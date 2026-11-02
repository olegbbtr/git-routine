import { GitHubClient, GitHubError } from './github.ts';
import type { KV } from './kv.ts';
import type { Routine } from '../format/model.ts';
import { parseRoutineYaml, serializeRoutineYaml } from '../format/routineYaml.ts';
import { runPath, serializeRun, validateRun, type Run } from '../format/run.ts';

const TRACKED = /^(routines\/[^/]+\.yaml|runs\/\d{4}\/\d{2}\/[^/]+\.json|users\/[^/]+\.json|space\.json)$/;
const BLOB_CONCURRENCY = 6;
const RACE_RETRIES = 3;

interface CachedFile {
  sha: string;
  text: string;
}

interface SyncState {
  branch: string | null;
  etag: string | null;
  treeSha: string | null;
  files: Record<string, CachedFile>;
}

export interface PullResult {
  changed: boolean;
  added: string[];
  updated: string[];
  removed: string[];
}

export interface FlushResult {
  sent: number;
  pending: number;
  error?: string;
}

export interface RoutineEntry {
  slug: string;
  sha: string;
  routine?: Routine;
  error?: string;
}

export interface RunEntry extends Run {
  pending: boolean; // still in the outbox
}

export type SaveResult =
  | { ok: true; sha: string }
  | { ok: false; conflict: { sha: string | null; text: string | null } };

export interface EngineOptions {
  client: GitHubClient;
  kv: KV;
  branch?: string; // default: the repository's default branch
  sleep?: (ms: number) => Promise<void>;
}

const STATE_KEY = 'state';
const OUTBOX_KEY = 'outbox';

function emptyState(): SyncState {
  return { branch: null, etag: null, treeSha: null, files: {} };
}

function isNetworkError(e: unknown): boolean {
  return !(e instanceof GitHubError);
}

export class SyncEngine {
  private client: GitHubClient;
  private kv: KV;
  private sleep: (ms: number) => Promise<void>;
  private state: SyncState;

  constructor(opts: EngineOptions) {
    this.client = opts.client;
    this.kv = opts.kv;
    this.sleep = opts.sleep ?? (ms => new Promise(r => setTimeout(r, ms)));
    this.state = this.kv.get<SyncState>(STATE_KEY) ?? emptyState();
    if (opts.branch && opts.branch !== this.state.branch) {
      this.state = { ...emptyState(), branch: opts.branch };
    }
  }

  private save(): void {
    this.kv.set(STATE_KEY, this.state);
  }

  private async branch(): Promise<string> {
    if (!this.state.branch) {
      this.state.branch = await this.client.defaultBranch();
      this.save();
    }
    return this.state.branch;
  }

  async pull(): Promise<PullResult> {
    const branch = await this.branch();
    const head = await this.client.branchHead(branch, this.state.etag);
    const result: PullResult = { changed: false, added: [], updated: [], removed: [] };
    if (!head) return result;

    if (head.treeSha === this.state.treeSha) {
      this.state.etag = head.etag;
      this.save();
      return result;
    }

    const entries = (await this.client.tree(head.treeSha)).filter(e => TRACKED.test(e.path));
    const remote = new Map(entries.map(e => [e.path, e.sha]));
    const toFetch = entries.filter(e => this.state.files[e.path]?.sha !== e.sha);

    const fetched: Record<string, CachedFile> = {};
    for (let i = 0; i < toFetch.length; i += BLOB_CONCURRENCY) {
      const batch = toFetch.slice(i, i + BLOB_CONCURRENCY);
      const texts = await Promise.all(batch.map(e => this.client.blob(e.sha)));
      batch.forEach((e, j) => { fetched[e.path] = { sha: e.sha, text: texts[j] }; });
    }

    for (const path of Object.keys(this.state.files)) {
      if (!remote.has(path)) {
        delete this.state.files[path];
        result.removed.push(path);
      }
    }
    for (const [path, file] of Object.entries(fetched)) {
      (this.state.files[path] ? result.updated : result.added).push(path);
      this.state.files[path] = file;
    }

    this.state.treeSha = head.treeSha;
    this.state.etag = head.etag;
    this.save();
    result.changed = result.added.length + result.updated.length + result.removed.length > 0;
    return result;
  }

  routines(): RoutineEntry[] {
    const list: RoutineEntry[] = [];
    for (const [path, file] of Object.entries(this.state.files)) {
      const m = /^routines\/([^/]+)\.yaml$/.exec(path);
      if (!m) continue;
      try {
        list.push({ slug: m[1], sha: file.sha, routine: parseRoutineYaml(file.text) });
      } catch (e) {
        list.push({ slug: m[1], sha: file.sha, error: (e as Error).message });
      }
    }
    return list.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  runs(): RunEntry[] {
    const byId = new Map<string, RunEntry>();
    for (const [path, file] of Object.entries(this.state.files)) {
      if (!path.startsWith('runs/')) continue;
      try {
        const run = JSON.parse(file.text);
        if (validateRun(run)) byId.set(run.id, { ...run, pending: false });
      } catch {
        // malformed run files are skipped
      }
    }
    for (const run of this.outbox()) {
      if (!byId.has(run.id)) byId.set(run.id, { ...run, pending: true });
    }
    return [...byId.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  outbox(): Run[] {
    return this.kv.get<Run[]>(OUTBOX_KEY) ?? [];
  }

  enqueueRun(run: Run): void {
    if (!validateRun(run)) throw new Error('invalid run');
    const outbox = this.outbox();
    if (!outbox.some(r => r.id === run.id)) {
      outbox.push(run);
      this.kv.set(OUTBOX_KEY, outbox);
    }
  }

  private dropFromOutbox(id: string): void {
    this.kv.set(OUTBOX_KEY, this.outbox().filter(r => r.id !== id));
  }

  // Sends queued runs; a run counts as sent once its file exists, even if an earlier response was lost
  async flush(): Promise<FlushResult> {
    const branch = await this.branch();
    let sent = 0;
    for (const run of this.outbox()) {
      const path = runPath(run);
      const text = serializeRun(run);
      try {
        const sha = await this.withRaceRetry(() =>
          this.client.putFile(path, text, { branch, message: `Run: ${run.routineName}` }));
        this.state.files[path] = { sha, text };
        this.save();
      } catch (e) {
        if (e instanceof GitHubError && e.kind === 'exists') {
          // already uploaded by an earlier attempt
        } else {
          return { sent, pending: this.outbox().length, error: isNetworkError(e) ? 'offline' : (e as Error).message };
        }
      }
      this.dropFromOutbox(run.id);
      sent++;
    }
    return { sent, pending: 0 };
  }

  // 409 on a create means the branch moved under us: retry
  private async withRaceRetry<T>(op: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await op();
      } catch (e) {
        if (!(e instanceof GitHubError) || e.kind !== 'conflict' || attempt >= RACE_RETRIES) throw e;
        await this.sleep(500 * 2 ** attempt);
      }
    }
  }

  // baseSha: version the edit started from, null for a new routine
  async saveRoutine(slug: string, routine: Routine, baseSha: string | null): Promise<SaveResult> {
    const branch = await this.branch();
    const path = `routines/${slug}.yaml`;
    const text = serializeRoutineYaml(routine);
    const message = `${baseSha ? 'Update' : 'Create'} routine: ${routine.name}`;

    for (let attempt = 0; ; attempt++) {
      try {
        const sha = await this.client.putFile(path, text, { branch, message, sha: baseSha });
        this.state.files[path] = { sha, text };
        this.save();
        return { ok: true, sha };
      } catch (e) {
        if (!(e instanceof GitHubError) || (e.kind !== 'conflict' && e.kind !== 'exists')) throw e;
        const current = await this.client.fileSha(path, branch);
        if (current === baseSha && attempt < RACE_RETRIES) {
          await this.sleep(500 * 2 ** attempt); // file unchanged, the branch just moved
          continue;
        }
        const theirs = current ? await this.client.blob(current) : null;
        return { ok: false, conflict: { sha: current, text: theirs } };
      }
    }
  }

  async deleteRoutine(slug: string, baseSha: string, name: string): Promise<SaveResult> {
    const branch = await this.branch();
    const path = `routines/${slug}.yaml`;
    for (let attempt = 0; ; attempt++) {
      try {
        await this.client.deleteFile(path, baseSha, { branch, message: `Delete routine: ${name}` });
        break;
      } catch (e) {
        if (!(e instanceof GitHubError)) throw e;
        if (e.kind === 'not-found') break; // already deleted elsewhere
        if (e.kind !== 'conflict') throw e;
        const current = await this.client.fileSha(path, branch);
        if (current === null) break;
        if (current === baseSha && attempt < RACE_RETRIES) {
          await this.sleep(500 * 2 ** attempt);
          continue;
        }
        return { ok: false, conflict: { sha: current, text: await this.client.blob(current) } };
      }
    }
    delete this.state.files[path];
    this.save();
    return { ok: true, sha: baseSha };
  }
}

import { base64ToUtf8, utf8ToBase64 } from './base64.ts';

export type GitHubErrorKind = 'conflict' | 'exists' | 'not-found' | 'auth' | 'rate-limit' | 'other';

export class GitHubError extends Error {
  status: number;
  kind: GitHubErrorKind;

  constructor(status: number, kind: GitHubErrorKind, message: string) {
    super(message);
    this.status = status;
    this.kind = kind;
  }
}

export interface BranchHead {
  commitSha: string;
  treeSha: string;
  etag: string | null;
}

export interface TreeEntry {
  path: string;
  sha: string;
}

export interface ClientOptions {
  repo: string; // "owner/name"
  token: string;
  fetch?: typeof fetch;
  api?: string;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export class GitHubClient {
  readonly repo: string;
  private token: string;
  private fetchImpl: typeof fetch;
  private api: string;

  constructor(opts: ClientOptions) {
    this.repo = opts.repo;
    this.token = opts.token;
    this.fetchImpl = opts.fetch ?? ((input, init) => fetch(input, init));
    this.api = opts.api ?? 'https://api.github.com';
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (init.body) headers['Content-Type'] = 'application/json';
    return this.fetchImpl(`${this.api}/repos/${this.repo}${path}`, { ...init, headers });
  }

  private async fail(res: Response): Promise<never> {
    let message = `${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.message === 'string') message = body.message;
    } catch {
      // body is not JSON
    }
    let kind: GitHubErrorKind = 'other';
    if (res.status === 409) kind = 'conflict';
    else if (res.status === 422 && /sha/i.test(message)) kind = 'exists';
    else if (res.status === 404) kind = 'not-found';
    else if (res.status === 401) kind = 'auth';
    else if (res.status === 403 || res.status === 429) kind = /rate limit/i.test(message) ? 'rate-limit' : 'auth';
    throw new GitHubError(res.status, kind, message);
  }

  async defaultBranch(): Promise<string> {
    const res = await this.request('');
    if (!res.ok) await this.fail(res);
    return (await res.json()).default_branch;
  }

  // null = not modified since `etag`
  async branchHead(branch: string, etag?: string | null): Promise<BranchHead | null> {
    const res = await this.request(`/branches/${encodeURIComponent(branch)}`, {
      headers: etag ? { 'If-None-Match': etag } : {},
    });
    if (res.status === 304) return null;
    if (!res.ok) await this.fail(res);
    const body = await res.json();
    return { commitSha: body.commit.sha, treeSha: body.commit.commit.tree.sha, etag: res.headers.get('ETag') };
  }

  async tree(treeSha: string): Promise<TreeEntry[]> {
    const res = await this.request(`/git/trees/${treeSha}?recursive=1`);
    if (!res.ok) await this.fail(res);
    const body = await res.json();
    if (body.truncated) throw new GitHubError(200, 'other', 'tree is truncated: repository too large for one request');
    return (body.tree as { path: string; sha: string; type: string }[])
      .filter(e => e.type === 'blob')
      .map(e => ({ path: e.path, sha: e.sha }));
  }

  async blob(sha: string): Promise<string> {
    const res = await this.request(`/git/blobs/${sha}`);
    if (!res.ok) await this.fail(res);
    return base64ToUtf8((await res.json()).content);
  }

  // Current blob sha of a file on the branch, null if absent
  async fileSha(path: string, branch: string): Promise<string | null> {
    const res = await this.request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
    if (res.status === 404) return null;
    if (!res.ok) await this.fail(res);
    return (await res.json()).sha;
  }

  // Without `sha` creates a new file and fails with kind 'exists' if it is already there
  async putFile(path: string, text: string, opts: { branch: string; message: string; sha?: string | null }): Promise<string> {
    const body: Record<string, string> = { message: opts.message, content: utf8ToBase64(text), branch: opts.branch };
    if (opts.sha) body.sha = opts.sha;
    const res = await this.request(`/contents/${encodePath(path)}`, { method: 'PUT', body: JSON.stringify(body) });
    if (!res.ok) await this.fail(res);
    return (await res.json()).content.sha;
  }

  async deleteFile(path: string, sha: string, opts: { branch: string; message: string }): Promise<void> {
    const res = await this.request(`/contents/${encodePath(path)}`, {
      method: 'DELETE',
      body: JSON.stringify({ message: opts.message, sha, branch: opts.branch }),
    });
    if (!res.ok) await this.fail(res);
  }
}

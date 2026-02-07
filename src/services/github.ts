import type { Routine, SessionLog } from '../types';
import { validateRoutine } from '../types';
import * as storage from './storage';

const API = 'https://api.github.com';

interface RepoInfo {
  full_name: string;
  name: string;
}

interface FileContent {
  content: string;
  sha: string;
}

async function ghFetch(path: string, token: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function validateToken(token: string): Promise<boolean> {
  const res = await ghFetch('/user', token);
  return res.ok;
}

export async function listRepos(token: string): Promise<RepoInfo[]> {
  const res = await ghFetch('/user/repos?per_page=100&sort=updated', token);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((r: RepoInfo) => ({ full_name: r.full_name, name: r.name }));
}

async function getFile(repo: string, path: string, token: string): Promise<FileContent | null> {
  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    content: atob(data.content.replace(/\n/g, '')),
    sha: data.sha,
  };
}

async function putFile(repo: string, path: string, content: string, sha: string, token: string, message: string): Promise<string> {
  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (sha) body.sha = sha;

  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to save ${path}: ${res.status}`);
  }
  const data = await res.json();
  return data.content.sha;
}

// Sync routines — each stored as routines/<filename>.json
interface DirEntry {
  name: string;
  path: string;
  sha: string;
}


export async function countRemoteRoutines(repo: string, token: string): Promise<number> {
  const res = await ghFetch(`/repos/${repo}/contents/routines`, token);
  if (!res.ok) return 0;
  const entries: DirEntry[] = await res.json();
  return entries.filter((e) => e.name.endsWith('.json')).length;
}

export async function pullRoutines(repo: string, token: string): Promise<{ routines: Record<string, Routine>; errors: string[] } | null> {
  const res = await ghFetch(`/repos/${repo}/contents/routines`, token);
  if (!res.ok) return null; // directory doesn't exist yet
  const entries: DirEntry[] = await res.json();
  const jsonFiles = entries.filter((e) => e.name.endsWith('.json'));

  const local = storage.loadRoutines();
  let changed = false;
  const routines: Record<string, Routine> = { ...local };
  const errors: string[] = [];

  for (const entry of jsonFiles) {
    const filename = entry.name.replace(/\.json$/, '');
    const localSha = storage.getRoutineSha(filename);
    if (localSha === entry.sha && local[filename]) {
      routines[filename] = local[filename];
      continue;
    }
    const file = await getFile(repo, entry.path, token);
    if (!file) continue;
    const parsed = JSON.parse(file.content);
    if (!validateRoutine(parsed)) {
      errors.push(filename);
      continue;
    }
    routines[filename] = parsed;
    storage.setRoutineSha(filename, entry.sha);
    changed = true;
  }

  if (changed) {
    storage.saveRoutines(routines);
  }
  if (!changed && errors.length === 0) return null;
  return { routines, errors };
}

export async function pushRoutine(repo: string, token: string, filename: string, routine: Routine): Promise<void> {
  const path = `routines/${filename}.json`;
  const sha = storage.getRoutineSha(filename);
  const content = JSON.stringify(routine, null, 2);
  const msg = sha ? `Update routine: ${routine.name}` : `Create routine: ${routine.name}`;
  const newSha = await putFile(repo, path, content, sha, token, msg);
  storage.setRoutineSha(filename, newSha);
}

export async function deleteRoutineRemote(repo: string, token: string, filename: string): Promise<void> {
  const path = `routines/${filename}.json`;
  let sha = storage.getRoutineSha(filename);
  if (!sha) {
    const file = await getFile(repo, path, token);
    sha = file?.sha || '';
  }
  if (!sha) return;
  const res = await ghFetch(`/repos/${repo}/contents/${path}`, token, {
    method: 'DELETE',
    body: JSON.stringify({ message: `Delete routine: ${filename}`, sha }),
  });
  if (res.status === 404) {
    storage.removeRoutineSha(filename);
    return;
  }
  if (!res.ok) {
    throw new Error(`Failed to delete ${path}: ${res.status}`);
  }
  storage.removeRoutineSha(filename);
}

// Sync history
export async function pullHistory(repo: string, token: string): Promise<SessionLog[] | null> {
  const file = await getFile(repo, 'history.json', token);
  if (!file) return null;
  const remoteSha = file.sha;
  const localSha = storage.getHistorySha();
  if (remoteSha === localSha) return null;
  const history: SessionLog[] = JSON.parse(file.content);
  storage.saveHistory(history);
  storage.setHistorySha(remoteSha);
  return history;
}

export async function pushHistory(repo: string, token: string, routineName?: string): Promise<void> {
  const history = storage.loadHistory();
  const sha = storage.getHistorySha();
  const content = JSON.stringify(history, null, 2);
  const msg = routineName ? `Record execution ${routineName}` : (sha ? 'Update session history' : 'Create session history');
  const newSha = await putFile(repo, 'history.json', content, sha, token, msg);
  storage.setHistorySha(newSha);
}

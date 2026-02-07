import type { Routine, SessionLog, AppSettings } from '../types';
import { validateRoutine } from '../types';

const KEYS = {
  routines: 'gr_routines',
  history: 'gr_history',
  settings: 'gr_settings',
  historySha: 'gr_history_sha',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  githubToken: '',
  repo: '',
  warmupDuration: 0,
  announceCurrent: true,
  announceNext: true,
  announceNextSeconds: 10,
  announceHalfway: false,
  announceCompletion: true,
  enableBeeps: true,
  announceLang: '',
  announceVoiceURI: '',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Routines — stored as Record<filename, Routine>
export function loadRoutines(): Record<string, Routine> {
  const raw = read<Record<string, unknown>>(KEYS.routines, {});
  const result: Record<string, Routine> = {};
  const invalid: string[] = [];
  for (const [filename, obj] of Object.entries(raw)) {
    if (validateRoutine(obj)) {
      result[filename] = obj;
    } else {
      invalid.push(filename);
    }
  }
  if (invalid.length > 0) {
    write(KEYS.routines, result);
  }
  return result;
}

export function getInvalidRoutineNames(): string[] {
  const raw = read<Record<string, unknown>>(KEYS.routines, {});
  return Object.keys(raw).filter(k => !validateRoutine(raw[k]));
}

export function saveRoutines(routines: Record<string, Routine>): void {
  write(KEYS.routines, routines);
}

export function saveRoutine(filename: string, routine: Routine): void {
  const routines = loadRoutines();
  routines[filename] = routine;
  saveRoutines(routines);
}

export function deleteRoutine(filename: string): void {
  const routines = loadRoutines();
  delete routines[filename];
  saveRoutines(routines);
}

export function renameRoutine(oldFilename: string, newFilename: string): void {
  const routines = loadRoutines();
  const routine = routines[oldFilename];
  if (!routine) return;
  delete routines[oldFilename];
  routines[newFilename] = routine;
  saveRoutines(routines);
  // Move SHA
  const sha = getRoutineSha(oldFilename);
  if (sha) {
    setRoutineSha(newFilename, sha);
    removeRoutineSha(oldFilename);
  }
}

export function getRoutine(filename: string): Routine | undefined {
  return loadRoutines()[filename];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'routine';
}

export function uniqueFilename(base: string): string {
  const routines = loadRoutines();
  if (!(base in routines)) return base;
  let i = 2;
  while (`${base}-${i}` in routines) i++;
  return `${base}-${i}`;
}

// History
export function loadHistory(): SessionLog[] {
  return read<SessionLog[]>(KEYS.history, []);
}

export function saveHistory(logs: SessionLog[]): void {
  write(KEYS.history, logs);
}

export function addSessionLog(log: SessionLog): void {
  const history = loadHistory();
  history.unshift(log);
  saveHistory(history);
}

export function deleteSessionLog(id: string): void {
  saveHistory(loadHistory().filter(l => l.id !== id));
}

// Settings
export function loadSettings(): AppSettings {
  return read<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  write(KEYS.settings, settings);
}

// SHA tracking for GitHub sync (per-filename)
export function getRoutineSha(filename: string): string {
  return localStorage.getItem(`gr_routine_sha_${filename}`) || '';
}

export function setRoutineSha(filename: string, sha: string): void {
  localStorage.setItem(`gr_routine_sha_${filename}`, sha);
}

export function removeRoutineSha(filename: string): void {
  localStorage.removeItem(`gr_routine_sha_${filename}`);
}

export function getHistorySha(): string {
  return localStorage.getItem(KEYS.historySha) || '';
}

export function setHistorySha(sha: string): void {
  localStorage.setItem(KEYS.historySha, sha);
}

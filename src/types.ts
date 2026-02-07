export interface Routine {
  name: string;
  created?: string; // ISO date
  edited?: string; // ISO date
  executed?: string; // ISO date, last run
  data: RoutineNode[];
}

export type RoutineNode = Block | Step;

export interface Block {
  label: string;
  repeats: number;
  children: RoutineNode[];
}

export interface Step {
  label: string;
  duration: number; // in the unit specified by `unit`
  unit?: 's' | 'm'; // default 's' (seconds), 'm' = minutes
  pause?: boolean; // pause and wait for user to press next
}

export interface SessionLog {
  id: string;
  timestamp: string; // ISO date
  routineName: string;
  durationSeconds: number;
}

export interface AppSettings {
  githubToken: string;
  repo: string;
  warmupDuration: number; // seconds, 0 = disabled
  announceCurrent: boolean;
  announceNext: boolean;
  announceNextSeconds: number;
  announceHalfway: boolean;
  announceCompletion: boolean;
  enableBeeps: boolean;
  announceLang: string; // e.g. 'en-US', '' for default
  announceVoiceURI: string; // '' for default
}

export interface FlatStep {
  label: string;
  duration: number;
  index: number;
  pause?: boolean;
}

export function isBlock(node: RoutineNode): node is Block {
  return 'children' in node;
}

export function isStep(node: RoutineNode): node is Step {
  return 'duration' in node && !('children' in node);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const NODE_KEY = Symbol('node_key');
const nodeKeys = new WeakMap<object, string>();

type KeyedRoutineNode = RoutineNode & { [NODE_KEY]?: string };
export function getNodeKey(node: RoutineNode): string {
  const keyed = node as KeyedRoutineNode;
  let key = keyed[NODE_KEY] || nodeKeys.get(node);
  if (!key) {
    key = generateId();
    keyed[NODE_KEY] = key;
  }
  nodeKeys.set(node, key);
  return key;
}

export function stepSeconds(step: Step): number {
  return step.unit === 'm' ? step.duration * 60 : step.duration;
}

export function calcDuration(nodes: RoutineNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (isBlock(node)) {
      total += calcDuration(node.children) * node.repeats;
    } else {
      total += stepSeconds(node);
    }
  }
  return total;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function validateRoutine(obj: unknown): obj is Routine {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.name === 'string' &&
    (typeof r.created === 'undefined' || typeof r.created === 'string') &&
    (typeof r.edited === 'undefined' || typeof r.edited === 'string') &&
    Array.isArray(r.data)
  );
}

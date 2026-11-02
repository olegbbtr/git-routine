export type RunStatus = 'completed' | 'aborted';

export interface Run {
  id: string;
  routine: string; // slug
  routineName: string;
  startedAt: string; // ISO, UTC
  finishedAt: string;
  status: RunStatus;
  activeSeconds: number;
  pausedSeconds: number;
  device?: string;
}

const ID = /^[a-z0-9-]{4,40}$/;

function isIsoDate(v: unknown): v is string {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

function isSeconds(v: unknown): v is number {
  return Number.isInteger(v) && (v as number) >= 0;
}

export function validateRun(obj: unknown): obj is Run {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.id === 'string' && ID.test(r.id) &&
    typeof r.routine === 'string' && r.routine !== '' &&
    typeof r.routineName === 'string' &&
    isIsoDate(r.startedAt) &&
    isIsoDate(r.finishedAt) &&
    (r.status === 'completed' || r.status === 'aborted') &&
    isSeconds(r.activeSeconds) &&
    isSeconds(r.pausedSeconds) &&
    (typeof r.device === 'undefined' || typeof r.device === 'string')
  );
}

// runs/2026/11/20261102T153000Z-ab12cd34.json
export function runPath(run: Pick<Run, 'id' | 'startedAt'>): string {
  const iso = new Date(run.startedAt).toISOString();
  const yyyy = iso.slice(0, 4);
  const mm = iso.slice(5, 7);
  const stamp = iso.slice(0, 19).replace(/[-:]/g, '') + 'Z';
  return `runs/${yyyy}/${mm}/${stamp}-${run.id}.json`;
}

export function serializeRun(run: Run): string {
  return JSON.stringify(run, null, 2) + '\n';
}

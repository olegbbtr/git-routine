import type { SessionLog } from '../types';
import { validateRoutine, calcDuration } from '../types.ts';
import { serializeRoutineYaml } from './routineYaml.ts';
import { fromLegacy } from './model.ts';
import { slugify, uniqueSlug } from './slug.ts';
import { runPath, serializeRun, validateRun, type Run } from './run.ts';

export interface LegacyRepo {
  routines: Record<string, string>; // "routines/<name>.json" -> text
  history: string | null; // history.json text
}

export interface MigrationPlan {
  writes: Record<string, string>;
  deletes: string[];
  report: string[];
}

const MIN_COMPLETED_SECONDS = 30;
const MAX_PLANNED_RATIO = 3;

export function planMigration(repo: LegacyRepo): MigrationPlan {
  const writes: Record<string, string> = {};
  const deletes: string[] = [];
  const report: string[] = [];
  const slugByName = new Map<string, string>();
  const plannedBySlug = new Map<string, number>();

  for (const [path, text] of Object.entries(repo.routines).sort()) {
    const base = path.replace(/^routines\//, '').replace(/\.json$/i, '');
    let obj: unknown;
    try {
      obj = JSON.parse(text);
    } catch {
      report.push(`пропущено, не JSON: ${path}`);
      continue;
    }
    if (!validateRoutine(obj)) {
      report.push(`пропущено, неверная рутина: ${path}`);
      continue;
    }
    const slug = uniqueSlug(slugify(base), plannedBySlug.keys());
    plannedBySlug.set(slug, calcDuration(obj.data));
    if (!slugByName.has(obj.name)) slugByName.set(obj.name, slug);
    writes[`routines/${slug}.yaml`] = serializeRoutineYaml(fromLegacy(obj));
    deletes.push(path);
    report.push(`рутина: ${path} -> routines/${slug}.yaml ("${obj.name}")`);
  }

  if (repo.history !== null) {
    let logs: unknown;
    try {
      logs = JSON.parse(repo.history);
    } catch {
      logs = null;
    }
    if (!Array.isArray(logs)) {
      report.push('history.json не разобран, оставлен как есть');
    } else {
      let completed = 0;
      let aborted = 0;
      for (const log of logs as SessionLog[]) {
        const finished = Date.parse(log?.timestamp);
        const seconds = Math.round(Number(log?.durationSeconds));
        if (Number.isNaN(finished) || !Number.isFinite(seconds) || seconds < 0 || typeof log.routineName !== 'string') {
          report.push(`пропущена запись истории: ${JSON.stringify(log)}`);
          continue;
        }
        const slug = slugByName.get(log.routineName) ?? slugify(log.routineName);
        const planned = plannedBySlug.get(slug) ?? 0;
        const tooShort = seconds < MIN_COMPLETED_SECONDS;
        const tooLong = planned > 0 && seconds > planned * MAX_PLANNED_RATIO;
        const status = tooShort || tooLong ? 'aborted' : 'completed';
        const run: Run = {
          id: typeof log.id === 'string' && /^[a-z0-9-]{4,40}$/.test(log.id) ? log.id : `m${finished.toString(36)}`,
          routine: slug,
          routineName: log.routineName,
          startedAt: new Date(finished - seconds * 1000).toISOString(),
          finishedAt: new Date(finished).toISOString(),
          status,
          activeSeconds: seconds,
          pausedSeconds: 0,
        };
        if (!validateRun(run)) {
          report.push(`пропущена запись истории: ${JSON.stringify(log)}`);
          continue;
        }
        writes[runPath(run)] = serializeRun(run);
        if (status === 'completed') completed++;
        else aborted++;
        if (tooLong) report.push(`аномально долгий запуск помечен aborted: ${log.routineName}, ${seconds} с`);
      }
      deletes.push('history.json');
      report.push(`история: ${completed} completed, ${aborted} aborted`);
    }
  }

  return { writes, deletes, report };
}

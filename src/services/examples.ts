import type { Routine } from '../types';
import { validateRoutine } from '../types';
import { saveRoutine } from './storage';

const modules = import.meta.glob<Routine>('../../examples/routines/*.json', { eager: true, import: 'default' });

export function importExamples(): { imported: number; errors: string[] } {
  let imported = 0;
  const errors: string[] = [];

  for (const [path, data] of Object.entries(modules)) {
    const filename = path.split('/').pop()!.replace(/\.json$/, '');
    if (!validateRoutine(data)) {
      errors.push(filename);
      continue;
    }
    const now = new Date().toISOString();
    const routine: Routine = { ...data, created: now, edited: now };
    saveRoutine(filename, routine);
    imported++;
  }

  return { imported, errors };
}

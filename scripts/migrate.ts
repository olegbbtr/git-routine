// Переводит репозиторий данных из старого формата (routines/*.json, history.json) в новый.
// Запуск: node scripts/migrate.ts <путь к клону> [--dry-run]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { planMigration, type LegacyRepo } from '../src/format/migrate.ts';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const dir = args.find(a => !a.startsWith('--'));
if (!dir) {
  console.error('usage: node scripts/migrate.ts <data-repo-dir> [--dry-run]');
  process.exit(2);
}

const repo: LegacyRepo = { routines: {}, history: null };
const routinesDir = join(dir, 'routines');
if (existsSync(routinesDir)) {
  for (const name of readdirSync(routinesDir)) {
    if (name.toLowerCase().endsWith('.json')) {
      repo.routines[`routines/${name}`] = readFileSync(join(routinesDir, name), 'utf8');
    }
  }
}
const historyFile = join(dir, 'history.json');
if (existsSync(historyFile)) repo.history = readFileSync(historyFile, 'utf8');

const plan = planMigration(repo);
for (const line of plan.report) console.log(line);

if (dryRun) {
  console.log(`dry run: ${Object.keys(plan.writes).length} файлов записать, ${plan.deletes.length} удалить`);
  process.exit(0);
}

for (const [path, text] of Object.entries(plan.writes)) {
  const target = join(dir, path);
  if (existsSync(target)) {
    console.error(`уже существует, остановка: ${path}`);
    process.exit(1);
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}
for (const path of plan.deletes) rmSync(join(dir, path));
console.log(`готово: ${Object.keys(plan.writes).length} записано, ${plan.deletes.length} удалено`);

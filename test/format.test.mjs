import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDuration } from '../src/format/duration.ts';
import { parseRoutineYaml, serializeRoutineYaml, RoutineFormatError } from '../src/format/routineYaml.ts';
import { slugify, uniqueSlug } from '../src/format/slug.ts';
import { runPath, validateRun } from '../src/format/run.ts';
import { planMigration } from '../src/format/migrate.ts';
import { flatten } from '../src/services/flattener.ts';

const examplesDir = join(process.cwd(), 'examples', 'routines');

test('parseDuration accepts the documented forms', () => {
  assert.deepEqual(parseDuration('20s'), { duration: 20, wait: false });
  assert.deepEqual(parseDuration('5m'), { duration: 5, unit: 'm', wait: false });
  assert.deepEqual(parseDuration('1m30s'), { duration: 90, wait: false });
  assert.deepEqual(parseDuration('1.5m'), { duration: 1.5, unit: 'm', wait: false });
  assert.deepEqual(parseDuration(45), { duration: 45, wait: false });
  assert.deepEqual(parseDuration('30s wait'), { duration: 30, wait: true });
  for (const bad of ['', '0s', '-5s', '5h', 'abc', 'wait', null, {}]) {
    assert.equal(parseDuration(bad), null, String(bad));
  }
});

test('YAML round trip keeps flattened timing of every example routine', () => {
  for (const file of readdirSync(examplesDir).filter(f => f.endsWith('.json'))) {
    const routine = JSON.parse(readFileSync(join(examplesDir, file), 'utf8'));
    const parsed = parseRoutineYaml(serializeRoutineYaml(routine));
    assert.equal(parsed.name, routine.name, file);
    const strip = steps => steps.map(({ label, duration, pause }) => ({ label, duration, pause: !!pause }));
    assert.deepEqual(strip(flatten(parsed.data)), strip(flatten(routine.data)), file);
  }
});

test('YAML format reads blocks, repeats, wait steps and Cyrillic labels', () => {
  const routine = parseRoutineYaml(`
name: Готовим гречку
steps:
  - Подготовка:
      - Вскипятить воду: 30s
      - "Засыпать: крупу": 1m wait
  - Варка:
      repeat: 2
      steps:
        - Помешать: 1m30s
`);
  assert.deepEqual(routine, {
    name: 'Готовим гречку',
    data: [
      { label: 'Подготовка', repeats: 1, children: [
        { label: 'Вскипятить воду', duration: 30 },
        { label: 'Засыпать: крупу', duration: 1, unit: 'm', pause: true },
      ] },
      { label: 'Варка', repeats: 2, children: [{ label: 'Помешать', duration: 90 }] },
    ],
  });
});

test('YAML format errors point at the broken element', () => {
  const cases = [
    ['name: X\nsteps:\n  - A: 10s\n    B: 5s\n', /steps\[0\].*ровно одна метка/],
    ['name: X\nsteps:\n  - A: soon\n', /steps\[0\] "A".*длительность/],
    ['name: X\nsteps:\n  - B:\n      repeat: 0\n      steps: []\n', /repeat/],
    ['steps: []\n', /name/],
    ['name: X\nsteps: []\nextra: 1\n', /extra/],
    ['name: X\nsteps: [\n', /YAML/],
  ];
  for (const [text, pattern] of cases) {
    assert.throws(() => parseRoutineYaml(text), err => err instanceof RoutineFormatError && pattern.test(err.message), text);
  }
});

test('slugify transliterates Cyrillic and uniqueSlug avoids collisions', () => {
  assert.equal(slugify('Готовим гречку'), 'gotovim-grechku');
  assert.equal(slugify('3. Warmup'), '3-warmup');
  assert.equal(slugify('!!!'), 'routine');
  assert.equal(uniqueSlug('warmup', ['warmup', 'warmup-2']), 'warmup-3');
});

test('runPath is UTC based and validateRun rejects malformed runs', () => {
  const run = {
    id: 'ab12cd34', routine: 'warmup', routineName: '3. Warmup',
    startedAt: '2026-11-02T23:30:05.120+02:00', finishedAt: '2026-11-02T21:36:12Z',
    status: 'completed', activeSeconds: 352, pausedSeconds: 15,
  };
  assert.equal(runPath(run), 'runs/2026/11/20261102T213005Z-ab12cd34.json');
  assert.equal(validateRun(run), true);
  assert.equal(validateRun({ ...run, status: 'done' }), false);
  assert.equal(validateRun({ ...run, activeSeconds: -1 }), false);
  assert.equal(validateRun({ ...run, id: '../x' }), false);
});

test('planMigration converts routines and splits history into run files', () => {
  const warmup = { name: '3. Warmup', data: [{ label: 'A', duration: 60 }, { label: 'B', duration: 1, unit: 'm' }] };
  const history = [
    { id: 'aaaa1111', timestamp: '2026-10-25T14:05:24.306Z', routineName: '3. Warmup', durationSeconds: 130 },
    { id: 'bbbb2222', timestamp: '2026-03-03T14:29:48.473Z', routineName: '3. Warmup', durationSeconds: 8 },
    { id: 'cccc3333', timestamp: '2026-02-21T14:32:38.454Z', routineName: '3. Warmup', durationSeconds: 6211 },
    { id: 'dddd4444', timestamp: '2026-02-21T20:05:20.994Z', routineName: '1. Neck stretch sit', durationSeconds: 235 },
    { broken: true },
  ];
  const plan = planMigration({
    routines: {
      'routines/warmup.json': JSON.stringify(warmup),
      'routines/Готовим гречку.json': JSON.stringify({ name: 'New Routine', data: [] }),
      'routines/bad.json': '{',
    },
    history: JSON.stringify(history),
  });

  assert.deepEqual(Object.keys(plan.writes).filter(p => p.startsWith('routines/')).sort(),
    ['routines/gotovim-grechku.yaml', 'routines/warmup.yaml']);
  assert.deepEqual(parseRoutineYaml(plan.writes['routines/warmup.yaml']).data, [
    { label: 'A', duration: 60 }, { label: 'B', duration: 1, unit: 'm' },
  ]);
  assert.deepEqual(plan.deletes.sort(), ['history.json', 'routines/warmup.json', 'routines/Готовим гречку.json'].sort());

  const runs = Object.entries(plan.writes).filter(([p]) => p.startsWith('runs/')).map(([, t]) => JSON.parse(t));
  const byId = Object.fromEntries(runs.map(r => [r.id, r]));
  assert.equal(runs.length, 4);
  assert.equal(byId.aaaa1111.status, 'completed');
  assert.equal(byId.aaaa1111.startedAt, '2026-10-25T14:03:14.306Z');
  assert.equal(byId.bbbb2222.status, 'aborted');
  assert.equal(byId.cccc3333.status, 'aborted');
  assert.equal(byId.dddd4444.routine, '1-neck-stretch-sit');
  assert.equal(byId.dddd4444.status, 'completed');
  assert.ok(plan.report.some(l => l.includes('bad.json')));
});

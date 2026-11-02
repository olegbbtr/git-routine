import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeGitHub } from './support/fake-github.mjs';
import { GitHubClient } from '../src/sync/github.ts';
import { MemoryKV } from '../src/sync/kv.ts';
import { SyncEngine } from '../src/sync/engine.ts';
import { parseRoutineYaml } from '../src/format/routineYaml.ts';

const WARMUP = 'name: 3. Warmup\nsteps:\n  - Head tilts: 20s\n';
const BUCKWHEAT = 'name: Гречка\nsteps:\n  - Вскипятить воду: wait\n  - Варить: 15m\n';

function run(id, startedAt = '2026-11-02T15:30:00Z') {
  return {
    id, routine: 'warmup', routineName: '3. Warmup', startedAt, finishedAt: '2026-11-02T15:36:07Z',
    status: 'completed', activeSeconds: 352, pausedSeconds: 15,
  };
}

function setup(files = {}) {
  const gh = new FakeGitHub(files);
  const kv = new MemoryKV();
  const make = () => new SyncEngine({
    client: new GitHubClient({ repo: 'o/r', token: 't', fetch: gh.fetch, api: 'https://api.test' }),
    kv,
    sleep: async () => {},
  });
  return { gh, kv, engine: make(), make };
}

test('first pull loads routines and runs, decoding UTF-8', async () => {
  const { engine } = setup({
    'routines/warmup.yaml': WARMUP,
    'routines/grechka.yaml': BUCKWHEAT,
    'runs/2026/11/20261102T153000Z-aaaa1111.json': JSON.stringify(run('aaaa1111')),
    'README.md': 'not tracked',
  });
  const res = await engine.pull();
  assert.equal(res.changed, true);
  assert.equal(res.added.length, 3);

  const routines = engine.routines();
  assert.deepEqual(routines.map(r => r.slug), ['grechka', 'warmup']);
  assert.equal(routines[0].routine.name, 'Гречка');
  assert.equal(routines[0].routine.steps[0].label, 'Вскипятить воду');
  assert.deepEqual(engine.runs().map(r => [r.id, r.pending]), [['aaaa1111', false]]);
});

test('unchanged repository costs one conditional request', async () => {
  const { engine, gh } = setup({ 'routines/warmup.yaml': WARMUP });
  await engine.pull();
  gh.calls = [];
  const res = await engine.pull();
  assert.equal(res.changed, false);
  assert.deepEqual(gh.calls, ['GET /branches/main']);
});

test('remote edits and deletions are picked up, fetching only changed blobs', async () => {
  const { engine, gh } = setup({ 'routines/warmup.yaml': WARMUP, 'routines/grechka.yaml': BUCKWHEAT });
  await engine.pull();
  gh.write('routines/warmup.yaml', WARMUP.replace('20s', '30s'));
  gh.remove('routines/grechka.yaml');
  gh.calls = [];

  const res = await engine.pull();
  assert.deepEqual(res.updated, ['routines/warmup.yaml']);
  assert.deepEqual(res.removed, ['routines/grechka.yaml']);
  assert.equal(gh.count(/^GET \/git\/blobs\//), 1);
  assert.deepEqual(engine.routines().map(r => r.slug), ['warmup']);
  assert.equal(engine.routines()[0].routine.steps[0].duration, 30);
});

test('state survives a restart: cached data without network', async () => {
  const { engine, gh, make } = setup({ 'routines/warmup.yaml': WARMUP });
  await engine.pull();
  gh.offline = true;
  const restarted = make();
  assert.deepEqual(restarted.routines().map(r => r.slug), ['warmup']);
  await assert.rejects(restarted.pull());
});

test('queued run is uploaded as its own file and leaves the outbox', async () => {
  const { engine, gh } = setup();
  await engine.pull();
  engine.enqueueRun(run('bbbb2222'));
  assert.deepEqual(engine.runs().map(r => r.pending), [true]);

  assert.deepEqual(await engine.flush(), { sent: 1, pending: 0 });
  assert.equal(gh.files.has('runs/2026/11/20261102T153000Z-bbbb2222.json'), true);
  assert.deepEqual(engine.outbox(), []);
  assert.deepEqual(engine.runs().map(r => r.pending), [false]);
});

test('offline flush keeps runs queued, next flush sends them', async () => {
  const { engine, gh } = setup();
  await engine.pull();
  engine.enqueueRun(run('cccc3333'));
  gh.offline = true;
  assert.deepEqual(await engine.flush(), { sent: 0, pending: 1, error: 'offline' });
  gh.offline = false;
  assert.deepEqual(await engine.flush(), { sent: 1, pending: 0 });
});

test('a lost response does not duplicate the run', async () => {
  const { engine, gh } = setup();
  await engine.pull();
  engine.enqueueRun(run('dddd4444'));
  gh.loseResponseOnce = true;
  assert.equal((await engine.flush()).pending, 1);
  assert.deepEqual(await engine.flush(), { sent: 1, pending: 0 });
  assert.equal([...gh.files.keys()].filter(p => p.includes('dddd4444')).length, 1);
});

test('branch race on upload is retried', async () => {
  const { engine, gh } = setup();
  await engine.pull();
  engine.enqueueRun(run('eeee5555'));
  gh.raceOnce = 2;
  assert.deepEqual(await engine.flush(), { sent: 1, pending: 0 });
});

test('enqueueRun is idempotent and rejects invalid runs', async () => {
  const { engine } = setup();
  engine.enqueueRun(run('ffff6666'));
  engine.enqueueRun(run('ffff6666'));
  assert.equal(engine.outbox().length, 1);
  assert.throws(() => engine.enqueueRun({ ...run('gggg7777'), status: 'done' }));
});

test('saving over a version changed elsewhere returns a conflict and keeps their file', async () => {
  const { engine, gh } = setup({ 'routines/warmup.yaml': WARMUP });
  await engine.pull();
  const base = engine.routines()[0];
  const theirs = WARMUP.replace('20s', '45s');
  gh.write('routines/warmup.yaml', theirs);

  const mine = { ...base.routine, name: '3. Warmup (mine)' };
  const res = await engine.saveRoutine('warmup', mine, base.sha);
  assert.equal(res.ok, false);
  assert.equal(res.conflict.text, theirs);
  assert.equal(gh.files.get('routines/warmup.yaml'), theirs);

  const resolved = await engine.saveRoutine('warmup', mine, res.conflict.sha);
  assert.equal(resolved.ok, true);
  assert.equal(parseRoutineYaml(gh.files.get('routines/warmup.yaml')).name, '3. Warmup (mine)');
});

test('creating a routine whose slug was just taken elsewhere is a conflict', async () => {
  const { engine, gh } = setup();
  await engine.pull();
  gh.write('routines/warmup.yaml', WARMUP);
  const res = await engine.saveRoutine('warmup', parseRoutineYaml(BUCKWHEAT), null);
  assert.equal(res.ok, false);
  assert.equal(res.conflict.text, WARMUP);
});

test('branch race on save is retried when the file itself did not change', async () => {
  const { engine, gh } = setup({ 'routines/warmup.yaml': WARMUP });
  await engine.pull();
  const base = engine.routines()[0];
  gh.raceOnce = 1;
  const res = await engine.saveRoutine('warmup', { ...base.routine, name: 'Renamed' }, base.sha);
  assert.equal(res.ok, true);
  assert.equal(engine.routines()[0].routine.name, 'Renamed');
});

test('delete succeeds, tolerates a file already gone, and reports edits made elsewhere', async () => {
  const { engine, gh } = setup({ 'routines/warmup.yaml': WARMUP, 'routines/grechka.yaml': BUCKWHEAT });
  await engine.pull();
  const [grechka, warmup] = engine.routines();

  assert.equal((await engine.deleteRoutine('warmup', warmup.sha, '3. Warmup')).ok, true);
  assert.equal(gh.files.has('routines/warmup.yaml'), false);

  gh.write('routines/grechka.yaml', BUCKWHEAT + '  - Подать: wait\n');
  const res = await engine.deleteRoutine('grechka', grechka.sha, 'Гречка');
  assert.equal(res.ok, false);
  assert.equal(gh.files.has('routines/grechka.yaml'), true);

  gh.remove('routines/grechka.yaml');
  assert.equal((await engine.deleteRoutine('grechka', grechka.sha, 'Гречка')).ok, true);
});

test('a malformed routine is reported without hiding the others', async () => {
  const { engine } = setup({ 'routines/warmup.yaml': WARMUP, 'routines/broken.yaml': 'name: X\nsteps:\n  - A: soon\n' });
  await engine.pull();
  const [broken, warmup] = engine.routines();
  assert.match(broken.error, /не удалось разобрать/);
  assert.equal(warmup.routine.name, '3. Warmup');
});

test('explicit branch is used instead of the default and resets cache from another branch', async () => {
  const { gh, kv } = setup({ 'routines/warmup.yaml': WARMUP });
  const make = branch => new SyncEngine({
    client: new GitHubClient({ repo: 'o/r', token: 't', fetch: gh.fetch, api: 'https://api.test' }),
    kv, branch, sleep: async () => {},
  });
  await make(undefined).pull();
  gh.calls = [];
  const other = make('main-copy');
  assert.deepEqual(other.routines(), []);
  await assert.rejects(other.pull()); // fake only knows "main"
  assert.equal(gh.count(/^GET \/branches\/main-copy$/), 1);
  assert.equal(gh.count(/^GET $/), 0);
});

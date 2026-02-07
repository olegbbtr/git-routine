import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

async function importTsModule(path) {
  const source = readFileSync(path, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript,${encodeURIComponent(transpiled)}`);
}

test('validateRoutine rejects malformed nested nodes', async () => {
  const { validateRoutine } = await importTsModule(join(process.cwd(), 'src', 'types.ts'));

  const invalidBlockChildren = {
    name: 'Bad',
    data: [{ label: 'B', repeats: 1, children: {} }],
  };
  assert.equal(validateRoutine(invalidBlockChildren), false);

  const invalidStep = {
    name: 'Bad step',
    data: [{ label: 'S', duration: -5, unit: 'x' }],
  };
  assert.equal(validateRoutine(invalidStep), false);

  const valid = {
    name: 'Good',
    data: [{ label: 'S', duration: 30, unit: 's', pause: false }],
  };
  assert.equal(validateRoutine(valid), true);
});

test('parseHash handles malformed encoded segments without throwing', async () => {
  const { parseHash } = await importTsModule(join(process.cwd(), 'src', 'services', 'router.ts'));

  assert.doesNotThrow(() => parseHash('#/edit/%E0%A4%A'));
  assert.deepEqual(parseHash('#/edit/%E0%A4%A'), { view: 'editor', filename: '%E0%A4%A' });
  assert.deepEqual(parseHash('#/run/my%20routine'), { view: 'runner', filename: 'my routine' });
});

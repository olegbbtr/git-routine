import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const examplesDir = join(process.cwd(), 'examples', 'routines');

function isBlock(node) {
  return !!node && typeof node === 'object' && Array.isArray(node.children);
}

function isStep(node) {
  return !!node && typeof node === 'object' && typeof node.label === 'string' && typeof node.duration === 'number';
}

function isValidNode(node) {
  if (isBlock(node)) {
    return typeof node.label === 'string' &&
      Number.isInteger(node.repeats) &&
      node.repeats > 0 &&
      node.children.every(isValidNode);
  }
  return isStep(node) && node.duration > 0;
}

function validateRoutineLike(obj) {
  return !!obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.data) &&
    obj.data.every(isValidNode);
}

function stepSeconds(step) {
  return step.unit === 'm' ? step.duration * 60 : step.duration;
}

function flattenNodes(nodes, out = []) {
  for (const node of nodes) {
    if (isBlock(node)) {
      for (let i = 0; i < node.repeats; i += 1) {
        flattenNodes(node.children, out);
      }
    } else {
      out.push({
        label: node.label,
        duration: stepSeconds(node),
      });
    }
  }
  return out;
}

function calcDurationLike(nodes) {
  return flattenNodes(nodes).reduce((sum, step) => sum + step.duration, 0);
}

test('example routines parse and validate shape', () => {
  const files = readdirSync(examplesDir).filter((name) => name.endsWith('.json'));
  assert.ok(files.length > 0, 'expected example routines');

  for (const file of files) {
    const raw = readFileSync(join(examplesDir, file), 'utf8');
    const parsed = JSON.parse(raw);
    assert.equal(validateRoutineLike(parsed), true, `${file} should be a valid routine`);
  }
});

test('example routines flatten with consistent total duration', () => {
  const files = readdirSync(examplesDir).filter((name) => name.endsWith('.json'));

  for (const file of files) {
    const raw = readFileSync(join(examplesDir, file), 'utf8');
    const routine = JSON.parse(raw);
    assert.equal(validateRoutineLike(routine), true, `${file} should be a valid routine`);

    const flat = flattenNodes(routine.data);
    assert.ok(flat.length > 0, `${file} should produce at least one flattened step`);

    for (const step of flat) {
      assert.equal(typeof step.label, 'string', `${file} flattened step label`);
      assert.ok(Number.isFinite(step.duration), `${file} flattened step duration is finite`);
      assert.ok(step.duration > 0, `${file} flattened step duration is positive`);
    }

    const flattenedTotal = flat.reduce((sum, step) => sum + step.duration, 0);
    assert.equal(flattenedTotal, calcDurationLike(routine.data), `${file} flattened duration should match recursive duration`);
  }
});

test('halfway announcement threshold uses 30s minimum', async () => {
  const sourcePath = join(process.cwd(), 'src', 'services', 'runnerRules.ts');
  const source = readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const moduleUrl = `data:text/javascript,${encodeURIComponent(transpiled)}`;
  const { HALF_ANNOUNCE_MIN_SECONDS, shouldAnnounceHalfway } = await import(moduleUrl);

  assert.equal(HALF_ANNOUNCE_MIN_SECONDS, 30);
  assert.equal(shouldAnnounceHalfway(29), false);
  assert.equal(shouldAnnounceHalfway(30), true);
  assert.equal(shouldAnnounceHalfway(120), true);
});

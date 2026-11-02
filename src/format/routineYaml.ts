import { parse, stringify } from 'yaml';
import type { Branch, Node, Routine } from './model.ts';
import { parseStepValue, formatInterval } from './duration.ts';

export class RoutineFormatError extends Error {}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

// Every list element is a single-key map: "Label: value"
function singleEntry(item: unknown, path: string): [string, unknown] {
  if (!isPlainObject(item)) {
    throw new RoutineFormatError(`${path}: ожидается "Метка: значение"`);
  }
  const keys = Object.keys(item);
  if (keys.length !== 1) {
    throw new RoutineFormatError(`${path}: в элементе должна быть ровно одна метка, найдено ${keys.length}`);
  }
  return [keys[0], item[keys[0]]];
}

function parseNodes(items: unknown, path: string): Node[] {
  if (!Array.isArray(items)) {
    throw new RoutineFormatError(`${path}: ожидается список`);
  }
  return items.map((item, i) => parseNode(item, `${path}[${i}]`));
}

function parseBranches(items: unknown, path: string): Branch[] {
  if (!Array.isArray(items) || items.length < 2) {
    throw new RoutineFormatError(`${path}: parallel - список минимум из двух веток`);
  }
  return items.map((item, i) => {
    const [label, value] = singleEntry(item, `${path}[${i}]`);
    return { label, steps: parseNodes(value, `${path}[${i}] "${label}"`) };
  });
}

function parseNode(item: unknown, path: string): Node {
  const [label, value] = singleEntry(item, path);
  const here = `${path} "${label}"`;

  if (Array.isArray(value)) {
    return { kind: 'group', label, repeat: 1, steps: parseNodes(value, here) };
  }

  if (isPlainObject(value)) {
    if ('parallel' in value) {
      const extra = Object.keys(value).filter(k => k !== 'parallel');
      if (extra.length > 0) {
        throw new RoutineFormatError(`${here}: рядом с parallel не бывает полей ${extra.join(', ')}`);
      }
      return { kind: 'parallel', label, branches: parseBranches(value.parallel, `${here}.parallel`) };
    }
    const extra = Object.keys(value).filter(k => k !== 'repeat' && k !== 'steps');
    if (extra.length > 0) {
      throw new RoutineFormatError(`${here}: неизвестные поля ${extra.join(', ')}`);
    }
    const repeat = value.repeat ?? 1;
    if (!Number.isInteger(repeat) || (repeat as number) < 1) {
      throw new RoutineFormatError(`${here}: repeat должен быть целым числом >= 1`);
    }
    return { kind: 'group', label, repeat: repeat as number, steps: parseNodes(value.steps, here) };
  }

  const parsed = parseStepValue(value);
  if (!parsed) {
    throw new RoutineFormatError(`${here}: не удалось разобрать "${String(value)}" (ожидается 20s, 5m, 1m30s, "30s wait" или wait)`);
  }
  if (parsed.kind === 'action') return { kind: 'action', label };
  const step: Node = { kind: 'interval', label, duration: parsed.duration, unit: parsed.unit };
  if (parsed.confirm) step.confirm = true;
  return step;
}

export function parseRoutineYaml(text: string): Routine {
  let doc: unknown;
  try {
    doc = parse(text);
  } catch (e) {
    throw new RoutineFormatError(`YAML: ${(e as Error).message}`);
  }
  if (!isPlainObject(doc)) {
    throw new RoutineFormatError('ожидается документ с полями name и steps');
  }
  if (typeof doc.name !== 'string' || doc.name.trim() === '') {
    throw new RoutineFormatError('name: обязательная строка');
  }
  const extra = Object.keys(doc).filter(k => k !== 'name' && k !== 'steps');
  if (extra.length > 0) {
    throw new RoutineFormatError(`неизвестные поля ${extra.join(', ')}`);
  }
  return { name: doc.name, steps: parseNodes(doc.steps, 'steps') };
}

function toYamlNode(node: Node): Record<string, unknown> {
  switch (node.kind) {
    case 'interval':
      return { [node.label]: formatInterval(node) };
    case 'action':
      return { [node.label]: 'wait' };
    case 'group': {
      const steps = node.steps.map(toYamlNode);
      return { [node.label]: node.repeat === 1 ? steps : { repeat: node.repeat, steps } };
    }
    case 'parallel':
      return { [node.label]: { parallel: node.branches.map(b => ({ [b.label]: b.steps.map(toYamlNode) })) } };
  }
}

export function serializeRoutineYaml(routine: Routine): string {
  return stringify({ name: routine.name, steps: routine.steps.map(toYamlNode) }, { lineWidth: 0 });
}

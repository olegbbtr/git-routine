import { parse, stringify } from 'yaml';
import type { Routine, RoutineNode, Step } from '../types';
import { isBlock } from '../types.ts';
import { parseDuration, formatStepDuration } from './duration.ts';

export class RoutineFormatError extends Error {}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function parseNodes(items: unknown, path: string): RoutineNode[] {
  if (!Array.isArray(items)) {
    throw new RoutineFormatError(`${path}: ожидается список`);
  }
  return items.map((item, i) => parseNode(item, `${path}[${i}]`));
}

function parseNode(item: unknown, path: string): RoutineNode {
  if (!isPlainObject(item)) {
    throw new RoutineFormatError(`${path}: ожидается "Метка: значение"`);
  }
  const keys = Object.keys(item);
  if (keys.length !== 1) {
    throw new RoutineFormatError(`${path}: в элементе должна быть ровно одна метка, найдено ${keys.length}`);
  }
  const label = keys[0];
  const value = item[label];
  const here = `${path} "${label}"`;

  if (Array.isArray(value)) {
    return { label, repeats: 1, children: parseNodes(value, here) };
  }

  if (isPlainObject(value)) {
    const extra = Object.keys(value).filter(k => k !== 'repeat' && k !== 'steps');
    if (extra.length > 0) {
      throw new RoutineFormatError(`${here}: неизвестные поля ${extra.join(', ')}`);
    }
    const repeat = value.repeat ?? 1;
    if (!Number.isInteger(repeat) || (repeat as number) < 1) {
      throw new RoutineFormatError(`${here}: repeat должен быть целым числом >= 1`);
    }
    return { label, repeats: repeat as number, children: parseNodes(value.steps, here) };
  }

  const parsed = parseDuration(value);
  if (!parsed) {
    throw new RoutineFormatError(`${here}: не удалось разобрать длительность "${String(value)}"`);
  }
  const step: Step = { label, duration: parsed.duration };
  if (parsed.unit) step.unit = parsed.unit;
  if (parsed.wait) step.pause = true;
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
  return { name: doc.name, data: parseNodes(doc.steps, 'steps') };
}

function toYamlNode(node: RoutineNode): Record<string, unknown> {
  if (isBlock(node)) {
    const children = node.children.map(toYamlNode);
    return { [node.label]: node.repeats === 1 ? children : { repeat: node.repeats, steps: children } };
  }
  return { [node.label]: formatStepDuration(node) };
}

export function serializeRoutineYaml(routine: Pick<Routine, 'name' | 'data'>): string {
  return stringify({ name: routine.name, steps: routine.data.map(toYamlNode) }, { lineWidth: 0 });
}

import type { Routine as LegacyRoutine, RoutineNode as LegacyNode } from '../types';
import { isBlock } from '../types.ts';

export interface Interval {
  kind: 'interval';
  label: string;
  duration: number; // in `unit`
  unit: 's' | 'm';
  confirm?: boolean; // after the countdown, wait for the user
}

export interface Action {
  kind: 'action'; // no duration: wait until done, time is measured
  label: string;
}

export interface Group {
  kind: 'group';
  label: string;
  repeat: number;
  steps: Node[];
}

export interface Branch {
  label: string;
  steps: Node[];
}

export interface Parallel {
  kind: 'parallel'; // all branches start together, ends when all are done
  label: string;
  branches: Branch[];
}

export type Node = Interval | Action | Group | Parallel;

export interface Routine {
  name: string;
  steps: Node[];
}

export function intervalSeconds(step: Interval): number {
  return step.unit === 'm' ? step.duration * 60 : step.duration;
}

// Known lower bound: actions count as 0, a parallel block takes its longest branch
export function plannedSeconds(nodes: Node[]): number {
  let total = 0;
  for (const node of nodes) {
    switch (node.kind) {
      case 'interval':
        total += intervalSeconds(node);
        break;
      case 'action':
        break;
      case 'group':
        total += plannedSeconds(node.steps) * node.repeat;
        break;
      case 'parallel':
        total += Math.max(0, ...node.branches.map(b => plannedSeconds(b.steps)));
        break;
    }
  }
  return total;
}

export function hasActions(nodes: Node[]): boolean {
  return nodes.some(node =>
    node.kind === 'action' ||
    (node.kind === 'group' && hasActions(node.steps)) ||
    (node.kind === 'parallel' && node.branches.some(b => hasActions(b.steps))));
}

function fromLegacyNode(node: LegacyNode): Node {
  if (isBlock(node)) {
    return { kind: 'group', label: node.label, repeat: node.repeats, steps: node.children.map(fromLegacyNode) };
  }
  const interval: Interval = { kind: 'interval', label: node.label, duration: node.duration, unit: node.unit === 'm' ? 'm' : 's' };
  if (node.pause) interval.confirm = true;
  return interval;
}

export function fromLegacy(routine: LegacyRoutine): Routine {
  return { name: routine.name, steps: routine.data.map(fromLegacyNode) };
}

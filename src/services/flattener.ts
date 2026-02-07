import type { RoutineNode, FlatStep } from '../types';
import { isBlock, stepSeconds } from '../types';

export function flatten(nodes: RoutineNode[]): FlatStep[] {
  const result: FlatStep[] = [];

  function walk(items: RoutineNode[]): void {
    for (const node of items) {
      if (isBlock(node)) {
        for (let i = 0; i < node.repeats; i++) {
          walk(node.children);
        }
      } else {
        result.push({
          label: node.label,
          duration: stepSeconds(node),
          index: result.length,
          pause: node.pause,
        });
      }
    }
  }

  walk(nodes);
  return result;
}

import type { Interval } from './model.ts';

export type ParsedStep =
  | { kind: 'interval'; duration: number; unit: 's' | 'm'; confirm: boolean }
  | { kind: 'action' };

const SINGLE = /^(\d+(?:\.\d+)?)(s|m)$/;
const COMBINED = /^(\d+)m(\d+)s$/;

// "20s", "5m", "1m30s", "1.5m", bare number = seconds; " wait" suffix = confirm; "wait" alone = action
export function parseStepValue(value: unknown): ParsedStep | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? { kind: 'interval', duration: value, unit: 's', confirm: false } : null;
  }
  if (typeof value !== 'string') return null;

  let text = value.trim();
  if (text === 'wait') return { kind: 'action' };

  let confirm = false;
  const waitMatch = /^(.*?)\s+wait$/.exec(text);
  if (waitMatch) {
    text = waitMatch[1];
    confirm = true;
  }

  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const n = Number(text);
    return n > 0 ? { kind: 'interval', duration: n, unit: 's', confirm } : null;
  }

  const combined = COMBINED.exec(text);
  if (combined) {
    const seconds = Number(combined[1]) * 60 + Number(combined[2]);
    return seconds > 0 ? { kind: 'interval', duration: seconds, unit: 's', confirm } : null;
  }

  const single = SINGLE.exec(text);
  if (single) {
    const n = Number(single[1]);
    if (n <= 0) return null;
    return { kind: 'interval', duration: n, unit: single[2] as 's' | 'm', confirm };
  }

  return null;
}

export function formatInterval(step: Interval): string {
  let text: string;
  if (step.unit === 'm') {
    text = `${step.duration}m`;
  } else if (step.duration > 60 && Number.isInteger(step.duration) && step.duration % 60 !== 0) {
    // 90 -> "1m30s"; multiples of 60 stay "120s" so the unit survives a round trip
    text = `${Math.floor(step.duration / 60)}m${step.duration % 60}s`;
  } else {
    text = `${step.duration}s`;
  }
  return step.confirm ? `${text} wait` : text;
}

import type { Step } from '../types';

export interface ParsedDuration {
  duration: number;
  unit?: 'm';
  wait: boolean;
}

const SINGLE = /^(\d+(?:\.\d+)?)(s|m)$/;
const COMBINED = /^(\d+)m(\d+)s$/;

// "20s", "5m", "1m30s", "1.5m", bare number = seconds; optional " wait" suffix
export function parseDuration(value: unknown): ParsedDuration | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? { duration: value, wait: false } : null;
  }
  if (typeof value !== 'string') return null;

  let text = value.trim();
  let wait = false;
  const waitMatch = /^(.*?)\s+wait$/.exec(text);
  if (waitMatch) {
    text = waitMatch[1];
    wait = true;
  }

  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const n = Number(text);
    return n > 0 ? { duration: n, wait } : null;
  }

  const combined = COMBINED.exec(text);
  if (combined) {
    const seconds = Number(combined[1]) * 60 + Number(combined[2]);
    return seconds > 0 ? { duration: seconds, wait } : null;
  }

  const single = SINGLE.exec(text);
  if (single) {
    const n = Number(single[1]);
    if (n <= 0) return null;
    return single[2] === 'm' ? { duration: n, unit: 'm', wait } : { duration: n, wait };
  }

  return null;
}

export function formatStepDuration(step: Step): string {
  let text: string;
  if (step.unit === 'm') {
    text = `${step.duration}m`;
  } else if (step.duration > 60 && Number.isInteger(step.duration) && step.duration % 60 !== 0) {
    // 90 -> "1m30s"; multiples of 60 stay "120s" so the unit survives a round trip
    text = `${Math.floor(step.duration / 60)}m${step.duration % 60}s`;
  } else {
    text = `${step.duration}s`;
  }
  return step.pause ? `${text} wait` : text;
}

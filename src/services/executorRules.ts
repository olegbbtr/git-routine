export const HALF_ANNOUNCE_MIN_SECONDS = 30;

export function shouldAnnounceHalfway(stepDurationSeconds: number): boolean {
  return stepDurationSeconds >= HALF_ANNOUNCE_MIN_SECONDS;
}

import { showToast } from './toast';

let wakeLock: WakeLockSentinel | null = null;

export async function acquire(): Promise<void> {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast(`Wake Lock failed: ${msg}`, 'error', true);
  }
}

export async function release(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

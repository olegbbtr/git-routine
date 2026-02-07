let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playBeep(frequency: number, durationMs: number = 150): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.value = 0.3;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000);
}

// High-High-Low pattern for final 3 seconds
export function playCountdownBeep(secondsLeft: number): void {
  if (secondsLeft === 3 || secondsLeft === 2) {
    playBeep(880, 150); // high
  } else if (secondsLeft === 1) {
    playBeep(440, 300); // low
  }
}

/** Unlock AudioContext and SpeechSynthesis on user gesture. */
export function unlockAudio(): void {
  getAudioContext().resume();
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

export function speak(text: string, lang?: string, voiceURI?: string): void {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
  // Small delay after cancel to work around Chrome/Safari bugs
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 0.8;
    if (lang) utterance.lang = lang;
    if (voiceURI) {
      const voice = speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }
    speechSynthesis.speak(utterance);
  }, 50);
}

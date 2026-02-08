import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { navigate } from '../app';
import type { FlatStep, SessionLog } from '../types';
import { generateId, formatDuration } from '../types';
import { getRoutine, saveRoutine, addSessionLog, loadSettings } from '../services/storage';
import { pushHistory } from '../services/github';
import { showToast } from '../services/toast';
import { flatten } from '../services/flattener';
import { playCountdownBeep, unlockAudio, speak } from '../services/audio';
import { shouldAnnounceHalfway } from '../services/executorRules';
import * as wakelock from '../services/wakelock';
import { ArrowLeft, X, Pencil, Play, Pause as PauseIcon, SkipBack, SkipForward } from '../icons';

export function Executor({ filename }: { filename: string }) {
  const routine = getRoutine(filename);
  const [steps] = useState<FlatStep[]>(() => routine ? flatten(routine.data) : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => steps.length > 0 ? steps[0].duration : 0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);

  const settings = useRef(loadSettings());
  const [warmupTimeLeft, setWarmupTimeLeft] = useState(settings.current.warmupDuration);

  const say = (text: string) => {
    const s = settings.current;
    speak(text, s.announceLang, s.announceVoiceURI);
  };

  const startTimeRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const lastTickRef = useRef(0);
  const rafRef = useRef(0);
  const currentIndexRef = useRef(0);
  const spokenCurrentRef = useRef(false);
  const spokenNextRef = useRef(false);
  const spokenHalfwayRef = useRef(false);
  const warmupDoneRef = useRef(false);
  const warmupRafRef = useRef(0);
  const warmupStartTimeRef = useRef(0);
  const warmupLastTickRef = useRef(0);

  // Mark routine as executed on mount
  useEffect(() => {
    if (routine) {
      saveRoutine(filename, { ...routine, executed: new Date().toISOString() });
    }
  }, []);

  const saveSession = useCallback(() => {
    if (!routine) return;
    const log: SessionLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      routineName: routine.name,
      durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
    };
    addSessionLog(log);
    const s = settings.current;
    if (s.githubToken && s.repo) {
      pushHistory(s.repo, s.githubToken, routine.name).catch(() => showToast('GitHub sync failed'));
    }
  }, [routine]);

  const handleExit = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(warmupRafRef.current);
    wakelock.release();
    saveSession();
    navigate('');
  }, [saveSession]);

  // Warmup timer
  useEffect(() => {
    if (!warmingUp || steps.length === 0) return;

    warmupStartTimeRef.current = Date.now();
    warmupLastTickRef.current = warmupTimeLeft;

    const tick = () => {
      const elapsed = (Date.now() - warmupStartTimeRef.current) / 1000;
      const remaining = Math.max(0, warmupLastTickRef.current - elapsed);
      setWarmupTimeLeft(remaining);

      // Announce next step during warmup
      const s = settings.current;
      if (s.announceNext && !spokenNextRef.current && remaining <= s.announceNextSeconds && steps.length > 0) {
        say('Next: ' + steps[0].label);
        spokenNextRef.current = true;
      }

      if (remaining <= 0) {
        warmupDoneRef.current = true;
        setWarmingUp(false);
        spokenCurrentRef.current = false;
        spokenNextRef.current = false;
        spokenHalfwayRef.current = false;
        setRunning(true);
        return;
      }

      warmupRafRef.current = requestAnimationFrame(tick);
    };

    warmupRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(warmupRafRef.current);
  }, [warmingUp, warmupTimeLeft, steps]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const resetStep = useCallback((nextIdx: number) => {
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    const duration = steps[nextIdx].duration;
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    lastTickRef.current = duration;
    spokenCurrentRef.current = false;
    spokenNextRef.current = false;
    spokenHalfwayRef.current = false;
  }, [steps]);

  // Timer loop using requestAnimationFrame + Date.now() for precision
  useEffect(() => {
    if (!running || done || steps.length === 0) return;

    startTimeRef.current = Date.now();
    lastTickRef.current = timeLeft;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, lastTickRef.current - elapsed);

      setTimeLeft(remaining);

      const s = settings.current;
      const idx = currentIndexRef.current;

      // Announce current step at start
      if (s.announceCurrent && !spokenCurrentRef.current) {
        say(steps[idx].label);
        spokenCurrentRef.current = true;
      }

      // Announce next step N seconds before current ends
      if (s.announceNext && !spokenNextRef.current && remaining <= s.announceNextSeconds) {
        const nextIdx = idx + 1;
        if (nextIdx < steps.length) {
          say('Next: ' + steps[nextIdx].label);
        }
        spokenNextRef.current = true;
      }

      // Announce halfway
      const halfDuration = steps[idx].duration / 2;
      if (s.announceHalfway && shouldAnnounceHalfway(steps[idx].duration) && !spokenHalfwayRef.current && remaining <= halfDuration) {
        say('Halfway done');
        spokenHalfwayRef.current = true;
      }

      if (remaining <= 0) {
        // If current step has pause, stop and let user press play
        if (steps[idx].pause) {
          setTimeLeft(0);
          setRunning(false);
          return;
        }
        // Move to next step
        const nextIdx = idx + 1;
        if (nextIdx >= steps.length) {
          setDone(true);
          setRunning(false);
          wakelock.release();
          if (s.announceCompletion) {
            say('Complete');
          }
          saveSession();
          return;
        }
        resetStep(nextIdx);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, done, steps, saveSession, resetStep]);

  // Beep effect: watches timeLeft and fires beeps at second boundaries
  const prevSecRef = useRef(-1);
  useEffect(() => {
    const isActive = running || warmingUp;
    if (!isActive || !settings.current.enableBeeps) return;
    const time = warmingUp ? warmupTimeLeft : timeLeft;
    const sec = Math.ceil(time);
    if (sec !== prevSecRef.current && sec >= 1 && sec <= 3) {
      playCountdownBeep(sec);
    }
    prevSecRef.current = sec;
  }, [running, warmingUp, timeLeft, warmupTimeLeft]);

  // Wake lock
  useEffect(() => {
    if (running || warmingUp) wakelock.acquire();
    else wakelock.release();
  }, [running, warmingUp]);

  if (!routine || steps.length === 0) {
    return (
      <div>
        <div class="header">
          <button class="btn-icon" onClick={() => navigate('')}><ArrowLeft size={20} /></button>
          <h1>{routine ? routine.name : 'Not Found'}</h1>
        </div>
        <div class="empty">{routine ? 'This routine has no steps.' : 'Routine not found.'}</div>
      </div>
    );
  }

  const currentStep = steps[currentIndex];
  const pendingWarmup = !warmupDoneRef.current && settings.current.warmupDuration > 0 && !running && !done;
  const showWarmup = warmingUp || pendingWarmup;
  const activeTime = showWarmup ? warmupTimeLeft : timeLeft;
  const displayTime = Math.ceil(activeTime);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  const handlePlayPause = () => {
    unlockAudio();
    if (warmingUp) {
      setWarmingUp(false);
      return;
    }
    if (running) {
      setRunning(false);
      return;
    }
    // Stopped on a pause step → advance to next step
    if (timeLeft === 0 && steps[currentIndex].pause) {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= steps.length) {
        setDone(true);
        wakelock.release();
        if (settings.current.announceCompletion) say('Complete');
        saveSession();
        return;
      }
      resetStep(nextIdx);
      setRunning(true);
      return;
    }
    const s = settings.current;
    if (!warmupDoneRef.current && s.warmupDuration > 0) {
      setWarmupTimeLeft(prev => prev > 0 ? prev : s.warmupDuration);
      setWarmingUp(true);
    } else {
      setRunning(true);
    }
  };

  const handlePrev = () => {
    if (warmingUp || done) return;
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      resetStep(prevIdx);
    } else {
      resetStep(0);
    }
  };

  const handleNext = () => {
    if (warmingUp) {
      warmupDoneRef.current = true;
      setWarmingUp(false);
      setRunning(true);
      return;
    }
    const wasPaused = !running && timeLeft === 0 && steps[currentIndex].pause;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= steps.length) {
      setDone(true);
      setRunning(false);
      wakelock.release();
      if (settings.current.announceCompletion) {
        say('Complete');
      }
      saveSession();
      return;
    }
    resetStep(nextIdx);
    if (wasPaused) setRunning(true);
  };

  const isActive = running || warmingUp;

  return (
    <div>
      <div class="header">
        <button class="btn-icon" onClick={handleExit} title="Exit"><X size={20} /></button>
        <h1>{routine.name}</h1>
        <button class="btn-icon" onClick={() => navigate('edit/' + filename)} title="Edit"><Pencil size={20} /></button>
      </div>

      {done ? (
        <div class="executor-current">
          <div class="executor-label">Complete!</div>
          <button class="btn-primary" onClick={() => navigate('')} style="margin-top:16px">Back to Dashboard</button>
        </div>
      ) : (
        <>
          <div class="executor-current">
            <div class="executor-label">{showWarmup ? 'Get Ready' : currentStep.label}</div>
            {!running && timeLeft === 0 && currentStep.pause ? (
              <div class="executor-timer" style="font-size:24px;color:var(--text2)">Paused - tap play to continue</div>
            ) : (
              <div class="executor-timer">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : seconds}
              </div>
            )}
            {!showWarmup && <div class="card-sub">Step {currentIndex + 1} of {steps.length}</div>}
            <div class="executor-controls">
              <button class="btn-icon" onClick={handlePrev} title="Previous"><SkipBack size={20} /></button>
              <button class="btn-icon" onClick={handlePlayPause}>
                {isActive ? <PauseIcon size={20} /> : <Play size={20} />}
              </button>
              <button class="btn-icon" onClick={handleNext} title="Next"><SkipForward size={20} /></button>
            </div>
          </div>

          <div class="executor-steps">
            {steps.map((s, i) => (
              <div
                key={i}
                class={`executor-step ${i === currentIndex && !showWarmup ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`}
              >
                <span>{s.label}{s.pause ? ' ||' : ''}</span>
                <span>{formatDuration(s.duration)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

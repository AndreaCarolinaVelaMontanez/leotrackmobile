import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useTimerStore } from '../stores/timerStore';

export function useTimer() {
  const { startedAt, pausedElapsed, isRunning, isPaused } = useTimerStore();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recalculate = () => {
    const store = useTimerStore.getState();
    if (store.isPaused) {
      setElapsed(store.pausedElapsed);
    } else if (store.startedAt) {
      setElapsed(store.pausedElapsed + (Date.now() - store.startedAt));
    } else {
      setElapsed(0);
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      recalculate();
      intervalRef.current = setInterval(recalculate, 1000);
    } else if (isPaused) {
      recalculate();
    } else {
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, startedAt]);

  // Recalculate on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        recalculate();
      }
    });
    return () => sub.remove();
  }, []);

  return elapsed;
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerState {
  userBookId: string | null;
  startedAt: number | null; // timestamp
  pausedElapsed: number; // ms accumulated before pause
  isRunning: boolean;
  isPaused: boolean;
  start: (userBookId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => { startedAt: number; endedAt: number; durationMs: number } | null;
  reset: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      userBookId: null,
      startedAt: null,
      pausedElapsed: 0,
      isRunning: false,
      isPaused: false,

      start: (userBookId) =>
        set({
          userBookId,
          startedAt: Date.now(),
          pausedElapsed: 0,
          isRunning: true,
          isPaused: false,
        }),

      pause: () => {
        const { startedAt, pausedElapsed } = get();
        if (!startedAt) return;
        const elapsed = pausedElapsed + (Date.now() - startedAt);
        set({
          pausedElapsed: elapsed,
          startedAt: null,
          isRunning: true,
          isPaused: true,
        });
      },

      resume: () =>
        set({
          startedAt: Date.now(),
          isPaused: false,
        }),

      stop: () => {
        const { startedAt, pausedElapsed, userBookId } = get();
        if (!userBookId) return null;

        let totalMs = pausedElapsed;
        if (startedAt) {
          totalMs += Date.now() - startedAt;
        }

        const now = Date.now();
        const sessionStart = now - totalMs;

        set({
          userBookId: null,
          startedAt: null,
          pausedElapsed: 0,
          isRunning: false,
          isPaused: false,
        });

        return {
          startedAt: sessionStart,
          endedAt: now,
          durationMs: totalMs,
        };
      },

      reset: () =>
        set({
          userBookId: null,
          startedAt: null,
          pausedElapsed: 0,
          isRunning: false,
          isPaused: false,
        }),
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

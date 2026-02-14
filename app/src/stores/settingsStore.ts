import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'LIGHT' | 'DARK';
type LanguageMode = 'EN' | 'ES';

interface SettingsState {
  theme: ThemeMode;
  language: LanguageMode;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'LIGHT',
      language: 'EN',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

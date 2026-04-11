import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

type ThemeMode = 'LIGHT' | 'DARK';
type LanguageMode = 'EN' | 'ES';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLanguage: LanguageMode = deviceLang === 'es' ? 'ES' : 'EN';

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
      language: defaultLanguage,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import React, { createContext, useContext, useMemo } from 'react';
import { lightTheme, darkTheme, Theme } from './tokens';
import { useSettingsStore } from '../stores/settingsStore';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.theme);
  const isDark = themeMode === 'DARK';
  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo(() => ({ theme, isDark }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import i18n from '../src/i18n';
// Keep splash screen visible until the app is ready
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
});

/**
 * AuthGuard reacts to token changes AFTER initial load.
 * Handles: logout -> redirect to login, login -> redirect to library.
 * Initial redirect is handled by index.tsx.
 */
function AuthGuard() {
  const token = useAuthStore((s) => s.token);
  const segments = useSegments();
  const router = useRouter();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip initial mount — index.tsx handles the first redirect
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const inAuth = segments[0] === '(auth)';

    if (!token && !inAuth) {
      router.replace('/(auth)/login');
    } else if (token && inAuth) {
      router.replace('/(tabs)/library');
    }
  }, [token]);

  return null;
}

function InnerLayout() {
  const { isDark } = useTheme();
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    i18n.changeLanguage(language.toLowerCase());
  }, [language]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

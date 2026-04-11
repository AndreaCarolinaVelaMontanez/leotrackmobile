import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Wait for auth store to rehydrate from AsyncStorage/SecureStore
      if (!useAuthStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            resolve();
            unsub();
          });
          // Segunda verificación para cerrar la ventana de la race condition
          if (useAuthStore.persist.hasHydrated()) {
            unsub();
            resolve();
          }
        });
      }
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  // While splash is still visible, render nothing (splash covers the screen)
  if (!isReady) return null;

  if (token) return <Redirect href="/(tabs)/library" />;
  return <Redirect href="/(auth)/login" />;
}

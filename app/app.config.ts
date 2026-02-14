import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LeoTrack',
  slug: 'leotrack',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'leotrack',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#EEEEF0',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.leotrack.app',
  },
  android: {
    package: 'com.leotrack.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#EEEEF0',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-localization', 'expo-font', 'expo-splash-screen'],
  extra: {
    apiUrl: process.env.API_URL || 'https://leotrackmobile-production.up.railway.app',
  },
});

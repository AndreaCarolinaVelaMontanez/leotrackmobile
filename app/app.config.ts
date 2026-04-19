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
    image: './assets/icon2.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.leotrack.app',
    ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID
      ? {
          infoPlist: {
            CFBundleURLTypes: [
              {
                CFBundleURLSchemes: [process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID],
              },
            ],
          },
        }
      : {}),
  },
  android: {
    package: 'com.leotrack.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6C63FF',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-localization', 'expo-font', 'expo-splash-screen', 'expo-web-browser'],
  extra: {
    apiUrl: process.env.API_URL || 'https://leotrackmobile-production.up.railway.app',
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    googleIosReversedClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    eas: {
      projectId: '859f4e79-38c2-4c54-a0ba-a5a9ba90afc4',
    },
  },
});

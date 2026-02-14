import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const TOKEN_KEY = 'auth-token';

const secureTokenStorage: StateStorage = {
  getItem: async (name: string) => {
    const json = await AsyncStorage.getItem(name);
    if (!json) return null;
    const state = JSON.parse(json);
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (state.state) {
      state.state.token = token || null;
    }
    return JSON.stringify(state);
  },
  setItem: async (name: string, value: string) => {
    const parsed = JSON.parse(value);
    const token = parsed.state?.token || null;
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    if (parsed.state) {
      parsed.state.token = null;
    }
    await AsyncStorage.setItem(name, JSON.stringify(parsed));
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(name);
  },
};

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureTokenStorage),
    }
  )
);

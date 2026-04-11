import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';

const devHost = Constants.expoGoConfig?.debuggerHost?.split(':')[0] ?? 'localhost';
const prodUrl = Constants.expoConfig?.extra?.apiUrl || 'https://leotrackmobile-production.up.railway.app';
const API_URL = __DEV__
  ? `http://${devHost}:4500`
  : prodUrl;

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default client;

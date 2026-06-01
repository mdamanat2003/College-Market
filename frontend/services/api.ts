import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_URL = 'https://college-market-ahrs.onrender.com/api';

const isLocalhostUrl = (url: string | undefined) => !!url && /localhost|127\.0\.0\.1/i.test(url);

const getWebOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '');

const resolveApiUrl = (): string => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest?.debuggerHost;
  const lanHost = hostUri?.split(':')[0];

  // If an explicit API URL is provided, prefer it. On web we trust env values as-is.
  if (envApiUrl) {
    if (Platform.OS === 'web') return envApiUrl;
    // For native (Expo on device), replace localhost with LAN host if available.
    if (isLocalhostUrl(envApiUrl) && lanHost) {
      return envApiUrl.replace(/localhost|127\.0\.0\.1/g, lanHost);
    }
    return envApiUrl;
  }

  // No explicit env value — try LAN host (device) or web origin
  if (lanHost) {
    return `https://${lanHost}:3001/api`;
  }

  if (Platform.OS === 'web') {
    const origin = getWebOrigin();
    return origin ? `${origin}/api` : DEFAULT_API_URL;
  }

  return DEFAULT_API_URL;
};

export const API_URL = resolveApiUrl();

const resolveSocketUrl = (): string => {
  const envSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();
  if (envSocketUrl) return envSocketUrl;
  if (Platform.OS === 'web') return getWebOrigin();
  return API_URL.replace(/\/api$/, '');
};

export const SOCKET_URL = resolveSocketUrl();

if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(API_URL)) {
  console.warn(
    '[api] API URL resolves to localhost on a native device. If requests fail, set EXPO_PUBLIC_API_URL to your machine LAN IP (e.g. http://192.168.x.x:3001/api).'
  );
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach token if exists
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (like token expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expire ho gaya hai ya invalid hai
      await AsyncStorage.removeItem('userToken');
      // Aage chal ke hum yahan se user ko login screen par redirect kar sakte hain
    }
    return Promise.reject(error);
  }
);
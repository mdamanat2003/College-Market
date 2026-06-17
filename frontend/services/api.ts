import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_URL = 'https://college-market-ahrs.onrender.com/api';

const isLocalhostUrl = (url: string | undefined) => !!url && /localhost|127\.0\.0\.1/i.test(url);
const isLocalWebHost = () => {
  if (typeof window === 'undefined') return false;
  return /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
};

const getLocalDevApiUrl = (lanHost?: string) => {
  if (Platform.OS === 'web' && isLocalWebHost()) {
    return 'http://127.0.0.1:3001/api';
  }

  if (lanHost) {
    return `http://${lanHost}:3001/api`;
  }

  return null;
};

const resolveApiUrl = (): string => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest?.debuggerHost;
  const lanHost = hostUri?.split(':')[0];

  if (__DEV__) {
    const localDevApiUrl = getLocalDevApiUrl(lanHost);
    if (localDevApiUrl) return localDevApiUrl;
  }

  // If an explicit API URL is provided, prefer it. On web we trust env values as-is.
  if (envApiUrl) {
    // For native (Expo on device), replace localhost with LAN host if available.
    if (isLocalhostUrl(envApiUrl) && lanHost) {
      return envApiUrl.replace(/localhost|127\.0\.0\.1/g, lanHost);
    }
    return envApiUrl;
  }

  // No explicit env value — try LAN host (device) or default backend
  if (lanHost) {
    return `https://${lanHost}:3001/api`;
  }

  return DEFAULT_API_URL;
};

export const API_URL = resolveApiUrl();

const resolveSocketUrl = (): string => {
  const envSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();
  if (__DEV__) {
    if (Platform.OS === 'web' && isLocalWebHost()) {
      return 'http://127.0.0.1:3001';
    }

    const hostUri =
      (Constants.expoConfig as any)?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any)?.manifest?.debuggerHost;
    const lanHost = hostUri?.split(':')[0];
    if (lanHost) {
      return `http://${lanHost}:3001`;
    }
  }

  if (envSocketUrl) return envSocketUrl;
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
  // Removed default Content-Type to allow axios to handle it automatically
});

// Request Interceptor: Automatically attach token if exists
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userAccessToken');
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
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('userRefreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await AsyncStorage.setItem('userAccessToken', accessToken);
          await AsyncStorage.setItem('userRefreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token fail ho gaya (expired or invalid)
          await AsyncStorage.removeItem('userAccessToken');
          await AsyncStorage.removeItem('userRefreshToken');
          // Yahan hum event emit kar sakte hain ya store ko clear kar sakte hain
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
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
  timeout: 15000, // 15 seconds timeout for slow 2G/3G connections
});

// Helper for caching GET requests to AsyncStorage
const getCacheKey = (url?: string) => (url ? `@cache_${url.replace(/[^a-zA-Z0-9_]/g, '_')}` : null);

// Request Interceptor: Automatically attach token & check offline cache
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

// Response Interceptor: Auto-Retry + Stale-While-Revalidate Caching for slow internet
api.interceptors.response.use(
  async (response) => {
    // Cache GET response asynchronously for offline/slow internet fallback
    if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
      const cacheKey = getCacheKey(response.config.url);
      if (cacheKey && response.data) {
        AsyncStorage.setItem(cacheKey, JSON.stringify(response.data)).catch(() => {});
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // 1. Automatic Retry logic for network timeouts or network failures (up to 2 retries)
    const isNetworkOrTimeoutError = error.code === 'ECONNABORTED' || !error.response;
    if (isNetworkOrTimeoutError && (!originalRequest._retryCount || originalRequest._retryCount < 2)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * originalRequest._retryCount));
      console.log(`[api] Slow Network: Retrying request (${originalRequest._retryCount}/2): ${originalRequest.url}`);
      return api(originalRequest);
    }

    // 2. Token refresh handling (401 Unauthorized)
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
          await AsyncStorage.removeItem('userAccessToken');
          await AsyncStorage.removeItem('userRefreshToken');
          return Promise.reject(refreshError);
        }
      }
    }

    // 3. Offline / Slow Internet Cache Fallback for GET requests
    if (originalRequest.method?.toLowerCase() === 'get' && originalRequest.url) {
      const cacheKey = getCacheKey(originalRequest.url);
      if (cacheKey) {
        try {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            console.log(`[api] Serving cached response for offline/slow internet: ${originalRequest.url}`);
            return {
              data: JSON.parse(cachedData),
              status: 200,
              statusText: 'OK (Cached)',
              headers: { 'x-from-cache': 'true' },
              config: originalRequest,
            };
          }
        } catch (cacheErr) {
          console.error('[api] Error reading cache:', cacheErr);
        }
      }
    }

    return Promise.reject(error);
  }
);
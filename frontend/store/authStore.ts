import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  role: 'student' | 'admin' | 'user' | string;
  college?: string;
  rating?: number;
  ratingCount?: number;
  isDemo?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  sendRegistrationOtp: (data: { email: string, phone?: string }) => Promise<{success: boolean, message?: string}>;
  verifyRegistrationOtp: (data: { email: string, emailOtp: string }) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginAsDemo: () => void;
  ensureRealUser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, refreshToken, ...userData } = response.data;
      
      await AsyncStorage.setItem('userAccessToken', accessToken);
      await AsyncStorage.setItem('userRefreshToken', refreshToken);
      set({ user: userData, accessToken, refreshToken, isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  loginAsDemo: () => {
    const demoUser: User = {
      _id: 'demo_user_id',
      name: 'Demo User',
      username: 'demouser',
      email: 'demo@example.com',
      phone: '0000000000',
      role: 'student',
      college: 'Demo College',
      isDemo: true,
    };
    set({ 
      user: demoUser, 
      accessToken: 'demo_token', 
      refreshToken: 'demo_refresh_token',
      isLoading: false, 
      error: null 
    });
  },

  ensureRealUser: () => {
    const { user } = get();
    if (user?.isDemo) {
      return false;
    }
    return true;
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', userData);
      await AsyncStorage.removeItem('userAccessToken');
      await AsyncStorage.removeItem('userRefreshToken');
      set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  sendRegistrationOtp: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/send-registration-otp', data);
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  verifyRegistrationOtp: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/verify-registration-otp', data);
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'OTP verification failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userAccessToken');
    await AsyncStorage.removeItem('userRefreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  // App start hone par call karenge taaki user logged in rahe
  checkAuth: async () => {
    const accessToken = await AsyncStorage.getItem('userAccessToken');
    const refreshToken = await AsyncStorage.getItem('userRefreshToken');
    if (!accessToken) return;

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, accessToken, refreshToken });
    } catch {
      // checkAuth me refresh token logic automatic handle hoga interceptor se
      // Agar wo fail hota hai toh logout
      if (!refreshToken) {
        await AsyncStorage.removeItem('userAccessToken');
        set({ user: null, accessToken: null, refreshToken: null });
      }
    }
  },
}));

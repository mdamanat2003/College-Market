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
  avatar?: string;
  isVerified?: boolean;
  collegeIdProof?: string;
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
  updateProfile: (formData: FormData) => Promise<boolean>;
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
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
    AsyncStorage.setItem('userData', JSON.stringify(demoUser)).catch(() => {});
    AsyncStorage.setItem('userAccessToken', 'demo_token').catch(() => {});
    AsyncStorage.setItem('userRefreshToken', 'demo_refresh_token').catch(() => {});
    set({ 
      user: demoUser, 
      accessToken: 'demo_token', 
      refreshToken: 'demo_refresh_token',
      isLoading: false, 
      error: null 
    });
  },

  ensureRealUser: () => {
    const { user, accessToken } = get();
    if (!user || user.isDemo || !accessToken) {
      return false;
    }
    return true;
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const isFormData = userData instanceof FormData;
      await api.post('/auth/register', userData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      await AsyncStorage.removeItem('userAccessToken');
      await AsyncStorage.removeItem('userRefreshToken');
      await AsyncStorage.removeItem('userData');
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

  updateProfile: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        set({ user: response.data.user, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userAccessToken');
    await AsyncStorage.removeItem('userRefreshToken');
    await AsyncStorage.removeItem('userData');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  // App start/reopen hone par local cache se instant user hydrate karo, phir background me revalidate karo
  checkAuth: async () => {
    const accessToken = await AsyncStorage.getItem('userAccessToken');
    const refreshToken = await AsyncStorage.getItem('userRefreshToken');
    const cachedUserData = await AsyncStorage.getItem('userData');

    // 1. Instant 0ms hydration from local AsyncStorage cache
    if (cachedUserData) {
      try {
        const parsedUser = JSON.parse(cachedUserData);
        set({ user: parsedUser, accessToken, refreshToken });
      } catch (e) {
        console.error('Error parsing cached user:', e);
      }
    }

    if (!accessToken) return;

    // 2. Background Revalidation (doesn't block UI render)
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        set({ user: response.data.user, accessToken, refreshToken });
      }
    } catch {
      if (!refreshToken) {
        await AsyncStorage.removeItem('userAccessToken');
        await AsyncStorage.removeItem('userRefreshToken');
        await AsyncStorage.removeItem('userData');
        set({ user: null, accessToken: null, refreshToken: null });
      }
    }
  },
}));

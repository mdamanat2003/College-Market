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
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginAsDemo: () => void;
  ensureRealUser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, ...userData } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      set({ user: userData, token, isLoading: false });
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
    set({ user: demoUser, token: 'demo_token', isLoading: false, error: null });
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
      await AsyncStorage.removeItem('userToken');
      set({ user: null, token: null, isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    set({ user: null, token: null });
  },

  // App start hone par call karenge taaki user logged in rahe
  checkAuth: async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, token });
    } catch {
      await AsyncStorage.removeItem('userToken');
      set({ user: null, token: null });
    }
  },
}));

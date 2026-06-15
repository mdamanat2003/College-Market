import { create } from 'zustand';
import { api } from '../services/api';

export interface LostFoundItem {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  title: string;
  description: string;
  type: 'Lost' | 'Found';
  category: string;
  location: string;
  date: string;
  image?: string;
  status: 'Active' | 'Resolved';
  createdAt: string;
}

interface LostFoundState {
  items: LostFoundItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: (filters?: { type?: string; category?: string; search?: string }) => Promise<void>;
  reportItem: (formData: FormData) => Promise<boolean>;
  updateStatus: (id: string, status: string) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
}

export const useLostFoundStore = create<LostFoundState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.category && filters.category !== 'All') query.append('category', filters.category);
      if (filters.search) query.append('search', filters.search);

      const response = await api.get(`/lost-found?${query.toString()}`);
      set({ items: response.data.items, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch items', 
        isLoading: false 
      });
    }
  },

  reportItem: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/lost-found', formData);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Report failed', 
        isLoading: false 
      });
      return false;
    }
  },

  updateStatus: async (id, status) => {
    try {
      console.log(`[Store] Updating status for ${id} to ${status}`);
      const response = await api.patch(`/lost-found/${id}`, { status });
      const updatedItem = response.data.item;
      
      // Update local state
      set((state) => ({
        items: state.items.map((item) => 
          item._id === id ? updatedItem : item
        ),
        error: null
      }));
      return true;
    } catch (error: any) {
      console.error("Update Status Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const serverMessage = error.response?.data?.message;
      const errorMessage = serverMessage || `Update failed: ${error.message}`;
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteItem: async (id) => {
    try {
      await api.delete(`/lost-found/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item._id !== id)
      }));
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Delete failed' });
      return false;
    }
  },
}));
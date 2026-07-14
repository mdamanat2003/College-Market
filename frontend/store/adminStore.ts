import { create } from 'zustand';
import { api } from '../services/api';

interface AdminState {
  stats: any | null;
  users: any[];
  products: any[];
  escrows: any[]; // Naya array escrows ke liye
  transactions: any[];
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  fetchUsers: (search?: string) => Promise<void>;
  toggleBlockUser: (userId: string) => Promise<void>;
  toggleVerifyUser: (userId: string) => Promise<void>;
  fetchProducts: (search?: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  fetchEscrows: () => Promise<void>; // Naya function
  fetchTransactions: () => Promise<void>;
  resolveEscrow: (orderId: string, action: 'release' | 'refund') => Promise<void>; // Naya function
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  users: [],
  products: [],
  escrows: [], // Initialize state
  transactions: [],
  isLoading: false,

  fetchStats: async () => { /* ... purana code ... */
    set({ isLoading: true });
    try {
      const response = await api.get('/admin/stats');
      set({ stats: response.data.stats || response.data, isLoading: false });
    } catch (error) { set({ isLoading: false }); }
  },

  fetchUsers: async (search = '') => { /* ... purana code ... */
    set({ isLoading: true });
    try {
      const response = await api.get(`/admin/users?search=${search}`);
      set({ users: response.data.users || [], isLoading: false });
    } catch (error) { set({ isLoading: false }); }
  },

  toggleBlockUser: async (userId) => { /* ... purana code ... */
    try {
      const response = await api.put(`/admin/users/${userId}/block`);
      const updatedUsers = get().users.map(user => user._id === userId ? { ...user, isBlocked: response.data.isBlocked } : user);
      set({ users: updatedUsers });
    } catch (error) { console.error(error); }
  },

  toggleVerifyUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/verify`);
      const updatedUsers = get().users.map(user => user._id === userId ? { ...user, isVerified: response.data.isVerified } : user);
      set({ users: updatedUsers });
    } catch (error) { console.error(error); }
  },

  fetchProducts: async (search = '') => { /* ... purana code ... */
    set({ isLoading: true });
    try {
      const response = await api.get(`/admin/products?search=${search}`);
      set({ products: response.data.products || [], isLoading: false });
    } catch (error) { set({ isLoading: false }); }
  },

  deleteProduct: async (productId) => { /* ... purana code ... */
    try {
      await api.delete(`/admin/products/${productId}`);
      set({ products: get().products.filter(p => p._id !== productId) });
    } catch (error) { console.error(error); }
  },

  // 👇 NAYE ESCROW FUNCTIONS
  fetchEscrows: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/admin/escrow');
      set({ escrows: response.data.orders || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch escrows", error);
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/admin/transactions');
      set({ transactions: response.data.orders || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      set({ isLoading: false });
    }
  },

  resolveEscrow: async (orderId, action) => {
    try {
      await api.put(`/admin/escrow/${orderId}/resolve`, { action });
      // Resolve hone ke baad us order ko list se hata do (kyunki ab wo pending nahi raha)
      set({ escrows: get().escrows.filter(o => o._id !== orderId) });
      // Stats bhi update kar do
      get().fetchStats();
    } catch (error) {
      console.error(`Error trying to ${action} escrow:`, error);
    }
  }
}));
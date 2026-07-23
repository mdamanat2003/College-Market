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
  updateUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
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

  toggleBlockUser: async (userId) => {
    const previousUsers = get().users;
    const target = previousUsers.find(u => u._id === userId);
    if (!target) return;

    // Optimistically update UI immediately (0ms latency)
    set({
      users: previousUsers.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u)
    });

    try {
      const response = await api.put(`/admin/users/${userId}/block`);
      set({
        users: get().users.map(u => u._id === userId ? { ...u, isBlocked: response.data.isBlocked } : u)
      });
    } catch (error) {
      console.error(error);
      // Revert if request failed
      set({ users: previousUsers });
    }
  },

  toggleVerifyUser: async (userId) => {
    const previousUsers = get().users;
    const target = previousUsers.find(u => u._id === userId);
    if (!target) return;

    // Optimistically update UI immediately (0ms latency)
    set({
      users: previousUsers.map(u => u._id === userId ? { ...u, isVerified: !u.isVerified } : u)
    });

    try {
      const response = await api.put(`/admin/users/${userId}/verify`);
      set({
        users: get().users.map(u => u._id === userId ? { ...u, isVerified: response.data.isVerified } : u)
      });
    } catch (error) {
      console.error(error);
      // Revert if request failed
      set({ users: previousUsers });
    }
  },

  updateUserPassword: async (userId, newPassword) => {
    try {
      const response = await api.put(`/admin/users/${userId}/password`, { newPassword });
      return { success: true, message: response.data.message || 'Password updated successfully' };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user password'
      };
    }
  },

  deleteUser: async (userId) => {
    const previousUsers = get().users;
    // Optimistically remove user from list immediately
    set({ users: previousUsers.filter(u => u._id !== userId) });

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      get().fetchStats();
      return { success: true, message: response.data.message || 'User deleted successfully' };
    } catch (error: any) {
      console.error(error);
      // Revert if request failed
      set({ users: previousUsers });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user'
      };
    }
  },

  fetchProducts: async (search = '') => { /* ... purana code ... */
    set({ isLoading: true });
    try {
      const response = await api.get(`/admin/products?search=${search}`);
      set({ products: response.data.products || [], isLoading: false });
    } catch (error) { set({ isLoading: false }); }
  },

  deleteProduct: async (productId) => {
    const previousProducts = get().products;
    // Optimistically remove product immediately
    set({ products: previousProducts.filter(p => p._id !== productId) });

    try {
      await api.delete(`/admin/products/${productId}`);
      get().fetchStats();
    } catch (error) {
      console.error(error);
      // Revert if request failed
      set({ products: previousProducts });
    }
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
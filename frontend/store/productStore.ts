import { create } from 'zustand';
import { api } from '../services/api';

interface ProductState {
  products: any[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string, search?: string) => Promise<void>;
  fetchProductById: (productId: string) => Promise<any | null>;
  addProduct: (productData: any) => Promise<boolean>; // <-- Naya function
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (category = '', search = '') => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (category && category !== 'All') query.append('category', category);
      if (search) query.append('search', search);

      const response = await api.get(`/products?${query.toString()}`);
      set({ products: response.data.products, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchProductById: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/products/${productId}`);
      set({ isLoading: false });
      return response.data.product;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch product', isLoading: false });
      return null;
    }
  },

  // Naya function add kiya
  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/products', productData);
      // Naye product ko turant list me add kar denge taaki refresh na karna pade
      set((state) => ({ 
        products: [response.data.product, ...state.products],
        isLoading: false 
      }));
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add product', isLoading: false });
      return false;
    }
  }
}));
import { create } from 'zustand';
import { api } from '../services/api';

interface OrderState {
  orders: any[];
  isLoading: boolean;
  error: string | null;
  createOrder: (productId: string) => Promise<any>;
  verifyPayment: (paymentData: any) => Promise<boolean>;
  fetchMyOrders: () => Promise<void>; // Naya
  releaseEscrow: (orderId: string) => Promise<boolean>; // Naya
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  createOrder: async (productId) => { /* Create order on backend and return response */
    set({ isLoading: true, error: null });
    try {
      // Backend exposes checkout at POST /api/orders/checkout
      const response = await api.post('/orders/checkout', { productId });
      set({ isLoading: false });
      // Backend returns { success, orderId, razorpayOrderId, amount, currency }
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create order', isLoading: false });
      return null;
    }
  },

  verifyPayment: async (paymentData) => { /* ... Purana code same rahega ... */ 
    set({ isLoading: true, error: null });
    try {
      await api.post('/orders/verify', paymentData);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Payment verification failed', isLoading: false });
      return false;
    }
  },

  // NAYA: User ke saare orders fetch karna (Khareede hue aur Beche hue)
  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/orders');
      set({ orders: response.data.orders, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  // NAYA: Buyer item aane ke baad funds release karega
  releaseEscrow: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/orders/${orderId}/release`);
      
      // Local state update kardo taaki refresh na karna pade
      const updatedOrders = get().orders.map(order => 
        order._id === orderId ? { ...order, status: 'Completed' } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to release funds', isLoading: false });
      return false;
    }
  }
}));
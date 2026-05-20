import { create } from 'zustand';
import { api } from '../services/api';

interface OrderState {
  orders: any[];
  isLoading: boolean;
  error: string | null;
  createOrder: (productId: string) => Promise<any>;
  verifyPayment: (paymentData: any) => Promise<boolean>;
  fetchMyOrders: () => Promise<void>;
  releaseEscrow: (orderId: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  createOrder: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      // Backend exposes order creation at POST /orders/create
      const response = await api.post('/orders/create', { productId });
      set({ isLoading: false });
      // Return the raw response data: { orderId, razorpayOrderId, amount, currency }
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create order', isLoading: false });
      return null;
    }
  },

  verifyPayment: async (paymentData) => {
    set({ isLoading: true });
    try {
      // Backend expects camelCase Razorpay fields.
      const payload = {
        razorpayOrderId: paymentData.razorpayOrderId || paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpayPaymentId || paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpaySignature || paymentData.razorpay_signature,
        orderId: paymentData.orderId || paymentData.db_order_id,
      };

      await api.post('/orders/verify', payload);

      // Refresh local orders so profile shows purchase — run in background to avoid blocking UI
      get().fetchMyOrders().catch((err: any) => console.error('Fetch orders after verify failed', err));

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/orders');
      set({ orders: response.data.orders, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  releaseEscrow: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/orders/${orderId}/receive`);
      
      // Local state update kardo taaki refresh na karna pade
      const updatedOrders = get().orders.map(order => 
        order._id === orderId ? { ...order, deliveryStatus: 'Received', paymentStatus: 'Held' } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to release funds', isLoading: false });
      return false;
    }
  }
}));

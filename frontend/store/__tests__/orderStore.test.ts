import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrderStore } from '../orderStore';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const initialState = useOrderStore.getState();

describe('useOrderStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOrderStore.setState(initialState, true);
  });

  it('creates an order and returns the backend payload', async () => {
    const orderPayload = { orderId: 'order-1', razorpayOrderId: 'rzp-1', amount: 500, currency: 'INR' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: orderPayload });

    await expect(useOrderStore.getState().createOrder('product-1')).resolves.toEqual(orderPayload);

    expect(api.post).toHaveBeenCalledWith('/orders/create', { productId: 'product-1' });
    expect(useOrderStore.getState().isLoading).toBe(false);
  });

  it('sends camelCase payment fields expected by the backend', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { orders: [] } });

    await expect(
      useOrderStore.getState().verifyPayment({
        razorpayOrderId: 'rzp-order',
        razorpayPaymentId: 'rzp-payment',
        razorpaySignature: 'signature',
        orderId: 'db-order',
      })
    ).resolves.toBe(true);

    expect(api.post).toHaveBeenCalledWith('/orders/verify', {
      razorpayOrderId: 'rzp-order',
      razorpayPaymentId: 'rzp-payment',
      razorpaySignature: 'signature',
      orderId: 'db-order',
    });
  });

  it('marks an order as received so admin can release escrow', async () => {
    useOrderStore.setState({
      orders: [
        { _id: 'order-1', status: 'EscrowLocked', paymentStatus: 'Held', deliveryStatus: 'Pending' },
        { _id: 'order-2', status: 'Paid' },
      ],
    });
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    await expect(useOrderStore.getState().releaseEscrow('order-1')).resolves.toBe(true);

    expect(api.put).toHaveBeenCalledWith('/orders/order-1/receive');
    expect(useOrderStore.getState().orders).toEqual([
      { _id: 'order-1', status: 'EscrowLocked', paymentStatus: 'Held', deliveryStatus: 'Received' },
      { _id: 'order-2', status: 'Paid' },
    ]);
  });
});

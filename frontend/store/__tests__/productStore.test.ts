import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductStore } from '../productStore';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const initialState = useProductStore.getState();

describe('useProductStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductStore.setState(initialState, true);
  });

  it('fetches products with category and search filters', async () => {
    const products = [{ _id: 'product-1', title: 'Calculator' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: { products } });

    await useProductStore.getState().fetchProducts('Electronics', 'calc');

    expect(api.get).toHaveBeenCalledWith('/products?category=Electronics&search=calc');
    expect(useProductStore.getState()).toMatchObject({
      products,
      isLoading: false,
      error: null,
    });
  });

  it('does not send the All category as a filter', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { products: [] } });

    await useProductStore.getState().fetchProducts('All', '');

    expect(api.get).toHaveBeenCalledWith('/products?');
  });

  it('prepends a newly added product to the local list', async () => {
    const existingProduct = { _id: 'old', title: 'Old Book' };
    const newProduct = { _id: 'new', title: 'New Book' };
    useProductStore.setState({ products: [existingProduct] });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { product: newProduct } });

    await expect(useProductStore.getState().addProduct({ title: 'New Book' })).resolves.toBe(true);

    expect(api.post).toHaveBeenCalledWith('/products', { title: 'New Book' });
    expect(useProductStore.getState().products).toEqual([newProduct, existingProduct]);
  });

  it('returns null and stores an error when wishlist update fails', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'Login required' } },
    });

    await expect(useProductStore.getState().toggleWishlist('product-1')).resolves.toBeNull();

    expect(useProductStore.getState()).toMatchObject({
      error: 'Login required',
      isLoading: false,
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../authStore';
import { api } from '../../services/api';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const initialState = useAuthStore.getState();

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState(initialState, true);
  });

  it('stores the user and token after a successful login', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        token: 'token-123',
        _id: 'user-1',
        name: 'Asha',
        email: 'asha@example.com',
        phone: '9999999999',
        role: 'student',
      },
    });

    await expect(useAuthStore.getState().login({ email: 'asha@example.com', password: 'secret' })).resolves.toBe(true);

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'asha@example.com', password: 'secret' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'token-123');
    expect(useAuthStore.getState()).toMatchObject({
      token: 'token-123',
      isLoading: false,
      error: null,
      user: expect.objectContaining({ _id: 'user-1', email: 'asha@example.com' }),
    });
  });

  it('sets an error when login fails', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    await expect(useAuthStore.getState().login({ email: 'bad@example.com' })).resolves.toBe(false);

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: null,
      isLoading: false,
      error: 'Invalid credentials',
    });
  });

  it('loads the current user when a saved token exists', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce('saved-token');
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { user: { _id: 'user-2', name: 'Ravi', email: 'ravi@example.com' } },
    });

    await useAuthStore.getState().checkAuth();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(useAuthStore.getState()).toMatchObject({
      token: 'saved-token',
      user: expect.objectContaining({ _id: 'user-2' }),
    });
  });

  it('clears a bad saved token when checkAuth fails', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce('expired-token');
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

    await useAuthStore.getState().checkAuth();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null });
  });
});

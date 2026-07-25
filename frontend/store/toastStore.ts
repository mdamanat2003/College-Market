import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
  icon?: string;
  onPress?: () => void;
  duration?: number;
}

interface ToastState {
  currentToast: ToastData | null;
  showToast: (data: Omit<ToastData, 'id'>) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  currentToast: null,

  showToast: (data) => {
    const id = Date.now().toString();
    set({
      currentToast: {
        id,
        type: 'info',
        duration: 4000,
        ...data,
      },
    });
  },

  hideToast: () => {
    set({ currentToast: null });
  },
}));

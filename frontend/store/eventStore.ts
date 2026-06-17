import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface CampusEvent {
  _id: string;
  title: string;
  description: string;
  organizer: string;
  date: string;
  location: string;
  category: 'Cultural' | 'Technical' | 'Sports' | 'Workshop' | 'Other';
  image?: string;
  registrationLink?: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

interface EventState {
  events: CampusEvent[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: { category?: string; search?: string }) => Promise<void>;
  createEvent: (formData: FormData) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      isLoading: false,
      error: null,

      fetchEvents: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const query = new URLSearchParams();
          if (filters.category && filters.category !== 'All') query.append('category', filters.category);
          if (filters.search) query.append('search', filters.search);

          const response = await api.get(`/events?${query.toString()}`);
          set({ events: response.data.events, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch events', 
            isLoading: false 
          });
        }
      },

      createEvent: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/events', formData);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to create event', 
            isLoading: false 
          });
          return false;
        }
      },

      deleteEvent: async (id) => {
        try {
          await api.delete(`/events/${id}`);
          set((state) => ({
            events: state.events.filter((ev) => ev._id !== id)
          }));
          return true;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Delete failed' });
          return false;
        }
      },
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ events: state.events }),
    }
  )
);
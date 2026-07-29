import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface AcademicMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'link';
  branch: string;
  semester: string;
  subject: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
  downloads: number;
  createdAt: string;
}

interface AcademicState {
  materials: AcademicMaterial[];
  isLoading: boolean;
  error: string | null;
  fetchMaterials: (branch?: string, semester?: string, search?: string) => Promise<void>;
  uploadMaterial: (formData: FormData) => Promise<boolean>;
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set) => ({
      materials: [],
      isLoading: false,
      error: null,

      fetchMaterials: async (branch = '', semester = '', search = '') => {
        set({ isLoading: true, error: null });
        try {
          const query = new URLSearchParams();
          if (branch && branch !== 'All') query.append('branch', branch);
          if (semester && semester !== 'All') query.append('semester', semester);
          if (search && search.trim()) query.append('search', search.trim());

          const response = await api.get(`/academic?${query.toString()}`);
          set({ materials: Array.isArray(response.data) ? response.data : [], isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch materials', 
            isLoading: false,
            materials: []
          });
        }
      },

      uploadMaterial: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/academic/upload', formData);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Upload failed', 
            isLoading: false 
          });
          return false;
        }
      },
    }),
    {
      name: 'academic-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ materials: state.materials }),
    }
  )
);
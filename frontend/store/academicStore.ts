import { create } from 'zustand';
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
  fetchMaterials: (branch?: string, semester?: string) => Promise<void>;
  uploadMaterial: (formData: FormData) => Promise<boolean>;
}

export const useAcademicStore = create<AcademicState>((set) => ({
  materials: [],
  isLoading: false,
  error: null,

  fetchMaterials: async (branch = '', semester = '') => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (branch) query.append('branch', branch);
      if (semester) query.append('semester', semester);

      const response = await api.get(`/academic?${query.toString()}`);
      set({ materials: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch materials', 
        isLoading: false 
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
}));
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface CommunityPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    college?: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  image?: string;
  likes: string[];
  views: number;
  answersCount: number;
  status: 'Open' | 'Solved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  _id: string;
  post: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    college?: string;
  };
  content: string;
  isAnonymous: boolean;
  likes: string[];
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommunityState {
  posts: CommunityPost[];
  activePost: CommunityPost | null;
  comments: CommunityComment[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'latest' | 'popular' | 'unanswered';

  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'latest' | 'popular' | 'unanswered') => void;

  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  createPost: (formData: FormData) => Promise<boolean>;
  toggleLikePost: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, content: string, isAnonymous: boolean) => Promise<boolean>;
  toggleLikeComment: (postId: string, commentId: string, userId: string) => Promise<void>;
  acceptAnswer: (postId: string, commentId: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  deleteComment: (postId: string, commentId: string) => Promise<boolean>;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      activePost: null,
      comments: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      selectedCategory: 'All',
      searchQuery: '',
      sortBy: 'latest',

      setCategory: (category) => {
        set({ selectedCategory: category });
        get().fetchPosts();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().fetchPosts();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
        get().fetchPosts();
      },

      fetchPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { selectedCategory, searchQuery, sortBy } = get();
          const query = new URLSearchParams();
          if (selectedCategory && selectedCategory !== 'All') {
            query.append('category', selectedCategory);
          }
          if (searchQuery) query.append('search', searchQuery);
          if (sortBy) query.append('sort', sortBy);

          const response = await api.get(`/community/posts?${query.toString()}`);
          set({ posts: response.data.posts, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch community posts',
            isLoading: false,
          });
        }
      },

      fetchPostById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/community/posts/${id}`);
          set({
            activePost: response.data.post,
            comments: response.data.comments,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch post details',
            isLoading: false,
          });
        }
      },

      createPost: async (formData: FormData) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await api.post('/community/posts', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          if (response.data?.post) {
            set((state) => ({
              posts: [response.data.post, ...state.posts],
              isSubmitting: false,
            }));
            return true;
          }
          set({ isSubmitting: false });
          return false;
        } catch (error: any) {
          console.error('[communityStore] createPost error:', error.response?.data || error.message);
          set({
            error: error.response?.data?.message || 'Failed to create post',
            isSubmitting: false,
          });
          return false;
        }
      },

      toggleLikePost: async (postId: string, userId: string) => {
        try {
          // Optimistic update
          set((state) => {
            const updateList = (list: CommunityPost[]) =>
              list.map((p) => {
                if (p._id !== postId) return p;
                const liked = p.likes.includes(userId);
                const updatedLikes = liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId];
                return { ...p, likes: updatedLikes };
              });

            const newActive = state.activePost && state.activePost._id === postId
              ? {
                  ...state.activePost,
                  likes: state.activePost.likes.includes(userId)
                    ? state.activePost.likes.filter((id) => id !== userId)
                    : [...state.activePost.likes, userId],
                }
              : state.activePost;

            return {
              posts: updateList(state.posts),
              activePost: newActive,
            };
          });

          await api.post(`/community/posts/${postId}/like`);
        } catch (error: any) {
          console.error('Error toggling like:', error);
          get().fetchPosts();
        }
      },

      addComment: async (postId: string, content: string, isAnonymous: boolean) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await api.post(`/community/posts/${postId}/comments`, {
            content,
            isAnonymous,
          });

          if (response.data?.comment) {
            set((state) => ({
              comments: [...state.comments, response.data.comment],
              activePost: state.activePost
                ? { ...state.activePost, answersCount: state.activePost.answersCount + 1 }
                : null,
              posts: state.posts.map((p) =>
                p._id === postId ? { ...p, answersCount: p.answersCount + 1 } : p
              ),
              isSubmitting: false,
            }));
            return true;
          }
          set({ isSubmitting: false });
          return false;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add comment',
            isSubmitting: false,
          });
          return false;
        }
      },

      toggleLikeComment: async (postId: string, commentId: string, userId: string) => {
        try {
          set((state) => ({
            comments: state.comments.map((c) => {
              if (c._id !== commentId) return c;
              const liked = c.likes.includes(userId);
              const updatedLikes = liked ? c.likes.filter((id) => id !== userId) : [...c.likes, userId];
              return { ...c, likes: updatedLikes };
            }),
          }));

          await api.post(`/community/posts/${postId}/comments/${commentId}/like`);
        } catch (error: any) {
          console.error('Error toggling comment like:', error);
        }
      },

      acceptAnswer: async (postId: string, commentId: string) => {
        try {
          const response = await api.patch(`/community/posts/${postId}/comments/${commentId}/accept`);
          const { isAcceptedAnswer, postStatus } = response.data;

          set((state) => ({
            comments: state.comments.map((c) =>
              c._id === commentId
                ? { ...c, isAcceptedAnswer }
                : { ...c, isAcceptedAnswer: false }
            ),
            activePost: state.activePost ? { ...state.activePost, status: postStatus } : null,
            posts: state.posts.map((p) => (p._id === postId ? { ...p, status: postStatus } : p)),
          }));
          return true;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to accept answer' });
          return false;
        }
      },

      deletePost: async (postId: string) => {
        try {
          await api.delete(`/community/posts/${postId}`);
          set((state) => ({
            posts: state.posts.filter((p) => p._id !== postId),
            activePost: state.activePost?._id === postId ? null : state.activePost,
          }));
          return true;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete post' });
          return false;
        }
      },

      deleteComment: async (postId: string, commentId: string) => {
        try {
          await api.delete(`/community/posts/${postId}/comments/${commentId}`);
          set((state) => ({
            comments: state.comments.filter((c) => c._id !== commentId),
            activePost: state.activePost
              ? { ...state.activePost, answersCount: Math.max(0, state.activePost.answersCount - 1) }
              : null,
            posts: state.posts.map((p) =>
              p._id === postId ? { ...p, answersCount: Math.max(0, p.answersCount - 1) } : p
            ),
          }));
          return true;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete comment' });
          return false;
        }
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ posts: state.posts }),
    }
  )
);

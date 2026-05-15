import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api } from '../services/api';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface Message {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  conversations: any[];
  currentMessages: Message[];
  isTyping: boolean;
  
  // Actions
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, receiverId: string, senderId: string, text: string) => void;
  startConversation: (productId: string, sellerId: string) => Promise<string | null>; // <-- Naya action add kiya
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  currentMessages: [],
  isTyping: false,

  // 1. Initialize Global Socket Connection
  connectSocket: (userId) => {
    // Agar pehle se connected hai, toh dobara connect mat karo
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL);

    // Backend ko batao ki ye user online aa gaya hai
    socket.emit('setup', userId);

    // Live message listener
    socket.on('receive_message', (newMessage: Message) => {
      set((state) => ({
        currentMessages: [...state.currentMessages, newMessage],
      }));
    });

    // Typing indicators
    socket.on('typing', () => set({ isTyping: true }));
    socket.on('stop_typing', () => set({ isTyping: false }));

    set({ socket });
  },

  // 2. Disconnect on Logout
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, conversations: [], currentMessages: [] });
    }
  },

  // 3. Fetch all chat threads for the user
  fetchConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      set({ conversations: response.data.conversations });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  // 4. Fetch past messages for a specific chat room
  fetchMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      set({ currentMessages: response.data.messages });
      
      // Join the specific socket room for this chat
      const { socket } = get();
      if (socket) {
        socket.emit('join_chat', conversationId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  // 5. Send a live message via Socket
  sendMessage: (conversationId, receiverId, senderId, text) => {
    const { socket } = get();
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        receiverId,
        senderId,
        text,
      });

      // Optimistic UI Update (Turant screen par dikhao bina backend ka wait kiye)
      const optimisticMessage: Message = {
        _id: Math.random().toString(), // Temp ID
        sender: senderId,
        text,
        createdAt: new Date().toISOString(),
      };
      
      set((state) => ({
        currentMessages: [...state.currentMessages, optimisticMessage],
      }));
    }
  },

  // 6. Start or fetch an existing conversation (Product details page se call hoga)
  startConversation: async (productId, sellerId) => {
    try {
      const response = await api.post('/chat', { productId, sellerId });
      return response.data.conversation._id;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return null;
    }
  },
}));
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api, SOCKET_URL } from '../services/api';

interface Message {
  _id: string;
  sender: string | { _id: string; name?: string; avatar?: string };
  text: string;
  createdAt: string;
  conversation?: string;
  clientTempId?: string;
}

interface ChatState {
  socket: Socket | null;
  conversations: any[];
  currentMessages: Message[];
  isTyping: boolean;
  unreadNotifications: number;
  
  // Actions
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, receiverId: string, senderId: string, text: string) => void;
  startConversation: (productId: string, otherUserId: string) => Promise<string | null>;
  clearMessages: () => void; // <-- Naya: chat screen se bahar aane par messages clear karne ke liye
  fetchUnreadNotificationsCount: () => Promise<void>;
  setUnreadNotifications: (count: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  currentMessages: [],
  isTyping: false,
  unreadNotifications: 0,

  // 1. Initialize Global Socket Connection
  connectSocket: (userId) => {
    // Agar pehle se connected hai, toh dobara connect mat karo
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL);

    // Backend ko batao ki ye user online aa gaya hai
    socket.emit('setup', userId);

    // Live message listener
    socket.on('receive_message', (newMessage: Message) => {
      set((state) => {
        // ✅ BUG FIX: Prevent duplicate messages from appearing
        const isDuplicate = state.currentMessages.some((msg) => msg._id === newMessage._id);
        if (isDuplicate) return state;

        const optimisticIndex = newMessage.clientTempId
          ? state.currentMessages.findIndex((msg) => msg._id === newMessage.clientTempId)
          : -1;

        if (optimisticIndex >= 0) {
          const currentMessages = [...state.currentMessages];
          currentMessages[optimisticIndex] = newMessage;
          return {
            currentMessages,
            conversations: updateConversationPreview(state.conversations, newMessage),
          };
        }

        return {
          currentMessages: [...state.currentMessages, newMessage],
          conversations: updateConversationPreview(state.conversations, newMessage),
        };
      });
    });

    // Typing indicators
    socket.on('typing', () => set({ isTyping: true }));
    socket.on('stop_typing', () => set({ isTyping: false }));
    socket.on('new_notification', () => {
      set((state) => ({ unreadNotifications: state.unreadNotifications + 1 }));
    });

    set({ socket });
  },

  // 2. Disconnect on Logout
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, conversations: [], currentMessages: [], unreadNotifications: 0 });
    }
  },

  // 3. Fetch all chat threads for the user
  fetchConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      set({ conversations: response.data.conversations || [] });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  // 4. Fetch past messages for a specific chat room
  fetchMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      set((state) => {
        const conversation = response.data.conversation;
        const conversations = conversation
          ? mergeConversation(state.conversations, conversation)
          : state.conversations;

        return {
          currentMessages: response.data.messages || [],
          conversations,
        };
      });
      
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
    if (socket && conversationId && senderId && text.trim()) {
      // ✅ Generate a unique temporary ID for the optimistic UI
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      
      const optimisticMessage: Message = {
        _id: tempId, 
        sender: senderId,
        text,
        createdAt: new Date().toISOString(),
        conversation: conversationId,
      };
      
      // Optimistic UI Update (Turant screen par dikhao)
      set((state) => ({
        currentMessages: [...state.currentMessages, optimisticMessage],
        conversations: updateConversationPreview(state.conversations, optimisticMessage),
      }));

      // Send to server
      socket.emit('send_message', {
        conversationId,
        receiverId,
        senderId,
        text,
        clientTempId: tempId,
      });
    } else {
      console.error("Socket is not connected!");
    }
  },

  // 6. Start or fetch an existing conversation
  startConversation: async (productId, otherUserId) => {
    try {
      const response = await api.post('/chat', { productId, otherUserId });
      const conversation = response.data.conversation;
      if (conversation) {
        set((state) => {
          return {
            conversations: mergeConversation(state.conversations, conversation),
          };
        });
      }
      return conversation?._id || null;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return null;
    }
  },

  // 7. Clear current messages (Use when unmounting chat screen)
  clearMessages: () => set({ currentMessages: [] }),

  fetchUnreadNotificationsCount: async () => {
    try {
      const response = await api.get('/notifications');
      set({ unreadNotifications: response.data.unreadCount || 0 });
    } catch (error) {
      console.error('Failed to fetch unread notifications count:', error);
    }
  },

  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));

const getConversationId = (message: Message) => message.conversation;

const updateConversationPreview = (conversations: any[], message: Message) => {
  const conversationId = getConversationId(message);
  if (!conversationId) return conversations;

  return conversations.map((conversation) => (
    conversation._id === conversationId
      ? { ...conversation, lastMessage: message.text, updatedAt: message.createdAt }
      : conversation
  ));
};

const mergeConversation = (conversations: any[], conversation: any) => {
  const exists = conversations.some((item) => item._id === conversation._id);
  return exists
    ? conversations.map((item) => item._id === conversation._id ? conversation : item)
    : [conversation, ...conversations];
};

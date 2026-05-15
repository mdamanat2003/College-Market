import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

// User tracking: user_id map to socket_id
const onlineUsers = new Map<string, string>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New Socket Connected: ${socket.id}`);

    // 1. User online aata hai
    socket.on('setup', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // User ka personal room
      console.log(`👤 User Online: ${userId}`);
    });

    // 2. Room join karna (Specific chat ke liye)
    socket.on('join_chat', (room: string) => {
      socket.join(room);
      console.log(`🏠 User joined room: ${room}`);
    });

    // 3. Naya message bhejna
    socket.on('send_message', async (data) => {
      const { conversationId, senderId, receiverId, text } = data;

      try {
        // DB me save karein
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text,
        });

        // Conversation update karein
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          updatedAt: new Date()
        });

        // Receiver ko live message bhejein agar wo room me hai
        io.to(conversationId).emit('receive_message', message);
        
        // Receiver ko notification bhejein agar wo room me nahi hai
        // Notification system hum aage build karenge

      } catch (error) {
        console.error('Message Send Error:', error);
      }
    });

    // 4. Typing indicators
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    // 5. User offline jata hai
    socket.on('disconnect', () => {
      console.log(`🔌 Socket Disconnected: ${socket.id}`);
      // Find and remove user from map
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          break;
        }
      }
    });
  });
};
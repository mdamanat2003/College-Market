import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { sendPushNotificationToUser, sendPushNotificationToUsers } from '../utils/pushNotification';

// User tracking: user_id map to socket_id
const onlineUsers = new Map<string, string>();

// Keep a module-level reference to io so other modules can emit events
let ioServer: Server | null = null;

export const getIo = () => ioServer;

export const notifyUser = (userId: string, payload: any) => {
  if (!ioServer) return;
  try {
    ioServer.to(userId).emit('new_notification', payload);
  } catch (err) {
    console.error('notifyUser emit error', err);
  }
  // Send background push notification as well
  if (payload?.title && payload?.message) {
    sendPushNotificationToUser(userId, payload.title, payload.message, { relatedId: payload.relatedId, type: payload.type });
  }
};

export const notifyUsers = (userIds: string[], payload: any) => {
  if (!ioServer) return;
  try {
    userIds.forEach((uid) => ioServer?.to(uid).emit('new_notification', payload));
  } catch (err) {
    console.error('notifyUsers emit error', err);
  }
  // Send background push notification as well
  if (payload?.title && payload?.message) {
    sendPushNotificationToUsers(userIds, payload.title, payload.message, { relatedId: payload.relatedId, type: payload.type });
  }
};

export const setupSocket = (io: Server) => {
  ioServer = io;

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
      const { conversationId, senderId, receiverId, text, clientTempId } = data;

      try {
        if (!conversationId || !senderId || !text?.trim()) {
          return;
        }

        // DB me save karein
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text.trim(),
        });

        // Conversation update karein
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text.trim(),
          updatedAt: new Date()
        });

        const outgoingMessage = {
          ...message.toObject(),
          clientTempId,
        };

        // Room me sender aur receiver dono ko synced DB message bhejein
        io.to(conversationId).emit('receive_message', outgoingMessage);

        if (receiverId) {
          io.to(receiverId).emit('new_notification');
          // Send mobile push notification to receiver
          sendPushNotificationToUser(
            receiverId,
            'New Message',
            text.trim().length > 50 ? `${text.trim().slice(0, 50)}...` : text.trim(),
            { conversationId, type: 'Chat' }
          );
        }

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

import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user._id] }
  })
    .populate('participants', 'name avatar')
    .populate('product', 'title images price')
    .sort({ updatedAt: -1 });

  res.json({ success: true, conversations });
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const messages = await Message.find({ conversation: req.params.conversationId })
    .sort({ createdAt: 1 }); // Purane se naye ki taraf

  res.json({ success: true, messages });
});
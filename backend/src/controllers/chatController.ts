import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// @desc    Start or get existing conversation between two users
// @route   POST /api/chat
export const startConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, otherUserId } = req.body;
  const currentUserId = req.user._id;

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, otherUserId] },
    product: productId
  }).populate('participants', 'name avatar');

  // Agar nahi hai toh naya create karo
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUserId, otherUserId],
      product: productId
    });
    await conversation.populate('participants', 'name avatar');
  }

  res.json({ success: true, conversation });
});

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
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: { $in: [req.user._id] },
  })
    .populate('participants', 'name avatar')
    .populate('product', 'title images price');

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const messages = await Message.find({ conversation: req.params.conversationId })
    .sort({ createdAt: 1 }); // Purane se naye ki taraf

  res.json({ success: true, conversation, messages });
});

import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Product from '../models/Product';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// @desc    Start or get existing conversation between two users
// @route   POST /api/chat
export const startConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, otherUserId } = req.body;
  const currentUserId = req.user._id;

  if (!productId || !otherUserId) {
    res.status(400);
    throw new Error('productId and otherUserId are required');
  }

  const product = await Product.findById(productId).select('seller');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const sellerId = product.seller?.toString();
  const requestedOtherUserId = otherUserId.toString();
  const requesterId = currentUserId.toString();

  if (!sellerId) {
    res.status(404);
    throw new Error('Seller account not found');
  }

  if (requestedOtherUserId !== sellerId) {
    res.status(403);
    throw new Error('Unauthorized user for this product conversation');
  }

  if (requesterId === requestedOtherUserId) {
    res.status(400);
    throw new Error('You cannot start a conversation with yourself');
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, product.seller] },
    product: productId
  }).populate('participants', 'name avatar');

  // Agar nahi hai toh naya create karo
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUserId, product.seller],
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

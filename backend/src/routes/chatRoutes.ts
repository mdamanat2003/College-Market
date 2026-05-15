import { Router } from 'express';
import { getConversations, getMessages } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);

export default router;
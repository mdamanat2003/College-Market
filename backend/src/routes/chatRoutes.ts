import { Router } from 'express';
import { getConversations, getMessages, startConversation } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, startConversation);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);

export default router;
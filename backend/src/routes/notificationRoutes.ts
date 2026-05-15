import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead); // Isko pehle rakhna zaroori hai
router.put('/:id/read', protect, markAsRead);

export default router;
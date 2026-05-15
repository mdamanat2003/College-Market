import { Router } from 'express';
import { createOrder, verifyPayment, releaseEscrow } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/checkout', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.put('/:id/release', protect, releaseEscrow);

export default router;
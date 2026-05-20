import express from 'express';
import { markOrderReceived,
   raiseDispute,
  createOrder, 
  verifyPayment, 
  getMyOrders, 
  releaseEscrow 
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// ✅ FIX: Isko '/create' hi rakhna hai, '/checkout' NAHI.
router.post('/create', protect, createOrder); 

router.post('/verify', protect, verifyPayment);
router.get('/', protect, getMyOrders);
router.put('/:id/release', protect, releaseEscrow);
router.put('/:id/receive', protect, markOrderReceived);
router.put('/:id/dispute', protect, raiseDispute);

export default router;
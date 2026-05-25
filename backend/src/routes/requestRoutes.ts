import express from 'express';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/requestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public: submit contact request
router.post('/', createRequest);

// Protected admin endpoints
const adminCheck = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Not authorized as an Admin' });
};

router.get('/', protect, adminCheck, getRequests);
router.put('/:id/status', protect, adminCheck, updateRequestStatus);

export default router;

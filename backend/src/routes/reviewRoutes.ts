import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createReview } from '../controllers/reviewController'; // path check kar lijiye

const router = express.Router();

// POST /api/reviews
router.post('/', protect, createReview);

export default router;
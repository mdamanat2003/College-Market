import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createPublicReview, createReview, getPublicReviews } from '../controllers/reviewController'; // path check kar lijiye

const router = express.Router();

// POST /api/reviews
router.post('/', protect, createReview);

// POST /api/reviews/public
router.post('/public', createPublicReview);

// GET /api/reviews/public
router.get('/public', getPublicReviews);

// (debug route removed)

export default router;
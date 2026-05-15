import { Router } from 'express';
import { createOffer, updateOfferStatus, getUserOffers } from '../controllers/offerController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createOffer);
router.get('/', protect, getUserOffers);
router.put('/:id/status', protect, updateOfferStatus);

export default router;
import { Router } from 'express';
import { getProducts, getProductById, createProduct, toggleWishlist } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes (Koi bhi dekh sakta hai)
router.get('/', getProducts);

// Protected wishlist route must come before :id routes
router.post('/:id/wishlist', protect, toggleWishlist);

router.get('/:id', getProductById);

// Protected routes (Sirf logged-in users add kar sakte hain)
router.post('/', protect, createProduct);

export default router;
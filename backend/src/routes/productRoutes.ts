import { Router } from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes (Koi bhi dekh sakta hai)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (Sirf logged-in users add kar sakte hain)
router.post('/', protect, createProduct);

export default router;
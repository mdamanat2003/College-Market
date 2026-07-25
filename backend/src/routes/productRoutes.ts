import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleWishlist } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { uploadProductImages } from '../middleware/uploadMiddleware';

const router = Router();

// Public routes (Koi bhi dekh sakta hai)
router.get('/', getProducts);

// Protected wishlist route must come before :id routes
router.post('/:id/wishlist', protect, toggleWishlist);

router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, uploadProductImages, createProduct);
router.put('/:id', protect, uploadProductImages, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
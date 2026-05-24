import { Router } from 'express';
import { getProducts, getProductById, createProduct, toggleWishlist } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { uploadProductImages } from '../middleware/uploadMiddleware'; // 👈 Naya middleware import kiya

const router = Router();

// Public routes (Koi bhi dekh sakta hai)
router.get('/', getProducts);

// Protected wishlist route must come before :id routes
router.post('/:id/wishlist', protect, toggleWishlist);

router.get('/:id', getProductById);

// Protected routes (Ab ye multi-image upload aur links dono support karega)
router.post('/', protect, uploadProductImages, createProduct); // 👈 Yahan middleware fit kar diya

export default router;
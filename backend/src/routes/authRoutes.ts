import { Router } from 'express';
import { registerUser, loginUser, getMe, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Ye line miss hone par app.use() crash hota hai!
export default router;
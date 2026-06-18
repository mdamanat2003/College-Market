import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  refreshAccessToken,
  sendRegistrationOtp,
  verifyRegistrationOtp
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);

// Ye line miss hone par app.use() crash hota hai!
export default router;
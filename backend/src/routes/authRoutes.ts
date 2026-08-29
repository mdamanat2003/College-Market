import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  refreshAccessToken,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  updateProfile,
  updatePushToken
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ooplabdh_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const upload = multer({ 
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB Limit
});

const collegeIdStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ooplabdh_id_proofs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const collegeIdUpload = multer({ 
  storage: isCloudinaryConfigured ? collegeIdStorage : localStorage,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB Limit
});

const uploadSingleAvatar = (req: any, res: any, next: any) => {
  upload.single('avatar')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Bhai, profile photo 1MB se kam size ki honi chahiye!' });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
};

const router = Router();

router.post('/register', collegeIdUpload.single('collegeIdProof'), registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.put('/update-profile', protect, uploadSingleAvatar, updateProfile);
router.post('/push-token', protect, updatePushToken);

// Ye line miss hone par app.use() crash hota hai!
export default router;
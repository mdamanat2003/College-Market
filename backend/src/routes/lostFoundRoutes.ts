import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware';
import { reportItem, getItems, updateItemStatus, deleteItem } from '../controllers/lostFoundController';

const router = express.Router();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Fallback Storage
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'lost-found');
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

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ooplabdh_lost_found',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Use Cloudinary for lost & found storage if configured, otherwise fallback to local storage
const upload = multer({ 
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadSingleImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size 5MB se kam honi chahiye.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
    }
    next();
  });
};

// Routes
router.route('/')
  .get(getItems)
  .post(protect, uploadSingleImage, reportItem);

router.route('/:id')
  .patch(protect, updateItemStatus)
  .delete(protect, deleteItem);

export default router;
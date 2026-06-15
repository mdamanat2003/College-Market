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
    folder: 'campuscart_lost_found',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
const upload = multer({ 
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage 
});

// Routes
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), reportItem);

router.route('/:id')
  .patch(protect, updateItemStatus)
  .delete(protect, deleteItem);

export default router;
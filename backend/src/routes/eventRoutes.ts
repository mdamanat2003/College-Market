import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware';
import { createEvent, getEvents, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Fallback Storage
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'events');
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
    folder: 'ooplabdh_events',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

// Use Cloudinary if keys are present, otherwise use local storage
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

console.log(`[Events] Cloudinary configured: ${isCloudinaryConfigured}`);
if (!isCloudinaryConfigured) {
  console.log(`[Events] Using local storage: ${uploadsDir}`);
}

const upload = multer({ 
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage 
});

// Routes
router.route('/')
  .get(getEvents)
  .post(protect, upload.single('image'), createEvent);

router.route('/:id')
  .delete(protect, deleteEvent);

export default router;
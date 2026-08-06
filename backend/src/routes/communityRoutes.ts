import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware';
import {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  acceptAnswer,
  deletePost,
  deleteComment,
} from '../controllers/communityController';

const router = express.Router();

// Cloudinary & Local Storage Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'community');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ooplabdh_community',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const upload = multer({
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSingleImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size should be less than 5MB' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
    }
    next();
  });
};

// Routes
router.route('/posts')
  .get(getPosts)
  .post(protect, uploadSingleImage, createPost);

router.route('/posts/:id')
  .get(getPostById)
  .delete(protect, deletePost);

router.post('/posts/:id/like', protect, toggleLikePost);
router.post('/posts/:id/comments', protect, addComment);
router.post('/posts/:id/comments/:commentId/like', protect, toggleLikeComment);
router.patch('/posts/:id/comments/:commentId/accept', protect, acceptAnswer);
router.delete('/posts/:id/comments/:commentId', protect, deleteComment);

export default router;

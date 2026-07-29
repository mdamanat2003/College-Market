import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import Academic from "../models/Academic";
import { protect } from "../middleware/authMiddleware";
import path from "path";
import fs from "fs";

const router = express.Router();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Fallback: Local Storage if Cloudinary is not configured
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads", "academic");
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
    folder: 'ooplabdh_notes',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'],
  } as any, 
});

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Use Cloudinary for notes storage if configured, otherwise fallback to local storage
const upload = multer({ 
  storage: isCloudinaryConfigured ? cloudinaryStorage : localStorage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// 3. Upload Route API (Protected)
router.post('/upload', protect, (req: any, res: any, next: any) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 25MB limit. Please upload a smaller PDF or image.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'Error uploading file' });
    }
    next();
  });
}, async (req: any, res: any) => {
  try {
    console.log("📥 Academic Upload Request Received");
    console.log("Body:", req.body);
    console.log("File:", req.file ? req.file.originalname : "No file");

    if (!req.file) {
      return res.status(400).json({ message: 'Bhai, file select karna bhool gaye shayad!' });
    }

    const { title, description, branch, semester, subject } = req.body;

    // Resolve file URL
    let fileUrl = req.file.path;
    if (!isCloudinaryConfigured) {
      // Convert local path to URL
      const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
      const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${forwardedProto}://${req.get('host')}/uploads/academic`;
      fileUrl = `${uploadsBase}/${req.file.filename}`;
    }

    const newNote = new Academic({
      title,
      description,
      fileUrl,
      fileType: req.file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      branch,
      semester,
      subject,
      uploadedBy: req.user._id,
    });

    await newNote.save();
    console.log("✅ Academic Material Saved:", newNote._id);
    
    // Populate uploadedBy before sending response
    await newNote.populate('uploadedBy', 'name');
    
    res.status(201).json({ 
      success: true, 
      message: 'Notes uploaded successfully!', 
      note: newNote 
    });

  } catch (error: any) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during upload', 
      error: error.message 
    });
  }
});

// 4. GET Route
router.get('/', async (req: any, res: any) => {
  try {
    const { branch, semester, search, q } = req.query;
    const searchTerm = (search || q || '').toString().trim();
    let query: any = {};
    
    if (branch && branch !== 'All') query.branch = branch;
    if (semester && semester !== 'All') query.semester = semester;

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { branch: searchRegex },
        { semester: searchRegex },
        { description: searchRegex },
        { fileType: searchRegex },
      ];
    }

    const notes = await Academic.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');
      
    res.status(200).json(notes);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

export default router;
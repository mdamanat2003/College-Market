import multer from 'multer';
import path from 'path';

// Files ko temporarely server ki memory me buffer ki tarah rakhne ke liye configuration
const storage = multer.memoryStorage();

// Sirf photos allow karne ke liye filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Bhai, sirf images (.jpg, .jpeg, .png, .webp) hi allowed hain!'));
  }
};

// Max 3 images accept karne ke liye upload middleware
export const uploadProductImages = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // Max 1MB per file
}).array('productImages', 3); // 👈 Frontend wale name 'productImages' se match karega (Max 3)
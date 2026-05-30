import { Request, Response } from 'express';
import Product from '../models/Product';
import Notification from '../models/Notification'; // Naya Notification model
import { asyncHandler } from '../utils/asyncHandler';
import path from 'path';
import fs from 'fs';

// Auth Request type jisme user object aur multer files ho sakein
interface AuthRequest extends Request {
  user?: any;
  files?: any; // Multer multiple files ke liye
}

// @desc    Toggle Wishlist (Add/Remove) & Send Notification
// @route   POST /api/products/:id/wishlist
export const toggleWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = req.params.id;
  const buyerId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.wishlistedBy) {
    product.wishlistedBy = [];
  }

  const isWishlisted = product.wishlistedBy.some((id: any) => id.toString() === buyerId.toString());

  if (isWishlisted) {
    product.wishlistedBy = product.wishlistedBy.filter(
      (id: any) => id.toString() !== buyerId.toString()
    );
    await product.save();
    
    res.status(200).json({ success: true, message: "Removed from wishlist", isWishlisted: false });
  } else {
    product.wishlistedBy.push(buyerId);
    await product.save();

    if (product.seller.toString() !== buyerId.toString()) {
      try {
        const notification = await Notification.create({
          recipient: product.seller,
          sender: buyerId,
          relatedId: product._id as any,
          type: 'Wishlist',
          title: 'Product added to wishlist',
          message: `${req.user.name || 'A user'} ne aapke product "${product.title}" ko wishlist me add kiya hai`,
        });

        const io = req.app.get('io');
        io.to(product.seller.toString()).emit('new_notification', notification);
      } catch (err) {
        console.error("Socket or Notification error:", err);
      }
    }

    res.status(200).json({ success: true, message: "Added to wishlist", isWishlisted: true });
  }
});

// @desc    Get all available products
// @route   GET /api/products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search } = req.query;
  
  let query: any = { status: 'Available' };

  if (category) query.category = category;
  
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(query)
    .populate('seller', 'name avatar college rating ratingCount') 
    .sort({ createdAt: -1 }); 

  const productsWithSeller = products.filter((product: any) => product.seller);

  res.json({ success: true, count: productsWithSeller.length, products: productsWithSeller });
});

// @desc    Get single product details
// @route   GET /api/products/:id
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name avatar college phone rating ratingCount'); 

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.seller) {
    res.status(404);
    throw new Error('Seller account for this product is no longer available');
  }

  res.json({ success: true, product });
});

// @desc    Create a new product listing (Protected - Supports Multi-Image & Links)
// @route   POST /api/products
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    console.log("📥 FRONTEND SE DATA AAYA:");
    console.log("Body Data:", req.body);
    console.log("Files Data:", req.files);

    const { title, description, price, category, condition, college, imageLinks } = req.body;

    let finalImagesArray: string[] = [];

    // 1. Links check
    if (imageLinks) {
      if (Array.isArray(imageLinks)) {
        finalImagesArray = [...imageLinks];
      } else {
        finalImagesArray.push(imageLinks);
      }
    }

    // 2. Local Files check - save uploaded files to backend /uploads and return accessible URLs
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadsBase = `${req.protocol}://${req.get('host')}/uploads`;
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');

      // ensure directory exists
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      req.files.forEach((file: any, idx: number) => {
        try {
          const ext = file.originalname && file.originalname.includes('.') ? '' : `.${file.mimetype.split('/')[1]}`;
          const safeName = `${Date.now()}_${idx}_${file.originalname || 'upload'}${ext}`.replace(/\s+/g, '_');
          const outPath = path.join(uploadDir, safeName);
          fs.writeFileSync(outPath, file.buffer);
          const publicUrl = `${uploadsBase}/${safeName}`;
          finalImagesArray.push(publicUrl);
        } catch (err) {
          console.error('File write error:', err);
        }
      });
    }

    if (finalImagesArray.length === 0) {
      console.log("❌ ERROR: Koi photo nahi mili!");
      res.status(400);
      throw new Error('Bhai, kam se kam ek product image ya link dena zaroori hai.');
    }

    console.log("✅ Final Images Array Taiyar:", finalImagesArray.length, "images");

    // 3. Database Save
    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      price: Number(price),
      category,
      condition,
      images: finalImagesArray,
      college: college || req.user.college || 'N/A', // 👈 'N/A' add kiya taaki empty na jaye
    });

    console.log("🎉 SUCCESS: Product Save Ho Gaya!");
    res.status(201).json({ success: true, product });

  } catch (error) {
    // 👇 YEH LINE HUME ASLI GUNEHGAAR BATAYEGI 👇
    console.error("🔥🔥🔥 BACKEND CRASH DETAILS 🔥🔥🔥");
    console.error(error);
    res.status(500).json({ success: false, message: "Server crash details printed in backend terminal", error });
  }
});

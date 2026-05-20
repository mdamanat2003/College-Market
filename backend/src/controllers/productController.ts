import { Request, Response } from 'express';
import Product from '../models/Product';
import Notification from '../models/Notification'; // Naya Notification model
import { asyncHandler } from '../utils/asyncHandler';

// Auth Request type jisme user object hoga
interface AuthRequest extends Request {
  user?: any;
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

  // Agar purane products me wishlistedBy array nahi hai, toh empty array bana do
  if (!product.wishlistedBy) {
    product.wishlistedBy = [];
  }

  const isWishlisted = product.wishlistedBy.some((id: any) => id.toString() === buyerId.toString());

  if (isWishlisted) {
    // 1. Agar pehle se hai, toh remove kar do (Unlike)
    product.wishlistedBy = product.wishlistedBy.filter(
      (id: any) => id.toString() !== buyerId.toString()
    );
    await product.save();
    
    res.status(200).json({ success: true, message: "Removed from wishlist", isWishlisted: false });
  } else {
    // 2. Agar nahi hai, toh add kar do (Like)
    product.wishlistedBy.push(buyerId);
    await product.save();

    // 3. Seller ko Notification bhejo (Agar seller khud apna product like na kar raha ho)
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
  
  // Base query: Sirf available products dikhao
  let query: any = { status: 'Available' };

  if (category) query.category = category;
  
  // Basic search filter (Title me keyword search karega)
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(query)
    .populate('seller', 'name avatar college') // Seller ki sirf ye 3 details laani hai
    .sort({ createdAt: -1 }); // Latest sabse upar

  res.json({ success: true, count: products.length, products });
});

// @desc    Get single product details
// @route   GET /api/products/:id
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name avatar college phone'); // Yahan phone number bhi denge contact ke liye

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc    Create a new product listing (Protected)
// @route   POST /api/products
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, price, category, condition, images, college } = req.body;

  const product = await Product.create({
    seller: req.user._id,
    title,
    description,
    price,
    category,
    condition,
    images,
    college: college || req.user.college, // Agar form me nahi diya, toh user profile ka le lenge
  });

  res.status(201).json({ success: true, product });
});
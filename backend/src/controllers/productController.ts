import { Request, Response } from 'express';
import Product from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';

// Auth Request type jisme user object hoga
interface AuthRequest extends Request {
  user?: any;
}

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
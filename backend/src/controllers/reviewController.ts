import { Request, Response } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// 1. Submit a Review
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, rating: rawRating, comment } = req.body;

  // Debug logs to diagnose saving issues
  console.log('[createReview] incoming body:', { orderId, rating: rawRating, comment });
  console.log('[createReview] auth user:', req.user ? { id: req.user._id, name: req.user.name } : null);

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!orderId) {
    res.status(400);
    throw new Error('orderId is required');
  }

  const rating = Number(rawRating);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status !== 'Completed') {
    res.status(400);
    throw new Error("You can only review after the order is completed");
  }

  const alreadyReviewed = await Review.findOne({ order: orderId, reviewer: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this order");
  }

  // Create Review
  const review = await Review.create({
    order: orderId,
    reviewer: req.user._id,
    reviewee: order.seller,
    source: 'order',
    rating,
    comment
  });

  // Recalculate Average Rating
  const sellerReviews = await Review.find({ reviewee: order.seller });
  const totalRating = sellerReviews.reduce((acc, item) => item.rating + acc, 0);
  const avgRating = sellerReviews.length > 0 ? totalRating / sellerReviews.length : 0;
  
  await User.findByIdAndUpdate(order.seller, { 
    rating: avgRating,
    ratingCount: sellerReviews.length
  });

  // ⚡ REAL-TIME MAGIC: Frontend ko live update bhejein
  const io = req.app.get('io');
  if (io) {
    // Ham "newReview" event emit kar rahe hain
    // Saath me reviewer ka naam bhi bhej rahe hain taaki UI update ho sake
    io.emit('newReview', {
      ...review.toObject(),
      reviewerName: req.user.name // Agar aapke User model me 'name' field hai
    });
  }

  res.status(201).json({ success: true, message: "Review submitted successfully!", review });
});

// 2. Submit a Public/Landing Review (no auth, no order)
export const createPublicReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewerName: rawReviewerName, rating: rawRating, comment: rawComment } = req.body;

  console.log('[createPublicReview] incoming body:', req.body);

  const reviewerName = (rawReviewerName || '').trim();
  const comment = (rawComment || '').trim();
  const rating = Number(rawRating);

  console.log('[createPublicReview] parsed:', { reviewerName, comment, rating });

  if (!reviewerName) {
    res.status(400);
    throw new Error('reviewerName is required');
  }

  if (!comment) {
    res.status(400);
    throw new Error('comment is required');
  }

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5');
  }

  const review = await Review.create({
    reviewerName,
    source: 'public',
    rating,
    comment,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('newReview', {
      ...review.toObject(),
      reviewerName,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Public review submitted successfully!',
    review,
  });
});

// Get public reviews (for landing page)
export const getPublicReviews = asyncHandler(async (req: Request, res: Response) => {
  // Return recent public reviews sorted by newest first, limit optional via query
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const reviews = await Review.find({ source: 'public' }).sort({ createdAt: -1 }).limit(limit).lean();
  res.status(200).json({ success: true, reviews });
});
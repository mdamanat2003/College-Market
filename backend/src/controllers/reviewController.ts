import { Request, Response } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// 1. Submit a Review
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5 stars");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check karo ki order complete ho chuka hai ya nahi
  if (order.status !== 'Completed') {
    res.status(400);
    throw new Error("You can only review after the order is completed");
  }

  // Check karo ki kya is order ka review pehle hi toh nahi de diya
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
    rating,
    comment
  });

  // Optional: Seller ki profile par average rating calculation recalculate karna
  const sellerReviews = await Review.find({ reviewee: order.seller });
  const totalRating = sellerReviews.reduce((acc, item) => item.rating + acc, 0);
  const avgRating = sellerReviews.length > 0 ? totalRating / sellerReviews.length : 0;
  
  await User.findByIdAndUpdate(order.seller, { 
    rating: avgRating,
    ratingCount: sellerReviews.length
  });

  res.status(201).json({ success: true, message: "Review submitted successfully!", review });
});
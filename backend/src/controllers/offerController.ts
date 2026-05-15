import { Request, Response } from 'express';
import Offer from '../models/Offer';
import Product from '../models/Product';
import Notification from '../models/Notification'; // <-- Notification model import kiya
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// @desc    Create a new offer
// @route   POST /api/offers
export const createOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, amount, message } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.seller.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot make an offer on your own product');
  }

  const offer = await Offer.create({
    product: productId,
    buyer: req.user._id,
    seller: product.seller,
    amount,
    message,
    status: 'Pending'
  });

  // 1. Notification ko DB me save karein (offline user ke liye)
  const notification = await Notification.create({
    recipient: product.seller,
    sender: req.user._id,
    type: 'Offer',
    title: 'New Offer Received',
    message: `You received an offer of ₹${amount} for ${product.title}`,
    relatedId: offer._id
  });

  // 2. Backend-driven Real-Time Events
  const io = req.app.get('io');
  
  // Seller ko offer aur notification dono ke events bhejein
  io.to(product.seller.toString()).emit('new_offer', offer);
  io.to(product.seller.toString()).emit('new_notification', notification);

  res.status(201).json({ success: true, offer });
});

// @desc    Update Offer Status (Accept/Reject)
// @route   PUT /api/offers/:id/status
export const updateOfferStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'Accepted' or 'Rejected'
  const offerId = req.params.id;

  // Product title nikalne ke liye populate use kiya hai
  const offer = await Offer.findById(offerId).populate('product', 'title');
  
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  // Ensure only the seller can accept/reject
  if (offer.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this offer');
  }

  offer.status = status;
  await offer.save();

  // 1. Buyer ke liye notification create karein
  const productTitle = (offer.product as any).title || 'a product';
  const notification = await Notification.create({
    recipient: offer.buyer,
    sender: req.user._id,
    type: 'Offer',
    title: `Offer ${status}`,
    message: `Your offer for ${productTitle} was ${status.toLowerCase()}.`,
    relatedId: offer._id
  });

  // 2. Buyer ko real-time updates bhejein
  const io = req.app.get('io');
  io.to(offer.buyer.toString()).emit('offer_updated', offer);
  io.to(offer.buyer.toString()).emit('new_notification', notification);

  res.json({ success: true, offer });
});

// @desc    Get offers for a user (Buy & Sell)
// @route   GET /api/offers
export const getUserOffers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const offers = await Offer.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }]
  })
  .populate('product', 'title price images')
  .populate('buyer', 'name')
  .populate('seller', 'name')
  .sort({ createdAt: -1 });

  res.json({ success: true, count: offers.length, offers });
});
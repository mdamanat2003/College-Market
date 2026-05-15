import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// Initialize Razorpay SDK
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
};

// @desc    Create Order & Init Razorpay Payment
// @route   POST /api/orders/checkout
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const rzp = getRazorpayInstance();

  // Razorpay expects amount in paise (multiply by 100)
  const amount = product.price;
  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  // Securely generate order on Razorpay servers
  const razorpayOrder = await rzp.orders.create(options);

  // Save Pending Order in our DB
  const order = await Order.create({
    buyer: req.user._id,
    seller: product.seller,
    product: productId,
    amount,
    razorpayOrderId: razorpayOrder.id,
  });

  // Product status lock so others can't buy it temporarily
  product.status = 'Reserved';
  await product.save();

  res.status(201).json({
    success: true,
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    currency: razorpayOrder.currency,
  });
});

// @desc    Verify Payment Signature from Frontend
// @route   POST /api/orders/verify
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = req.body;

  // Create HMAC hex digest to match with Razorpay's signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment is verified -> Move money to 'Held' (Escrow)
    const order = await Order.findById(db_order_id);
    if (order) {
      order.paymentStatus = 'Held';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      // Mark product as Sold
      await Product.findByIdAndUpdate(order.product, { status: 'Sold' });

      // TODO: Emit socket event for real-time notification to seller

      res.json({ success: true, message: 'Payment verified and held in escrow safely.' });
    }
  } else {
    res.status(400);
    throw new Error('Invalid Payment Signature! Potential fraud detected.');
  }
});

// @desc    Release Escrow (Buyer confirms delivery)
// @route   PUT /api/orders/:id/release
export const releaseEscrow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the buyer can release the escrow');
  }

  if (order.deliveryStatus !== 'Shipped') {
    res.status(400);
    throw new Error('Cannot release payment until seller marks product as Shipped');
  }

  order.deliveryStatus = 'Delivered';
  order.paymentStatus = 'Released'; // Money is now available to seller
  await order.save();

  res.json({ success: true, message: 'Payment released to seller successfully' });
});

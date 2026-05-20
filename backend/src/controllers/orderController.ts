import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Review from '../models/Review';
import User from '../models/User';
import Notification from '../models/Notification';
import { notifyUsers } from '../socket';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

const notifyAdminsAboutEscrow = async (order: any, title: string, message: string) => {
  const admins = await User.find({ role: 'admin' }).select('_id');

  if (!admins.length) {
    return;
  }

  await Notification.insertMany(
    admins.map((admin) => ({
      recipient: admin._id,
      type: 'Order',
      title,
      message,
      relatedId: order._id,
    }))
  );
  try {
    // Emit real-time notification to online admins
    const adminIds = admins.map((a) => a._id.toString());
    notifyUsers(adminIds, { title, message, relatedId: order._id });
  } catch (err) {
    console.error('Failed to emit admin notification:', err);
  }
};

// Initialize Razorpay SDK
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
};

// @desc    Create Order & Init Razorpay Payment
// @route   POST /api/orders/create
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
    status: 'Pending' // Standardized status
  });

  // Product status lock so others can't buy it temporarily
  product.status = 'Reserved';
  await product.save();

  res.status(201).json({
    success: true,
    order: order, // Frontend expects response.data.order
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    currency: razorpayOrder.currency,
  });
});

// @desc    Verify Payment Signature from Frontend
// @route   POST /api/orders/verify
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  // FIX: Names updated to match what Frontend is sending
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Create HMAC hex digest to match with Razorpay's signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpaySignature;

  if (isAuthentic) {
    // Payment is verified -> Move money to 'EscrowLocked'
    const order = await Order.findById(orderId);
    if (order) {
      order.status = 'EscrowLocked'; // Kept consistent with frontend checks
      (order as any).paymentStatus = 'Held';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
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

// @desc    Get Logged in User's Orders (Both Buying and Selling)
// @route   GET /api/orders
export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  // Fetch orders where user is either buyer or seller
  const orders = await Order.find({
    $or: [{ buyer: userId }, { seller: userId }]
  })
    .populate('product')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  const completedOrderIds = orders
    .filter((order: any) => order.status === 'Completed' && String(order.buyer?._id || order.buyer) === String(userId))
    .map((order: any) => order._id);

  const reviewedOrders = await Review.find({
    reviewer: userId,
    order: { $in: completedOrderIds }
  }).select('order');

  const reviewedOrderIds = new Set(reviewedOrders.map((review: any) => String(review.order)));

  const ordersWithReviewFlag = orders.map((order: any) => ({
    ...order.toObject(),
    hasReviewed: reviewedOrderIds.has(String(order._id))
  }));

  res.status(200).json({ success: true, orders: ordersWithReviewFlag }); // Frontend expects response.data.orders
});

// @desc    Release Escrow (Buyer confirms delivery)
// @route   PUT /api/orders/:id/release
export const releaseEscrow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the buyer can release the escrow');
  }

  order.status = 'Completed'; // Money is now available to seller
  await order.save();

  res.json({ success: true, message: 'Payment released to seller successfully' });
});


// ==========================================
// 👇 NAYE FUNCTIONS: RECEIVE & DISPUTE 👇
// ==========================================

// @desc    Mark Order as Received by Buyer
// @route   PUT /api/orders/:id/receive
export const markOrderReceived = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Security Check: Sirf buyer hi receive kar sakta hai
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the buyer can mark this order as received");
  }

  // TypeScript bypass use kiya hai taaki agar model me types add karna bhool gaye ho toh error na aaye
  (order as any).deliveryStatus = 'Received';
  (order as any).paymentStatus = 'Held';
  await order.save();

  await notifyAdminsAboutEscrow(
    order,
    'Buyer marked order as received',
    `Order #${String(order._id).slice(-6).toUpperCase()} was marked received. Release funds to the seller.`
  );

  res.json({ success: true, message: "Order marked as received! Admin will release your payment." });
});

// @desc    Apply for Refund / Raise Dispute by Buyer
// @route   PUT /api/orders/:id/dispute
export const raiseDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason, description } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Security Check: Sirf buyer hi dispute open kar sakta hai
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the buyer can raise a dispute");
  }

  (order as any).isDisputed = true;
  (order as any).disputeReason = reason;
  (order as any).disputeDescription = description || '';
  (order as any).paymentStatus = 'Held';
  
  await order.save();

  await notifyAdminsAboutEscrow(
    order,
    'Refund request raised',
    `Order #${String(order._id).slice(-6).toUpperCase()} has a refund request: ${reason}`
  );

  res.json({ success: true, message: "Refund request sent to Admin successfully." });
});
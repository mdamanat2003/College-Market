import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Notification from '../models/Notification';
import { notifyUsers } from '../socket';
import { asyncHandler } from '../utils/asyncHandler';

// 1. Get Dashboard Overview Stats
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  // ✅ FIX: Admin ko chhor kar sabko count karo (Purane users jinke paas role nahi hai, wo bhi include honge)
  const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
  
  const activeProducts = await Product.countDocuments({ status: 'Available' });
  
  // Held escrow aur open disputes dono ko count karo
  const escrowOrders = await Order.find({
    $or: [
      { status: 'EscrowLocked' },
      { paymentStatus: 'Held' },
      { isDisputed: true }
    ],
    status: { $nin: ['Completed', 'Cancelled'] }
  } as any);
  const totalEscrow = escrowOrders.reduce((sum, order: any) => sum + (order.totalAmount || order.price || order.amount || 0), 0);

  res.json({ totalUsers, activeProducts, totalEscrow });
});

// 2. Get All Users with Search Filter
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  
  // ✅ FIX: Yahan bhi list me admin ko chhor kar baki saare users dikhao
  let query: any = { role: { $ne: 'admin' } }; 

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// 3. Toggle User Block Status
export const toggleBlockUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Type assertion ka error fix karne ke liye 'any' use karenge
  if ((user as any).role === 'admin') {
    res.status(400);
    throw new Error("You cannot block an Admin account");
  }

  // ✅ FIX: TypeScript ko bypass karne ke liye (user as any) ka use
  (user as any).isBlocked = !(user as any).isBlocked;
  await user.save();

  res.json({ 
    success: true, 
    message: `User has been ${(user as any).isBlocked ? 'Blocked' : 'Unblocked'} successfully`,
    isBlocked: (user as any).isBlocked 
  });
});

// 4. Get All Products with Search (Admin)
export const getAllProductsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  let query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  // populate use kar rahe hain taaki seller ka naam aur email bhi mil jaye
  const products = await Product.find(query).populate('seller', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, products });
});

// 5. Delete Fake/Inappropriate Product (Admin)
export const deleteProductAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Product delete kar do
  await product.deleteOne();

  res.json({ success: true, message: "Product deleted successfully" });
});

// 6. Get All Escrow/Paid Orders (Admin)
// 6. Get All Escrow/Paid Orders (Admin)
export const getEscrowOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({
    $or: [
      { status: 'EscrowLocked' },
      { paymentStatus: 'Held' },
      { isDisputed: true }
    ],
    status: { $nin: ['Completed', 'Cancelled'] }
  } as any)
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('product', 'title price')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, orders });
});

// 6.b Get Completed / Refunded Transactions (History)
export const getPastTransactions = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({
    status: { $in: ['Completed', 'Cancelled'] }
  } as any)
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('product', 'title price')
    .sort({ updatedAt: -1 })
    .limit(200);

  res.json({ success: true, count: orders.length, orders });
});

// 7. Resolve Escrow (Release or Refund)
export const resolveEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // 'release' ya 'refund'

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!['release', 'refund'].includes(action)) {
    res.status(400);
    throw new Error("Invalid action. Use 'release' or 'refund'");
  }

  const canResolve = (
    order.status === 'EscrowLocked' ||
    order.paymentStatus === 'Held' ||
    Boolean((order as any).isDisputed)
  ) && !['Completed', 'Cancelled'].includes(order.status);

  if (!canResolve) {
    res.status(400);
    throw new Error("This order is not in an open escrow state");
  }

  if (action === 'release') {
    // Seller ko paise mil gaye, order complete
    (order as any).status = 'Completed';
    (order as any).paymentStatus = 'Released'; // Custom status for your logic
    (order as any).deliveryStatus = 'Received';
    (order as any).isDisputed = false;
    await Product.findByIdAndUpdate(order.product, { status: 'Sold' });
  } else if (action === 'refund') {
    // Dispute me buyer ko paise wapas
    (order as any).status = 'Cancelled';
    (order as any).paymentStatus = 'Refunded';
    (order as any).deliveryStatus = 'Cancelled';
    (order as any).isDisputed = false;
    await Product.findByIdAndUpdate(order.product, { status: 'Available' });
  }

  await order.save();

  await Notification.insertMany([
    {
      recipient: order.buyer,
      type: 'Order',
      title: action === 'release' ? 'Escrow payment released' : 'Refund approved',
      message: action === 'release'
        ? 'Admin released escrow funds to the seller.'
        : 'Admin approved your refund request.',
      relatedId: order._id as any,
    },
    {
      recipient: order.seller,
      type: 'Order',
      title: action === 'release' ? 'Payment released' : 'Order refunded',
      message: action === 'release'
        ? 'Escrow funds for your sale have been released.'
        : 'Admin refunded the buyer for this order.',
      relatedId: order._id as any,
    },
  ]);

  try {
    const recipients = [order.buyer.toString(), order.seller.toString()];
    notifyUsers(recipients, {
      title: action === 'release' ? 'Escrow update' : 'Escrow update',
      message: action === 'release' ? 'Admin released escrow funds' : 'Admin processed a refund',
      relatedId: order._id,
    });
  } catch (err) {
    console.error('Failed to emit resolveEscrow notifications:', err);
  }

  res.json({ success: true, message: `Payment ${action}ed successfully`, order });
});

import { Request, Response } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';
import Order from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';

export const getSeedNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const admin = await User.findOne({ email: 'admin@campuscart.com' });
  if (!admin) return res.json({ success: true, message: 'Admin not present in DB' });

  const notifications = await Notification.find({ recipient: admin._id }).sort({ createdAt: -1 }).limit(200);
  const total = await Notification.countDocuments({ recipient: admin._id });

  const orders = await Order.find({ status: { $in: ['Completed', 'Cancelled'] } }).limit(50).sort({ updatedAt: -1 });
  const ordersCount = await Order.countDocuments({ status: { $in: ['Completed', 'Cancelled'] } });

  res.json({ success: true, adminId: admin._id, total, notifications, ordersCount, orders });
});

export default {};

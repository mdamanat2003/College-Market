import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request { user?: any; }

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 }) // Latest sabse upar
    .limit(50); // Ek baar me max 50 notifications fetch karein

  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    isRead: false 
  });

  res.json({ success: true, unreadCount, notifications });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }

  res.json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});
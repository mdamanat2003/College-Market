import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import LostFound from '../models/LostFound';
import User from '../models/User';
import Notification from '../models/Notification';
import { notifyUsers } from '../socket';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Report a lost or found item
// @route   POST /api/lost-found
export const reportItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log("📥 Lost & Found Upload Request Received");
  
  const { title, description, type, category, location, date } = req.body;
  
  let image = '';
  if (req.file) {
    if (req.file.filename) {
       // Local storage fallback
       const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
       const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${forwardedProto}://${req.get('host')}/uploads/lost-found`;
       image = `${uploadsBase}/${req.file.filename}`;
    } else {
       // Cloudinary
       image = req.file.path;
    }
  } else if (req.body.image) {
    image = req.body.image;
  }

  if (!req.user) {
    res.status(401);
    throw new Error('User not found in request');
  }

  try {
    const item = await LostFound.create({
      reporter: req.user._id,
      title,
      description,
      type,
      category,
      location,
      date,
      image,
    });

    console.log("✅ Lost & Found Item Saved:", item._id);
    
    // Populate reporter before sending response
    await item.populate('reporter', '_id name email phone');

    // Notify all users in the same campus/college immediately
    try {
      const userCollege = req.user.college;
      let sameCampusUsers: any[] = [];

      if (userCollege && userCollege.trim() !== '') {
        sameCampusUsers = await User.find({
          college: userCollege,
          _id: { $ne: req.user._id },
          isBlocked: { $ne: true }
        }).select('_id');
      } else {
        sameCampusUsers = await User.find({
          _id: { $ne: req.user._id },
          isBlocked: { $ne: true }
        }).select('_id');
      }

      if (sameCampusUsers.length > 0) {
        const isLost = type === 'Lost';
        const notificationTitle = isLost 
          ? `🔴 Lost Item Alert (${userCollege || 'Campus'})` 
          : `🟢 Found Item Alert (${userCollege || 'Campus'})`;
        
        const notificationMessage = `${req.user.name} reported a ${isLost ? 'lost' : 'found'} item: "${title}"${location ? ` at ${location}` : ''}`;

        const notificationsToCreate = sameCampusUsers.map(u => ({
          recipient: u._id,
          sender: req.user!._id,
          type: 'LostFound' as const,
          title: notificationTitle,
          message: notificationMessage,
          relatedId: item._id,
          isRead: false,
        }));

        await Notification.insertMany(notificationsToCreate);

        const recipientIds = sameCampusUsers.map(u => u._id.toString());
        notifyUsers(recipientIds, {
          title: notificationTitle,
          message: notificationMessage,
          type: 'info',
          relatedId: item._id,
        });
        console.log(`📢 Instant notification sent to ${recipientIds.length} campus users for Lost/Found item.`);
      }
    } catch (notifErr) {
      console.error("⚠️ Failed to send Lost & Found campus notifications:", notifErr);
    }
    
    res.status(201).json({ success: true, item });
  } catch (error: any) {
    console.error("❌ Save Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// @desc    Get all lost and found items
// @route   GET /api/lost-found
export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { type, category, status, search } = req.query;
  
  let query: any = {};
  
  if (type) query.type = type;
  if (category && category !== 'All') query.category = category;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const items = await LostFound.find(query)
    .sort({ createdAt: -1 })
    .populate('reporter', '_id name email phone');

  res.json({ success: true, items });
});

// @desc    Update item status (e.g., mark as Resolved)
// @route   PATCH /api/lost-found/:id
export const updateItemStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log("🛠 Updating Item Status, ID:", req.params.id);
  console.log("Request Body:", req.body);
  
  if (!req.params.id) {
    res.status(400);
    throw new Error('Item ID is missing');
  }

  const item = await LostFound.findById(req.params.id);

  if (!item) {
    console.log("❌ Item not found in DB");
    res.status(404);
    throw new Error('Item not found in our records');
  }

  if (!req.user) {
    console.log("❌ User not authenticated in request");
    res.status(401);
    throw new Error('Aap login nahi hain. Please login karein.');
  }

  // Check permission
  const reporterId = item.reporter.toString();
  const userId = req.user._id.toString();

  console.log(`Checking permission: Reporter=${reporterId}, User=${userId}, Role=${req.user.role}`);

  if (reporterId !== userId && req.user.role !== 'admin') {
    console.log("❌ Authorization check failed");
    res.status(403);
    throw new Error('Bhai, aap ye item resolve nahi kar sakte. Ye aapka report nahi hai!');
  }

  item.status = req.body.status || 'Resolved';
  
  try {
    await item.save();
    console.log("✅ Save successful in DB");
  } catch (saveError: any) {
    console.error("❌ Mongoose Save Error:", saveError);
    res.status(400);
    throw new Error(`Database save failed: ${saveError.message}`);
  }

  // Populate reporter before sending response
  await item.populate('reporter', '_id name email phone');

  console.log("✅ Sending updated item back to frontend");
  res.json({ success: true, item });
});

// @desc    Delete a lost/found report
// @route   DELETE /api/lost-found/:id
export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await LostFound.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const reporterId = item.reporter.toString();
  const userId = req.user._id.toString();

  if (reporterId !== userId && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Item removed' });
});
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Event from '../models/Event';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new event
// @route   POST /api/events
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log("📥 Event Creation Request Received");
  console.log("Body:", req.body);
  console.log("File:", req.file ? req.file.originalname : "No file");

  const { title, description, organizer, date, location, category, registrationLink } = req.body;
  
  let image = '';
  if (req.file) {
    if (req.file.filename) {
       // Local storage fallback
       const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
       const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${forwardedProto}://${req.get('host')}/uploads/events`;
       image = `${uploadsBase}/${req.file.filename}`;
    } else {
       // Cloudinary
       image = req.file.path;
    }
  } else if (req.body.image) {
    image = req.body.image;
  }

  if (!req.user) {
    console.log("❌ User not found in request");
    res.status(401);
    throw new Error('User not found in request');
  }

  try {
    const event = await Event.create({
      title,
      description,
      organizer,
      date,
      location,
      category,
      registrationLink,
      image,
      createdBy: req.user._id,
    });

    console.log("✅ Event Created Successfully:", event._id);
    res.status(201).json({ success: true, event });
  } catch (error: any) {
    console.error("❌ Event Creation Error:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to create event' 
    });
  }
});

// @desc    Get all upcoming events
// @route   GET /api/events
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { category, search } = req.query;
  
  let query: any = {
    // Optionally: Only show future events
    // date: { $gte: new Date() }
  };
  
  if (category && category !== 'All') query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { organizer: { $regex: search, $options: 'i' } }
    ];
  }

  const events = await Event.find(query)
    .sort({ date: 1 }) // Sort by upcoming dates
    .populate('createdBy', 'name');

  res.json({ success: true, events });
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  await event.deleteOne();
  res.json({ success: true, message: 'Event removed' });
});
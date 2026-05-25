import { Request as ExRequest, Response } from 'express';
import RequestModel from '../models/Request';
import { asyncHandler } from '../utils/asyncHandler';

export const createRequest = asyncHandler(async (req: ExRequest, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('name, email and message are required');
  }

  const doc = await RequestModel.create({ name, email, message });
  res.status(201).json({ success: true, request: doc });
});

// Admin: list all requests
export const getRequests = asyncHandler(async (req: any, res: Response) => {
  const requests = await RequestModel.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, requests });
});

// Admin: update status
export const updateRequestStatus = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['new', 'in_progress', 'resolved'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const updated = await RequestModel.findByIdAndUpdate(id, { status }, { new: true });
  res.status(200).json({ success: true, request: updated });
});

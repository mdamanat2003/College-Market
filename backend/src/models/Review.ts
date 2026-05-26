import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Jisne kharida (Buyer)
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Jiska item tha (Seller)
  reviewerName: { type: String, trim: true, required: false },
  source: { type: String, enum: ['order', 'public'], default: 'order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
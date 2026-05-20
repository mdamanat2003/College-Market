import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisne kharida (Buyer)
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jiska item tha (Seller)
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
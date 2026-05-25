import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);

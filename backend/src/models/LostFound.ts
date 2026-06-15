import mongoose, { Document, Schema } from 'mongoose';

export interface ILostFound extends Document {
  reporter: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'Lost' | 'Found';
  category: string;
  location: string;
  date: Date;
  image?: string;
  status: 'Active' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
}

const lostFoundSchema = new Schema<ILostFound>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Lost', 'Found'], required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String },
    status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
  },
  { timestamps: true }
);

// Indexes for search performance
lostFoundSchema.index({ type: 1, status: 1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ILostFound>('LostFound', lostFoundSchema);
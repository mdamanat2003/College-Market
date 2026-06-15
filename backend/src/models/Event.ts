import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: string;
  date: Date;
  location: string;
  category: 'Cultural' | 'Technical' | 'Sports' | 'Workshop' | 'Other';
  image?: string;
  registrationLink?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Cultural', 'Technical', 'Sports', 'Workshop', 'Other'], 
      required: true 
    },
    image: { type: String },
    registrationLink: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for search and sorting
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IEvent>('Event', eventSchema);
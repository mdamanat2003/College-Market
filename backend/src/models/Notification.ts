import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // Jisko notification bhejni hai
  sender?: mongoose.Types.ObjectId; // Jisne action kiya (optional for system alerts)
  type: 'Message' | 'Offer' | 'Order' | 'System' | 'Wishlist' | 'LostFound' | 'Community';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId; // Product ID, Order ID, ya Offer ID (Click karne par wahan redirect karne ke liye)
  isRead: boolean;
}

const notificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { 
      type: String, 
      enum: ['Message', 'Offer', 'Order', 'System', 'Wishlist', 'LostFound', 'Community'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt se hum "2 mins ago" time dikhayenge
);

export default mongoose.model<INotification>('Notification', notificationSchema);
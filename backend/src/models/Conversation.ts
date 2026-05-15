import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // Buyer aur Seller
  product: mongoose.Types.ObjectId; // Kis product ke bare me baat ho rahi hai
  lastMessage?: string;
  unreadCount: number;
}

const conversationSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    lastMessage: { type: String },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>('Conversation', conversationSchema);
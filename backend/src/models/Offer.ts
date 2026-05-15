import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  product: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Countered';
  message?: string; // Optional message like "Bhai 500 me de do"
}

const offerSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Rejected', 'Countered'], 
      default: 'Pending' 
    },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>('Offer', offerSchema);
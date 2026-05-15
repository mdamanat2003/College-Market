import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  amount: number;
  paymentMode: 'Direct' | 'Escrow';
  paymentStatus: 'Pending' | 'Held' | 'Released' | 'Refunded'; // Escrow states
  deliveryStatus: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  razorpayOrderId: string; // RZP order ID
  razorpayPaymentId?: string; // RZP payment ID (after success)
}

const orderSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Direct', 'Escrow'], default: 'Escrow' },
    
    // Escrow lifecycle
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Held', 'Released', 'Refunded'], 
      default: 'Pending' 
    },
    
    // Delivery lifecycle
    deliveryStatus: { 
      type: String, 
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending' 
    },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
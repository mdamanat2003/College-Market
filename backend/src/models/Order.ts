import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  amount: number;
  paymentMode: 'Direct' | 'Escrow';
  paymentStatus: 'Pending' | 'Paid' | 'Held' | 'Released' | 'Refunded'; // Escrow states
  deliveryStatus: 'Pending' | 'Shipped' | 'Delivered' | 'Received' | 'Cancelled';
  
  // ✅ FIX: status ko interface me add kar diya
  status: 'Pending' | 'Paid' | 'EscrowLocked' | 'Completed' | 'Cancelled'; 
  
  razorpayOrderId: string; // RZP order ID
  razorpayPaymentId?: string; // RZP payment ID (after success)
  razorpaySignature?: string;
  isDisputed?: boolean;
  disputeReason?: string;
  disputeDescription?: string;
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
      enum: ['Pending', 'Paid', 'Held', 'Released', 'Refunded'], 
      default: 'Pending' 
    },
    
    // ✅ FIX: deliveryStatus ko schema me add kiya taaki interface se match kare
    deliveryStatus: { 
      type: String, 
      enum: ['Pending', 'Shipped', 'Delivered', 'Received', 'Cancelled'], 
      default: 'Pending' 
    },
    isDisputed: { 
    type: Boolean, 
    default: false 
    },
    disputeReason: { 
      type: String // (e.g., 'Product received different')
    },
    disputeDescription: { 
      type: String // (Custom text if 'Other' is selected)
    },   
    
    // Overall order status
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'EscrowLocked', 'Completed', 'Cancelled'], 
      default: 'Pending' 
    },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

// Indexes for performance optimization
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
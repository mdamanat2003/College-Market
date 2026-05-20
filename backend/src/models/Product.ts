import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  status: 'Available' | 'Sold' | 'Reserved';
  college: string; // Seller ka college, taaki local filtering ho sake
  wishlistedBy: mongoose.Types.ObjectId[];
}

const productSchema: Schema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: { type: [String], default: [] },
    condition: { 
      type: String, 
      enum: ['New', 'Like New', 'Good', 'Used', 'Fair', 'Poor'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Available', 'Sold', 'Reserved'], 
      default: 'Available' 
    },
    college: { type: String, required: true },
    wishlistedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
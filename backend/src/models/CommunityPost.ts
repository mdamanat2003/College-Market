import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  views: number;
  answersCount: number;
  status: 'Open' | 'Solved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Academic & Exam Prep',
        'Campus Life & Advice',
        'Career & Internships',
        'Tech & Coding',
        'General Discussion',
        'Confessions & Opinions',
      ],
      default: 'General Discussion',
    },
    tags: [{ type: String, trim: true }],
    isAnonymous: { type: Boolean, default: false },
    image: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Open', 'Solved', 'Closed'], default: 'Open' },
  },
  { timestamps: true }
);

communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.models.CommunityPost ||
  mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);

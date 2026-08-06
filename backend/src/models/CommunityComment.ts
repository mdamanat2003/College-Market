import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  likes: mongoose.Types.ObjectId[];
  isAcceptedAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communityCommentSchema = new Schema<ICommunityComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isAcceptedAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

communityCommentSchema.index({ post: 1, createdAt: 1 });

export default mongoose.models.CommunityComment ||
  mongoose.model<ICommunityComment>('CommunityComment', communityCommentSchema);

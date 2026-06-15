import mongoose from "mongoose";

const academicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'image', 'link'], default: 'pdf' },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Academic || mongoose.model('Academic', academicSchema);
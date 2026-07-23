import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  phone: string;
  college?: string;
  avatar?: string;
  collegeIdProof?: string;
  isVerified?: boolean;
  role: "student" | "admin";
  rating?: number;
  ratingCount?: number;
  // 👇 Ye 2 lines nayi add karni hain
  resetOtp?: string | null;
  resetOtpExpires?: Date | null;
  isBlocked?: boolean;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // select: false prevents password from returning in queries by default
    phone: { type: String, required: true },
    college: { type: String, default: "" },
    avatar: { type: String, default: "" },
    collegeIdProof: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);

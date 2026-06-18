import mongoose, { Document, Schema } from "mongoose";

export interface IRegistrationOtp extends Document {
  email: string;
  phone?: string;
  emailOtp: string;
  phoneOtp?: string;
  expiresAt: Date;
}

const registrationOtpSchema: Schema = new Schema({
  email: { type: String, required: true },
  phone: { type: String, required: false },
  emailOtp: { type: String, required: true },
  phoneOtp: { type: String, required: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-delete after expiry
}, { timestamps: true });

export default mongoose.model<IRegistrationOtp>("RegistrationOtp", registrationOtpSchema);

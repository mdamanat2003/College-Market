import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as jwt.SignOptions['expiresIn'],
  });
};

// ==========================================
// Nodemailer SMTP Setup
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail', // Google SMTP use kar rahe hain
  auth: {
    user: process.env.EMAIL_USER, // Aapka email (e.g., test@gmail.com)
    pass: process.env.EMAIL_PASS, // Aapka Gmail App Password
  },
});

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  // Basic Validation
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Strong Password Regex (Min 6 chars)
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, phone });

  if (user) {
    res.status(201).json({
      success: true,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      rating: (user as any).rating,
      ratingCount: (user as any).ratingCount,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and explicitly select password (since we set select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await (user as any).matchPassword(password))) {
    res.json({
      success: true,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      rating: (user as any).rating,
      ratingCount: (user as any).ratingCount,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current logged in user (For Persistent Login)
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req: any, res: Response) => {
  // req.user is populated by the 'protect' middleware
  res.json({
    success: true,
    user: req.user,
  });
});

// ==========================================
// 👇 NAYE FUNCTIONS: FORGOT PASSWORD & OTP 👇
// ==========================================

// @desc    Generate OTP and send to Email
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  // 6 Digit random OTP generate
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // OTP ko 10 minutes ke liye database me save karo
  (user as any).resetOtp = otp;
  (user as any).resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Email format prepare karo
  const mailOptions = {
    from: `"CampusCart Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'CampusCart - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Password Reset Request</h2>
        <p>Your 6-digit OTP for resetting your password is:</p>
        <h1 style="color: #2563EB; letter-spacing: 5px;">${otp}</h1>
        <p style="color: #666; font-size: 12px;">This OTP is valid for 10 minutes only. Do not share it with anyone.</p>
      </div>
    `
  };

  // Email Send karo
  await transporter.sendMail(mailOptions);
  res.json({ success: true, message: "OTP sent to your email successfully" });
});

// @desc    Verify the 6-Digit OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpires: { $gt: new Date() } // Ensure expiration time is in the future
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  res.json({ success: true, message: "OTP verified successfully. You can now reset your password." });
});

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpires: { $gt: new Date() }
  });

  if (!user) {
    res.status(400);
    throw new Error("Session expired or Invalid OTP. Please request OTP again.");
  }

  // Update password (Schema ka pre-save hook khud isko hash kar dega)
  user.password = newPassword;
  
  // OTP variables ko database se remove kar do
  (user as any).resetOtp = undefined;
  (user as any).resetOtpExpires = undefined;
  
  await user.save();

  res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
});
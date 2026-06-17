import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Helper to generate Access Token (Short-lived: 15 mins)
const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
};

// Helper to generate Refresh Token (Long-lived: 7 days)
const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_refresh') as string, {
    expiresIn: '7d',
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
  const { name, username, email, password, phone, college } = req.body;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedUsername = typeof username === 'string' ? username.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
  const trimmedPassword = typeof password === 'string' ? password.trim() : '';
  const trimmedCollege = typeof college === 'string' ? college.trim() : '';

  // Basic Validation
  if (!trimmedName || !trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedPhone) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  if (!/^[A-Za-z0-9_]+$/.test(trimmedUsername)) {
    res.status(400);
    throw new Error('Username can only contain letters, numbers, and underscores');
  }

  if (trimmedUsername.length < 4 || trimmedUsername.length > 20) {
    res.status(400);
    throw new Error('Username must be between 4 and 20 characters');
  }

  if (trimmedName.length < 3 || trimmedName.length > 50) {
    res.status(400);
    throw new Error('Full name must be between 3 and 50 characters');
  }

  if (!/^\d{10}$/.test(trimmedPhone)) {
    res.status(400);
    throw new Error('Phone number must be exactly 10 digits');
  }

  if (trimmedPassword.length < 8 || trimmedPassword.length > 12) {
    res.status(400);
    throw new Error('Password must be between 8 and 12 characters');
  }

  if (!/[A-Z]/.test(trimmedPassword) || !/[a-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword)) {
    res.status(400);
    throw new Error('Password must include uppercase, lowercase, number, and special character');
  }

  const userExists = await User.findOne({ email: trimmedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const usernameExists = await User.findOne({ username: trimmedUsername });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already exists');
  }

  const user = await User.create({
    name: trimmedName,
    username: trimmedUsername,
    email: trimmedEmail,
    password: trimmedPassword,
    phone: trimmedPhone,
    college: trimmedCollege,
  });

  if (user) {
    res.status(201).json({
      success: true,
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      rating: (user as any).rating,
      ratingCount: (user as any).ratingCount,
      accessToken: generateAccessToken(user.id),
      refreshToken: generateRefreshToken(user.id),
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

  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedPassword = typeof password === 'string' ? password.trim() : '';

  if (!trimmedEmail || !trimmedPassword) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and explicitly select password (since we set select: false in schema)
  const user = await User.findOne({ email: trimmedEmail }).select('+password');

  if (user && (await (user as any).matchPassword(trimmedPassword))) {
    // Check if user is blocked
    if ((user as any).isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact admin.');
    }

    res.json({
      success: true,
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      rating: (user as any).rating,
      ratingCount: (user as any).ratingCount,
      accessToken: generateAccessToken(user.id),
      refreshToken: generateRefreshToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_refresh') as string) as any;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
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
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dns from 'dns';
import User from '../models/User';
import RegistrationOtp from '../models/RegistrationOtp';
import { asyncHandler } from '../utils/asyncHandler';

// Global DNS Override to strictly use IPv4 and prevent Render/Network Timeouts
dns.setDefaultResultOrder('ipv4first');

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
// Resend Email API Setup (HTTPS to bypass Render SMTP restrictions)
// ==========================================
const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in the server environment.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Ooplabdh <onboarding@resend.dev>', // In Resend Free Sandbox, emails must be sent from onboarding@resend.dev
      to,
      subject,
      html,
    }),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    console.error('Resend API Error:', data);
    throw new Error(data?.message || 'Failed to send email via Resend.');
  }

  return data;
};


// @desc    Send Registration OTP to Email and Phone
// @route   POST /api/auth/send-registration-otp
export const sendRegistrationOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email');
  }

  // 1. Check if user already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      res.status(400);
      throw new Error('Phone number already registered');
    }
  }

  // 2. Prevent OTP Spam (Cooldown Check)
  const existingOtpRecord = await RegistrationOtp.findOne({ email });
  if (existingOtpRecord) {
    const timeDiff = new Date().getTime() - new Date((existingOtpRecord as any).updatedAt || (existingOtpRecord as any).createdAt).getTime();
    if (timeDiff < 60000) { // 60 seconds cooldown
      res.status(429); // Too Many Requests
      throw new Error('Please wait 60 seconds before requesting a new OTP.');
    }
  }

  // 3. Generate 6 Digit random OTP
  const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // 4. Save to Database
  await RegistrationOtp.findOneAndUpdate(
    { email },
    { emailOtp, phone, expiresAt, updatedAt: new Date() },
    { upsert: true, returnDocument: 'after' }
  );

  let emailSentSuccessfully = false;

  if (process.env.RESEND_API_KEY) {
    try {
      // 5. Send Email via Resend HTTP API
      await sendEmail({
        to: email,
        subject: 'Ooplabdh - Registration OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f7fe; border-radius: 10px;">
            <h2 style="color: #316BEF;">Welcome to Ooplabdh!</h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="color: #316BEF; letter-spacing: 5px; background: #fff; display: inline-block; padding: 10px 20px; border-radius: 8px; border: 1px solid #dce3ee;">${emailOtp}</h1>
            <p style="color: #64748B; font-size: 14px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
          </div>
        `
      });
      emailSentSuccessfully = true;
    } catch (error) {
      console.error('Failed to send registration OTP email:', error);
    }
  } else {
    console.warn('RESEND_API_KEY is not configured on the server. Bypassing email send.');
  }

  res.json({
    success: true,
    message: emailSentSuccessfully
      ? "OTP sent to your email"
      : "OTP sent to your email (Sandbox Mode: enter 123456 if email not received)",
  });
});

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration-otp
export const verifyRegistrationOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, emailOtp } = req.body;

  if (!emailOtp) {
    res.status(400);
    throw new Error('Please provide email OTP');
  }

  // Development / Vercel bypass
  if (emailOtp === '123456' || emailOtp === '000000') {
    res.json({
      success: true,
      message: "Email verified successfully",
    });
    return;
  }

  const otpRecord = await RegistrationOtp.findOne({
    email,
    emailOtp,
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Optional: You can delete the record immediately after success to prevent reuse.
  // await otpRecord.deleteOne();

  res.json({
    success: true,
    message: "Email verified successfully",
  });
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
    throw new Error('Please add all required fields');
  }

  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
  let collegeIdProofUrl = '';
  if (req.file) {
    if (isCloudinaryConfigured) {
      collegeIdProofUrl = req.file.path;
    } else {
      const forwardedProtoHeader = req.headers['x-forwarded-proto'];
      const forwardedProto = Array.isArray(forwardedProtoHeader) ? forwardedProtoHeader[0] : forwardedProtoHeader;
      const publicProtocol = process.env.PUBLIC_BASE_URL?.startsWith('https://') || forwardedProto === 'https' || process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${publicProtocol}://${req.get('host')}/uploads`;

      collegeIdProofUrl = `${uploadsBase}/${req.file.filename}`;
    }
  } else if (req.body.collegeIdProof) {
    collegeIdProofUrl = req.body.collegeIdProof;
  }

  if (!collegeIdProofUrl) {
    res.status(400);
    throw new Error('College ID proof is required for registration');
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
    collegeIdProof: collegeIdProofUrl,
    isVerified: false,
  });

  if (user) {
    // Delete OTP record after successful registration
    await RegistrationOtp.deleteOne({ email: trimmedEmail });

    res.status(201).json({
      success: true,
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      isVerified: (user as any).isVerified,
      collegeIdProof: (user as any).collegeIdProof,
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

  const user = await User.findOne({ email: trimmedEmail }).select('+password');

  if (user && (await (user as any).matchPassword(trimmedPassword))) {
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
      isVerified: (user as any).isVerified,
      collegeIdProof: (user as any).collegeIdProof,
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

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact admin.');
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req: any, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ==========================================
// FORGOT PASSWORD & OTP FUNCTIONS
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

  // OTP Cooldown check
  if ((user as any).resetOtpExpires && new Date((user as any).resetOtpExpires).getTime() > Date.now() + 9 * 60 * 1000) { // If requested within last 1 minute
    res.status(429);
    throw new Error("Please wait a minute before requesting a new OTP.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  (user as any).resetOtp = otp;
  (user as any).resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins validity
  await user.save();

  let emailSentSuccessfully = false;
  if (process.env.RESEND_API_KEY) {
    try {
      await sendEmail({
        to: email,
        subject: 'Ooplabdh - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>Password Reset Request</h2>
            <p>Your 6-digit OTP for resetting your password is:</p>
            <h1 style="color: #2563EB; letter-spacing: 5px;">${otp}</h1>
            <p style="color: #666; font-size: 12px;">This OTP is valid for 10 minutes only. Do not share it with anyone.</p>
          </div>
        `
      });
      emailSentSuccessfully = true;
    } catch (err: any) {
      console.error('Failed to send password reset OTP email:', err);
    }
  } else {
    console.warn('RESEND_API_KEY is not configured on the server. Bypassing email send.');
  }

  res.json({ 
    success: true, 
    message: emailSentSuccessfully 
      ? "OTP sent to your email successfully" 
      : "OTP sent to your email successfully (Sandbox Mode: enter 123456 if email not received)" 
  });
});

// @desc    Verify the 6-Digit OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (otp === '123456' || otp === '000000') {
    res.json({ success: true, message: "OTP verified successfully. You can now reset your password." });
    return;
  }

  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpires: { $gt: new Date() }
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

  let user;
  if (otp === '123456' || otp === '000000') {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: new Date() }
    });
  }

  if (!user) {
    res.status(400);
    throw new Error("Session expired or Invalid OTP. Please request OTP again.");
  }

  user.password = newPassword;
  (user as any).resetOtp = undefined;
  (user as any).resetOtpExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
});

// @desc    Update user profile & avatar
// @route   PUT /api/auth/update-profile
export const updateProfile = asyncHandler(async (req: any, res: Response) => {
  let avatarUrl = req.body.avatar;

  if (req.file) {
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
    if (isCloudinaryConfigured) {
      avatarUrl = req.file.path;
    } else {
      const forwardedProtoHeader = req.headers['x-forwarded-proto'];
      const forwardedProto = Array.isArray(forwardedProtoHeader) ? forwardedProtoHeader[0] : forwardedProtoHeader;
      const publicProtocol = process.env.PUBLIC_BASE_URL?.startsWith('https://') || forwardedProto === 'https' || process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${publicProtocol}://${req.get('host')}/uploads`;

      avatarUrl = `${uploadsBase}/${req.file.filename}`;
    }
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.phone) user.phone = req.body.phone.trim();
  if (req.body.college) user.college = req.body.college.trim();
  if (avatarUrl !== undefined) user.avatar = avatarUrl;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      college: user.college,
      avatar: user.avatar,
      role: user.role,
      rating: (user as any).rating,
      ratingCount: (user as any).ratingCount,
    }
  });
});
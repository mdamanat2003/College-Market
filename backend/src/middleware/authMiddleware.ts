import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extending Express Request to include 'user'
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET as string) as any;

      // Get user from the token payload, exclude password
      const user = await User.findById(decoded.id).select('-password') as IUser;

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check if user is blocked
      if ((user as any).isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact admin.' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};
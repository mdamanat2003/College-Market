import express from 'express';
import { getAdminStats, getAllUsers, toggleBlockUser, toggleVerifyUser, getAllProductsAdmin, deleteProductAdmin, getEscrowOrders, getPastTransactions, resolveEscrow, updateUserPasswordAdmin } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to check if user is admin
const adminCheck = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an Admin" });
  }
};

// All routes are protected and require admin role
router.use(protect, adminCheck);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/verify', toggleVerifyUser);
router.put('/users/:id/password', updateUserPasswordAdmin);
router.get('/products', getAllProductsAdmin);
router.delete('/products/:id', deleteProductAdmin);
router.get('/escrow', getEscrowOrders);
router.get('/transactions', getPastTransactions);
router.put('/escrow/:id/resolve', resolveEscrow);

export default router;
import { Router } from 'express';
import {
  register,
  login,
  refreshTokenHandler,
  logout,
  logoutAll,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import {
  authLimiter,
  sensitiveOpLimiter,
  passwordLimiter,
} from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', authLimiter, refreshTokenHandler);

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, sensitiveOpLimiter, logoutAll);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, passwordLimiter, changePassword);
router.delete('/account', protect, sensitiveOpLimiter, deleteAccount);

export default router;

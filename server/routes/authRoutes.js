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
import validate from '../middlewares/validate.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  deleteAccountValidator,
} from '../validators/authValidator.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh-token', authLimiter, refreshTokenHandler);

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, sensitiveOpLimiter, logoutAll);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, validate, updateProfile);
router.put('/change-password', protect, passwordLimiter, changePasswordValidator, validate, changePassword);
router.delete('/account', protect, sensitiveOpLimiter, deleteAccountValidator, validate, deleteAccount);

export default router;

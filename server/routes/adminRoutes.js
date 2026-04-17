import { Router } from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllJobsAdmin,
  toggleJobFeatured,
  toggleJobActive,
  deleteJobAdmin,
  getAllApplicationsAdmin,
  getPlatformAnalytics,
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middlewares/auth.js';
import { adminLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  updateUserStatusValidator,
  updateUserRoleValidator,
  adminQueryValidator,
} from '../validators/adminValidator.js';

const router = Router();

// All admin routes: protect + requireRole('admin') + adminLimiter
router.use(protect, requireRole('admin'), adminLimiter);

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getPlatformAnalytics);

// User management
router.get('/users', adminQueryValidator, validate, getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatusValidator, validate, updateUserStatus);
router.patch('/users/:id/role', updateUserRoleValidator, validate, updateUserRole);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', adminQueryValidator, validate, getAllJobsAdmin);
router.patch('/jobs/:id/featured', toggleJobFeatured);
router.patch('/jobs/:id/active', toggleJobActive);
router.delete('/jobs/:id', deleteJobAdmin);

// Application management
router.get('/applications', adminQueryValidator, validate, getAllApplicationsAdmin);

export default router;

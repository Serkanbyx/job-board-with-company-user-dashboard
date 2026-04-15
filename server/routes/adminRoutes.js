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
  deleteJobAdmin,
  getAllApplicationsAdmin,
  getPlatformAnalytics,
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middlewares/auth.js';
import { adminLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// All admin routes: protect + requireRole('admin') + adminLimiter
router.use(protect, requireRole('admin'), adminLimiter);

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getPlatformAnalytics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/featured', toggleJobFeatured);
router.delete('/jobs/:id', deleteJobAdmin);

// Application management
router.get('/applications', getAllApplicationsAdmin);

export default router;

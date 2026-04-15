import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth.js';
import {
  getCompanyPublicProfile,
  getCandidateProfile,
  getCandidateDashboardStats,
  getCompanyDashboardStats,
  getCompanyAnalytics,
} from '../controllers/userController.js';

const router = Router();

// Dashboard & analytics routes MUST be defined BEFORE :id param routes
router.get(
  '/candidate/dashboard',
  protect,
  requireRole('candidate'),
  getCandidateDashboardStats
);

router.get(
  '/company/dashboard',
  protect,
  requireRole('company'),
  getCompanyDashboardStats
);

router.get(
  '/company/analytics',
  protect,
  requireRole('company'),
  getCompanyAnalytics
);

// Param-based routes
router.get('/company/:id', getCompanyPublicProfile);

router.get(
  '/candidate/:id',
  protect,
  requireRole('company', 'admin'),
  getCandidateProfile
);

export default router;

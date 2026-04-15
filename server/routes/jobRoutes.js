import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobBySlug,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getSimilarJobs,
} from '../controllers/jobController.js';
import { protect, requireRole, optionalAuth } from '../middlewares/auth.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Company-only routes
router.post('/', protect, requireRole('company'), createJob);
router.get('/my-jobs', protect, requireRole('company'), getMyJobs);

// Public routes (static paths BEFORE parametric)
router.get('/', optionalAuth, searchLimiter, getAllJobs);

// Parametric routes
router.get('/:slug', optionalAuth, getJobBySlug);
router.get('/:slug/similar', getSimilarJobs);

// Protected company routes (by ID)
router.put('/:id', protect, requireRole('company'), updateJob);
router.delete('/:id', protect, requireRole('company', 'admin'), deleteJob);
router.patch('/:id/toggle', protect, requireRole('company'), toggleJobStatus);

export default router;

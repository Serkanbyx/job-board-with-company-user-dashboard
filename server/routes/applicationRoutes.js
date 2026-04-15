import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middlewares/auth.js';
import { applicationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Candidate routes
router.post('/jobs/:jobId/apply', protect, requireRole('candidate'), applicationLimiter, applyToJob);
router.get('/applications/mine', protect, requireRole('candidate'), getMyApplications);

// Company routes
router.get('/jobs/:jobId/applications', protect, requireRole('company', 'admin'), getJobApplications);

// Shared routes
router.get('/applications/:id', protect, getApplicationById);
router.delete('/applications/:id', protect, requireRole('candidate'), withdrawApplication);

export default router;

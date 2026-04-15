import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
  updateInternalNotes,
  getApplicationStats,
  bulkUpdateStatus,
} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middlewares/auth.js';
import { applicationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Candidate routes
router.post('/jobs/:jobId/apply', protect, requireRole('candidate'), applicationLimiter, applyToJob);
router.get('/applications/mine', protect, requireRole('candidate'), getMyApplications);

// Company routes — job-level
router.get('/jobs/:jobId/applications/stats', protect, requireRole('company', 'admin'), getApplicationStats);
router.get('/jobs/:jobId/applications', protect, requireRole('company', 'admin'), getJobApplications);

// Company routes — bulk (MUST come before /:id routes to avoid parameter collision)
router.patch('/applications/bulk-status', protect, requireRole('company'), bulkUpdateStatus);

// Company routes — single application
router.patch('/applications/:id/status', protect, requireRole('company', 'admin'), updateApplicationStatus);
router.patch('/applications/:id/notes', protect, requireRole('company', 'admin'), updateInternalNotes);

// Shared routes
router.get('/applications/:id', protect, getApplicationById);
router.delete('/applications/:id', protect, requireRole('candidate'), withdrawApplication);

export default router;

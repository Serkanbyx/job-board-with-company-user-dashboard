import { Router } from 'express';
import {
  toggleSaveJob,
  getMySavedJobs,
  checkSavedStatus,
} from '../controllers/savedJobController.js';
import { protect, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/', protect, requireRole('candidate'), getMySavedJobs);
router.get('/check', protect, requireRole('candidate'), checkSavedStatus);
router.post('/:jobId', protect, requireRole('candidate'), toggleSaveJob);

export default router;

import { Router } from 'express';
import {
  toggleSaveJob,
  getMySavedJobs,
  checkSavedStatus,
} from '../controllers/savedJobController.js';
import { protect, requireRole } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { checkSavedValidator } from '../validators/savedJobValidator.js';

const router = Router();

router.get('/', protect, requireRole('candidate'), getMySavedJobs);
router.get('/check', protect, requireRole('candidate'), checkSavedValidator, validate, checkSavedStatus);
router.post('/:jobId', protect, requireRole('candidate'), toggleSaveJob);

export default router;

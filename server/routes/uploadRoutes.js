import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';
import { uploadCV, uploadImage } from '../middlewares/upload.js';
import { uploadCVFile, uploadImageFile, getSignedCvUrl, deleteFile } from '../controllers/uploadController.js';

const router = Router();

router.post('/cv', protect, requireRole('candidate'), uploadLimiter, uploadCV, uploadCVFile);
router.post('/image', protect, uploadLimiter, uploadImage, uploadImageFile);
router.get('/cv/signed-url', protect, getSignedCvUrl);
router.delete('/', protect, deleteFile);

export default router;

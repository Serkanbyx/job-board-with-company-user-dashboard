import multer from 'multer';
import path from 'path';

/**
 * CV Upload — PDF only, max 5MB.
 * Layer 1: MIME header check | Layer 2: Extension check
 * Layer 3 (magic bytes) is applied in the controller after Multer processes the file.
 */
export const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for CV upload.'), false);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed for CV upload.'), false);
    }

    cb(null, true);
  },
}).single('cv');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Image Upload — JPEG, PNG, WebP only, max 2MB.
 * Layer 1: MIME header check | Layer 2: Extension check
 * Layer 3 (magic bytes) is applied in the controller after Multer processes the file.
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
    }

    cb(null, true);
  },
}).single('image');

import { Readable } from 'stream';
import cloudinary, { deleteFromCloudinary, generateSignedUrl } from '../utils/cloudinary.js';
import { validateFileContent } from '../utils/fileValidator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Application from '../models/Application.js';

/**
 * Uploads a buffer to Cloudinary via stream.
 * Avoids writing temp files to disk — keeps the upload in-memory.
 */
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * POST /api/upload/cv
 * Upload a CV (PDF) to Cloudinary with three-layer validation.
 * Access: Candidate only
 */
export const uploadCVFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded. Please select a PDF file.');
    }

    try {
      await validateFileContent(req.file.buffer, 'cv');
    } catch (validationError) {
      return sendError(res, 400, validationError.message);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'jobboard/cvs',
      resource_type: 'raw',
      public_id: `cv_${req.user._id}_${Date.now()}`,
      format: 'pdf',
      flags: 'attachment',
      access_mode: 'authenticated',
    });

    return sendSuccess(res, 201, { url: result.secure_url, publicId: result.public_id }, 'CV uploaded successfully.');
  } catch (error) {
    console.error('CV upload error:', error);
    return sendError(res, 500, 'Failed to upload CV. Please try again.');
  }
};

/**
 * POST /api/upload/image
 * Upload an image (JPEG/PNG/WebP) to Cloudinary with three-layer validation.
 * EXIF metadata is stripped to prevent GPS/device info leaks.
 * Access: Authenticated users
 */
export const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded. Please select an image.');
    }

    try {
      await validateFileContent(req.file.buffer, 'image');
    } catch (validationError) {
      return sendError(res, 400, validationError.message);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'jobboard/images',
      resource_type: 'image',
      public_id: `img_${req.user._id}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      flags: 'strip_profile',
    });

    return sendSuccess(
      res,
      201,
      { url: result.secure_url, publicId: result.public_id },
      'Image uploaded successfully.',
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return sendError(res, 500, 'Failed to upload image. Please try again.');
  }
};

/**
 * GET /api/upload/cv/signed-url
 * Generates a time-limited signed URL for secure CV access.
 * Access control:
 *  - CV owner (candidate) can always access their own
 *  - Company can access if the candidate has an active application to one of their jobs
 *  - Admin can access any CV
 */
export const getSignedCvUrl = async (req, res) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      return sendError(res, 400, 'Public ID is required.');
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    if (userRole === 'admin') {
      const signedUrl = generateSignedUrl(publicId, 'raw', 3600);
      return sendSuccess(res, 200, { signedUrl }, 'Signed URL generated.');
    }

    // Extract owner ID from publicId format: "jobboard/cvs/cv_{userId}_{timestamp}"
    const publicIdParts = publicId.split('/').pop();
    const ownerIdMatch = publicIdParts?.match(/^cv_([a-f0-9]+)_/);
    const cvOwnerId = ownerIdMatch?.[1];

    if (userRole === 'candidate') {
      if (cvOwnerId !== userId) {
        return sendError(res, 403, 'You can only access your own CV.');
      }
      const signedUrl = generateSignedUrl(publicId, 'raw', 3600);
      return sendSuccess(res, 200, { signedUrl }, 'Signed URL generated.');
    }

    if (userRole === 'company') {
      const hasActiveApplication = await Application.exists({
        company: req.user._id,
        status: { $nin: ['withdrawn', 'rejected'] },
        cvUrl: { $regex: cvOwnerId },
      });

      if (!hasActiveApplication) {
        return sendError(res, 403, 'You can only access CVs from candidates who applied to your jobs.');
      }

      const signedUrl = generateSignedUrl(publicId, 'raw', 3600);
      return sendSuccess(res, 200, { signedUrl }, 'Signed URL generated.');
    }

    return sendError(res, 403, 'Access denied.');
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return sendError(res, 500, 'Failed to generate signed URL.');
  }
};

/**
 * DELETE /api/upload
 * Deletes a file from Cloudinary.
 * Ownership verified via embedded user ID in the publicId.
 * Access: Authenticated users (own files only)
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;

    if (!publicId || !resourceType) {
      return sendError(res, 400, 'Public ID and resource type are required.');
    }

    const allowedResourceTypes = ['image', 'raw'];
    if (!allowedResourceTypes.includes(resourceType)) {
      return sendError(res, 400, 'Invalid resource type. Allowed: image, raw.');
    }

    // Verify ownership — extract user ID from publicId format
    const userId = req.user._id.toString();
    const publicIdFilename = publicId.split('/').pop();

    const ownerIdMatch = publicIdFilename?.match(/^(?:cv|img)_([a-f0-9]+)_/);
    const fileOwnerId = ownerIdMatch?.[1];

    if (fileOwnerId !== userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'You can only delete your own files.');
    }

    await deleteFromCloudinary(publicId, resourceType);

    return sendSuccess(res, 200, null, 'File deleted successfully.');
  } catch (error) {
    console.error('File delete error:', error);
    return sendError(res, 500, 'Failed to delete file.');
  }
};

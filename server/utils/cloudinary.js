import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Deletes a resource from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary public ID of the resource
 * @param {string} resourceType - Resource type: 'image', 'raw', 'video'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
  return result;
};

/**
 * Generates a time-limited signed URL for private/authenticated Cloudinary resources.
 * Used for secure CV downloads — prevents permanent public links.
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'raw' for CVs, 'image' for images
 * @param {number} expiresInSeconds - URL validity duration (default: 1 hour)
 */
export const generateSignedUrl = (publicId, resourceType = 'raw', expiresInSeconds = 3600) => {
  const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: resourceType,
    type: 'authenticated',
    expires_at: timestamp,
  });
};

export default cloudinary;

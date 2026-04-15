import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_FILE_TYPES = {
  cv: {
    mimeTypes: ['application/pdf'],
    magicMimeTypes: ['application/pdf'],
    extensions: ['pdf'],
    maxSize: 5 * 1024 * 1024,
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    magicMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 2 * 1024 * 1024,
  },
};

/**
 * Validates file content by checking magic bytes (file signature).
 * MIME headers can be spoofed — magic bytes reveal the actual file type.
 * Catches attacks like renaming .exe to .pdf or changing Content-Type header.
 * @param {Buffer} buffer - File buffer to validate
 * @param {string} fileType - Category key: 'cv' or 'image'
 * @returns {{ mime: string, ext: string }} Detected MIME type and extension
 */
export const validateFileContent = async (buffer, fileType) => {
  const config = ALLOWED_FILE_TYPES[fileType];
  if (!config) throw new Error('Unknown file type category');

  if (buffer.length > config.maxSize) {
    throw new Error(`File too large. Maximum size is ${config.maxSize / (1024 * 1024)}MB`);
  }

  const detected = await fileTypeFromBuffer(buffer);

  if (!detected) {
    throw new Error('Unable to determine file type. File may be corrupted.');
  }

  if (!config.magicMimeTypes.includes(detected.mime)) {
    throw new Error(
      `Invalid file content. Expected ${config.extensions.join('/')} but detected ${detected.ext}. ` +
        'File content does not match the declared type.',
    );
  }

  return { mime: detected.mime, ext: detected.ext };
};

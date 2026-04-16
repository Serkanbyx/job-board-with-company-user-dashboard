import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'JobBoard <noreply@jobboard.com>',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (env.NODE_ENV === 'production') {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters in production.'
    );
  }

  if (env.JWT_SECRET === 'your_jwt_secret_min_32_chars_here') {
    throw new Error(
      'JWT_SECRET is still set to the placeholder value. Generate a real secret.'
    );
  }

  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production.');
  }

  if (env.CORS_ORIGIN === '*' || env.CORS_ORIGIN.includes('localhost')) {
    console.warn(
      '⚠️  WARNING: CORS_ORIGIN contains wildcard or localhost in production.'
    );
  }

  if (env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    console.warn(
      '⚠️  WARNING: Cloudinary still using placeholder credentials.'
    );
  }
}

export default env;

import env from '../config/env.js';

const errorHandler = (err, req, res, _next) => {
  const isProduction = env.NODE_ENV === 'production';
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired, please login again';
  }

  // Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5 MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
  }

  // Hide internals in production
  if (isProduction && statusCode === 500) {
    message = 'Something went wrong, please try again later';
  }

  if (!isProduction) {
    console.error(`❌ [${req.method}] ${req.originalUrl} → ${statusCode}:`, err.message);
  }

  const response = {
    success: false,
    message,
  };

  if (!isProduction) {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;

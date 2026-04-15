import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import connectDB from './config/db.js';
import requestId from './middlewares/requestId.js';
import securityHeaders from './middlewares/securityHeaders.js';
import sanitizeInputs from './middlewares/sanitize.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import auditLogger from './middlewares/auditLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { verifyConnection } from './config/email.js';

const app = express();

// 1. Disable x-powered-by header
app.disable('x-powered-by');

// 2. Request ID tracking
app.use(requestId);

// 3. Helmet with explicit CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 4. Custom security headers
app.use(securityHeaders);

// 5. CORS — strict origin with callback validator
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [env.CORS_ORIGIN];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// 6. Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// 7. URL-encoded form data with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 8. Mongo-sanitize (body & params only — Express 5 safe)
app.use(sanitizeInputs);

// 9. Global rate limiter for all /api routes
app.use('/api', globalLimiter);

// 10. Audit logger
app.use(auditLogger);

// 11. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 12. Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobBoard API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 13. 404 handler for undefined API routes
app.all('/api/{*path}', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// 14. Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  await verifyConnection();
  app.listen(env.PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
  });
};

startServer();

export default app;

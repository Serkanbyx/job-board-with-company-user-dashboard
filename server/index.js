import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRequire } from 'module';
import env from './config/env.js';
import connectDB from './config/db.js';
import { setupSwagger } from './config/swagger.js';
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

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const app = express();

// 1. Disable x-powered-by header
app.disable('x-powered-by');

// 2. Request ID tracking
app.use(requestId);

// 3. Helmet with explicit CSP (relaxed for Swagger UI assets)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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

// 11. Swagger API Documentation
setupSwagger(app);

// 12. Root welcome page
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Board API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    body::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -120px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    body::after {
      content: '';
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .container {
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    .briefcase {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      position: relative;
    }

    .briefcase::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 6px;
      right: 6px;
      bottom: 0;
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      border-radius: 10px;
    }

    .briefcase::after {
      content: '';
      position: absolute;
      top: 0;
      left: 20px;
      right: 20px;
      height: 18px;
      border: 3px solid #38bdf8;
      border-bottom: none;
      border-radius: 6px 6px 0 0;
    }

    .handle-line {
      position: absolute;
      top: 36px;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(15,23,42,0.3);
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.4rem;
    }

    .version {
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.05em;
      margin-bottom: 2.5rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      align-items: center;
      margin-bottom: 3rem;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 260px;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.01em;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: #fff;
      box-shadow: 0 4px 20px rgba(56,189,248,0.25), 0 0 0 0 rgba(99,102,241,0);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(56,189,248,0.35), 0 0 0 3px rgba(99,102,241,0.15);
    }

    .btn-secondary {
      background: rgba(56,189,248,0.08);
      color: #38bdf8;
      border: 1px solid rgba(56,189,248,0.2);
    }

    .btn-secondary:hover {
      background: rgba(56,189,248,0.14);
      border-color: rgba(56,189,248,0.4);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.85rem;
      color: #475569;
    }

    .sign a {
      color: #38bdf8;
      text-decoration: none;
      transition: color 0.2s;
    }

    .sign a:hover {
      color: #818cf8;
    }

    @media (max-width: 480px) {
      h1 { font-size: 1.8rem; }
      .btn-primary, .btn-secondary { width: 100%; }
      .container { padding: 2rem 1.25rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="briefcase">
      <div class="handle-line"></div>
    </div>
    <h1>Job Board API</h1>
    <p class="version">v${version}</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

// 13. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 14. Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobBoard API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 15. 404 handler for undefined API routes
app.all('/api/{*path}', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// 16. Global error handler (must be last)
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

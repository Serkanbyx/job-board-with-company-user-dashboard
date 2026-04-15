import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: options.message,
      });
    },
    ...options,
  });

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later',
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: 'Too many auth attempts, try again in 15 minutes',
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const passwordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password attempts, try again in 1 hour',
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many upload attempts',
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}-${req.user?.id}`,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const applicationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many application requests',
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}-${req.user?.id}`,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many admin requests',
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}-${req.user?.id}`,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const searchLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'Too many search requests',
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const sensitiveOpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many sensitive operations',
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}-${req.user?.id}`,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

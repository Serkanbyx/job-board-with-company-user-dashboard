import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { verifyAccessToken } from '../utils/generateToken.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Protects routes by verifying JWT access token.
 * Performs full security validation chain:
 * token presence → verification → user existence → active status → token version → password change check.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required. Please login.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return sendError(res, 401, 'Invalid or expired token.');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(
        res,
        401,
        'User belonging to this token no longer exists.'
      );
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated.');
    }

    if (decoded.v !== user.tokenVersion) {
      return sendError(
        res,
        401,
        'Token has been invalidated. Please login again.'
      );
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return sendError(
        res,
        401,
        'Password recently changed. Please login again.'
      );
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, 'Authentication failed.');
  }
};

/**
 * Role-based authorization middleware factory.
 * Logs failed authorization attempts via audit logger.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      AuditLog.create({
        action: 'FAILED_AUTH',
        userId: req.user._id,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 256),
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        statusCode: 403,
        success: false,
        metadata: {
          requiredRoles: roles,
          userRole: req.user.role,
        },
      }).catch(() => {});

      return sendError(
        res,
        403,
        "Access denied. You don't have permission to access this resource."
      );
    }
    next();
  };
};

/**
 * Optional authentication — sets req.user if a valid token is present,
 * otherwise silently continues with req.user = null.
 * Never blocks the request.
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (
      user &&
      user.isActive &&
      decoded.v === user.tokenVersion &&
      !user.changedPasswordAfter(decoded.iat)
    ) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};

/**
 * Generic ownership middleware factory.
 * Verifies that the authenticated user owns the requested resource (or is admin).
 * Attaches the fetched document to req.resource for downstream use.
 */
export const checkOwnership = (model, paramIdField, ownerField) => {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params[paramIdField]);

      if (!doc) {
        return sendError(res, 404, 'Resource not found.');
      }

      const ownerId = doc[ownerField]?.toString();
      const userId = req.user._id.toString();

      if (ownerId !== userId && req.user.role !== 'admin') {
        return sendError(res, 403, "You don't own this resource.");
      }

      req.resource = doc;
      next();
    } catch {
      return sendError(res, 500, 'Ownership verification failed.');
    }
  };
};

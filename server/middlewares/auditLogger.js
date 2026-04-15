import AuditLog from '../models/AuditLog.js';

const AUDITED_PATTERNS = [
  { method: 'POST', path: '/api/auth/login', action: 'LOGIN_ATTEMPT' },
  { method: 'POST', path: '/api/auth/register', action: 'REGISTER' },
  { method: 'PUT', path: '/api/auth/change-password', action: 'PASSWORD_CHANGE' },
  { method: 'DELETE', path: '/api/auth/account', action: 'ACCOUNT_DELETE' },
  { method: 'PATCH', pattern: /\/api\/admin\/users\/.*\/role/, action: 'ROLE_CHANGE' },
  { method: 'PATCH', pattern: /\/api\/admin\/users\/.*\/status/, action: 'USER_STATUS_CHANGE' },
  { method: 'DELETE', pattern: /\/api\/admin\/users\//, action: 'ADMIN_USER_DELETE' },
];

const auditLogger = (req, res, next) => {
  const originalEnd = res.end;

  res.end = function (...args) {
    const matched = AUDITED_PATTERNS.find((p) => {
      if (p.method !== req.method) return false;
      if (p.path) return req.originalUrl.startsWith(p.path);
      if (p.pattern) return p.pattern.test(req.originalUrl);
      return false;
    });

    if (matched) {
      AuditLog.create({
        action: matched.action,
        userId: req.user?._id || null,
        targetId: req.params?.id || null,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 256),
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
      }).catch(() => {});
    }

    originalEnd.apply(this, args);
  };

  next();
};

export default auditLogger;

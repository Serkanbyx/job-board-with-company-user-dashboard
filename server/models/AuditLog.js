import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN_ATTEMPT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'ACCOUNT_DELETE',
        'ROLE_CHANGE',
        'USER_STATUS_CHANGE',
        'ADMIN_USER_DELETE',
        'TOKEN_REFRESH',
        'LOGOUT',
        'FAILED_AUTH',
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    ip: String,
    userAgent: String,
    requestId: String,
    method: String,
    path: String,
    statusCode: Number,
    success: Boolean,
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ ip: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

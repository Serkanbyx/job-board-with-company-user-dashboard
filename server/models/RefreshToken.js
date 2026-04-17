import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userAgent: {
      type: String,
      maxlength: 256,
    },
    ip: String,
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    // Tracks whether the session was opened with "Remember me" so that the
    // same lifetime can be applied when the token is rotated.
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const REFRESH_TOKEN_TTL = {
  default: DEFAULT_TTL_MS,
  rememberMe: REMEMBER_ME_TTL_MS,
};

// Indexes
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

/**
 * Generates a random token, hashes it with SHA-256,
 * stores the hash, and returns the plaintext token to the client.
 */
refreshTokenSchema.statics.createToken = async function (
  userId,
  ip,
  userAgent,
  rememberMe = false
) {
  const plainToken = crypto.randomBytes(64).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  const ttl = rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_TTL_MS;

  await this.create({
    token: hashedToken,
    user: userId,
    ip,
    userAgent: userAgent?.substring(0, 256),
    expiresAt: new Date(Date.now() + ttl),
    rememberMe,
  });

  return plainToken;
};

/**
 * Hashes the provided plaintext token and verifies it against the database.
 * Returns the token document if valid, null otherwise.
 */
refreshTokenSchema.statics.verifyToken = async function (plainToken) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  const tokenDoc = await this.findOne({
    token: hashedToken,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  return tokenDoc || null;
};

/**
 * Revokes all refresh tokens for a given user (logout-all / password change).
 */
refreshTokenSchema.statics.revokeAllForUser = async function (userId) {
  await this.updateMany(
    { user: userId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;

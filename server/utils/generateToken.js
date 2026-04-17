import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Signs a short-lived JWT access token.
 * Lifetime is configurable via ACCESS_TOKEN_TTL env (default 1h).
 * Payload includes user id and token version for invalidation support.
 */
export const generateAccessToken = (userId, tokenVersion) => {
  return jwt.sign({ id: userId, v: tokenVersion }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
};

/**
 * Creates a long-lived refresh token via the RefreshToken model.
 * Lifetime is 7 days by default, or 30 days when `rememberMe` is true.
 * Returns the plaintext token to send to the client.
 */
export const generateRefreshToken = async (
  userId,
  ip,
  userAgent,
  rememberMe = false
) => {
  return RefreshToken.createToken(userId, ip, userAgent, rememberMe);
};

/**
 * Verifies a JWT access token and returns the decoded payload.
 * Throws on invalid/expired tokens.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Verifies a plaintext refresh token against the database.
 * Returns the token document (with user reference) or null.
 */
export const verifyRefreshToken = async (plainToken) => {
  return RefreshToken.verifyToken(plainToken);
};

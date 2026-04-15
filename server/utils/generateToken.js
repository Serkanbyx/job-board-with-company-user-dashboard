import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Signs a short-lived JWT access token (15 minutes).
 * Payload includes user id and token version for invalidation support.
 */
export const generateAccessToken = (userId, tokenVersion) => {
  return jwt.sign({ id: userId, v: tokenVersion }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Creates a long-lived refresh token (7 days) via the RefreshToken model.
 * Returns the plaintext token to send to the client.
 */
export const generateRefreshToken = async (userId, ip, userAgent) => {
  return RefreshToken.createToken(userId, ip, userAgent);
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

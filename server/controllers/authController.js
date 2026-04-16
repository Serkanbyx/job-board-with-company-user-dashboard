import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import sendEmail from '../services/emailService.js';
import welcomeEmail from '../templates/emails/welcomeEmail.js';

/**
 * @desc    Register a new user (candidate or company)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      companyName,
      companyAbout,
      companyWebsite,
      companyLocation,
      companySize,
      companyIndustry,
      title,
      location,
    } = req.body;

    if (role === 'admin') {
      return sendError(res, 403, 'Admin registration is not allowed.');
    }

    if (role === 'company' && !companyName) {
      return sendError(res, 400, 'Company name is required.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(
        res,
        409,
        'An account with this email already exists.'
      );
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'candidate',
      companyName,
      companyAbout,
      companyWebsite,
      companyLocation,
      companySize,
      companyIndustry,
      title,
      location,
    });

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = await generateRefreshToken(
      user._id,
      req.ip,
      req.headers['user-agent']
    );

    // Send welcome email (non-blocking — failure won't affect registration)
    try {
      const { subject, html } = welcomeEmail(user);
      await sendEmail({ to: user.email, subject, html });
    } catch {
      // Email failure must never break registration
    }

    sendSuccess(
      res,
      201,
      { user, accessToken, refreshToken },
      'Account created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login with email & password (brute force protection)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password.');
    }

    const user = await User.findOne({ email }).select(
      '+password +loginAttempts +lockUntil +tokenVersion'
    );

    // Timing attack prevention — run bcrypt even when user not found
    if (!user) {
      await bcrypt.compare(password, '$2a$12$dummyhashfortimingequaliz');
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (user.isLocked) {
      return sendError(
        res,
        423,
        'Account is temporarily locked due to too many failed login attempts. Please try again after 30 minutes.'
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(
        res,
        403,
        'Your account has been deactivated. Please contact support.'
      );
    }

    await user.resetLoginAttempts();

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = await generateRefreshToken(
      user._id,
      req.ip,
      req.headers['user-agent']
    );

    sendSuccess(
      res,
      200,
      { user, accessToken, refreshToken },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Exchange refresh token for a new token pair (rotation)
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required.');
    }

    const tokenDoc = await verifyRefreshToken(refreshToken);

    if (!tokenDoc) {
      return sendError(
        res,
        401,
        'Invalid or expired refresh token. Please login again.'
      );
    }

    const user = await User.findById(tokenDoc.user);

    if (!user || !user.isActive) {
      return sendError(
        res,
        401,
        'Invalid or expired refresh token. Please login again.'
      );
    }

    // Token rotation — revoke the old token
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const newAccessToken = generateAccessToken(user._id, user.tokenVersion);
    const newRefreshToken = await generateRefreshToken(
      user._id,
      req.ip,
      req.headers['user-agent']
    );

    sendSuccess(
      res,
      200,
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout — revoke the specific refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenDoc = await verifyRefreshToken(refreshToken);
      if (tokenDoc) {
        tokenDoc.isRevoked = true;
        await tokenDoc.save();
      }
    }

    sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout from all devices — revoke all refresh tokens + increment tokenVersion
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.revokeAllForUser(req.user._id);

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
    });

    sendSuccess(res, 200, null, 'All sessions have been logged out.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const responseData = { user };

    if (user.role === 'company') {
      const Job = (await import('../models/Job.js')).default;
      responseData.activeJobCount = await Job.countDocuments({
        company: user._id,
        status: 'active',
      });
    } else if (user.role === 'candidate') {
      const Application = (await import('../models/Application.js')).default;
      responseData.applicationCount = await Application.countDocuments({
        applicant: user._id,
      });
    }

    sendSuccess(res, 200, responseData, 'Profile retrieved successfully');
  } catch {
    // Models may not exist yet — return user without counts
    sendSuccess(
      res,
      200,
      { user: req.user },
      'Profile retrieved successfully'
    );
  }
};

/**
 * @desc    Update user profile (role-based field whitelist)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const commonFields = ['firstName', 'lastName', 'phone', 'avatar', 'location'];
    const candidateFields = [
      'title',
      'bio',
      'skills',
      'experience',
      'cvUrl',
      'portfolioUrl',
      'linkedinUrl',
      'githubUrl',
      'desiredSalary',
      'jobPreferences',
    ];
    const companyFields = [
      'companyName',
      'companyLogo',
      'companyWebsite',
      'companyLocation',
      'companySize',
      'companyAbout',
      'companyIndustry',
      'companyFounded',
      'companySocials',
    ];

    let allowedFields = [...commonFields, 'notificationPrefs'];

    if (req.user.role === 'candidate') {
      allowedFields = [...allowedFields, ...candidateFields];
    } else if (req.user.role === 'company') {
      allowedFields = [...allowedFields, ...companyFields];
    }

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    sendSuccess(res, 200, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password with history check & session invalidation
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(
        res,
        400,
        'Current password and new password are required.'
      );
    }

    const user = await User.findById(req.user._id).select(
      '+password +passwordHistory +tokenVersion'
    );

    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return sendError(res, 400, 'Current password is incorrect.');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return sendError(
        res,
        400,
        'New password must be different from current password.'
      );
    }

    const isReused = await user.isPasswordReused(newPassword);
    if (isReused) {
      return sendError(
        res,
        400,
        'This password has been used recently. Please choose a different password.'
      );
    }

    // Push OLD hash to history before overwriting with new plaintext
    if (!user.passwordHistory) user.passwordHistory = [];
    user.passwordHistory = [user.password, ...user.passwordHistory].slice(0, 5);

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();

    await RefreshToken.revokeAllForUser(user._id);

    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = await generateRefreshToken(
      user._id,
      req.ip,
      req.headers['user-agent']
    );

    sendSuccess(
      res,
      200,
      { accessToken, refreshToken },
      'Password changed successfully. All other sessions have been logged out.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own account with password confirmation & cascade
 * @route   DELETE /api/auth/account
 * @access  Private
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return sendError(res, 400, 'Password confirmation is required.');
    }

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 400, 'Incorrect password.');
    }

    // Revoke all refresh tokens
    await RefreshToken.revokeAllForUser(user._id);

    // Cascade delete related data (models may not exist yet)
    try {
      if (user.role === 'company') {
        const Job = (await import('../models/Job.js')).default;
        const Application = (await import('../models/Application.js')).default;
        const Notification = (await import('../models/Notification.js')).default;
        const SavedJob = (await import('../models/SavedJob.js')).default;

        const jobIds = await Job.find({ company: user._id }).distinct('_id');
        await Application.deleteMany({ job: { $in: jobIds } });
        await Notification.deleteMany({ job: { $in: jobIds } });
        await SavedJob.deleteMany({ job: { $in: jobIds } });
        await Job.deleteMany({ company: user._id });
      } else if (user.role === 'candidate') {
        const Application = (await import('../models/Application.js')).default;
        const SavedJob = (await import('../models/SavedJob.js')).default;
        const Notification = (await import('../models/Notification.js')).default;

        await Application.deleteMany({ applicant: user._id });
        await SavedJob.deleteMany({ user: user._id });
        await Notification.deleteMany({ user: user._id });
      }
    } catch {
      // Models may not exist yet in early development — continue with user deletion
    }

    // Delete notifications and audit logs for all roles
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.deleteMany({
        $or: [{ user: user._id }, { sender: user._id }],
      });
    } catch {
      // Model may not exist yet
    }

    const AuditLog = (await import('../models/AuditLog.js')).default;
    await AuditLog.deleteMany({ userId: user._id });

    // Hard delete user (GDPR compliance)
    await User.findByIdAndDelete(user._id);

    sendSuccess(res, 200, null, 'Account deleted successfully.');
  } catch (error) {
    next(error);
  }
};

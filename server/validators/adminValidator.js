import { body, query } from 'express-validator';

const APPLICATION_STATUSES = [
  'pending', 'reviewed', 'shortlisted', 'interviewed',
  'offered', 'hired', 'rejected', 'withdrawn',
];
const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'];
const SORT_OPTIONS = ['newest', 'oldest', 'name-asc', 'name-desc'];

export const updateUserStatusValidator = [
  body('isActive')
    .notEmpty().withMessage('Status is required')
    .isBoolean().withMessage('Status must be a boolean'),
];

export const updateUserRoleValidator = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['candidate', 'company', 'admin']).withMessage("Role must be one of: 'candidate', 'company', 'admin'"),
];

export const adminQueryValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  query('role')
    .optional()
    .isIn(['candidate', 'company', 'admin']).withMessage("Role must be one of: 'candidate', 'company', 'admin'"),
  query('isActive')
    .optional()
    .custom((value) => {
      if (value !== 'true' && value !== 'false') {
        throw new Error('isActive must be true or false');
      }
      return true;
    }),
  query('status')
    .optional()
    .isIn(APPLICATION_STATUSES).withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`),
  query('type')
    .optional()
    .isIn(JOB_TYPES).withMessage(`Type must be one of: ${JOB_TYPES.join(', ')}`),
  query('isFeatured')
    .optional()
    .custom((value) => {
      if (value !== 'true' && value !== 'false') {
        throw new Error('isFeatured must be true or false');
      }
      return true;
    }),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort')
    .optional()
    .isIn(SORT_OPTIONS).withMessage(`Sort must be one of: ${SORT_OPTIONS.join(', ')}`),
];

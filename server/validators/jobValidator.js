import { body, query } from 'express-validator';

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'];
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'any'];
const EDUCATION_LEVELS = ['none', 'high-school', 'associate', 'bachelor', 'master', 'doctorate', 'any'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];
const SALARY_PERIODS = ['hourly', 'monthly', 'yearly'];
const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'education', 'marketing',
  'retail', 'manufacturing', 'consulting', 'media', 'other',
];
const SORT_OPTIONS = ['newest', 'oldest', 'salary-high', 'salary-low', 'deadline', 'most-applied', 'most-viewed'];

export const createJobValidator = [
  body('title')
    .notEmpty().withMessage('Job title is required')
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters')
    .escape(),
  body('description')
    .notEmpty().withMessage('Job description is required')
    .trim()
    .isLength({ min: 50, max: 10000 }).withMessage('Description must be 50-10000 characters')
    .escape(),
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Requirements cannot exceed 5000 characters')
    .escape(),
  body('responsibilities')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Responsibilities cannot exceed 5000 characters')
    .escape(),
  body('benefits')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Benefits cannot exceed 3000 characters')
    .escape(),
  body('location')
    .notEmpty().withMessage('Location is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
    .escape(),
  body('type')
    .notEmpty().withMessage('Job type is required')
    .isIn(JOB_TYPES).withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),
  body('salary.min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  body('salary.max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      const min = req.body.salary?.min;
      if (min !== undefined && Number(value) < Number(min)) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary');
      }
      return true;
    }),
  body('salary.currency')
    .optional()
    .isIn(CURRENCIES).withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),
  body('salary.period')
    .optional()
    .isIn(SALARY_PERIODS).withMessage(`Salary period must be one of: ${SALARY_PERIODS.join(', ')}`),
  body('skills')
    .notEmpty().withMessage('At least one skill is required')
    .isArray({ min: 1, max: 15 }).withMessage('Skills must be an array with 1-15 items'),
  body('skills.*')
    .notEmpty().withMessage('Skill cannot be empty')
    .trim()
    .isLength({ max: 50 }).withMessage('Each skill cannot exceed 50 characters')
    .escape(),
  body('experience')
    .optional()
    .isIn(EXPERIENCE_LEVELS).withMessage(`Experience must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),
  body('education')
    .optional()
    .isIn(EDUCATION_LEVELS).withMessage(`Education must be one of: ${EDUCATION_LEVELS.join(', ')}`),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters')
    .escape(),
  body('positions')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Positions must be between 1 and 100'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
];

export const updateJobValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 10000 }).withMessage('Description must be 50-10000 characters')
    .escape(),
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Requirements cannot exceed 5000 characters')
    .escape(),
  body('responsibilities')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Responsibilities cannot exceed 5000 characters')
    .escape(),
  body('benefits')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Benefits cannot exceed 3000 characters')
    .escape(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
    .escape(),
  body('type')
    .optional()
    .isIn(JOB_TYPES).withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),
  body('salary.min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  body('salary.max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      const min = req.body.salary?.min;
      if (min !== undefined && Number(value) < Number(min)) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary');
      }
      return true;
    }),
  body('salary.currency')
    .optional()
    .isIn(CURRENCIES).withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),
  body('salary.period')
    .optional()
    .isIn(SALARY_PERIODS).withMessage(`Salary period must be one of: ${SALARY_PERIODS.join(', ')}`),
  body('skills')
    .optional()
    .isArray({ min: 1, max: 15 }).withMessage('Skills must be an array with 1-15 items'),
  body('skills.*')
    .notEmpty().withMessage('Skill cannot be empty')
    .trim()
    .isLength({ max: 50 }).withMessage('Each skill cannot exceed 50 characters')
    .escape(),
  body('experience')
    .optional()
    .isIn(EXPERIENCE_LEVELS).withMessage(`Experience must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),
  body('education')
    .optional()
    .isIn(EDUCATION_LEVELS).withMessage(`Education must be one of: ${EDUCATION_LEVELS.join(', ')}`),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters')
    .escape(),
  body('positions')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Positions must be between 1 and 100'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
];

export const jobQueryValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  query('type')
    .optional()
    .trim(),
  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location filter cannot exceed 100 characters'),
  query('skill')
    .optional()
    .trim(),
  query('salaryMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  query('salaryMax')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  query('experience')
    .optional()
    .isIn(EXPERIENCE_LEVELS).withMessage(`Experience must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),
  query('education')
    .optional()
    .isIn(EDUCATION_LEVELS).withMessage(`Education must be one of: ${EDUCATION_LEVELS.join(', ')}`),
  query('industry')
    .optional()
    .isIn(INDUSTRIES).withMessage(`Industry must be one of: ${INDUSTRIES.join(', ')}`),
  query('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean'),
  query('postedWithin')
    .optional()
    .isIn(['24h', '7d', '30d']).withMessage("Posted within must be one of: '24h', '7d', '30d'"),
  query('sort')
    .optional()
    .isIn(SORT_OPTIONS).withMessage(`Sort must be one of: ${SORT_OPTIONS.join(', ')}`),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

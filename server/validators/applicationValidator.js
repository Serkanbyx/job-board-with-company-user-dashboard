import { body } from 'express-validator';

const APPLICATION_STATUSES = [
  'pending', 'reviewed', 'shortlisted', 'interviewed',
  'offered', 'hired', 'rejected', 'withdrawn',
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];

export const applyValidator = [
  body('cvUrl')
    .notEmpty().withMessage('CV is required')
    .isURL().withMessage('Invalid CV URL'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Cover letter cannot exceed 5000 characters')
    .escape(),
  body('expectedSalary.min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Expected minimum salary must be a positive number'),
  body('expectedSalary.max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Expected maximum salary must be a positive number'),
  body('expectedSalary.currency')
    .optional()
    .isIn(CURRENCIES).withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),
  body('availableFrom')
    .optional()
    .isISO8601().withMessage('Available from must be a valid date'),
];

export const updateStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(APPLICATION_STATUSES).withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`),
  body('statusNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Status note cannot exceed 1000 characters')
    .escape(),
];

export const updateNotesValidator = [
  body('internalNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Internal notes cannot exceed 2000 characters')
    .escape(),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

export const bulkStatusValidator = [
  body('applicationIds')
    .notEmpty().withMessage('Application IDs are required')
    .isArray({ min: 1, max: 50 }).withMessage('Application IDs must be an array with 1-50 items'),
  body('applicationIds.*')
    .isMongoId().withMessage('Each application ID must be a valid Mongo ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(APPLICATION_STATUSES).withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`),
  body('statusNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Status note cannot exceed 1000 characters')
    .escape(),
];

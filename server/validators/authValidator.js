import { body } from 'express-validator';

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'manager'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'education', 'marketing',
  'retail', 'manufacturing', 'consulting', 'media', 'other',
];
const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];

export const registerValidator = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .escape(),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .escape(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter and one number'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['candidate', 'company']).withMessage("Role must be either 'candidate' or 'company'"),
  body('companyName')
    .custom((value, { req }) => {
      if (req.body.role === 'company') {
        if (!value || value.trim().length === 0) {
          throw new Error('Company name is required for company accounts');
        }
        if (value.trim().length < 2 || value.trim().length > 100) {
          throw new Error('Company name must be 2-100 characters');
        }
      }
      return true;
    })
    .optional()
    .escape(),
  body('companyAbout')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Company about cannot exceed 3000 characters')
    .escape(),
  body('companyWebsite')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL'),
  body('companyLocation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company location cannot exceed 100 characters')
    .escape(),
  body('companySize')
    .optional()
    .isIn(COMPANY_SIZES).withMessage(`Company size must be one of: ${COMPANY_SIZES.join(', ')}`),
  body('companyIndustry')
    .optional()
    .isIn(INDUSTRIES).withMessage(`Industry must be one of: ${INDUSTRIES.join(', ')}`),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters')
    .escape(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
    .escape(),
];

export const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('rememberMe')
    .optional()
    .isBoolean().withMessage('rememberMe must be a boolean')
    .toBoolean(),
];

export const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .escape(),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .escape(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters')
    .escape(),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters')
    .escape(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio cannot exceed 2000 characters')
    .escape(),
  body('skills')
    .optional()
    .isArray({ max: 30 }).withMessage('Skills cannot exceed 30 items'),
  body('skills.*')
    .trim()
    .isLength({ max: 50 }).withMessage('Each skill cannot exceed 50 characters')
    .escape(),
  body('experience')
    .optional()
    .isIn(EXPERIENCE_LEVELS).withMessage(`Experience must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),
  body('portfolioUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid portfolio URL'),
  body('linkedinUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('githubUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid GitHub URL'),
  body('desiredSalary.min')
    .optional()
    .isNumeric().withMessage('Minimum salary must be a number')
    .isFloat({ min: 0 }).withMessage('Minimum salary cannot be negative'),
  body('desiredSalary.max')
    .optional()
    .isNumeric().withMessage('Maximum salary must be a number')
    .custom((value, { req }) => {
      const min = req.body.desiredSalary?.min;
      if (min !== undefined && Number(value) < Number(min)) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary');
      }
      return true;
    }),
  body('desiredSalary.currency')
    .optional()
    .isIn(CURRENCIES).withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),
  body('jobPreferences.types')
    .optional()
    .isArray().withMessage('Job preference types must be an array'),
  body('jobPreferences.types.*')
    .isIn(JOB_TYPES).withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),
  body('jobPreferences.locations')
    .optional()
    .isArray().withMessage('Job preference locations must be an array'),
  body('jobPreferences.remote')
    .optional()
    .isBoolean().withMessage('Remote preference must be a boolean'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters')
    .escape(),
  body('companyAbout')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Company about cannot exceed 3000 characters')
    .escape(),
  body('companyWebsite')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid company website URL'),
  body('companyLocation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company location cannot exceed 100 characters')
    .escape(),
  body('companySize')
    .optional()
    .isIn(COMPANY_SIZES).withMessage(`Company size must be one of: ${COMPANY_SIZES.join(', ')}`),
  body('companyIndustry')
    .optional()
    .isIn(INDUSTRIES).withMessage(`Industry must be one of: ${INDUSTRIES.join(', ')}`),
  body('companyFounded')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Founded year must be between 1800 and ${new Date().getFullYear()}`),
  body('companySocials.linkedin')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('companySocials.twitter')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Twitter URL'),
  body('companySocials.facebook')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Facebook URL'),
  body('notificationPrefs.emailOnApplication')
    .optional()
    .isBoolean().withMessage('emailOnApplication must be a boolean'),
  body('notificationPrefs.emailOnStatusChange')
    .optional()
    .isBoolean().withMessage('emailOnStatusChange must be a boolean'),
  body('notificationPrefs.emailOnNewJob')
    .optional()
    .isBoolean().withMessage('emailOnNewJob must be a boolean'),
  body('notificationPrefs.inAppNotifications')
    .optional()
    .isBoolean().withMessage('inAppNotifications must be a boolean'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter and one number'),
];

export const deleteAccountValidator = [
  body('password')
    .notEmpty().withMessage('Password is required to delete your account'),
];

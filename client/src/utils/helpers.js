import { APPLICATION_STATUSES } from './constants';

/**
 * "$5,000 - $10,000/mo"
 */
export const formatSalary = (salary) => {
  if (!salary) return 'Not specified';

  const { min, max, currency = 'USD', period = 'monthly' } = salary;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  const periodLabel =
    period === 'yearly' ? '/yr' : period === 'hourly' ? '/hr' : '/mo';

  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}${periodLabel}`;
  if (min) return `From ${formatter.format(min)}${periodLabel}`;
  if (max) return `Up to ${formatter.format(max)}${periodLabel}`;
  return 'Not specified';
};

/**
 * Tailwind color classes for application status badges
 */
export const getStatusColor = (status) => {
  const statusObj = APPLICATION_STATUSES.find((s) => s.value === status);
  const colorMap = {
    warning: 'bg-warning-100 text-warning-600',
    info: 'bg-info-50 text-info-600',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    danger: 'bg-danger-100 text-danger-700',
    default: 'bg-gray-100 text-gray-600',
  };
  return colorMap[statusObj?.color] || colorMap.default;
};

/**
 * Tailwind color classes for job type badges
 */
export const getJobTypeColor = (type) => {
  const colorMap = {
    'full-time': 'bg-primary-100 text-primary-700',
    'part-time': 'bg-warning-100 text-warning-600',
    remote: 'bg-success-100 text-success-700',
    hybrid: 'bg-info-50 text-info-600',
    contract: 'bg-danger-100 text-danger-700',
    internship: 'bg-purple-100 text-purple-700',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-600';
};

/**
 * Truncate text with "..."
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Avatar initials fallback — "JD"
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
};

/**
 * "1 job" / "5 jobs"
 */
export const pluralize = (count, singular, plural) => {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
};

/**
 * Builds URL query string, filtering out empty/null values
 */
export const buildQueryString = (params) => {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined && value !== '',
  );
  if (filtered.length === 0) return '';
  return `?${new URLSearchParams(Object.fromEntries(filtered)).toString()}`;
};

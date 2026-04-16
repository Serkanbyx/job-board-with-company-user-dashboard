import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, DollarSign, Building2, Calendar, Heart } from 'lucide-react';
import { formatSalary, getJobTypeColor, truncateText } from '../../utils/helpers';
import { formatRelativeDate, isExpired, daysUntil } from '../../utils/formatDate';
import { EXPERIENCE_LEVELS, JOB_TYPES } from '../../utils/constants';

const getExperienceLabel = (value) =>
  EXPERIENCE_LEVELS.find((e) => e.value === value)?.label || value;

const getTypeLabel = (value) =>
  JOB_TYPES.find((t) => t.value === value)?.label || value;

const JobCard = ({ job, variant = 'grid', isSaved = false, onToggleSave, showSaveButton = false }) => {
  const {
    _id,
    title,
    slug,
    company,
    location,
    type,
    salary,
    experience,
    skills = [],
    description,
    deadline,
    createdAt,
  } = job;

  const expired = deadline && isExpired(deadline);
  const daysLeft = deadline ? daysUntil(deadline) : null;
  const companyName = company?.companyName || `${company?.firstName || ''} ${company?.lastName || ''}`.trim();
  const companyId = company?._id || company?.id;

  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 350);
    onToggleSave?.(_id);
  };

  const SaveButton = () => {
    if (!showSaveButton) return null;
    return (
      <button
        onClick={handleSaveClick}
        className="group/save flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-pink-50 dark:hover:bg-pink-950/30"
        aria-label={isSaved ? 'Unsave job' : 'Save job'}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${heartAnimating ? 'animate-heart-pop' : ''} ${
            isSaved
              ? 'fill-pink-500 text-pink-500'
              : 'text-slate-400 group-hover/save:text-pink-500'
          }`}
        />
      </button>
    );
  };

  const DeadlineWarning = () => {
    if (!deadline || expired) return null;
    if (daysLeft !== null && daysLeft <= 7 && daysLeft >= 0) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-warning-600 dark:text-amber-400">
          <Calendar className="h-3.5 w-3.5" />
          {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
        </span>
      );
    }
    return null;
  };

  if (variant === 'list') {
    return (
      <Link
        to={`/jobs/${slug}`}
        className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
      >
        {/* Company logo */}
        {company?.companyLogo ? (
          <img
            src={company.companyLogo}
            alt={companyName}
            className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
            <Building2 className="h-5 w-5" />
          </div>
        )}

        {/* Center info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                {title}
              </h3>
              <p
                className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400"
                onClick={(e) => {
                  if (companyId) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/company/${companyId}`;
                  }
                }}
              >
                {companyName}
              </p>
            </div>

            {/* Salary prominent on list view */}
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatSalary(salary)}
              </p>
              <DeadlineWarning />
            </div>
          </div>

          {/* Description preview */}
          {description && (
            <p className="mb-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {truncateText(description, 150)}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getJobTypeColor(type)}`}>
              {getTypeLabel(type)}
            </span>
            {experience && experience !== 'any' && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {getExperienceLabel(experience)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              {truncateText(location, 30)}
            </span>

            {/* Mobile salary */}
            <span className="flex items-center gap-1 text-xs text-slate-500 sm:hidden dark:text-slate-400">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary(salary)}
            </span>

            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{skills.length - 3} more
              </span>
            )}
          </div>

          {/* Bottom row */}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeDate(createdAt)}
            </span>
            {deadline && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  expired ? 'text-danger-600 dark:text-red-400' : ''
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {expired ? 'Expired' : `Due ${formatRelativeDate(deadline)}`}
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <SaveButton />
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link
      to={`/jobs/${slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        {company?.companyLogo ? (
          <img
            src={company.companyLogo}
            alt={companyName}
            className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
            <Building2 className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {title}
          </h3>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{companyName}</p>
        </div>

        <SaveButton />
      </div>

      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getJobTypeColor(type)}`}>
          {getTypeLabel(type)}
        </span>
        {experience && experience !== 'any' && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {getExperienceLabel(experience)}
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="mb-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {truncateText(location, 25)}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 shrink-0" />
          {formatSalary(salary)}
        </span>
      </div>

      {/* Skills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-slate-700 dark:text-slate-500">
            +{skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeDate(createdAt)}
        </span>

        {deadline && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              expired
                ? 'text-danger-600 dark:text-red-400'
                : daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
                  ? 'text-warning-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {expired
              ? 'Expired'
              : daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
                ? daysLeft === 0
                  ? 'Expires today'
                  : `${daysLeft}d left`
                : `Due ${formatRelativeDate(deadline)}`}
          </span>
        )}
      </div>
    </Link>
  );
};

export default JobCard;

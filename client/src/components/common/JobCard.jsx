import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, DollarSign, Building2, Calendar } from 'lucide-react';
import { formatSalary, getJobTypeColor, truncateText } from '../../utils/helpers';
import { formatDate, formatRelativeDate, isExpired } from '../../utils/formatDate';
import { EXPERIENCE_LEVELS, JOB_TYPES } from '../../utils/constants';

const getExperienceLabel = (value) =>
  EXPERIENCE_LEVELS.find((e) => e.value === value)?.label || value;

const getTypeLabel = (value) =>
  JOB_TYPES.find((t) => t.value === value)?.label || value;

const JobCard = ({ job }) => {
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
    deadline,
    createdAt,
  } = job;

  const expired = deadline && isExpired(deadline);
  const companyName = company?.companyName || `${company?.firstName || ''} ${company?.lastName || ''}`.trim();
  const detailHref = slug ? `/jobs/${slug}` : `/jobs/${_id}`;

  return (
    <Link
      to={detailHref}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        {company?.companyLogo ? (
          <img
            src={company.companyLogo}
            alt={companyName}
            className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
            <Building2 className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {title}
          </h3>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{companyName}</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {truncateText(location, 25)}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" />
          {formatSalary(salary)}
        </span>
        {experience && experience !== 'any' && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {getExperienceLabel(experience)}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getJobTypeColor(type)}`}>
          {getTypeLabel(type)}
        </span>
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
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {expired ? 'Expired' : `Due ${formatDate(deadline)}`}
          </span>
        )}
      </div>
    </Link>
  );
};

export default JobCard;

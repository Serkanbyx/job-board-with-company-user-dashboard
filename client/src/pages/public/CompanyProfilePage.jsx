import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Users,
  Calendar,
  Briefcase,
  DollarSign,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import * as userService from '../../api/userService';
import { formatSalary, getJobTypeColor, truncateText } from '../../utils/helpers';
import { formatDate, formatRelativeDate, isExpired, daysUntil } from '../../utils/formatDate';
import { COMPANY_INDUSTRIES, JOB_TYPES } from '../../utils/constants';

const getLabel = (list, value) => list.find((item) => item.value === value)?.label || value;

const extractDomain = (url) => {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

const ensureUrl = (url) => (url?.startsWith('http') ? url : `https://${url}`);

/* ──────────────────────────────────────── Skeleton ──────────────────────────────────────── */

const CompanyProfileSkeleton = () => (
  <div className="animate-pulse">
    {/* Banner */}
    <div className="h-48 bg-linear-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />

    <div className="mx-auto max-w-5xl px-4">
      {/* Logo + info */}
      <div className="-mt-10 mb-8 flex items-end gap-4">
        <div className="h-20 w-20 rounded-xl border-4 border-white bg-slate-200 dark:border-slate-900 dark:bg-slate-700" />
        <div className="flex-1 space-y-2 pb-1">
          <div className="h-7 w-56 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* About */}
      <div className="mb-8 space-y-3 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Jobs grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-52 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────── Job Card (Compact) ──────────────────────────────────────── */

const CompanyJobCard = ({ job }) => {
  const expired = job.deadline && isExpired(job.deadline);
  const daysLeft = job.deadline ? daysUntil(job.deadline) : null;

  return (
    <Link
      to={`/jobs/${job.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
    >
      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
        {job.title}
      </h3>

      {/* Type badge */}
      {job.type && (
        <div className="mb-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getJobTypeColor(job.type)}`}>
            {getLabel(JOB_TYPES, job.type)}
          </span>
        </div>
      )}

      {/* Meta */}
      <div className="mb-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {truncateText(job.location, 30)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 shrink-0" />
          {formatSalary(job.salary)}
        </span>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-slate-700 dark:text-slate-500">
              +{job.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeDate(job.createdAt)}
        </span>

        {job.deadline && (
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
                : formatDate(job.deadline)}
          </span>
        )}
      </div>
    </Link>
  );
};

/* ──────────────────────────────────────── Social Icon Link ──────────────────────────────────────── */

const SocialLink = ({ href, icon: Icon, label }) => {
  if (!href) return null;

  return (
    <a
      href={ensureUrl(href)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
};

/* ──────────────────────────────────────── Page ──────────────────────────────────────── */

const CompanyProfilePage = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getCompanyProfile(id);
      const data = response.data || response;

      setCompany(data.company);
      setActiveJobs(data.activeJobs || data.recentJobs || []);
      setActiveJobCount(data.activeJobCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Company not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  /* ─── Guard states ─── */

  if (loading) return <CompanyProfileSkeleton />;

  if (error || !company) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-danger-500" />
        <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          Company Not Found
        </h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          {error || 'The company you are looking for does not exist or is no longer active.'}
        </p>
        <Link
          to="/jobs"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  const industryLabel = company.companyIndustry
    ? getLabel(COMPANY_INDUSTRIES, company.companyIndustry)
    : null;

  const socials = company.companySocials || {};

  return (
    <div>
      {/* ─── Breadcrumb ─── */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/jobs" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-700 dark:text-slate-300">
            {company.companyName}
          </span>
        </nav>
      </div>

      {/* ─── 1. Company Header (Banner-style) ─── */}
      <div className="relative bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTEydjJIMjR2LTJoMTJ6bTAgMTJ2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-12">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {/* Company logo */}
            {company.companyLogo ? (
              <img
                src={company.companyLogo}
                alt={company.companyName}
                className="h-20 w-20 shrink-0 rounded-xl border-4 border-white/20 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-4 border-white/20 bg-white/10 shadow-lg">
                <Building2 className="h-9 w-9 text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Name + badges */}
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {company.companyName}
                </h1>
                {industryLabel && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                    {industryLabel}
                  </span>
                )}
                {company.companyFounded && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                    Since {company.companyFounded}
                  </span>
                )}
              </div>

              {/* Info row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                {company.companyLocation && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {company.companyLocation}
                  </span>
                )}

                {company.companySize && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {company.companySize} employees
                  </span>
                )}

                {company.companyWebsite && (
                  <a
                    href={ensureUrl(company.companyWebsite)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                  >
                    <Globe className="h-4 w-4" />
                    {extractDomain(company.companyWebsite)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Social links */}
              {(socials.linkedin || socials.twitter || socials.facebook) && (
                <div className="mt-3 flex gap-2">
                  <SocialLink href={socials.linkedin} icon={Linkedin} label="LinkedIn" />
                  <SocialLink href={socials.twitter} icon={Twitter} label="Twitter" />
                  <SocialLink href={socials.facebook} icon={Facebook} label="Facebook" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* ─── 2. About Section ─── */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
            About {company.companyName}
          </h2>
          {company.companyAbout ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {company.companyAbout}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400 dark:text-slate-500">
              This company hasn't added a description yet.
            </p>
          )}
        </section>

        {/* ─── 3. Active Jobs Section ─── */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Open Positions ({activeJobCount})
          </h2>

          {activeJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeJobs.map((job) => (
                <CompanyJobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-800/50">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No open positions at the moment.
              </p>
            </div>
          )}
        </section>

        {/* ─── 4. Company Stats ─── */}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Member since {formatDate(company.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            {activeJobCount} {activeJobCount === 1 ? 'job' : 'jobs'} posted
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;

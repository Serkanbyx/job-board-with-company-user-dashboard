import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Building2,
  Calendar,
  Heart,
  Share2,
  Eye,
  Users,
  ChevronRight,
  Pencil,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as jobService from '../../api/jobService';
import * as savedJobService from '../../api/savedJobService';
import * as applicationService from '../../api/applicationService';
import JobCard from '../../components/jobs/JobCard';
import ApplyModal from '../../components/jobs/ApplyModal';
import { formatSalary, getJobTypeColor, truncateText } from '../../utils/helpers';
import { formatDate, formatRelativeDate, isExpired, daysUntil } from '../../utils/formatDate';
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  APPLICATION_STATUSES,
  COMPANY_INDUSTRIES,
} from '../../utils/constants';

const getLabel = (list, value) => list.find((item) => item.value === value)?.label || value;

const SectionTitle = ({ children }) => (
  <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{children}</h2>
);

/* ──────────────────────────────────────── Skeleton ──────────────────────────────────────── */

const JobDetailSkeleton = () => (
  <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
    {/* Breadcrumb */}
    <div className="mb-6 h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />

    {/* Header card */}
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────── Page ──────────────────────────────────────── */

const JobDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate, isCompany } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const [showApplyModal, setShowApplyModal] = useState(false);

  const isOwner = isCompany && job?.company?._id === user?._id;

  /* ─── Data fetching ─── */

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getJobBySlug(slug);
      // API envelope: { success, message, data: { job } }
      const jobData = response?.data?.job || response?.job || null;
      setJob(jobData);

      if (jobData?._id) {
        // Similar jobs route uses :slug, so pass the slug — not the id
        jobService
          .getSimilarJobs(jobData.slug || slug)
          .then((res) => setSimilarJobs(res?.data?.jobs || res?.jobs || []))
          .catch(() => {});

        checkCandidateStatus(jobData._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const checkCandidateStatus = useCallback(
    async (jobId) => {
      if (!isAuthenticated || !isCandidate) return;

      try {
        const [savedRes, appsRes] = await Promise.allSettled([
          savedJobService.checkSavedStatus(jobId),
          applicationService.getMyApplications({ limit: 100 }),
        ]);

        if (savedRes.status === 'fulfilled') {
          // API returns { data: { [jobId]: boolean } }
          const statusMap = savedRes.value?.data || {};
          setIsSaved(Boolean(statusMap[jobId]));
        }

        if (appsRes.status === 'fulfilled') {
          // Paginated payload exposes data as an array at the top level
          const apps = Array.isArray(appsRes.value?.data)
            ? appsRes.value.data
            : appsRes.value?.data?.applications || [];
          const myApp = apps.find(
            (app) => (app.job?._id || app.job) === jobId,
          );
          if (myApp) {
            setHasApplied(true);
            setApplicationStatus(myApp.status);
          }
        }
      } catch {
        /* silently fail */
      }
    },
    [isAuthenticated, isCandidate]
  );

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  /* ─── Actions ─── */

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${slug}`);
      return;
    }
    if (!isCandidate) return;

    setSavingJob(true);
    try {
      await savedJobService.toggleSaveJob(job._id);
      setIsSaved((prev) => !prev);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleApplySuccess = () => {
    setHasApplied(true);
    setApplicationStatus('pending');
  };

  /* ─── Guard states ─── */

  if (loading) return <JobDetailSkeleton />;

  if (error) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-danger-500" />
        <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          Oops! Something went wrong
        </h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">{error}</p>
        <Link
          to="/jobs"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  if (!job) return null;

  const expired = job.deadline && isExpired(job.deadline);
  const daysLeft = job.deadline ? daysUntil(job.deadline) : null;
  const companyName =
    job.company?.companyName ||
    `${job.company?.firstName || ''} ${job.company?.lastName || ''}`.trim();
  const companyId = job.company?._id || job.company?.id;
  const industryLabel = job.company?.industry
    ? getLabel(COMPANY_INDUSTRIES, job.company.industry)
    : null;
  const statusObj = APPLICATION_STATUSES.find((s) => s.value === applicationStatus);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/jobs" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-700 dark:text-slate-300">{job.title}</span>
        </nav>

        {/* ─── Job Header ─── */}
        <div className="mb-6 rounded-xl border-l-4 border-l-primary-500 border border-slate-200 bg-white p-6 dark:border-slate-700 dark:border-l-primary-400 dark:bg-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Company logo */}
            {job.company?.companyLogo ? (
              <img
                src={job.company.companyLogo}
                alt={companyName}
                className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                <Building2 className="h-7 w-7" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Company name + industry */}
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Link
                  to={`/company/${companyId}`}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                >
                  {companyName}
                </Link>
                {industryLabel && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {industryLabel}
                  </span>
                )}
              </div>

              {/* Job title */}
              <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                {job.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
                    <Briefcase className="h-3.5 w-3.5" />
                    {getLabel(JOB_TYPES, job.type)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatRelativeDate(job.createdAt)}
                </span>
                {job.education && job.education !== 'none' && job.education !== 'any' && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    {getLabel(EDUCATION_LEVELS, job.education)}
                  </span>
                )}
              </div>

              {/* Salary */}
              <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                {formatSalary(job.salary)}
              </p>

              {/* Deadline */}
              {job.deadline && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
                    expired
                      ? 'text-danger-600 dark:text-red-400'
                      : daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
                        ? 'text-warning-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  {expired
                    ? 'Deadline passed'
                    : `Apply before ${formatDate(job.deadline)}${daysLeft !== null && daysLeft <= 7 ? ` (${daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`})` : ''}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Action Bar ─── */}
        <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
          {/* Candidate & authenticated */}
          {isCandidate && isAuthenticated && !hasApplied && !expired && (
            <>
              <button
                onClick={() => setShowApplyModal(true)}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Apply Now
              </button>
              <button
                onClick={handleToggleSave}
                disabled={savingJob}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isSaved
                    ? 'border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100 dark:border-pink-700 dark:bg-pink-950/30 dark:text-pink-400'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {savingJob ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`}
                  />
                )}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </>
          )}

          {/* Already applied */}
          {isCandidate && isAuthenticated && hasApplied && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-sm font-medium text-success-700 dark:bg-success-900/30 dark:text-success-400">
                <CheckCircle2 className="h-4 w-4" />
                Applied — {statusObj?.label || applicationStatus}
              </span>
              <Link
                to="/candidate/applications"
                className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
              >
                View Application
              </Link>
            </div>
          )}

          {/* Company & own job */}
          {isOwner && (
            <>
              <Link
                to={`/company/jobs/${job._id}/edit`}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Pencil className="h-4 w-4" />
                Edit Job
              </Link>
              <Link
                to={`/company/jobs/${job._id}/applications`}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Users className="h-4 w-4" />
                View Applications
                {job.applicationCount != null && ` (${job.applicationCount})`}
              </Link>
            </>
          )}

          {/* Not authenticated */}
          {!isAuthenticated && (
            <Link
              to={`/login?redirect=/jobs/${slug}`}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Login to Apply
            </Link>
          )}

          {/* Share button (always visible) */}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* ─── Content (Two-Column) ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Description */}
            {job.description && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <SectionTitle>Job Description</SectionTitle>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.description}
                </div>
              </section>
            )}

            {/* Requirements */}
            {job.requirements && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <SectionTitle>Requirements</SectionTitle>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.requirements}
                </div>
              </section>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <SectionTitle>Responsibilities</SectionTitle>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.responsibilities}
                </div>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <SectionTitle>Benefits</SectionTitle>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.benefits}
                </div>
              </section>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <SectionTitle>Required Skills</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Link
                      key={skill}
                      to={`/jobs?skill=${encodeURIComponent(skill)}`}
                      className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-900/40"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Job Overview */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                Job Overview
              </h3>
              <div className="space-y-3">
                {job.type && (
                  <OverviewItem icon={Briefcase} label="Type" value={getLabel(JOB_TYPES, job.type)} />
                )}
                {job.experience && job.experience !== 'any' && (
                  <OverviewItem icon={Clock} label="Experience" value={getLabel(EXPERIENCE_LEVELS, job.experience)} />
                )}
                {job.education && job.education !== 'none' && job.education !== 'any' && (
                  <OverviewItem icon={GraduationCap} label="Education" value={getLabel(EDUCATION_LEVELS, job.education)} />
                )}
                {job.department && (
                  <OverviewItem icon={Building2} label="Department" value={job.department} />
                )}
                {job.positions && (
                  <OverviewItem icon={Users} label="Positions" value={`${job.positions} open`} />
                )}
                <OverviewItem icon={Calendar} label="Posted" value={formatDate(job.createdAt)} />
                {job.deadline && (
                  <OverviewItem
                    icon={Calendar}
                    label="Deadline"
                    value={formatDate(job.deadline)}
                    highlight={expired ? 'danger' : daysLeft <= 7 ? 'warning' : null}
                  />
                )}
                {job.views != null && (
                  <OverviewItem icon={Eye} label="Views" value={job.views.toLocaleString()} />
                )}
                {job.applicationCount != null && (
                  <OverviewItem icon={FileText} label="Applications" value={job.applicationCount.toString()} />
                )}
              </div>
            </div>

            {/* Company Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                About the Company
              </h3>

              <div className="mb-4 flex items-center gap-3">
                {job.company?.companyLogo ? (
                  <img
                    src={job.company.companyLogo}
                    alt={companyName}
                    className="h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{companyName}</p>
                  {industryLabel && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{industryLabel}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                {job.company?.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{job.company.companySize} employees</span>
                  </div>
                )}
                {job.company?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{job.company.location}</span>
                  </div>
                )}
              </div>

              {job.company?.about && (
                <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {job.company.about}
                </p>
              )}

              <Link
                to={`/company/${companyId}`}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
              >
                View Company Profile
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Share Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
                Share this Job
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Share on LinkedIn
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── Similar Jobs ─── */}
        {similarJobs.length > 0 && (
          <section className="mt-12">
            <SectionTitle>Similar Opportunities</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarJobs.slice(0, 4).map((sJob) => (
                <JobCard key={sJob._id} job={sJob} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── Apply Modal ─── */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
        userCvUrl={user?.cvUrl}
        onSuccess={handleApplySuccess}
      />
    </>
  );
};

/* ─── Sidebar helper ─── */

const OverviewItem = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight === 'danger'
            ? 'text-danger-600 dark:text-red-400'
            : highlight === 'warning'
              ? 'text-warning-600 dark:text-amber-400'
              : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default JobDetailPage;

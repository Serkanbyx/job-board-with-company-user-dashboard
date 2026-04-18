import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Clock,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as userService from '../../api/userService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { getInitials } from '../../utils/helpers';

const APPLICATION_STATUS_COLORS = {
  pending: { bg: 'bg-amber-400', label: 'Pending' },
  reviewed: { bg: 'bg-sky-400', label: 'Reviewed' },
  shortlisted: { bg: 'bg-blue-500', label: 'Shortlisted' },
  interviewed: { bg: 'bg-indigo-500', label: 'Interviewed' },
  offered: { bg: 'bg-emerald-500', label: 'Offered' },
  hired: { bg: 'bg-green-500', label: 'Hired' },
  rejected: { bg: 'bg-red-400', label: 'Rejected' },
};

/* ─────────────────── Skeleton Loader ─────────────────── */

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {/* Welcome skeleton */}
    <div className="space-y-2">
      <div className="h-7 w-72 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

    {/* Stats grid skeleton */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>

    {/* Application overview skeleton */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-6 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 flex gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>

    {/* Recent applications skeleton */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>

    {/* Monthly chart skeleton */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="flex items-end gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-slate-200 dark:bg-slate-700"
              style={{ height: `${40 + Math.random() * 80}px` }}
            />
            <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>

    {/* Quick actions skeleton */}
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mb-3 h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Application Overview Bar ─────────────────── */

const ApplicationOverviewBar = ({ statusDistribution }) => {
  const total = useMemo(
    () => Object.values(statusDistribution).reduce((sum, val) => sum + val, 0),
    [statusDistribution],
  );

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Application Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No applications yet. Post a job to start receiving applications.
        </p>
      </div>
    );
  }

  const segments = Object.entries(APPLICATION_STATUS_COLORS)
    .filter(([status]) => statusDistribution[status] > 0)
    .map(([status, config]) => ({
      status,
      count: statusDistribution[status],
      percentage: ((statusDistribution[status] / total) * 100).toFixed(1),
      ...config,
    }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Application Overview
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {total} total
        </span>
      </div>

      {/* Horizontal bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        {segments.map(({ status, percentage, bg }) => (
          <div
            key={status}
            className={`${bg} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
            title={`${APPLICATION_STATUS_COLORS[status].label}: ${percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map(({ status, count, percentage, bg, label }) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${bg}`} />
            <span>{label}</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {count} ({percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Recent Applications ─────────────────── */

const RecentApplications = ({ applications }) => {
  const navigate = useNavigate();

  if (!applications?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Recent Applications
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No applications received yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Applications
        </h2>
        <Link
          to="/company/jobs"
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {applications.map((app) => (
          <button
            key={app._id}
            onClick={() => navigate(`/company/jobs/${app.job?._id}/applications`)}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-750"
          >
            {/* Candidate avatar */}
            {app.candidate?.profileImage ? (
              <img
                src={app.candidate.profileImage}
                alt={`${app.candidate.firstName} ${app.candidate.lastName}`}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                {getInitials(app.candidate?.firstName, app.candidate?.lastName)}
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {app.candidate?.firstName} {app.candidate?.lastName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {app.job?.title}
              </p>
            </div>

            {/* Date */}
            <span className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
              {new Date(app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>

            {/* Status */}
            <StatusBadge status={app.status} />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Applications by Month ─────────────────── */

const ApplicationsByMonth = ({ monthlyData }) => {
  if (!monthlyData?.length) return null;

  const maxCount = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Applications by Month
      </h2>

      <div className="flex items-end gap-3">
        {monthlyData.map((month) => {
          const heightPercent = Math.max((month.count / maxCount) * 100, 4);

          return (
            <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
              {/* Count label */}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {month.count}
              </span>

              {/* Bar */}
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-md bg-primary-500 transition-all duration-500 dark:bg-primary-400"
                  style={{ height: `${heightPercent * 1.2}px`, minHeight: '4px' }}
                />
              </div>

              {/* Month label */}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {month.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Quick Actions ─────────────────── */

const QUICK_ACTIONS = [
  {
    label: 'Post a New Job',
    description: 'Create a new job listing to find talent',
    to: '/company/jobs/create',
    icon: PlusCircle,
    color: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
  },
  {
    label: 'View All Jobs',
    description: 'Manage your existing job listings',
    to: '/company/jobs',
    icon: Briefcase,
    color: 'bg-success-50 text-success-600 dark:bg-green-950/30 dark:text-green-400',
  },
  {
    label: 'Pending Applications',
    description: 'Review applications awaiting your response',
    to: '/company/jobs',
    icon: Clock,
    color: 'bg-warning-50 text-warning-600 dark:bg-amber-950/30 dark:text-amber-400',
  },
];

const QuickActions = () => (
  <div>
    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
      Quick Actions
    </h2>
    <div className="grid gap-4 sm:grid-cols-3">
      {QUICK_ACTIONS.map(({ label, description, to, icon: Icon, color }) => (
        <Link
          key={to + label}
          to={to}
          className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-800"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="font-medium text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {label}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </Link>
      ))}
    </div>
  </div>
);

/* ─────────────────── Main Dashboard ─────────────────── */

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const companyName =
    user?.companyName?.trim() ||
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await userService.getCompanyDashboardStats();
        // API envelope: { success, message, data: { totalJobs, ... } }
        setStats(response?.data || response);
      } catch (error) {
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const {
    totalJobs = 0,
    activeJobs = 0,
    totalApplications = 0,
    pendingApplications = 0,
    // Server returns `statusBreakdown` and `applicationsByMonth` — keep aliases for back-compat
    statusBreakdown = {},
    statusDistribution = statusBreakdown,
    recentApplications = [],
    applicationsByMonth = [],
    monthlyApplications = applicationsByMonth,
  } = stats || {};

  return (
    <div className="space-y-8">
      {/* 1. Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {companyName}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {formattedDate} — Here's what's happening with your job listings.
        </p>
      </div>

      {/* 2. Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          color="info"
        />
        <StatCard
          title="Active Listings"
          value={activeJobs}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Pending Review"
          value={pendingApplications}
          icon={Clock}
          color="warning"
          subtitle={
            pendingApplications > 10 ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                Needs urgent attention
              </span>
            ) : undefined
          }
        />
      </div>

      {/* 3. Application overview bar */}
      <ApplicationOverviewBar statusDistribution={statusDistribution} />

      {/* 4. Recent applications */}
      <RecentApplications applications={recentApplications} />

      {/* 5. Applications by month */}
      <ApplicationsByMonth monthlyData={monthlyApplications} />

      {/* 6. Quick actions */}
      <QuickActions />
    </div>
  );
};

export default CompanyDashboard;

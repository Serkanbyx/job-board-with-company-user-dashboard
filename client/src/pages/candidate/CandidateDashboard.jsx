import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Star,
  XCircle,
  Briefcase,
  Bookmark,
  UserCog,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../api/userService';
import * as savedJobService from '../../api/savedJobService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

const APPLICATION_STATUS_COLORS = {
  pending: { bg: 'bg-amber-400', label: 'Pending' },
  reviewed: { bg: 'bg-sky-400', label: 'Reviewed' },
  shortlisted: { bg: 'bg-blue-500', label: 'Shortlisted' },
  interviewed: { bg: 'bg-indigo-500', label: 'Interviewed' },
  offered: { bg: 'bg-emerald-500', label: 'Offered' },
  hired: { bg: 'bg-green-500', label: 'Hired' },
  rejected: { bg: 'bg-red-400', label: 'Rejected' },
  withdrawn: { bg: 'bg-slate-400', label: 'Withdrawn' },
};

const PROFILE_CHECKLIST = [
  { key: 'basicInfo', label: 'Basic info', check: (u) => u?.firstName && u?.lastName },
  { key: 'title', label: 'Add professional title', check: (u) => !!u?.title },
  { key: 'skills', label: 'Add skills', check: (u) => u?.skills?.length > 0 },
  { key: 'bio', label: 'Write a bio', check: (u) => !!u?.bio },
  { key: 'cvUrl', label: 'Upload CV', check: (u) => !!u?.cvUrl },
  { key: 'experience', label: 'Add experience', check: (u) => u?.experience?.length > 0 },
  { key: 'location', label: 'Set location', check: (u) => !!u?.location },
];

/* ─────────────────── Skeleton Loader ─────────────────── */

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-2">
      <div className="h-7 w-72 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

    {/* Profile completion skeleton */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
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

    {/* Status distribution skeleton */}
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
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
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

/* ─────────────────── Profile Completion Card ─────────────────── */

const ProfileCompletionCard = ({ user, completeness }) => {
  const items = PROFILE_CHECKLIST.map((item) => ({
    ...item,
    completed: item.check(user),
  }));

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completeness / 100) * circumference;

  const progressColor =
    completeness >= 80
      ? 'text-green-500'
      : completeness >= 50
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${progressColor} transition-all duration-700`}
              style={{ stroke: 'currentColor' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
            {completeness}%
          </span>
        </div>

        {/* Checklist */}
        <div className="flex-1">
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
            Profile Completion
          </h3>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-2 text-sm ${
                  item.completed
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                )}
                {item.label}
              </li>
            ))}
          </ul>

          <Link
            to="/settings/profile"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Complete Your Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Application Status Distribution ─────────────────── */

const StatusDistributionBar = ({ statusBreakdown }) => {
  const total = useMemo(
    () => Object.values(statusBreakdown).reduce((sum, val) => sum + val, 0),
    [statusBreakdown],
  );

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Application Status Distribution
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No applications yet. Start applying to see your status distribution.
        </p>
      </div>
    );
  }

  const segments = Object.entries(APPLICATION_STATUS_COLORS)
    .filter(([status]) => statusBreakdown[status] > 0)
    .map(([status, config]) => ({
      status,
      count: statusBreakdown[status],
      percentage: ((statusBreakdown[status] / total) * 100).toFixed(1),
      ...config,
    }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Application Status Distribution
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {total} total
        </span>
      </div>

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
          You haven't applied to any jobs yet. Start browsing!
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
          to="/candidate/applications"
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
            onClick={() => navigate(`/jobs/${app.job?.slug}`)}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-750"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {app.job?.title}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {app.job?.company?.companyName}
              </p>
            </div>

            <span className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
              {new Date(app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>

            <StatusBadge status={app.status} />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Application Activity (Monthly Trend) ─────────────────── */

const ApplicationActivity = ({ monthlyData }) => {
  if (!monthlyData?.length) return null;

  const maxCount = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Application Activity
      </h2>

      <div className="flex items-end gap-3">
        {monthlyData.map((month) => {
          const heightPercent = Math.max((month.count / maxCount) * 100, 4);

          return (
            <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {month.count}
              </span>

              <div className="relative w-full">
                <div
                  className="w-full rounded-t-md bg-primary-500 transition-all duration-500 dark:bg-primary-400"
                  style={{ height: `${heightPercent * 1.2}px`, minHeight: '4px' }}
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                {month.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Quick Actions ─────────────────── */

const QuickActions = ({ savedJobsCount }) => {
  const actions = [
    {
      label: 'Browse Jobs',
      description: 'Explore open positions and find your next role',
      to: '/jobs',
      icon: Briefcase,
      color: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
    },
    {
      label: `Saved Jobs (${savedJobsCount})`,
      description: 'Review jobs you bookmarked for later',
      to: '/candidate/saved-jobs',
      icon: Bookmark,
      color: 'bg-warning-50 text-warning-600 dark:bg-amber-950/30 dark:text-amber-400',
    },
    {
      label: 'Update Profile',
      description: 'Keep your profile up to date for employers',
      to: '/settings/profile',
      icon: UserCog,
      color: 'bg-success-50 text-success-600 dark:bg-green-950/30 dark:text-green-400',
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map(({ label, description, to, icon: Icon, color }) => (
          <Link
            key={to}
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
};

/* ─────────────────── Main Dashboard ─────────────────── */

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, savedRes] = await Promise.all([
          userService.getCandidateDashboardStats(),
          savedJobService.getMySavedJobs({ limit: 1 }),
        ]);
        setStats(dashboardRes?.data || dashboardRes);
        setSavedJobsCount(savedRes?.pagination?.total || 0);
      } catch (error) {
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const {
    totalApplications = 0,
    statusBreakdown = {},
    recentApplications = [],
    applicationsByMonth = [],
    profileCompleteness = 0,
  } = stats || {};

  const pendingCount = statusBreakdown.pending || 0;
  const shortlistedCount = statusBreakdown.shortlisted || 0;
  const rejectedCount = statusBreakdown.rejected || 0;

  return (
    <div className="space-y-8">
      {/* 1. Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formattedDate} — Here's an overview of your job search progress.
        </p>
      </div>

      {/* Profile completion — hide when 100% */}
      {profileCompleteness < 100 && (
        <ProfileCompletionCard user={user} completeness={profileCompleteness} />
      )}

      {/* 2. Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={FileText}
          color="info"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          color="warning"
          subtitle="Check for updates"
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={Star}
          color="success"
        />
        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* 3. Application status distribution */}
      <StatusDistributionBar statusBreakdown={statusBreakdown} />

      {/* 4. Recent applications */}
      <RecentApplications applications={recentApplications} />

      {/* 5. Application activity (monthly trend) */}
      <ApplicationActivity monthlyData={applicationsByMonth} />

      {/* 6. Quick actions */}
      <QuickActions savedJobsCount={savedJobsCount} />
    </div>
  );
};

export default CandidateDashboard;

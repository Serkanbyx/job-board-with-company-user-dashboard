import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserSearch,
  Building2,
  Briefcase,
  CheckCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import StatCard from '../../components/common/StatCard';
import RoleBadge from '../../components/common/RoleBadge';
import { formatDate } from '../../utils/formatDate';
import { getJobTypeColor } from '../../utils/helpers';

/* ─────────────────── Status Color Map ─────────────────── */

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

/* ─────────────────── Skeleton Loader ─────────────────── */

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-2">
      <div className="h-7 w-72 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
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

    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-36 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-52 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mb-4 h-5 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="h-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Today's Activity ─────────────────── */

const TodayActivity = ({ todayStats }) => {
  const items = [
    { label: 'New Users', value: todayStats.users, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Jobs Posted', value: todayStats.jobs, icon: Briefcase, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Applications', value: todayStats.applications, icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-linear-to-r from-primary-50 to-blue-50 p-6 dark:border-slate-700 dark:from-primary-950/20 dark:to-blue-950/20">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/40">
          <CalendarDays className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time platform activity</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-lg bg-white/70 p-4 text-center dark:bg-slate-800/60">
            <div className={`mx-auto mb-2 inline-flex rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Application Status Distribution ─────────────────── */

const ApplicationStatusDistribution = ({ statusDistribution }) => {
  const total = useMemo(
    () => Object.values(statusDistribution).reduce((sum, val) => sum + val, 0),
    [statusDistribution],
  );

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Application Status Distribution
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No applications data available yet.
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
          Application Status Distribution
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{total} total</span>
      </div>

      {/* Horizontal stacked bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
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
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map(({ status, count, percentage, bg, label }) => (
          <div key={status} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <span className={`inline-block h-3 w-3 rounded-full ${bg}`} />
            <span>{label}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {count}
            </span>
            <span className="text-xs text-slate-400">({percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Recent Users ─────────────────── */

const RecentUsers = ({ users }) => {
  if (!users?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Users</h2>
        <Link
          to="/admin/users"
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {(user.firstName?.charAt(0) || '').toUpperCase()}
              {(user.lastName?.charAt(0) || '').toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>

            <RoleBadge role={user.role} />

            <span className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
              {formatDate(user.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Recent Jobs ─────────────────── */

const RecentJobs = ({ jobs }) => {
  if (!jobs?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Jobs</h2>
        <Link
          to="/admin/jobs"
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
              <Briefcase className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {job.title}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {job.company?.companyName || 'Unknown Company'}
              </p>
            </div>

            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
              {job.type}
            </span>

            <span className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
              {formatDate(job.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Growth Indicators ─────────────────── */

const GrowthIndicators = ({ growthRate }) => {
  const indicators = [
    { label: 'Users Growth', value: growthRate.users, icon: Users },
    { label: 'Jobs Growth', value: growthRate.jobs, icon: Briefcase },
    { label: 'Applications Growth', value: growthRate.applications, icon: FileText },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Month-over-Month Growth
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {indicators.map(({ label, value, icon: Icon }) => {
          const isPositive = value >= 0;

          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-700"
            >
              <div className={`rounded-lg p-2.5 ${isPositive ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                <Icon className={`h-5 w-5 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-lg font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{value}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Compared to previous 30-day period
      </p>
    </div>
  );
};

/* ─────────────────── Main Admin Dashboard ─────────────────── */

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminService.getAdminDashboard();
        setData(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const {
    totalUsers = 0,
    totalCandidates = 0,
    totalCompanies = 0,
    totalJobs = 0,
    activeJobs = 0,
    totalApplications = 0,
    applicationsByStatus = {},
    recentUsers = [],
    recentJobs = [],
    todayStats = { users: 0, jobs: 0, applications: 0 },
    growthRate = { users: 0, jobs: 0, applications: 0 },
  } = data || {};

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome, Admin — {formattedDate}
        </p>
      </div>

      {/* 2. Stats grid (3x2) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="primary"
          trend={{
            isPositive: growthRate.users >= 0,
            value: Math.abs(growthRate.users),
          }}
          subtitle="vs last 30 days"
        />
        <StatCard
          title="Candidates"
          value={totalCandidates}
          icon={UserSearch}
          color="info"
        />
        <StatCard
          title="Companies"
          value={totalCompanies}
          icon={Building2}
          color="primary"
          subtitle="Registered companies"
        />
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          color="success"
        />
        <StatCard
          title="Active Jobs"
          value={activeJobs}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={FileText}
          color="warning"
        />
      </div>

      {/* 3. Today's Activity */}
      <TodayActivity todayStats={todayStats} />

      {/* 4. Application Status Distribution */}
      <ApplicationStatusDistribution statusDistribution={applicationsByStatus} />

      {/* 5. Two-column recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentUsers users={recentUsers} />
        <RecentJobs jobs={recentJobs} />
      </div>

      {/* 6. Growth Indicators */}
      <GrowthIndicators growthRate={growthRate} />
    </div>
  );
};

export default AdminDashboard;

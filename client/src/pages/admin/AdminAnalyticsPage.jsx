import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  Percent,
  TrendingUp,
  MapPin,
  Award,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import StatCard from '../../components/common/StatCard';

/* ─────────────────── Helpers ─────────────────── */

const ROLE_COLORS = {
  candidate: { bar: 'bg-blue-500', label: 'Candidates' },
  company: { bar: 'bg-purple-500', label: 'Companies' },
  admin: { bar: 'bg-amber-500', label: 'Admins' },
};

/**
 * Aggregate weekly buckets that come back from the analytics aggregation
 * pipeline ({ _id: { week, year, role? }, count }) into a chronologically
 * ordered list of week labels. Optionally splits the count by role.
 */
const buildWeeklyTimeline = (rawBuckets, { splitByRole = false } = {}) => {
  if (!rawBuckets?.length) return [];

  const map = new Map();

  for (const entry of rawBuckets) {
    const { year, week, role } = entry._id || {};
    if (year == null || week == null) continue;

    const key = `${year}-W${String(week).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, { key, year, week, total: 0, roles: {} });
    }
    const bucket = map.get(key);
    bucket.total += entry.count || 0;
    if (splitByRole && role) {
      bucket.roles[role] = (bucket.roles[role] || 0) + (entry.count || 0);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.week - b.week;
  });
};

/* ─────────────────── Skeleton ─────────────────── */

const AnalyticsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-2">
      <div className="h-7 w-72 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

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

    {Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-6 h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, j) => (
            <div key={j} className="h-6 w-full rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────── Stacked Weekly User Growth ─────────────────── */

const UserGrowthChart = ({ rawBuckets }) => {
  const weeklyData = useMemo(
    () => buildWeeklyTimeline(rawBuckets, { splitByRole: true }),
    [rawBuckets],
  );

  if (!weeklyData.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          User Registrations by Week
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No registration data for the last 12 weeks.
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...weeklyData.map((w) => w.total), 1);
  const totalRegistered = weeklyData.reduce((sum, w) => sum + w.total, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          User Registrations by Week
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {totalRegistered} total in 12 weeks
        </span>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: '220px' }}>
        {weeklyData.map((bucket) => {
          const heightPercent = Math.max((bucket.total / maxTotal) * 100, 3);
          const segments = ['candidate', 'company', 'admin'].filter(
            (role) => bucket.roles[role],
          );

          return (
            <div
              key={bucket.key}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden min-w-max -translate-x-1/2 items-center justify-center rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:flex dark:bg-slate-600">
                <div className="space-y-0.5">
                  <p className="font-semibold">Week {bucket.week}</p>
                  {segments.map((role) => (
                    <p key={role}>
                      {ROLE_COLORS[role]?.label}: {bucket.roles[role]}
                    </p>
                  ))}
                </div>
              </div>

              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-t"
                style={{ height: `${heightPercent}%` }}
              >
                {segments.map((role) => {
                  const segmentPercent = (bucket.roles[role] / bucket.total) * 100;
                  return (
                    <div
                      key={role}
                      className={`${ROLE_COLORS[role].bar} transition-all duration-500`}
                      style={{ height: `${segmentPercent}%` }}
                    />
                  );
                })}
              </div>

              <span className="mt-2 w-full truncate text-center text-[10px] text-slate-500 dark:text-slate-400">
                W{bucket.week}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        {Object.entries(ROLE_COLORS).map(([role, { bar, label }]) => (
          <div
            key={role}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400"
          >
            <span className={`inline-block h-3 w-3 rounded-full ${bar}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Weekly Bars (Jobs / Applications) ─────────────────── */

const WeeklyBars = ({ title, rawBuckets, color = 'bg-primary-500', subtitle }) => {
  const weeklyData = useMemo(() => buildWeeklyTimeline(rawBuckets), [rawBuckets]);

  if (!weeklyData.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No data for the last 12 weeks.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...weeklyData.map((w) => w.total), 1);
  const total = weeklyData.reduce((sum, w) => sum + w.total, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {subtitle || `${total} total in 12 weeks`}
        </span>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: '180px' }}>
        {weeklyData.map((week) => {
          const heightPercent = Math.max((week.total / maxCount) * 100, 3);
          return (
            <div
              key={week.key}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 items-center justify-center rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:flex dark:bg-slate-600">
                {week.total}
              </div>
              <div
                className={`w-full cursor-pointer rounded-t ${color} transition-all duration-500 hover:opacity-80`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="mt-2 w-full truncate text-center text-[10px] text-slate-500 dark:text-slate-400">
                W{week.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Top Companies ─────────────────── */

const TopCompaniesTable = ({ companies }) => {
  if (!companies?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          Top Companies by Job Count
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No company data available yet.
        </p>
      </div>
    );
  }

  const maxJobs = Math.max(...companies.map((c) => c.jobCount), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Top Companies by Job Count
      </h2>

      <div className="space-y-3">
        {companies.map((company, index) => {
          const widthPercent = (company.jobCount / maxJobs) * 100;
          return (
            <div key={company._id} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
                {index + 1}
              </span>

              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.companyName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {company.companyName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {company.companyName || 'Unknown company'}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-400 transition-all duration-700"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {company.jobCount} jobs
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Top Skills ─────────────────── */

const TopSkillsList = ({ skills }) => {
  if (!skills?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          Most In-Demand Skills
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No skills data available yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...skills.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Most In-Demand Skills
      </h2>

      <div className="space-y-3">
        {skills.map((item) => {
          const widthPercent = Math.max((item.count / maxCount) * 100, 5);
          return (
            <div key={item.skill} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.skill}
              </span>
              <div className="h-7 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="flex h-full items-center rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 pl-3 transition-all duration-700"
                  style={{ width: `${widthPercent}%`, minWidth: '32px' }}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-sm">
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Geographic Distribution ─────────────────── */

const GeographicList = ({ locations }) => {
  if (!locations?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          Top Job Locations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No location data available yet.
        </p>
      </div>
    );
  }

  const totalJobs = locations.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Top Job Locations
      </h2>

      <div className="space-y-2">
        {locations.map((entry, index) => {
          const percentage = ((entry.count / totalJobs) * 100).toFixed(1);
          return (
            <div
              key={entry.location || index}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-700"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {entry.location || 'Unknown'}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">{percentage}%</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {entry.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminService.getPlatformAnalytics();
        setAnalytics(response.data || response);
      } catch (error) {
        toast.error(error.message || 'Failed to load platform analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const dateRange = useMemo(() => {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 86400000);
    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(twelveWeeksAgo)} — ${fmt(now)}`;
  }, []);

  if (loading) return <AnalyticsSkeleton />;

  const {
    userGrowth = [],
    jobTrends = [],
    applicationTrends = [],
    hiringSuccessRate = 0,
    topCompanies = [],
    topSkills = [],
    averageApplicationsPerJob = 0,
    geographicDistribution = [],
  } = analytics || {};

  const totalNewUsers = userGrowth.reduce((sum, e) => sum + (e.count || 0), 0);
  const totalNewJobs = jobTrends.reduce((sum, e) => sum + (e.count || 0), 0);
  const totalNewApplications = applicationTrends.reduce(
    (sum, e) => sum + (e.count || 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dateRange}</p>
      </div>

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Users (12w)"
          value={totalNewUsers}
          icon={Users}
          color="primary"
          subtitle="Across all roles"
        />
        <StatCard
          title="Jobs Posted (12w)"
          value={totalNewJobs}
          icon={Briefcase}
          color="success"
        />
        <StatCard
          title="Applications (12w)"
          value={totalNewApplications}
          icon={FileText}
          color="warning"
        />
        <StatCard
          title="Hiring Success Rate"
          value={`${hiringSuccessRate}%`}
          icon={Percent}
          color="info"
          subtitle="Hired of total applications"
        />
      </div>

      {/* User registrations */}
      <UserGrowthChart rawBuckets={userGrowth} />

      {/* Two-column trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyBars
          title="Jobs Posted by Week"
          rawBuckets={jobTrends}
          color="bg-emerald-500"
        />
        <WeeklyBars
          title="Applications by Week"
          rawBuckets={applicationTrends}
          color="bg-amber-500"
        />
      </div>

      {/* Average apps per job + Top skills */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-linear-to-br from-primary-50 to-blue-50 p-6 lg:col-span-1 dark:border-slate-700 dark:from-primary-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-2.5 dark:bg-primary-900/40">
              <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Avg. Applications per Active Job
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {averageApplicationsPerJob}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Average application volume across currently active job listings on the
            platform.
          </p>
        </div>

        <div className="lg:col-span-2">
          <TopSkillsList skills={topSkills} />
        </div>
      </div>

      {/* Top companies + Locations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopCompaniesTable companies={topCompanies} />
        <GeographicList locations={geographicDistribution} />
      </div>

      {/* Footnote */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>
          Trend charts show the most recent 12 ISO weeks. Top companies, skills and
          locations reflect the full platform.
        </span>
        <Award className="ml-auto h-3.5 w-3.5" />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

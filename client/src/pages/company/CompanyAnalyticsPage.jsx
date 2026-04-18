import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  BarChart3,
  Clock,
  Percent,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as userService from '../../api/userService';
import StatCard from '../../components/common/StatCard';

const FUNNEL_COLORS = [
  { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', light: 'bg-blue-50 dark:bg-blue-950/30' },
  { bar: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300', light: 'bg-sky-50 dark:bg-sky-950/30' },
  { bar: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', light: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { bar: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', light: 'bg-violet-50 dark:bg-violet-950/30' },
  { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', light: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { bar: 'bg-green-600', text: 'text-green-700 dark:text-green-300', light: 'bg-green-50 dark:bg-green-950/30' },
];

const FUNNEL_LABELS = ['Applied', 'Reviewed', 'Shortlisted', 'Interviewed', 'Offered', 'Hired'];

/* ─────────────────── Skeleton Loader ─────────────────── */

const AnalyticsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {/* Header */}
    <div className="space-y-2">
      <div className="h-7 w-56 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

    {/* Stats grid */}
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

    {/* Funnel */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-24 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
            <div
              className="h-9 rounded bg-slate-200 dark:bg-slate-700"
              style={{ width: `${100 - i * 14}%` }}
            />
          </div>
        ))}
      </div>
    </div>

    {/* Bar chart */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="flex items-end gap-2" style={{ height: '192px' }}>
        {[35, 60, 45, 80, 55, 70, 40, 85, 50, 65, 30, 75].map((height, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-slate-200 dark:bg-slate-700"
              style={{ height: `${height}%` }}
            />
            <div className="mt-2 h-3 w-6 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>

    {/* Table */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-44 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>

    {/* Skills */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-20 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────── Hiring Funnel ─────────────────── */

const HiringFunnel = ({ hiringFunnel, totalApplications }) => {
  const funnelData = useMemo(() => {
    const countMap = {};
    for (const stage of hiringFunnel) {
      countMap[stage.stage] = stage.count;
    }

    const stages = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'hired'];
    const counts = stages.map((s) => countMap[s] || 0);

    return stages.map((stage, index) => {
      // Cumulative: this stage + all subsequent stages (proper funnel shape)
      const cumulativeCount =
        index === 0 ? totalApplications : counts.slice(index).reduce((sum, c) => sum + c, 0);
      const prevCount =
        index === 0
          ? totalApplications
          : index === 1
            ? totalApplications
            : counts.slice(index - 1).reduce((sum, c) => sum + c, 0);
      const conversionRate = prevCount > 0 ? Math.round((cumulativeCount / prevCount) * 100) : 0;
      const widthPercent =
        totalApplications > 0
          ? Math.max((cumulativeCount / totalApplications) * 100, 3)
          : 3;

      return {
        stage,
        label: FUNNEL_LABELS[index],
        count: cumulativeCount,
        conversionRate: index === 0 ? 100 : conversionRate,
        widthPercent,
        colors: FUNNEL_COLORS[index],
      };
    });
  }, [hiringFunnel, totalApplications]);

  if (totalApplications === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Hiring Funnel
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No application data available yet. The funnel will appear once you receive applications.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Hiring Funnel
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {totalApplications} total applications
        </span>
      </div>

      <div className="space-y-3">
        {funnelData.map(({ stage, label, count, conversionRate, widthPercent, colors }, index) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">
              {label}
            </span>

            <div className="flex-1">
              <div className="relative overflow-hidden rounded bg-slate-100 dark:bg-slate-700" style={{ height: '36px' }}>
                <div
                  className={`h-full rounded transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-white drop-shadow-sm">
                  {count}
                </span>
              </div>
            </div>

            <span className={`w-14 shrink-0 text-right text-sm font-semibold ${colors.text}`}>
              {index === 0 ? '100%' : `${conversionRate}%`}
            </span>
          </div>
        ))}
      </div>

      {/* Conversion arrows legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-4 dark:border-slate-700">
        {funnelData.slice(1).map(({ label, conversionRate }, i) => (
          <span key={label} className="text-xs text-slate-500 dark:text-slate-400">
            {FUNNEL_LABELS[i]} → {label}:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{conversionRate}%</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Application Trend ─────────────────── */

const ApplicationTrend = ({ weeklyData }) => {
  if (!weeklyData?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Application Trend
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No weekly data available yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...weeklyData.map((w) => w.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Application Trend
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">Last 12 weeks</span>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: '200px' }}>
        {weeklyData.map((week) => {
          const heightPercent = Math.max((week.count / maxCount) * 100, 3);

          return (
            <div
              key={week.week}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 items-center justify-center rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:flex dark:bg-slate-600">
                {week.count}
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800 dark:bg-slate-600" />
              </div>

              {/* Bar */}
              <div
                className="w-full cursor-pointer rounded-t bg-primary-500 transition-all duration-500 hover:bg-primary-600 dark:bg-primary-400 dark:hover:bg-primary-300"
                style={{ height: `${heightPercent}%` }}
              />

              {/* Week label */}
              <span className="mt-2 w-full truncate text-center text-[10px] text-slate-500 dark:text-slate-400">
                {week.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── Top Performing Jobs ─────────────────── */

const TopPerformingJobs = ({ jobs }) => {
  if (!jobs?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Top Performing Jobs
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No job data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Top Performing Jobs
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Title
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Applications
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Views
              </th>
              <th className="py-3 pl-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Conversion
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {jobs.map((job, index) => {
              const conversionRate =
                job.views > 0
                  ? ((job.applicationCount / job.views) * 100).toFixed(1)
                  : '0.0';

              return (
                <tr
                  key={job._id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {job.title}
                        </p>
                        <span
                          className={`text-xs font-medium ${job.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    {job.applicationCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {job.views}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {conversionRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─────────────────── Skills Demand ─────────────────── */

const SkillsDemand = ({ skills }) => {
  if (!skills?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Skills Demand
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No skills data available yet. Add skills to your job listings to see demand insights.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...skills.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
        Skills Demand
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
                  className="flex h-full items-center rounded-full bg-linear-to-r from-primary-500 to-primary-400 pl-3 transition-all duration-700 dark:from-primary-400 dark:to-primary-300"
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

/* ─────────────────── Main Analytics Page ─────────────────── */

const CompanyAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const dateRange = useMemo(() => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(threeMonthsAgo)} — ${fmt(now)}`;
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await userService.getCompanyAnalytics();
        setAnalytics(response.data || response);
      } catch (error) {
        toast.error(error.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <AnalyticsSkeleton />;

  const {
    totalApplications = 0,
    totalJobs = 0,
    hiringFunnel = [],
    topPerformingJobs = [],
    weeklyTimeline = [],
    avgTimeToHire = { averageDays: 0, totalHired: 0 },
    skillsDemand = [],
  } = analytics || {};

  const avgAppsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : '0';
  const hiredCount = hiringFunnel.find((s) => s.stage === 'hired')?.count || 0;
  const hiringRate =
    totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hiring Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dateRange}</p>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Avg. per Job"
          value={avgAppsPerJob}
          icon={BarChart3}
          color="info"
          subtitle={`Across ${totalJobs} jobs`}
        />
        <StatCard
          title="Hiring Rate"
          value={`${hiringRate}%`}
          icon={Percent}
          color="success"
          subtitle={`${hiredCount} hired`}
        />
        <StatCard
          title="Avg. Time to Hire"
          value={`${avgTimeToHire.averageDays}d`}
          icon={Clock}
          color="warning"
          subtitle={avgTimeToHire.totalHired > 0 ? `Based on ${avgTimeToHire.totalHired} hires` : 'No hires yet'}
        />
      </div>

      {/* 3. Hiring Funnel */}
      <HiringFunnel hiringFunnel={hiringFunnel} totalApplications={totalApplications} />

      {/* 4. Application Trend */}
      <ApplicationTrend weeklyData={weeklyTimeline} />

      {/* 5. Top Performing Jobs */}
      <TopPerformingJobs jobs={topPerformingJobs} />

      {/* 6. Skills Demand */}
      <SkillsDemand skills={skillsDemand} />
    </div>
  );
};

export default CompanyAnalyticsPage;

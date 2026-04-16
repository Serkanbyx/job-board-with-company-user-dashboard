import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Star,
  Users,
  Gift,
  CheckCircle2,
  XCircle,
  MinusCircle,
  SortAsc,
  Search,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as applicationService from '../../api/applicationService';
import { APPLICATION_STATUSES, JOB_TYPES } from '../../utils/constants';
import { formatSalary, getJobTypeColor } from '../../utils/helpers';
import { formatRelativeDate, formatDateTime, isExpired, daysUntil } from '../../utils/formatDate';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable';

const ITEMS_PER_PAGE = 10;
const WITHDRAWABLE_STATUSES = ['pending', 'reviewed', 'shortlisted'];

const STATUS_TABS = [
  { key: 'all', label: 'All', icon: FileText },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'reviewed', label: 'Reviewed', icon: Eye },
  { key: 'shortlisted', label: 'Shortlisted', icon: Star },
  { key: 'interviewed', label: 'Interviewed', icon: Users },
  { key: 'offered', label: 'Offered', icon: Gift },
  { key: 'hired', label: 'Hired', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'withdrawn', label: 'Withdrawn', icon: MinusCircle },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

/* ─────────────────── Status Timeline ─────────────────── */

const StatusTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory.length) return null;

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-slate-200 dark:bg-slate-700" />
      {statusHistory.map((entry, idx) => {
        const isLast = idx === statusHistory.length - 1;
        return (
          <div key={idx} className="relative mb-3 last:mb-0">
            <div
              className={`absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-800 ${
                isLast ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={entry.status} size="sm" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatDateTime(entry.changedAt)}
              </span>
            </div>
            {entry.note && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">
                "{entry.note}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────── Expanded Row Detail Panel ─────────────────── */

const ExpandedDetail = ({ application, onWithdraw }) => {
  const [showFullCover, setShowFullCover] = useState(false);
  const job = application.job || {};
  const jobType = JOB_TYPES.find((t) => t.value === job.type);
  const deadlineExpired = job.deadline && isExpired(job.deadline);
  const deadlineDays = job.deadline ? daysUntil(job.deadline) : null;
  const canWithdraw = WITHDRAWABLE_STATUSES.includes(application.status);

  const lastStatusEntry = application.statusHistory?.[application.statusHistory.length - 1];
  const companyNote = lastStatusEntry?.note || application.statusNote;

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Job Summary */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Job Summary
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {jobType && (
                <span className={`rounded-full px-2.5 py-0.5 font-medium ${getJobTypeColor(job.type)}`}>
                  {jobType.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <DollarSign className="h-3 w-3" />
                {formatSalary(job.salary)}
              </span>
              {job.deadline && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${
                    deadlineExpired
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {deadlineExpired
                    ? 'Deadline passed'
                    : `${deadlineDays} day${deadlineDays !== 1 ? 's' : ''} left`}
                </span>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Cover Letter
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {showFullCover || application.coverLetter.length <= 200
                  ? application.coverLetter
                  : `${application.coverLetter.slice(0, 200)}...`}
              </p>
              {application.coverLetter.length > 200 && (
                <button
                  onClick={() => setShowFullCover((prev) => !prev)}
                  className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {showFullCover ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* CV Link */}
          {application.cvUrl && (
            <a
              href={application.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
            >
              <FileText className="h-3.5 w-3.5" />
              View your submitted CV
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Status Timeline */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Status Timeline
            </h4>
            <StatusTimeline statusHistory={application.statusHistory} />
          </div>

          {/* Company Note */}
          {companyNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Note from company
              </p>
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
                {companyNote}
              </p>
            </div>
          )}

          {/* Withdraw */}
          {canWithdraw && (
            <button
              onClick={() => onWithdraw(application)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Withdraw Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Mobile Application Card ─────────────────── */

const MobileApplicationCard = ({ application, isExpanded, onToggle, onWithdraw }) => {
  const job = application.job || {};
  const company = job.company || {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Company Logo */}
          {company.companyLogo ? (
            <img
              src={company.companyLogo}
              alt={company.companyName}
              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-contain dark:border-slate-700"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {company.companyName?.charAt(0) || '?'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <Link
              to={`/jobs/${job.slug}`}
              className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
            >
              <span className="truncate">{job.title || 'Unknown Job'}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {company.companyName || 'Unknown Company'}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={application.status} />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatRelativeDate(application.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-1 border-t border-slate-100 px-4 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-750"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" /> Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" /> View Details
          </>
        )}
      </button>

      {isExpanded && <ExpandedDetail application={application} onWithdraw={onWithdraw} />}
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const MyApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  const activeTab = searchParams.get('status') || 'all';

  /* ── Fetch all status counts for tab badges ── */
  const fetchStatusCounts = useCallback(async () => {
    try {
      const res = await applicationService.getMyApplications({ limit: 1 });
      const total = res.pagination?.total || 0;

      const countPromises = APPLICATION_STATUSES.map(async (s) => {
        const statusRes = await applicationService.getMyApplications({
          status: s.value,
          limit: 1,
        });
        return [s.value, statusRes.pagination?.total || 0];
      });

      const counts = await Promise.all(countPromises);
      const countMap = Object.fromEntries(counts);
      countMap.all = total;
      setStatusCounts(countMap);
    } catch {
      /* non-critical */
    }
  }, []);

  /* ── Fetch applications ── */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (activeTab !== 'all') params.status = activeTab;
      if (sortBy === 'oldest') params.sort = 'createdAt';

      const res = await applicationService.getMyApplications(params);
      setApplications(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, sortBy]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  /* ── Tab change ── */
  const handleTabChange = (tab) => {
    setSearchParams(tab === 'all' ? {} : { status: tab });
    setCurrentPage(1);
    setExpandedId(null);
  };

  /* ── Toggle expand ── */
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ── Withdraw ── */
  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await applicationService.withdrawApplication(withdrawTarget._id);
      setApplications((prev) =>
        prev.map((a) =>
          a._id === withdrawTarget._id ? { ...a, status: 'withdrawn' } : a,
        ),
      );
      toast.success('Application withdrawn');
      setWithdrawTarget(null);
      fetchStatusCounts();
    } catch (error) {
      toast.error(error.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  /* ── Memoized tab data with counts ── */
  const tabsWithCounts = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        ...tab,
        count: statusCounts[tab.key] ?? '—',
      })),
    [statusCounts],
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Applications
          </h1>
          {totalItems > 0 && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {totalItems} application{totalItems !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
      </div>

      {/* 2. Status filter tabs (pill-style) */}
      <div className="flex flex-wrap gap-1.5">
        {tabsWithCounts.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
            }`}
          >
            {label}
            <span
              className={`ml-1.5 ${
                activeTab === key
                  ? 'text-primary-200'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              ({count})
            </span>
          </button>
        ))}
      </div>

      {/* 3. Sort */}
      <div className="flex items-center justify-end gap-2">
        <SortAsc className="h-4 w-4 text-slate-400" />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Content */}
      {loading ? (
        <>
          <div className="hidden lg:block">
            <SkeletonTable rows={5} columns={5} />
          </div>
          <div className="space-y-3 lg:hidden">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Search}
          title={
            activeTab !== 'all'
              ? 'No matching applications'
              : "You haven't applied to any jobs yet"
          }
          description={
            activeTab !== 'all'
              ? `No applications with status "${activeTab}". Try a different filter.`
              : 'Start browsing and find your next opportunity!'
          }
          actionLabel={activeTab === 'all' ? 'Browse Jobs' : undefined}
          actionHref={activeTab === 'all' ? '/jobs' : undefined}
        />
      ) : (
        <>
          {/* Desktop — expandable table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    Job
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    Location
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    Applied
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.map((app) => {
                  const job = app.job || {};
                  const company = job.company || {};
                  const jobType = JOB_TYPES.find((t) => t.value === job.type);
                  const isOpen = expandedId === app._id;
                  const canWithdraw = WITHDRAWABLE_STATUSES.includes(app.status);

                  return (
                    <Fragment key={app._id}>
                      <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {company.companyLogo ? (
                              <img
                                src={company.companyLogo}
                                alt={company.companyName}
                                className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-contain dark:border-slate-700"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                                {company.companyName?.charAt(0) || '?'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                to={`/jobs/${job.slug}`}
                                className="flex items-center gap-1 font-medium text-slate-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                              >
                                <span className="truncate">
                                  {job.title || 'Unknown Job'}
                                </span>
                                <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                              </Link>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {company.companyName || 'Unknown Company'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {job.location && (
                              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                            )}
                            {jobType && (
                              <span
                                className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}
                              >
                                {jobType.label}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {formatRelativeDate(app.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(app._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                            >
                              {isOpen ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" /> View
                                  Details
                                </>
                              )}
                            </button>

                            {canWithdraw && (
                              <button
                                onClick={() => setWithdrawTarget(app)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded inline detail panel */}
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <ExpandedDetail
                              application={app}
                              onWithdraw={setWithdrawTarget}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile — cards */}
          <div className="space-y-3 lg:hidden">
            {applications.map((app) => (
              <MobileApplicationCard
                key={app._id}
                application={app}
                isExpanded={expandedId === app._id}
                onToggle={() => toggleExpand(app._id)}
                onWithdraw={setWithdrawTarget}
              />
            ))}
          </div>

          {/* 7. Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {/* 5. Withdraw confirmation modal */}
      <ConfirmModal
        isOpen={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message={`Withdraw your application for '${withdrawTarget?.job?.title || 'this job'}' at ${withdrawTarget?.job?.company?.companyName || 'this company'}? This action cannot be undone.`}
        confirmText="Withdraw"
        variant="danger"
        isLoading={withdrawing}
      />
    </div>
  );
};

export default MyApplicationsPage;

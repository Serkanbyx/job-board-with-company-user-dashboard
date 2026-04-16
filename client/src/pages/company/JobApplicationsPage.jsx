import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  ChevronDown,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Gift,
  XCircle,
  FileText,
  SortAsc,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as applicationService from '../../api/applicationService';
import { getMyJobs } from '../../api/jobService';
import { APPLICATION_STATUSES, STATUS_TRANSITIONS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import { formatDate, formatRelativeDate } from '../../utils/formatDate';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ApplicationDetailModal from '../../components/applications/ApplicationDetailModal';

const ITEMS_PER_PAGE = 10;

const STAT_CONFIGS = [
  { key: 'total', label: 'Total', color: 'bg-slate-500', icon: FileText, cardBg: 'bg-slate-50 dark:bg-slate-700/40', cardText: 'text-slate-600 dark:text-slate-300' },
  { key: 'pending', label: 'Pending', color: 'bg-amber-500', icon: Clock, cardBg: 'bg-amber-50 dark:bg-amber-950/30', cardText: 'text-amber-600 dark:text-amber-400' },
  { key: 'reviewed', label: 'Reviewed', color: 'bg-sky-500', icon: Eye, cardBg: 'bg-sky-50 dark:bg-sky-950/30', cardText: 'text-sky-600 dark:text-sky-400' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-500', icon: Star, cardBg: 'bg-blue-50 dark:bg-blue-950/30', cardText: 'text-blue-600 dark:text-blue-400' },
  { key: 'interviewed', label: 'Interviewed', color: 'bg-indigo-500', icon: Users, cardBg: 'bg-indigo-50 dark:bg-indigo-950/30', cardText: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'offered', label: 'Offered', color: 'bg-emerald-500', icon: Gift, cardBg: 'bg-emerald-50 dark:bg-emerald-950/30', cardText: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'hired', label: 'Hired', color: 'bg-green-500', icon: CheckCircle2, cardBg: 'bg-green-50 dark:bg-green-950/30', cardText: 'text-green-600 dark:text-green-400' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: XCircle, cardBg: 'bg-red-50 dark:bg-red-950/30', cardText: 'text-red-600 dark:text-red-400' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest-rated', label: 'Highest Rated' },
];

/* ─────────────────── Skeleton Loader ─────────────────── */

const PageSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="space-y-2">
      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-7 w-64 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-6 w-8 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Quick Status Dropdown ─────────────────── */

const QuickStatusDropdown = ({ application, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const allowed = STATUS_TRANSITIONS[application.status] || [];

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  if (allowed.length === 0) return null;

  const handleSelect = async (newStatus) => {
    setLoading(true);
    try {
      const res = await applicationService.updateApplicationStatus(application._id, {
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      onUpdate(res.application || { ...application, status: newStatus });
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        {loading ? 'Updating...' : 'Status'}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {allowed.map((s) => {
            const label = APPLICATION_STATUSES.find((st) => st.value === s)?.label || s;
            return (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(s);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <StatusBadge status={s} size="sm" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────── Application Card ─────────────────── */

const ApplicationCard = ({ application, isSelected, onSelect, onViewDetails, onStatusUpdate }) => {
  const candidate = application.candidate || {};
  const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
  const skills = candidate.skills?.slice(0, 3) || [];

  return (
    <div
      className={`group rounded-xl border bg-white p-4 transition-all hover:shadow-md dark:bg-slate-800 ${
        isSelected
          ? 'border-primary-300 ring-2 ring-primary-500/20 dark:border-primary-600'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(application._id)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700"
          aria-label={`Select ${fullName}`}
        />

        {/* Avatar */}
        {candidate.avatar ? (
          <img
            src={candidate.avatar}
            alt={fullName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
            {getInitials(candidate.firstName, candidate.lastName)}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            {/* Left: Name & title */}
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {fullName || 'Unknown'}
              </h3>
              {candidate.title && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.title}</p>
              )}
              {candidate.location && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <MapPin className="h-3 w-3" /> {candidate.location}
                </p>
              )}
            </div>

            {/* Right: Status + rating */}
            <div className="flex items-center gap-2">
              <StatusBadge status={application.status} />
              {application.rating > 0 && (
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {application.rating}
                </span>
              )}
            </div>
          </div>

          {/* Center: Date, skills, experience */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Applied {formatRelativeDate(application.createdAt)}
            </span>
            {candidate.experience && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                {candidate.experience}
              </span>
            )}
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewDetails(application)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
            >
              <Eye className="h-3.5 w-3.5" /> View Details
            </button>
            {application.cvUrl && (
              <a
                href={application.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
              >
                <Download className="h-3.5 w-3.5" /> Download CV
              </a>
            )}
            <QuickStatusDropdown application={application} onUpdate={onStatusUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Bulk Actions Bar ─────────────────── */

const BulkActionsBar = ({ selectedCount, onBulkUpdate, loading }) => {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  const allStatuses = APPLICATION_STATUSES.filter(
    (s) => !['withdrawn'].includes(s.value),
  );

  const handleSubmit = () => {
    if (!status) return toast.error('Please select a status');
    onBulkUpdate(status, note);
    setStatus('');
    setNote('');
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950/30">
      <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
        {selectedCount} selected
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-primary-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="">Update Status...</option>
        {allStatuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-primary-700 dark:bg-slate-800 dark:text-white"
      />
      <button
        onClick={handleSubmit}
        disabled={!status || loading}
        className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Apply'}
      </button>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const JobApplicationsPage = () => {
  const { id: jobId } = useParams();
  const location = useLocation();

  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || '');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [detailApp, setDetailApp] = useState(null);

  /* ── Fetch job title if not from location state ── */
  useEffect(() => {
    if (jobTitle) return;
    getMyJobs({}).then((res) => {
      const jobs = res.jobs || res.data || [];
      const found = jobs.find((j) => j._id === jobId);
      if (found) setJobTitle(found.title);
    }).catch(() => {});
  }, [jobId, jobTitle]);

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await applicationService.getApplicationStats(jobId);
      setStats(res.stats);
    } catch {
      // non-critical
    }
  }, [jobId]);

  /* ── Fetch applications ── */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      if (sortBy === 'oldest') params.sort = 'createdAt';
      if (sortBy === 'highest-rated') params.sort = '-rating';

      const res = await applicationService.getJobApplications(jobId, params);
      setApplications(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, currentPage, statusFilter, sortBy]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── Selection handlers ── */
  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a._id)));
    }
  };

  /* ── Bulk update ── */
  const handleBulkUpdate = async (status, note) => {
    setBulkLoading(true);
    try {
      const res = await applicationService.bulkUpdateStatus({
        applicationIds: [...selectedIds],
        status,
        statusNote: note || undefined,
      });
      const { updated, skipped } = res;
      toast.success(
        `Updated ${updated} application${updated !== 1 ? 's' : ''}${
          skipped > 0 ? `. ${skipped} skipped (invalid transition).` : '.'
        }`,
      );
      setSelectedIds(new Set());
      fetchApplications();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  /* ── Status filter click from stat cards ── */
  const handleStatClick = (key) => {
    if (key === 'total') {
      setStatusFilter('');
    } else {
      setStatusFilter(statusFilter === key ? '' : key);
    }
    setCurrentPage(1);
  };

  /* ── Single status update (from card or modal) ── */
  const handleSingleStatusUpdate = (updatedApp) => {
    setApplications((prev) =>
      prev.map((a) => (a._id === updatedApp._id ? { ...a, ...updatedApp } : a)),
    );
    fetchStats();
  };

  /* ── Sorted stat configs with values ── */
  const statValues = useMemo(() => {
    if (!stats) return [];
    return STAT_CONFIGS.map((cfg) => ({
      ...cfg,
      value: cfg.key === 'total' ? stats.total : stats.statusBreakdown?.[cfg.key] || 0,
    }));
  }, [stats]);

  if (loading && !applications.length) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <Link
          to="/company/jobs"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Applications for: {jobTitle || 'Loading...'}
        </h1>
      </div>

      {/* 2. Stats summary bar */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {statValues.map(({ key, label, value, icon: Icon, cardBg, cardText }) => (
            <button
              key={key}
              onClick={() => handleStatClick(key)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-md ${cardBg} ${
                (key === 'total' && !statusFilter) || statusFilter === key
                  ? 'ring-2 ring-primary-500/30 border-primary-300 dark:border-primary-700'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${cardText}`} />
                <span className={`text-xs font-medium ${cardText}`}>{label}</span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* 3. Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !statusFilter
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          {APPLICATION_STATUSES.filter((s) => s.value !== 'withdrawn').map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(statusFilter === s.value ? '' : s.value);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onBulkUpdate={handleBulkUpdate}
          loading={bulkLoading}
        />
      )}

      {/* Select all */}
      {applications.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.size === applications.length && applications.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700"
            aria-label="Select all"
          />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Select all ({applications.length})
          </span>
        </div>
      )}

      {/* 4. Application cards */}
      {loading ? (
        <PageSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={statusFilter ? 'No matching applications' : 'No applications yet'}
          description={
            statusFilter
              ? `No applications with status "${statusFilter}". Try a different filter.`
              : 'This job has not received any applications yet. Share it to reach more candidates!'
          }
          actionLabel={statusFilter ? undefined : 'Back to My Jobs'}
          actionHref={statusFilter ? undefined : '/company/jobs'}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              isSelected={selectedIds.has(app._id)}
              onSelect={handleSelect}
              onViewDetails={setDetailApp}
              onStatusUpdate={handleSingleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={!!detailApp}
        onClose={() => setDetailApp(null)}
        application={detailApp}
        onStatusUpdate={(updated) => {
          handleSingleStatusUpdate(updated);
          setDetailApp(updated);
        }}
      />
    </div>
  );
};

export default JobApplicationsPage;

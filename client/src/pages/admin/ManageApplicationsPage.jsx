import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Eye,
  X,
  Calendar,
  User,
  Briefcase,
  Building2,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import useDebounce from '../../hooks/useDebounce';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import { APPLICATION_STATUSES } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable';

const ITEMS_PER_PAGE = 20;

/* ─────────────────── Application Detail Modal ─────────────────── */

const ApplicationDetailModal = ({ application, onClose }) => {
  useLockBodyScroll(!!application);
  if (!application) return null;

  const candidateName = `${application.candidate?.firstName || ''} ${application.candidate?.lastName || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Application Details
        </h2>

        <div className="space-y-4">
          {/* Candidate info */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5" /> Candidate
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {getInitials(application.candidate?.firstName, application.candidate?.lastName)}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{candidateName || 'Unknown'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{application.candidate?.email}</p>
              </div>
            </div>
          </div>

          {/* Job info */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Briefcase className="h-3.5 w-3.5" /> Job
            </div>
            <p className="font-medium text-slate-900 dark:text-white">{application.job?.title || 'Unknown'}</p>
          </div>

          {/* Company info */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5" /> Company
            </div>
            <p className="font-medium text-slate-900 dark:text-white">{application.company?.companyName || 'Unknown'}</p>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </div>
              <StatusBadge status={application.status} size="md" />
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" /> Applied
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(application.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Cover letter */}
          {application.coverLetter && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cover Letter
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* CV */}
          {application.cvUrl && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CV / Resume
              </div>
              <a
                href={application.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View CV
              </a>
            </div>
          )}

          {/* Status history */}
          {application.statusHistory?.length > 0 && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status History
              </div>
              <div className="space-y-2">
                {application.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <StatusBadge status={entry.status} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(entry.changedAt || entry.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Mobile Application Card ─────────────────── */

const MobileApplicationCard = ({ application, onViewDetails }) => {
  const candidateName =
    `${application.candidate?.firstName || ''} ${application.candidate?.lastName || ''}`.trim() ||
    application.candidate?.email ||
    'Unknown candidate';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {getInitials(application.candidate?.firstName, application.candidate?.lastName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={candidateName}>
              {candidateName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{application.job?.title || 'Unknown Job'}</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(application)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={application.status} />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {application.company?.companyName}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const ManageApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailTarget, setDetailTarget] = useState(null);

  /* ── Fetch applications ── */
  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const response = await adminService.getAllApplicationsAdmin(params);
      setApplications(response.data || response.applications || []);
      setPagination({
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          All Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {pagination.total} total applications
        </p>
      </div>

      {/* 2. Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 sm:max-w-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by candidate name or job title..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* 3. Content */}
      {loading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={debouncedSearch ? `No applications matching "${debouncedSearch}".` : 'No applications match the current filters.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Candidate</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Job</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Company</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Applied</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.map((app) => {
                  const candidateName =
                    `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() ||
                    app.candidate?.email ||
                    'Unknown candidate';

                  return (
                    <tr key={app._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      {/* Candidate */}
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {getInitials(app.candidate?.firstName, app.candidate?.lastName)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="truncate font-medium text-slate-900 dark:text-white"
                              title={candidateName}
                            >
                              {candidateName}
                            </p>
                            {app.candidate?.email && (
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {app.candidate.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job */}
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate text-slate-700 dark:text-slate-300">
                          {app.job?.title || 'Unknown'}
                        </p>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {app.company?.companyName || 'Unknown'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Applied */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailTarget(app)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {applications.map((app) => (
              <MobileApplicationCard
                key={app._id}
                application={app}
                onViewDetails={setDetailTarget}
              />
            ))}
          </div>

          {/* 5. Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchApplications(page)}
              totalItems={pagination.total}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
};

export default ManageApplicationsPage;

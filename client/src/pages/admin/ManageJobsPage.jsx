import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Star,
  Trash2,
  Eye,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import useDebounce from '../../hooks/useDebounce';
import { JOB_TYPES } from '../../utils/constants';
import { getJobTypeColor } from '../../utils/helpers';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable';

const ITEMS_PER_PAGE = 20;

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'featured', label: 'Featured' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

/* ─────────────────── Actions Dropdown ─────────────────── */

const ActionsDropdown = ({ job, onView, onToggleFeatured, onDelete }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleClick = () => setOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <Link
            to={`/jobs/${job.slug}`}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Eye className="h-4 w-4" /> View Public Page
          </Link>
          <button
            onClick={() => onToggleFeatured(job)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Star className={`h-4 w-4 ${job.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
            {job.isFeatured ? 'Remove Featured' : 'Make Featured'}
          </button>
          <hr className="my-1 border-slate-200 dark:border-slate-700" />
          <button
            onClick={() => onDelete(job)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────── Mobile Job Card ─────────────────── */

const MobileJobCard = ({ job, onToggleFeatured, onDelete, togglingFeaturedId }) => {
  const jobType = JOB_TYPES.find((t) => t.value === job.type);
  const companyName = job.company?.companyName || `${job.company?.firstName || ''} ${job.company?.lastName || ''}`.trim();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to={`/jobs/${job.slug}`}
            className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
          >
            {job.title}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </Link>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{companyName}</p>
        </div>
        <ActionsDropdown
          job={job}
          onView={() => {}}
          onToggleFeatured={onToggleFeatured}
          onDelete={onDelete}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
          {jobType?.label || job.type}
        </span>
        {job.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" /> Featured
          </span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.isActive ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
          {job.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Apps: </span>
          {job.applicationCount || 0}
        </div>
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Views: </span>
          {job.views || 0}
        </div>
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Posted: </span>
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <button
          onClick={() => onToggleFeatured(job)}
          disabled={togglingFeaturedId === job._id}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            job.isFeatured
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${job.isFeatured ? 'fill-current' : ''}`} />
          {job.isFeatured ? 'Featured' : 'Feature'}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  const [togglingFeaturedId, setTogglingFeaturedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Fetch jobs ── */
  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, sort: sortOption };
      if (debouncedSearch) params.search = debouncedSearch;
      if (typeFilter) params.type = typeFilter;

      if (statusFilter === 'active') params.isActive = 'true';
      else if (statusFilter === 'inactive') params.isActive = 'false';
      else if (statusFilter === 'featured') params.isFeatured = 'true';

      const response = await adminService.getAllJobsAdmin(params);
      setJobs(response.data || []);
      setPagination({
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, typeFilter, sortOption]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  /* ── Toggle featured (optimistic) ── */
  const handleToggleFeatured = async (job) => {
    setTogglingFeaturedId(job._id);
    const original = [...jobs];

    setJobs((prev) =>
      prev.map((j) => (j._id === job._id ? { ...j, isFeatured: !j.isFeatured } : j)),
    );

    try {
      await adminService.toggleJobFeatured(job._id);
      toast.success(`Job ${job.isFeatured ? 'unfeatured' : 'featured'} successfully`);
    } catch (error) {
      setJobs(original);
      toast.error(error.message || 'Failed to update featured status');
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  /* ── Delete job ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteJobAdmin(deleteTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      toast.success(`"${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Manage Jobs
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {pagination.total} total jobs
        </p>
      </div>

      {/* 2. Toolbar */}
      <div className="space-y-4">
        {/* Search + Type filter + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 sm:max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by job title..."
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Content */}
      {loading ? (
        <SkeletonTable rows={8} columns={8} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={debouncedSearch ? `No jobs matching "${debouncedSearch}". Try a different search.` : 'No jobs match the current filters.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Job</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Company</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Applications</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Views</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Featured</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Posted</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {jobs.map((job) => {
                  const jobType = JOB_TYPES.find((t) => t.value === job.type);
                  const companyName = job.company?.companyName || `${job.company?.firstName || ''} ${job.company?.lastName || ''}`.trim();

                  return (
                    <tr key={job._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750">
                      {/* Job title */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/jobs/${job.slug}`}
                          className="flex items-center gap-1.5 font-medium text-slate-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                        >
                          {job.title}
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                        </Link>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {job.company?.companyLogo ? (
                            <img
                              src={job.company.companyLogo}
                              alt={companyName}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {companyName?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="text-sm text-slate-700 dark:text-slate-300">{companyName}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
                          {jobType?.label || job.type}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {job.applicationCount || 0}
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {job.views || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Featured star */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(job)}
                          disabled={togglingFeaturedId === job._id}
                          className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                            job.isFeatured
                              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-600 dark:hover:bg-slate-700'
                          }`}
                          aria-label={job.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star className={`h-5 w-5 ${job.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* Posted */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <ActionsDropdown
                          job={job}
                          onView={() => {}}
                          onToggleFeatured={handleToggleFeatured}
                          onDelete={setDeleteTarget}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {jobs.map((job) => (
              <MobileJobCard
                key={job._id}
                job={job}
                onToggleFeatured={handleToggleFeatured}
                onDelete={setDeleteTarget}
                togglingFeaturedId={togglingFeaturedId}
              />
            ))}
          </div>

          {/* 6. Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchJobs(page)}
              totalItems={pagination.total}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        message={`This will permanently delete this job listing and all ${deleteTarget?.applicationCount || 0} associated application(s), saved jobs, and notifications. This action cannot be undone.`}
        confirmText="Delete Job"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageJobsPage;

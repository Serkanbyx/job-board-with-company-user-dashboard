import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  MoreHorizontal,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as jobService from '../../api/jobService';
import { JOB_TYPES } from '../../utils/constants';
import { getJobTypeColor } from '../../utils/helpers';
import SearchInput from '../../components/common/SearchInput';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable';

const ITEMS_PER_PAGE = 10;

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

/* ─────────────────── Actions Dropdown ─────────────────── */

const ActionsDropdown = ({ job, onEdit, onViewApplications, onDelete }) => {
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
          <button
            onClick={() => onEdit(job)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={() => onViewApplications(job)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileText className="h-4 w-4" /> View Applications
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

const MobileJobCard = ({ job, onToggle, onEdit, onViewApplications, onDelete, togglingId }) => {
  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const jobType = JOB_TYPES.find((t) => t.value === job.type);

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
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
            {jobType?.label || job.type}
          </span>
        </div>
        <ActionsDropdown
          job={job}
          onEdit={onEdit}
          onViewApplications={onViewApplications}
          onDelete={onDelete}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Applications: </span>
          <Link
            to={`/company/jobs/${job._id}/applications`}
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            {job.applicationCount || 0}
          </Link>
        </div>
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Views: </span>
          {job.views || 0}
        </div>
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Posted: </span>
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Deadline: </span>
          <span className={isExpired ? 'text-danger-600 dark:text-red-400' : ''}>
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <ToggleSwitch
          checked={job.isActive}
          onChange={() => onToggle(job._id)}
          disabled={togglingId === job._id}
          label={job.isActive ? 'Active' : 'Inactive'}
        />
      </div>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const MyJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tabCounts, setTabCounts] = useState({ all: 0, active: 0, inactive: 0 });
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeTab = searchParams.get('status') || 'all';

  const counts = tabCounts;

  /* ── Client-side filtering by search query ── */
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter((j) => j.title.toLowerCase().includes(q));
  }, [jobs, searchQuery]);

  /* ── Fetch jobs ── */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (activeTab !== 'all') params.status = activeTab;

      const data = await jobService.getMyJobs(params);
      const jobList = data.jobs || data.data || [];
      setJobs(jobList);
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
      setTotalItems(data.pagination?.total || data.total || data.totalJobs || 0);

      if (data.totalJobs !== undefined || data.activeJobs !== undefined) {
        const all = data.totalJobs ?? data.pagination?.total ?? jobList.length;
        const active = data.activeJobs ?? jobList.filter((j) => j.isActive).length;
        const inactive = data.inactiveJobs ?? Math.max(0, all - active);
        setTabCounts({ all, active, inactive });
      } else {
        setTabCounts((prev) => ({ ...prev, [activeTab]: data.pagination?.total || jobList.length }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* ── Tab change ── */
  const handleTabChange = (tab) => {
    setSearchParams(tab === 'all' ? {} : { status: tab });
    setCurrentPage(1);
  };

  /* ── Toggle status (optimistic) ── */
  const handleToggle = async (id) => {
    setTogglingId(id);
    const original = [...jobs];
    setJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, isActive: !j.isActive } : j)),
    );

    try {
      await jobService.toggleJobStatus(id);
      toast.success('Job status updated');
    } catch (error) {
      setJobs(original);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.deleteJob(deleteTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      toast.success(`"${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Navigation helpers ── */
  const handleEdit = (job) => {
    window.location.href = `/company/jobs/${job._id}/edit`;
  };

  const handleViewApplications = (job) => {
    window.location.href = `/company/jobs/${job._id}/applications`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Job Listings
        </h1>
        <Link
          to="/company/jobs/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* 2. Status tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
              ({counts[key]})
            </span>
          </button>
        ))}
      </div>

      {/* 3. Search */}
      <div className="max-w-md">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search jobs by title..."
        />
      </div>

      {/* 4. Content */}
      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : filteredJobs.length === 0 && jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings yet"
          description="You haven't posted any jobs yet. Post your first job to start receiving applications."
          actionLabel="Post Your First Job"
          actionHref="/company/jobs/create"
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matching jobs"
          description={`No jobs found matching "${searchQuery}". Try a different search term.`}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Job</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Applications</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Views</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Posted</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Deadline</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredJobs.map((job) => {
                  const isExpired = job.deadline && new Date(job.deadline) < new Date();
                  const jobType = JOB_TYPES.find((t) => t.value === job.type);

                  return (
                    <tr
                      key={job._id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750"
                    >
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

                      {/* Type badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getJobTypeColor(job.type)}`}>
                          {jobType?.label || job.type}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/company/jobs/${job._id}/applications`}
                          className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
                        >
                          {job.applicationCount || 0}
                        </Link>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {job.views || 0}
                        </span>
                      </td>

                      {/* Toggle */}
                      <td className="px-4 py-3">
                        <ToggleSwitch
                          checked={job.isActive}
                          onChange={() => handleToggle(job._id)}
                          disabled={togglingId === job._id}
                        />
                      </td>

                      {/* Posted */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3">
                        <span className={isExpired ? 'font-medium text-danger-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
                          {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <ActionsDropdown
                          job={job}
                          onEdit={handleEdit}
                          onViewApplications={handleViewApplications}
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
            {filteredJobs.map((job) => (
              <MobileJobCard
                key={job._id}
                job={job}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onViewApplications={handleViewApplications}
                onDelete={setDeleteTarget}
                togglingId={togglingId}
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

      {/* 6. Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        message={`This will permanently delete this job listing and remove ${deleteTarget?.applicationCount || 0} associated application(s). This action cannot be undone.`}
        confirmText="Delete Job"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default MyJobsPage;

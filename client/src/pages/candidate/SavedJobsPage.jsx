import { useState, useEffect, useCallback, useRef } from 'react';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

import JobCard from '../../components/jobs/JobCard';
import Pagination from '../../components/common/Pagination';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

import { getMySavedJobs, toggleSaveJob } from '../../api/savedJobService';

const ITEMS_PER_PAGE = 12;

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const [unsaveTarget, setUnsaveTarget] = useState(null);
  const [unsaveLoading, setUnsaveLoading] = useState(false);

  const undoTimerRef = useRef(null);

  const fetchSavedJobs = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const response = await getMySavedJobs({ page: targetPage, limit: ITEMS_PER_PAGE });
      const items = response.data || [];
      setSavedJobs(items);
      setPagination({
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs(page);
  }, [page, fetchSavedJobs]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleUnsaveClick = useCallback((jobId) => {
    setUnsaveTarget(jobId);
  }, []);

  const handleConfirmUnsave = useCallback(async () => {
    if (!unsaveTarget) return;
    const jobId = unsaveTarget;
    setUnsaveLoading(true);

    const removedItem = savedJobs.find((s) => (s.job?._id || s.job) === jobId);
    setSavedJobs((prev) => prev.filter((s) => (s.job?._id || s.job) !== jobId));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    setUnsaveTarget(null);
    setUnsaveLoading(false);

    try {
      await toggleSaveJob(jobId);

      const toastId = toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>Job removed from saved.</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleUndoUnsave(jobId, removedItem);
              }}
              className="shrink-0 font-semibold text-primary-600 underline hover:text-primary-700"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000 },
      );

      undoTimerRef.current = setTimeout(() => {
        toast.dismiss(toastId);
      }, 5100);
    } catch {
      if (removedItem) {
        setSavedJobs((prev) => [...prev, removedItem]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }
      toast.error('Failed to remove job');
    }
  }, [unsaveTarget, savedJobs]);

  const handleUndoUnsave = useCallback(async (jobId, removedItem) => {
    try {
      await toggleSaveJob(jobId);
      if (removedItem) {
        setSavedJobs((prev) => [removedItem, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }
      toast.success('Job restored to saved list');
    } catch {
      toast.error('Failed to undo');
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isJobInactive = (savedItem) => {
    const job = savedItem.job;
    if (!job || typeof job === 'string') return true;
    return job.isActive === false;
  };

  const handleRemoveInactive = useCallback(async (jobId) => {
    setSavedJobs((prev) => prev.filter((s) => (s.job?._id || s.job) !== jobId));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await toggleSaveJob(jobId);
    } catch {
      fetchSavedJobs(page);
    }
  }, [fetchSavedJobs, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Jobs</h1>
        {!loading && pagination.total > 0 && (
          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700 dark:bg-pink-950 dark:text-pink-300">
            {pagination.total}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SkeletonCard count={4} />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any jobs yet"
          description="Browse jobs and save the ones you're interested in for later!"
          actionLabel="Browse Jobs"
          actionHref="/jobs"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {savedJobs.map((savedItem) => {
              const job = savedItem.job;
              const jobId = job?._id || job;
              const inactive = isJobInactive(savedItem);

              if (inactive) {
                return (
                  <div
                    key={savedItem._id}
                    className="relative rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                      <Bookmark className="mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
                      <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                        This job is no longer active
                      </p>
                      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
                        The listing may have been closed or removed
                      </p>
                      <button
                        onClick={() => handleRemoveInactive(jobId)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <JobCard
                  key={savedItem._id}
                  job={job}
                  variant="grid"
                  isSaved
                  onToggleSave={() => handleUnsaveClick(jobId)}
                  showSaveButton
                />
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.total}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}

      {/* Unsave Confirmation Modal */}
      <ConfirmModal
        isOpen={!!unsaveTarget}
        onClose={() => setUnsaveTarget(null)}
        onConfirm={handleConfirmUnsave}
        title="Remove Saved Job"
        message="Remove this job from your saved list?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="warning"
        isLoading={unsaveLoading}
      />
    </div>
  );
};

export default SavedJobsPage;

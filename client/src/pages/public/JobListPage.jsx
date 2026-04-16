import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

import { getAllJobs, getJobStats } from '../../api/jobService';
import { checkSavedStatus, toggleSaveJob } from '../../api/savedJobService';
import { useAuth } from '../../contexts/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import { SORT_OPTIONS } from '../../utils/constants';
import { pluralize } from '../../utils/helpers';

const ITEMS_PER_PAGE = 12;

const ARRAY_FILTER_KEYS = ['type', 'experience', 'education', 'industry', 'skills'];

/**
 * Parse URL search params into a structured filters object.
 * Array-typed filters are stored as comma-separated values in the URL.
 */
const parseFiltersFromURL = (searchParams) => {
  const filters = {};
  for (const key of ARRAY_FILTER_KEYS) {
    const raw = searchParams.get(key);
    if (raw) filters[key] = raw.split(',').filter(Boolean);
  }
  const textKeys = ['search', 'location', 'salaryMin', 'salaryMax', 'postedWithin', 'sort'];
  for (const key of textKeys) {
    const raw = searchParams.get(key);
    if (raw) filters[key] = raw;
  }
  return filters;
};

/**
 * Serialize a filters object back to URLSearchParams, dropping empty values.
 */
const filtersToSearchParams = (filters) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (!value || (Array.isArray(value) && value.length === 0)) continue;
    params.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  return params;
};

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isCandidate } = useAuth();

  // Filters derived from URL
  const filters = useMemo(() => parseFiltersFromURL(searchParams), [searchParams]);

  // Local state for text inputs (debounced before URL sync)
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [locationInput, setLocationInput] = useState(filters.location || '');

  // Debounced values
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedLocation = useDebounce(locationInput, 500);

  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({});
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Sync debounced text inputs → URL
  useEffect(() => {
    const currentSearch = filters.search || '';
    if (debouncedSearch !== currentSearch) {
      handleFilterChange('search', debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const currentLocation = filters.location || '';
    if (debouncedLocation !== currentLocation) {
      handleFilterChange('location', debouncedLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation]);

  // Fetch jobs whenever URL params change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const page = parseInt(searchParams.get('page')) || 1;
        const params = { ...filters, page, limit: ITEMS_PER_PAGE };

        // Convert array filters for API
        for (const key of ARRAY_FILTER_KEYS) {
          if (params[key] && Array.isArray(params[key])) {
            params[key] = params[key].join(',');
          }
        }

        const response = await getAllJobs(params);
        setJobs(response.data || response.jobs || []);
        setPagination({
          page: response.pagination?.page || page,
          totalPages: response.pagination?.totalPages || 1,
          total: response.pagination?.total || 0,
        });
      } catch {
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams, filters]);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getJobStats();
        setStats(data.stats || data || {});
      } catch {
        // Stats are non-critical
      }
    };
    fetchStats();
  }, []);

  // Check saved status for visible jobs
  useEffect(() => {
    if (!isAuthenticated || !isCandidate || jobs.length === 0) return;

    const checkSaved = async () => {
      try {
        const jobIds = jobs.map((j) => j._id);
        const results = await checkSavedStatus(jobIds);
        const savedIds = new Set(
          Array.isArray(results)
            ? results.filter((r) => r.isSaved).map((r) => r.jobId)
            : results.savedJobIds || []
        );
        setSavedJobIds(savedIds);
      } catch {
        // Non-critical
      }
    };
    checkSaved();
  }, [jobs, isAuthenticated, isCandidate]);

  const handleFilterChange = useCallback(
    (key, value) => {
      const updated = { ...filters, [key]: value };

      // When a filter changes (not page), reset to page 1
      if (key !== 'page') {
        delete updated.page;
      }

      // Clean up empty values
      for (const k of Object.keys(updated)) {
        if (!updated[k] || (Array.isArray(updated[k]) && updated[k].length === 0)) {
          delete updated[k];
        }
      }

      setSearchParams(filtersToSearchParams(updated), { replace: true });
    },
    [filters, setSearchParams],
  );

  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setLocationInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (page) => {
      handleFilterChange('page', page.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handleFilterChange],
  );

  const handleToggleSave = useCallback(
    async (jobId) => {
      if (!isAuthenticated) {
        toast.error('Please login to save jobs');
        return;
      }
      try {
        await toggleSaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (next.has(jobId)) {
            next.delete(jobId);
            toast.success('Job removed from saved');
          } else {
            next.add(jobId);
            toast.success('Job saved');
          }
          return next;
        });
      } catch {
        toast.error('Failed to save job');
      }
    },
    [isAuthenticated],
  );

  const handleRemoveFilter = useCallback(
    (key, value) => {
      if (ARRAY_FILTER_KEYS.includes(key)) {
        const updated = (filters[key] || []).filter((v) => v !== value);
        handleFilterChange(key, updated);
      } else {
        handleFilterChange(key, '');
        if (key === 'search') setSearchInput('');
        if (key === 'location') setLocationInput('');
      }
    },
    [filters, handleFilterChange],
  );

  // Collect active filter chips for display
  const activeFilterChips = useMemo(() => {
    const chips = [];
    for (const key of ARRAY_FILTER_KEYS) {
      if (filters[key]?.length) {
        filters[key].forEach((val) => chips.push({ key, value: val, label: val }));
      }
    }
    if (filters.search) chips.push({ key: 'search', value: filters.search, label: `"${filters.search}"` });
    if (filters.location) chips.push({ key: 'location', value: filters.location, label: `📍 ${filters.location}` });
    if (filters.salaryMin) chips.push({ key: 'salaryMin', value: filters.salaryMin, label: `Min $${filters.salaryMin}` });
    if (filters.salaryMax) chips.push({ key: 'salaryMax', value: filters.salaryMax, label: `Max $${filters.salaryMax}` });
    if (filters.postedWithin) chips.push({ key: 'postedWithin', value: filters.postedWithin, label: `Within ${filters.postedWithin}` });
    return chips;
  }, [filters]);

  // Filter change handler for sidebar (adapts location to use local state)
  const handleSidebarFilterChange = useCallback(
    (key, value) => {
      if (key === 'location') {
        setLocationInput(value);
        return;
      }
      handleFilterChange(key, value);
    },
    [handleFilterChange],
  );

  const sidebarFilters = useMemo(
    () => ({ ...filters, location: locationInput }),
    [filters, locationInput],
  );

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const showSaveButton = isAuthenticated && isCandidate;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Find Jobs
          </h1>
          {pagination.total > 0 && (
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {pagination.total.toLocaleString()}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="max-w-2xl">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search jobs by title, skill, or company..."
            isLoading={loading && !!searchInput}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex gap-8">
        {/* Filter sidebar */}
        <JobFilters
          filters={sidebarFilters}
          onFilterChange={handleSidebarFilterChange}
          onClearAll={handleClearAll}
          stats={stats}
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        />

        {/* Right content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:hidden dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterChips.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-semibold text-white">
                    {activeFilterChips.length}
                  </span>
                )}
              </button>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading
                  ? 'Loading...'
                  : `Showing ${pluralize(jobs.length, 'job')} of ${pagination.total}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex rounded-lg border border-slate-300 dark:border-slate-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilterChips.map(({ key, value, label }) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                >
                  {label}
                  <button
                    onClick={() => handleRemoveFilter(key, value)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary-200 dark:hover:bg-primary-900"
                    aria-label={`Remove filter ${label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Job cards */}
          {loading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
              }
            >
              <SkeletonCard count={6} />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs match your criteria"
              description="Try adjusting your filters or search terms to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={handleClearAll}
            />
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    variant={viewMode}
                    isSaved={savedJobIds.has(job._id)}
                    onToggleSave={handleToggleSave}
                    showSaveButton={showSaveButton}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListPage;

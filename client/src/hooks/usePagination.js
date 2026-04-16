import { useState, useEffect, useCallback, useRef } from 'react';

const usePagination = (fetchFn, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFiltersState] = useState(initialParams);

  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (page = 1, params = filters) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchFn({ ...params, page });
        if (!isMounted.current) return;

        setData(response.data || response.jobs || response.applications || []);
        setPagination({
          page: response.pagination?.page || page,
          totalPages: response.pagination?.totalPages || 1,
          total: response.pagination?.total || 0,
        });
      } catch (err) {
        if (!isMounted.current) return;
        setError(err.message || 'Something went wrong');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [fetchFn, filters],
  );

  useEffect(() => {
    isMounted.current = true;
    fetchData(1, filters);
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, filters]);

  const setPage = useCallback(
    (page) => fetchData(page, filters),
    [fetchData, filters],
  );

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(
    () => fetchData(pagination.page, filters),
    [fetchData, pagination.page, filters],
  );

  return { data, loading, error, pagination, setPage, setFilters, refresh };
};

export default usePagination;

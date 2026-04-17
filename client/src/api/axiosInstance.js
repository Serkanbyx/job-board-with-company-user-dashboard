import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor — attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — automatic token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        // Queue requests while a refresh is already in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('jb_refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        clearTokensAndRedirect('Your session has expired. Please log in again.');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('jb_access_token', accessToken);
        localStorage.setItem('jb_refresh_token', newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const status = refreshError.response?.status;
        const serverMessage = refreshError.response?.data?.message;
        const reason =
          serverMessage ||
          (status === 429
            ? 'Too many refresh attempts. Please log in again.'
            : 'Your session has expired. Please log in again.');
        clearTokensAndRedirect(reason);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If the refresh request itself failed with 401
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      clearTokensAndRedirect(
        error.response?.data?.message ||
          'Your session has expired. Please log in again.',
      );
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.';
    error.message = message;
    return Promise.reject(error);
  },
);

// Guard so we don't show multiple toasts / trigger multiple redirects when
// several queued requests fail at once after a refresh failure.
let isRedirecting = false;

const clearTokensAndRedirect = (message) => {
  localStorage.removeItem('jb_access_token');
  localStorage.removeItem('jb_refresh_token');

  if (isRedirecting) return;
  isRedirecting = true;

  if (message) toast.error(message);

  // Avoid an immediate reload loop if we're already on /login
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

export default axiosInstance;

import axiosInstance from './axiosInstance';

export const getAdminDashboard = () =>
  axiosInstance.get('/admin/dashboard').then((res) => res.data);

export const getPlatformAnalytics = () =>
  axiosInstance.get('/admin/analytics').then((res) => res.data);

export const getAllUsers = (params) =>
  axiosInstance.get('/admin/users', { params }).then((res) => res.data);

export const getUserById = (id) =>
  axiosInstance.get(`/admin/users/${id}`).then((res) => res.data);

export const updateUserStatus = (id, data) =>
  axiosInstance.patch(`/admin/users/${id}/status`, data).then((res) => res.data);

export const updateUserRole = (id, data) =>
  axiosInstance.patch(`/admin/users/${id}/role`, data).then((res) => res.data);

export const deleteUser = (id) =>
  axiosInstance.delete(`/admin/users/${id}`).then((res) => res.data);

export const getAllJobsAdmin = (params) =>
  axiosInstance.get('/admin/jobs', { params }).then((res) => res.data);

export const toggleJobFeatured = (id) =>
  axiosInstance.patch(`/admin/jobs/${id}/featured`).then((res) => res.data);

export const toggleJobActive = (id) =>
  axiosInstance.patch(`/admin/jobs/${id}/active`).then((res) => res.data);

export const deleteJobAdmin = (id) =>
  axiosInstance.delete(`/admin/jobs/${id}`).then((res) => res.data);

export const getAllApplicationsAdmin = (params) =>
  axiosInstance.get('/admin/applications', { params }).then((res) => res.data);

import axiosInstance from './axiosInstance';

export const applyToJob = (jobId, data) =>
  axiosInstance.post(`/jobs/${jobId}/apply`, data).then((res) => res.data);

export const getMyApplications = (params) =>
  axiosInstance.get('/applications/mine', { params }).then((res) => res.data);

export const getJobApplications = (jobId, params) =>
  axiosInstance
    .get(`/jobs/${jobId}/applications`, { params })
    .then((res) => res.data);

export const getApplicationById = (id) =>
  axiosInstance.get(`/applications/${id}`).then((res) => res.data);

export const updateApplicationStatus = (id, data) =>
  axiosInstance.patch(`/applications/${id}/status`, data).then((res) => res.data);

export const updateInternalNotes = (id, data) =>
  axiosInstance.patch(`/applications/${id}/notes`, data).then((res) => res.data);

export const getApplicationStats = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}/applications/stats`).then((res) => res.data);

export const bulkUpdateStatus = (data) =>
  axiosInstance.patch('/applications/bulk-status', data).then((res) => res.data);

export const withdrawApplication = (id) =>
  axiosInstance.delete(`/applications/${id}`).then((res) => res.data);

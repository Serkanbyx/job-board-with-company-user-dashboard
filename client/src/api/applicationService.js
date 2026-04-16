import axiosInstance from './axiosInstance';

export const applyToJob = (jobId, data) =>
  axiosInstance.post(`/applications/jobs/${jobId}`, data).then((res) => res.data);

export const getMyApplications = (params) =>
  axiosInstance.get('/applications/my', { params }).then((res) => res.data);

export const getJobApplications = (jobId, params) =>
  axiosInstance
    .get(`/applications/jobs/${jobId}/list`, { params })
    .then((res) => res.data);

export const getApplicationById = (id) =>
  axiosInstance.get(`/applications/${id}`).then((res) => res.data);

export const updateApplicationStatus = (id, data) =>
  axiosInstance.patch(`/applications/${id}/status`, data).then((res) => res.data);

export const updateInternalNotes = (id, notes) =>
  axiosInstance
    .patch(`/applications/${id}/notes`, { internalNotes: notes })
    .then((res) => res.data);

export const getApplicationStats = () =>
  axiosInstance.get('/applications/stats/overview').then((res) => res.data);

export const bulkUpdateStatus = (data) =>
  axiosInstance.patch('/applications/bulk/status', data).then((res) => res.data);

export const withdrawApplication = (id) =>
  axiosInstance.patch(`/applications/${id}/withdraw`).then((res) => res.data);

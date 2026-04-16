import axiosInstance from './axiosInstance';

export const toggleSaveJob = (jobId) =>
  axiosInstance.post(`/saved-jobs/${jobId}`).then((res) => res.data);

export const getMySavedJobs = (params) =>
  axiosInstance.get('/saved-jobs', { params }).then((res) => res.data);

export const checkSavedStatus = (jobId) =>
  axiosInstance.get(`/saved-jobs/${jobId}/check`).then((res) => res.data);

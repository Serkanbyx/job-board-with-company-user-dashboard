import axiosInstance from './axiosInstance';

export const toggleSaveJob = (jobId) =>
  axiosInstance.post(`/saved-jobs/${jobId}`).then((res) => res.data);

export const getMySavedJobs = (params) =>
  axiosInstance.get('/saved-jobs', { params }).then((res) => res.data);

export const checkSavedStatus = (jobIds) =>
  axiosInstance.get('/saved-jobs/check', { params: { jobIds } }).then((res) => res.data);

import axiosInstance from './axiosInstance';

export const getAllJobs = (params) =>
  axiosInstance.get('/jobs', { params }).then((res) => res.data);

export const getJobBySlug = (slug) =>
  axiosInstance.get(`/jobs/${slug}`).then((res) => res.data);

export const getJobStats = () =>
  axiosInstance.get('/jobs/stats').then((res) => res.data);

export const getMyJobs = (params) =>
  axiosInstance.get('/jobs/my-jobs', { params }).then((res) => res.data);

export const createJob = (data) =>
  axiosInstance.post('/jobs', data).then((res) => res.data);

export const updateJob = (id, data) =>
  axiosInstance.put(`/jobs/${id}`, data).then((res) => res.data);

export const deleteJob = (id) =>
  axiosInstance.delete(`/jobs/${id}`).then((res) => res.data);

export const toggleJobStatus = (id) =>
  axiosInstance.patch(`/jobs/${id}/toggle`).then((res) => res.data);

export const getSimilarJobs = (slug) =>
  axiosInstance.get(`/jobs/${slug}/similar`).then((res) => res.data);

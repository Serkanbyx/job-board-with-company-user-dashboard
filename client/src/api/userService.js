import axiosInstance from './axiosInstance';

export const getCompanyProfile = (userId) =>
  axiosInstance.get(`/users/company/${userId}`).then((res) => res.data);

export const getCandidateProfile = (userId) =>
  axiosInstance.get(`/users/candidate/${userId}`).then((res) => res.data);

export const getCandidateDashboardStats = () =>
  axiosInstance.get('/users/candidate/dashboard').then((res) => res.data);

export const getCompanyDashboardStats = () =>
  axiosInstance.get('/users/company/dashboard').then((res) => res.data);

export const getCompanyAnalytics = () =>
  axiosInstance.get('/users/company/analytics').then((res) => res.data);

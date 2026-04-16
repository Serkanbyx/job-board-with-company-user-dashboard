import axiosInstance from './axiosInstance';

export const register = (data) =>
  axiosInstance.post('/auth/register', data).then((res) => res.data);

export const login = (credentials) =>
  axiosInstance.post('/auth/login', credentials).then((res) => res.data);

export const refreshToken = (refreshTokenValue) =>
  axiosInstance
    .post('/auth/refresh-token', { refreshToken: refreshTokenValue })
    .then((res) => res.data);

export const logout = (refreshTokenValue) =>
  axiosInstance
    .post('/auth/logout', { refreshToken: refreshTokenValue })
    .then((res) => res.data);

export const logoutAll = () =>
  axiosInstance.post('/auth/logout-all').then((res) => res.data);

export const getMe = () =>
  axiosInstance.get('/auth/me').then((res) => res.data);

export const updateProfile = (data) =>
  axiosInstance.put('/auth/profile', data).then((res) => res.data);

export const changePassword = (data) =>
  axiosInstance.put('/auth/change-password', data).then((res) => res.data);

export const deleteAccount = (data) =>
  axiosInstance.delete('/auth/account', { data }).then((res) => res.data);

import axiosInstance from './axiosInstance';

export const getMyNotifications = (params) =>
  axiosInstance.get('/notifications', { params }).then((res) => res.data);

export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count').then((res) => res.data);

export const markAsRead = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`).then((res) => res.data);

export const markAllAsRead = () =>
  axiosInstance.patch('/notifications/read-all').then((res) => res.data);

export const deleteNotification = (id) =>
  axiosInstance.delete(`/notifications/${id}`).then((res) => res.data);

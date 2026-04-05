import axiosInstance from '../../axiosInstance';

export const notificationApi = {
    getMyNotifications: () =>
        axiosInstance.get('/Notification/my-notifications'),

    getUnreadCount: () =>
        axiosInstance.get('/Notification/unread-count'),

    markAsRead: (id) =>
        axiosInstance.put(`/Notification/mark-as-read/${id}`),

    markAllAsRead: () =>
        axiosInstance.put('/Notification/mark-all-as-read'),
};
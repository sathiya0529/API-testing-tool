import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

export const notificationApi = {
  getNotifications: () => apiClient.get(e.notifications.list).then((r) => r.data),
  markRead: (id) => apiClient.put(e.notifications.read(id)).then((r) => r.data),
  markAllRead: () => apiClient.put(e.notifications.readAll).then((r) => r.data),
};

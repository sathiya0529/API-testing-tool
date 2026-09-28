import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

export const analyticsApi = {
  getDashboard: () => apiClient.get(e.analytics.dashboard).then((r) => r.data),
  getPerformance: (range = 7) => apiClient.get(e.analytics.performance, { params: { range } }).then((r) => r.data),
};

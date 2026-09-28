import apiClient from './apiClient';
import { endpoints } from './endpoints';

export const requestApi = {
  // Backend performs the outbound HTTP call. Returns { status, statusText, time, size, headers, cookies, body, contentType, testResults, validation }
  executeRequest: (payload) => apiClient.post(endpoints.requests.execute, payload, { timeout: 60000 }).then((r) => r.data),
  saveRequest: (request) => apiClient.post(endpoints.requests.create, request).then((r) => r.data),
  updateRequest: (id, request) => apiClient.put(endpoints.requests.detail(id), request).then((r) => r.data),
  deleteRequest: (id) => apiClient.delete(endpoints.requests.detail(id)).then((r) => r.data),
  getRequest: (id) => apiClient.get(endpoints.requests.detail(id)).then((r) => r.data),
  duplicateRequest: (id) => apiClient.post(endpoints.requests.duplicate(id)).then((r) => r.data),
  getHistory: () => apiClient.get(endpoints.requests.history).then((r) => r.data),
  deleteHistoryItem: (id) => apiClient.delete(endpoints.requests.historyItem(id)).then((r) => r.data),
  clearHistory: () => apiClient.delete(endpoints.requests.history).then((r) => r.data),
};

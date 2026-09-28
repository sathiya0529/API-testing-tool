import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

// A test: { id, name, requestId, assertions: [...], lastRun?: { status, passed, total, results, ranAt } }
export const testApi = {
  getTests: () => apiClient.get(e.tests.list).then((r) => r.data),
  createTest: (payload) => apiClient.post(e.tests.list, payload).then((r) => r.data),
  updateTest: (id, payload) => apiClient.put(e.tests.detail(id), payload).then((r) => r.data),
  deleteTest: (id) => apiClient.delete(e.tests.detail(id)).then((r) => r.data),
  runTest: (id) => apiClient.post(e.tests.run(id), null, { timeout: 60000 }).then((r) => r.data),
  runAllTests: () => apiClient.post(e.tests.runAll, null, { timeout: 120000 }).then((r) => r.data),
};

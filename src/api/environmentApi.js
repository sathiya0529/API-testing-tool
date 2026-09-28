import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

// An environment: { id, name, variables: [{id, key, value, enabled}] }
export const environmentApi = {
  getEnvironments: () => apiClient.get(e.environments.list).then((r) => r.data),
  createEnvironment: (payload) => apiClient.post(e.environments.list, payload).then((r) => r.data),
  updateEnvironment: (id, payload) => apiClient.put(e.environments.detail(id), payload).then((r) => r.data),
  deleteEnvironment: (id) => apiClient.delete(e.environments.detail(id)).then((r) => r.data),
};

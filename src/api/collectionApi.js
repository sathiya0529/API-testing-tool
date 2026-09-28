import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

// A collection: { id, name, description, folders: [{id, name}], requests: [{id, name, method, url, folderId, ...}] }
export const collectionApi = {
  getCollections: () => apiClient.get(e.collections.list).then((r) => r.data),
  createCollection: (payload) => apiClient.post(e.collections.list, payload).then((r) => r.data),
  updateCollection: (id, payload) => apiClient.put(e.collections.detail(id), payload).then((r) => r.data),
  deleteCollection: (id) => apiClient.delete(e.collections.detail(id)).then((r) => r.data),
  createFolder: (id, payload) => apiClient.post(e.collections.folders(id), payload).then((r) => r.data),
  updateFolder: (id, folderId, payload) => apiClient.put(e.collections.folder(id, folderId), payload).then((r) => r.data),
  deleteFolder: (id, folderId) => apiClient.delete(e.collections.folder(id, folderId)).then((r) => r.data),
  importCollections: (payload) => apiClient.post(e.collections.import, payload).then((r) => r.data),
  exportCollections: (ids) => apiClient.get(e.collections.export, { params: ids?.length ? { ids: ids.join(',') } : {} }).then((r) => r.data),
};

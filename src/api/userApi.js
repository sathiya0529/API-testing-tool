import apiClient from './apiClient';
import { endpoints as e } from './endpoints';

export const userApi = {
  getProfile: () => apiClient.get(e.users.profile).then((r) => r.data.user ?? r.data),
  updateProfile: (payload) => apiClient.put(e.users.profile, payload).then((r) => r.data.user ?? r.data),
  // multipart/form-data with field "avatar". Expected response: { avatarUrl }
  uploadProfilePicture: (blob) => {
    const form = new FormData();
    form.append('avatar', blob, 'avatar.jpg');
    return apiClient.post(e.users.picture, form).then((r) => r.data);
  },
  removeProfilePicture: () => apiClient.delete(e.users.picture).then((r) => r.data),
};

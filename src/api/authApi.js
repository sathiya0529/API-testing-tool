import apiClient from './apiClient';
import { endpoints } from './endpoints';
import { env } from '../config/env';

const quiet = { skipAuthHandler: true };

export const authApi = {
  register: (payload) => apiClient.post(endpoints.auth.register, payload, quiet).then((r) => r.data),

  // Expected: { otpRequired: true, challengeId, email, expiresIn } when 2FA is on.
  login: ({ email, password }) => apiClient.post(endpoints.auth.login, { email, password }, quiet).then((r) => r.data),

  // Expected: { user, token? }  (token omitted when the backend uses HttpOnly cookies)
  verifyOtp: ({ challengeId, otp }) => apiClient.post(endpoints.auth.verifyOtp, { challengeId, otp }, quiet).then((r) => r.data),

  resendOtp: ({ challengeId }) => apiClient.post(endpoints.auth.resendOtp, { challengeId }, quiet).then((r) => r.data),

  logout: () => apiClient.post(endpoints.auth.logout, null, quiet).then((r) => r.data),

  getCurrentUser: () => apiClient.get(endpoints.auth.me, quiet).then((r) => r.data.user ?? r.data),

  // Real mode: hand the browser to the backend, which runs the Google OAuth flow and redirects back to /login?oauth=success.
  // Mock mode: resolves immediately with { user, token } so the UI flow can be exercised.
  async googleLogin() {
    if (env.useMockApi) return apiClient.post(endpoints.auth.googleMock, null, quiet).then((r) => r.data);
    window.location.assign(env.googleAuthUrl);
    return null;
  },
};

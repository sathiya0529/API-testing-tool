import axios from 'axios';
import { env } from '../config/env';
import { tokenStorage } from './tokenStorage';
import { normalizeError } from './errors';

// Set by AuthContext. Called when any protected call returns 401 (session expired).
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  withCredentials: env.authMode === 'cookie',
  headers: { Accept: 'application/json' },
});

// Mock mode swaps the transport only; every service, interceptor and error path stays identical.
if (env.useMockApi) {
  apiClient.defaults.adapter = (config) => import('./mock/mockAdapter').then((m) => m.default(config));
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && env.authMode === 'token') config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeError(error);
    // Per-request opt-out: { skipAuthHandler: true } (login, OTP, session restore).
    if (apiError.status === 401 && !error.config?.skipAuthHandler) unauthorizedHandler?.(apiError);
    return Promise.reject(apiError);
  },
);

export default apiClient;

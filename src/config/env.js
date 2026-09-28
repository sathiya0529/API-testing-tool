// Single place where public runtime configuration is read.
const flag = (value, fallback) =>
  value === undefined || value === '' ? fallback : String(value).toLowerCase() === 'true';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const useMockApi = flag(import.meta.env.VITE_USE_MOCK_API, true);

export const env = {
  apiBaseUrl,
  socketUrl: import.meta.env.VITE_SOCKET_URL || apiBaseUrl.replace(/\/api$/, ''),
  useMockApi,
  useMockSocket: flag(import.meta.env.VITE_USE_MOCK_SOCKET, useMockApi),
  authMode: import.meta.env.VITE_AUTH_MODE === 'cookie' ? 'cookie' : 'token',
  authStorage: import.meta.env.VITE_AUTH_STORAGE === 'session' ? 'session' : 'local',
  googleAuthUrl: import.meta.env.VITE_GOOGLE_AUTH_URL || `${apiBaseUrl}/auth/google`,
  githubUrl: import.meta.env.VITE_GITHUB_URL || 'https://github.com/sathiya0529/AI-Skill-Gap-Analyzer',
};

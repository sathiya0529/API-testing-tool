// All backend paths live here. Adjust these to match the backend team's final routes.
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    logout: '/auth/logout',
    me: '/auth/me',
    googleMock: '/auth/google/mock', // mock mode only
  },
  collections: {
    list: '/collections',
    detail: (id) => `/collections/${id}`,
    folders: (id) => `/collections/${id}/folders`,
    folder: (id, folderId) => `/collections/${id}/folders/${folderId}`,
    import: '/collections/import',
    export: '/collections/export',
  },
  requests: {
    execute: '/requests/execute',
    create: '/requests',
    detail: (id) => `/requests/${id}`,
    duplicate: (id) => `/requests/${id}/duplicate`,
    history: '/history',
    historyItem: (id) => `/history/${id}`,
  },
  environments: { list: '/environments', detail: (id) => `/environments/${id}` },
  tests: {
    list: '/tests',
    detail: (id) => `/tests/${id}`,
    run: (id) => `/tests/${id}/run`,
    runAll: '/tests/run-all',
  },
  users: {
    profile: '/users/profile',
    picture: '/users/profile/picture',
  },
  analytics: { dashboard: '/analytics/dashboard', performance: '/analytics/performance' },
  notifications: { list: '/notifications', read: (id) => `/notifications/${id}/read`, readAll: '/notifications/read-all' },
  mock: { expireSession: '/__mock/expire-session' },
};

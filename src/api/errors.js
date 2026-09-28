// Centralised mapping from HTTP failures to messages the UI can show.
export class ApiError extends Error {
  constructor(message, { status = 0, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const MESSAGES = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was not valid. Please check the details and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'This conflicts with existing data. Please review and try again.',
  422: 'Some of the submitted fields are invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

// Prefer the backend's own message for 400/409/422 (validation text); use ours for everything else.
const PREFER_SERVER = new Set([400, 409, 422]);

export function normalizeError(error) {
  if (error instanceof ApiError) return error;
  const res = error?.response;
  const status = res?.status ?? 0;
  const serverMessage = res?.data?.message || res?.data?.error;
  const fallback = MESSAGES[status] || (status >= 500 ? MESSAGES[500] : 'Something went wrong. Please try again.');
  const message = PREFER_SERVER.has(status) && serverMessage ? serverMessage : (status === 404 && serverMessage) || fallback;
  return new ApiError(message, { status, code: res?.data?.code, details: res?.data?.errors || res?.data?.details });
}

export const getErrorMessage = (e, fallback = 'Something went wrong. Please try again.') => e?.message || fallback;

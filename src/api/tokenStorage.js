import { env } from '../config/env';

// Only used when VITE_AUTH_MODE=token. In cookie mode the browser holds the session (HttpOnly) and nothing is stored here.
const KEY = 'apit.auth.token';
const persistent = () => (env.authStorage === 'session' ? sessionStorage : localStorage);

export const tokenStorage = {
  get() {
    if (env.authMode !== 'token') return null;
    try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch { return null; }
  },
  set(token, remember = true) {
    if (env.authMode !== 'token' || !token) return;
    try {
      this.clear();
      (remember ? persistent() : sessionStorage).setItem(KEY, token);
    } catch { /* storage unavailable */ }
  },
  clear() {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};

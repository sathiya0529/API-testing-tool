import { useSyncExternalStore } from 'react';

// Small UI preferences (not domain data). Domain data always comes from the backend.
const KEY = 'apit.prefs';
const DEFAULTS = { notifications: true, defaultMethod: 'GET', defaultEnvId: null, activeEnvId: null, sidebarCollapsed: false };
const subs = new Set();
let cache = null;

const read = () => {
  if (cache) return cache;
  try { cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { cache = { ...DEFAULTS }; }
  return cache;
};

export const prefsStore = {
  get: read,
  set(patch) {
    cache = { ...read(), ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
    subs.forEach((f) => f());
  },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
};

export function usePrefs() {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.get, prefsStore.get);
  return [prefs, prefsStore.set];
}

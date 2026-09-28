import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { createSocket, SOCKET_EVENTS } from '../api/socketService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useWorkspace } from './WorkspaceContext';
import { usePrefs } from '../utils/prefsStore';
import { uid } from '../utils/uid';

const NotificationContext = createContext(null);
const TOAST_TYPE = { testFailed: 'error', testPassed: 'success', collectionImported: 'success', environmentChanged: 'info' };

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const ws = useWorkspace();
  const [prefs] = usePrefs();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('disconnected'); // connected | connecting | disconnected
  const prefsRef = useRef(prefs); prefsRef.current = prefs;
  const wsRef = useRef(ws); wsRef.current = ws;

  useEffect(() => {
    if (!isAuthenticated) { setItems([]); return undefined; }
    let cancelled = false;
    setLoading(true);
    notificationApi.getNotifications().then((d) => { if (!cancelled) setItems(d); }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let socket; let disposed = false;
    setStatus('connecting');
    createSocket().then((s) => {
      if (disposed) { s.disconnect(); return; }
      socket = s;
      s.on('connect', () => setStatus('connected'));
      s.on('disconnect', () => setStatus('disconnected'));
      s.on('connect_error', () => setStatus('connecting'));
      s.io?.on?.('reconnect_attempt', () => setStatus('connecting'));
      SOCKET_EVENTS.forEach((type) => s.on(type, (payload = {}) => {
        if (!prefsRef.current.notifications) return;
        const n = { id: payload.id || uid('n'), type, message: payload.message || type, createdAt: payload.createdAt || new Date().toISOString(), read: false };
        setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev].slice(0, 50)));
        if (type === 'testFailed' || type === 'testPassed') wsRef.current.reloadTests?.();
        if (type === 'collectionImported') wsRef.current.reloadCollections?.();
        if (type === 'environmentChanged') wsRef.current.reloadEnvironments?.();
        if (type !== 'requestCompleted') toast[TOAST_TYPE[type] || 'info'](n.message);
      }));
    });
    return () => { disposed = true; socket?.disconnect(); setStatus('disconnected'); };
  }, [isAuthenticated, toast]);

  const markRead = useCallback(async (id) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await notificationApi.markRead(id); } catch { /* keep optimistic state */ }
  }, []);
  const markAllRead = useCallback(async () => {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    try { await notificationApi.markAllRead(); } catch { /* keep optimistic state */ }
  }, []);

  const value = useMemo(() => ({
    notifications: items, unreadCount: items.filter((n) => !n.read).length, loading, status, markRead, markAllRead,
  }), [items, loading, status, markRead, markAllRead]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// Reusable hook required by the spec.
export const useNotifications = () => useContext(NotificationContext);

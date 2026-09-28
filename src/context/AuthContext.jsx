import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/apiClient';
import { tokenStorage } from '../api/tokenStorage';
import { env } from '../config/env';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
const OTP_KEY = 'apit.auth.pending';

const readPending = () => { try { return JSON.parse(sessionStorage.getItem(OTP_KEY) || 'null'); } catch { return null; } };
const writePending = (v) => { try { v ? sessionStorage.setItem(OTP_KEY, JSON.stringify(v)) : sessionStorage.removeItem(OTP_KEY); } catch { /* ignore */ } };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the first session check finishes
  const [pendingOtp, setPendingOtp] = useState(readPending);
  const navigate = useNavigate();
  const toast = useToast();
  const userRef = useRef(null);
  userRef.current = user;

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setPendingOtp(null); writePending(null);
  }, []);

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      // Token mode without a stored token: nothing to restore. Cookie mode always asks the backend.
      if (env.authMode === 'token' && !tokenStorage.get()) { setUser(null); return null; }
      const me = await authApi.getCurrentUser();
      setUser(me);
      return me;
    } catch {
      tokenStorage.clear(); setUser(null); return null;
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  // Any protected call that returns 401 lands here.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!userRef.current) return;
      clearSession();
      toast.warning('Your session has expired. Please log in again.');
      navigate('/login', { replace: true, state: { expired: true } });
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, navigate, toast]);

  const finishLogin = useCallback((data, remember) => {
    if (data.token) tokenStorage.set(data.token, remember);
    setUser(data.user);
    setPendingOtp(null); writePending(null);
  }, []);

  const login = useCallback(async ({ email, password, remember }) => {
    const data = await authApi.login({ email, password });
    if (data.otpRequired) {
      const p = { challengeId: data.challengeId, email: data.email || email, remember: !!remember, expiresIn: data.expiresIn || 60 };
      setPendingOtp(p); writePending(p);
      return { otpRequired: true };
    }
    finishLogin(data, remember); // backend without 2FA returns the session directly
    return { otpRequired: false };
  }, [finishLogin]);

  const verifyOtp = useCallback(async (otp) => {
    const p = pendingOtp || readPending();
    if (!p) throw new Error('Your verification request expired. Please sign in again.');
    const data = await authApi.verifyOtp({ challengeId: p.challengeId, otp });
    finishLogin(data, p.remember);
  }, [pendingOtp, finishLogin]);

  const resendOtp = useCallback(async () => {
    const p = pendingOtp || readPending();
    if (!p) throw new Error('Your verification request expired. Please sign in again.');
    return authApi.resendOtp({ challengeId: p.challengeId });
  }, [pendingOtp]);

  const register = useCallback((payload) => authApi.register(payload), []);

  const googleLogin = useCallback(async () => {
    const data = await authApi.googleLogin();
    if (data?.user) finishLogin(data, true);
  }, [finishLogin]);

  const logout = useCallback(async ({ silent = false } = {}) => {
    try { await authApi.logout(); } catch { /* still sign out locally */ }
    clearSession();
    if (!silent) toast.info('You have been signed out.');
    navigate('/login', { replace: true });
  }, [clearSession, navigate, toast]);

  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);
  const cancelOtp = useCallback(() => { setPendingOtp(null); writePending(null); }, []);

  const value = useMemo(() => ({
    user, isAuthenticated: !!user, loading, pendingOtp,
    login, register, verifyOtp, resendOtp, googleLogin, logout, restoreSession, updateUser, cancelOtp,
  }), [user, loading, pendingOtp, login, register, verifyOtp, resendOtp, googleLogin, logout, restoreSession, updateUser, cancelOtp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

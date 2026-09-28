import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, MailCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../api/errors';
import { env } from '../../config/env';

const LEN = 6;
const mask = (email = '') => email.replace(/^(.).*(@.*)$/, '$1•••$2');
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function VerifyOtpPage() {
  useDocumentTitle('Verify your sign-in');
  const { pendingOtp, verifyOtp, resendOtp, cancelOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [left, setLeft] = useState(pendingOtp?.expiresIn || 60);
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const code = digits.join('');
  const focus = (i) => refs.current[Math.max(0, Math.min(LEN - 1, i))]?.focus();

  const onChange = (i, v) => {
    const clean = v.replace(/\D/g, '');
    if (!clean) return;
    setError('');
    setDigits((d) => { const n = [...d]; clean.slice(0, LEN - i).split('').forEach((c, k) => { n[i + k] = c; }); return n; });
    focus(i + clean.length);
  };
  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setError('');
      if (digits[i]) setDigits((d) => d.map((x, k) => (k === i ? '' : x)));
      else if (i > 0) { setDigits((d) => d.map((x, k) => (k === i - 1 ? '' : x))); focus(i - 1); }
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); focus(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1); }
  };
  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, k) => text[k] || ''));
    focus(text.length);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < LEN) { setError('Enter the 6-digit code'); return; }
    setBusy(true); setError('');
    try {
      await verifyOtp(code);
      toast.success('Signed in');
      // PublicOnlyRoute redirects to the dashboard (or the page you came from) once the session exists.
    } catch (err) {
      setError(getErrorMessage(err));
      setDigits(Array(LEN).fill('')); focus(0);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setResending(true); setError('');
    try {
      const r = await resendOtp();
      setLeft(r?.expiresIn || 60); setDigits(Array(LEN).fill('')); focus(0);
      toast.info('A new code has been sent to your email');
    } catch (err) { setError(getErrorMessage(err)); } finally { setResending(false); }
  };

  return (
    <>
      <span className="empty-icon otp-icon"><MailCheck size={24} aria-hidden="true" /></span>
      <h1 className="auth-title">Check your email</h1>
      <p className="auth-sub">We sent a 6-digit verification code to <strong>{mask(pendingOtp?.email)}</strong>. Enter it to finish signing in.</p>
      {error && <div className="alert alert-err" role="alert"><AlertTriangle size={16} /> {error}</div>}
      <form onSubmit={submit} noValidate>
        <div className="otp" role="group" aria-label="Verification code" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} className={`otp-input ${error ? 'input-error' : ''}`} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={LEN} value={d} aria-label={`Digit ${i + 1} of ${LEN}`} onChange={(e) => onChange(i, e.target.value)} onKeyDown={(e) => onKeyDown(i, e)} onFocus={(e) => e.target.select()} />
          ))}
        </div>
        <Button type="submit" variant="primary" size="lg" loading={busy} disabled={code.length < LEN} className="w-full">Verify</Button>
      </form>
      <p className="otp-resend">
        {left > 0 ? <span className="muted">Resend code in {fmt(left)}</span>
          : <>Did not get it? <button className="link-btn" onClick={resend} disabled={resending}>{resending ? 'Sending…' : 'Resend OTP'}</button></>}
      </p>
      <p className="auth-foot"><Link to="/login" onClick={cancelOtp}>Use a different account</Link></p>
      {env.useMockApi && <p className="mock-hint"><Info size={14} /> Mock mode: the code is <code>123456</code>.</p>}
    </>
  );
}

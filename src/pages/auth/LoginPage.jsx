import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import { TextField, PasswordField, Checkbox } from '../../components/ui/Fields';
import { GoogleIcon } from '../../components/common/BrandIcons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../api/errors';
import { env } from '../../config/env';
import { EMAIL_RE } from './validators';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { login, googleLogin, restoreSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const from = location.state?.from;

  // Return leg of the backend Google OAuth flow: /login?oauth=success (session cookie or token already issued)
  useEffect(() => {
    const oauth = params.get('oauth');
    if (!oauth) return;
    setParams({}, { replace: true });
    if (oauth === 'success') restoreSession().then((u) => { if (u) toast.success('Signed in with Google'); else setFormError('Google sign-in could not be completed. Please try again.'); });
    else setFormError('Google sign-in was cancelled or failed. Please try again.');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address'; else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true); setFormError('');
    try {
      const res = await login({ email: form.email.trim(), password: form.password, remember: form.remember });
      if (res.otpRequired) navigate('/verify-otp', { state: from ? { from } : undefined });
    } catch (err) { setFormError(getErrorMessage(err)); } finally { setBusy(false); }
  };

  const google = async () => {
    setGoogleBusy(true); setFormError('');
    try { await googleLogin(); } catch (err) { setFormError(getErrorMessage(err)); } finally { setGoogleBusy(false); }
  };

  return (
    <>
      <h1 className="auth-title">Sign in to API Tester</h1>
      <p className="auth-sub">Welcome back. Enter your details to continue.</p>
      {location.state?.expired && <div className="alert alert-warn" role="status"><AlertTriangle size={16} /> Your session has expired. Please log in again.</div>}
      {location.state?.registered && <div className="alert alert-ok" role="status"><CheckCircle2 size={16} /> Account created. Sign in to continue.</div>}
      {formError && <div className="alert alert-err" role="alert"><AlertTriangle size={16} /> {formError}</div>}
      <form onSubmit={submit} noValidate className="form">
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@company.com" />
        <PasswordField label="Password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Enter your password" />
        <Checkbox label="Remember me" checked={form.remember} onChange={set('remember')} />
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">Sign In</Button>
      </form>
      <div className="divider"><span>or</span></div>
      <Button size="lg" className="w-full" onClick={google} loading={googleBusy} icon={GoogleIcon}>Continue with Google</Button>
      <p className="auth-foot">New to API Tester? <Link to="/register" state={from ? { from } : undefined}>Create an account</Link></p>
      {env.useMockApi && <p className="mock-hint"><Info size={14} /> Mock mode: sign in with <code>demo@apitester.dev</code> / <code>Demo@1234</code>, then enter code <code>123456</code>.</p>}
    </>
  );
}

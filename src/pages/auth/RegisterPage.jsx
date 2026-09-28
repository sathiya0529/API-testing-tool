import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { TextField, PasswordField, Checkbox } from '../../components/ui/Fields';
import { GoogleIcon } from '../../components/common/BrandIcons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../api/errors';
import { EMAIL_RE, passwordProblems } from './validators';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); setFormError(''); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your full name';
    if (!form.email.trim()) e.email = 'Enter your email address'; else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    const pw = passwordProblems(form.password);
    if (!form.password) e.password = 'Create a password'; else if (pw.length) e.password = `Password needs ${pw.join(', ')}`;
    if (!form.confirm) e.confirm = 'Confirm your password'; else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (!form.terms) e.terms = 'Accept the Terms & Conditions and Privacy Policy to continue';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setFormError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created. Sign in to continue.');
      navigate('/login', { replace: true, state: { registered: true, email: form.email.trim() } });
    } catch (err) {
      setFormError(getErrorMessage(err));
      if (err.status === 409) setErrors((x) => ({ ...x, email: 'This email is already registered' }));
    } finally { setBusy(false); }
  };

  const google = async () => {
    setGoogleBusy(true);
    try { await googleLogin(); } catch (err) { setFormError(getErrorMessage(err)); } finally { setGoogleBusy(false); }
  };

  return (
    <>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-sub">Start building and testing API requests.</p>
      {formError && <div className="alert alert-err" role="alert"><AlertTriangle size={16} /> {formError}</div>}
      <form onSubmit={submit} noValidate className="form">
        <TextField label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Your full name" />
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@company.com" />
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters with upper and lower case letters and a number." />
        <PasswordField label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Checkbox checked={form.terms} onChange={set('terms')} error={errors.terms}>
          I agree to the <Link to="/terms" target="_blank">Terms &amp; Conditions</Link> and <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>
        </Checkbox>
        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">Create Account</Button>
      </form>
      <div className="divider"><span>or</span></div>
      <Button size="lg" className="w-full" onClick={google} loading={googleBusy} icon={GoogleIcon}>Continue with Google</Button>
      <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
    </>
  );
}

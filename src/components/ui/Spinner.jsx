import { Loader2 } from 'lucide-react';
import Logo from '../common/Logo';

export const Spinner = ({ size = 18 }) => <Loader2 size={size} className="spin" aria-hidden="true" />;

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="page-loader" role="status"><Spinner size={22} /><span>{label}</span></div>
);

// Full-screen state shown while the session is being restored, so no wrong page flashes.
export const AuthLoading = () => (
  <div className="auth-loading" role="status" aria-live="polite">
    <Logo />
    <div className="row gap-8 muted"><Spinner /> <span>Checking your session…</span></div>
  </div>
);

export const Skeleton = ({ h = 14, w = '100%', style }) => <span className="skeleton" style={{ height: h, width: w, ...style }} aria-hidden="true" />;

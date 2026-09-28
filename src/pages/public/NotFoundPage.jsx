import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  useDocumentTitle('Page not found');
  return (
    <div className="error-screen">
      <Logo to="/" />
      <span className="empty-icon"><Compass size={26} aria-hidden="true" /></span>
      <h1 className="page-title">404: page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <div className="row gap-8">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary">{isAuthenticated ? 'Go to dashboard' : 'Back to home'}</Link>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>Go back</button>
      </div>
    </div>
  );
}

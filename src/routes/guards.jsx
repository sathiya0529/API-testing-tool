import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLoading } from '../components/ui/Spinner';

// While the session is being restored we render only a loading screen, so no wrong page can flash.
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={location.state?.from || '/dashboard'} replace />;
  return <Outlet />;
}

export function OtpGuard({ children }) {
  const { pendingOtp } = useAuth();
  if (!pendingOtp) return <Navigate to="/login" replace />;
  return children;
}

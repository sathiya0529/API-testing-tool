import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { NotificationProvider } from '../context/NotificationContext';

export default function Root() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          <a href="#main" className="skip-link">Skip to content</a>
          <Outlet />
          <ScrollRestoration />
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

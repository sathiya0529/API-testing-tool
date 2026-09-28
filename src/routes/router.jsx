import { createBrowserRouter } from 'react-router-dom';
import Root from '../layouts/Root';
import PublicLayout from '../layouts/PublicLayout';
import AuthSplitLayout from '../layouts/AuthSplitLayout';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute, PublicOnlyRoute, OtpGuard } from './guards';
import { RouteError } from '../components/common/ErrorBoundary';

import LandingPage from '../pages/public/LandingPage';
import FeaturesPage from '../pages/public/FeaturesPage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import AboutPage from '../pages/public/AboutPage';
import { PrivacyPage, TermsPage } from '../pages/public/LegalPage';
import NotFoundPage from '../pages/public/NotFoundPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';

import DashboardPage from '../pages/app/DashboardPage';
import CollectionsPage from '../pages/app/CollectionsPage';
import CollectionDetailPage from '../pages/app/CollectionDetailPage';
import RequestBuilderPage from '../pages/app/RequestBuilderPage';
import HistoryPage from '../pages/app/HistoryPage';
import EnvironmentsPage from '../pages/app/EnvironmentsPage';
import TestCasesPage from '../pages/app/TestCasesPage';
import PerformancePage from '../pages/app/PerformancePage';
import ImportExportPage from '../pages/app/ImportExportPage';
import SettingsPage from '../pages/app/SettingsPage';
import ProfilePage from '../pages/app/ProfilePage';

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/features', element: <FeaturesPage /> },
          { path: '/how-it-works', element: <HowItWorksPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/privacy-policy', element: <PrivacyPage /> },
          { path: '/terms', element: <TermsPage /> },
        ],
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthSplitLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
              { path: '/verify-otp', element: <OtpGuard><VerifyOtpPage /></OtpGuard> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/collections', element: <CollectionsPage /> },
              { path: '/collections/:collectionId', element: <CollectionDetailPage /> },
              { path: '/request/:requestId', element: <RequestBuilderPage /> },
              { path: '/history', element: <HistoryPage /> },
              { path: '/environments', element: <EnvironmentsPage /> },
              { path: '/test-cases', element: <TestCasesPage /> },
              { path: '/performance', element: <PerformancePage /> },
              { path: '/import-export', element: <ImportExportPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

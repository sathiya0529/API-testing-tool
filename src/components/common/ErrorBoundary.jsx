import { Component } from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Logo from './Logo';

export function ErrorFallback({ error, onRetry }) {
  return (
    <div className="error-screen" role="alert">
      <Logo />
      <span className="empty-icon empty-icon-error"><AlertTriangle size={26} /></span>
      <h1 className="page-title">Something went wrong</h1>
      <p className="muted">{error?.message || 'An unexpected error occurred while rendering this page.'}</p>
      <div className="row gap-8">
        <button className="btn btn-primary" onClick={onRetry}>Retry</button>
        {/* Plain link on purpose: a full reload works even if router state is broken */}
        <a className="btn btn-secondary" href="/dashboard">Go to dashboard</a>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Unhandled UI error', error, info); }
  render() {
    if (this.state.error) return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

export function RouteError() {
  const error = useRouteError();
  return <ErrorFallback error={error instanceof Error ? error : new Error(error?.statusText || 'Page failed to load')} onRetry={() => window.location.reload()} />;
}

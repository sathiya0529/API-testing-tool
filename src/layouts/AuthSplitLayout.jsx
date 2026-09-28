import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import ProductPreview from '../components/common/ProductPreview';

const POINTS = ['Build and send GET, POST, PUT, PATCH and DELETE requests', 'Organise work in collections and switch environments in one click', 'Add assertions and see pass or fail results after every run'];

export default function AuthSplitLayout() {
  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <Logo size={32} />
        <div className="auth-brand-copy">
          <h2>Everything you need to test an API, in one workspace.</h2>
          <p>Send requests, inspect responses and keep your checks next to the requests they belong to.</p>
          <ul className="auth-points">{POINTS.map((p) => <li key={p}><CheckCircle2 size={18} aria-hidden="true" />{p}</li>)}</ul>
        </div>
        <div className="auth-visual"><ProductPreview /></div>
      </aside>
      <main className="auth-panel" id="main">
        <div className="auth-panel-top">
          <Link to="/" className="link-back"><ArrowLeft size={16} aria-hidden="true" /> Back to home</Link>
          <ThemeToggle />
        </div>
        <div className="auth-card"><Outlet /></div>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductPreview from '../../components/common/ProductPreview';
import { FEATURE_GROUPS } from '../../data/features';
import { STEPS } from '../../data/steps';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const HIGHLIGHTS = ['HTTP request testing', 'Collections', 'Environment variables', 'Automated tests', 'Performance analysis', 'Real-time notifications'];

export default function LandingPage() {
  useDocumentTitle('');
  const featured = FEATURE_GROUPS.flatMap((g) => g.items).filter((f) => HIGHLIGHTS.map((h) => h.toLowerCase()).includes(f.title.toLowerCase()));
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">Test, Debug and Monitor APIs with Confidence</h1>
          <p className="hero-sub">API Tester is a workspace for sending HTTP requests, inspecting responses and checking them automatically. Keep requests in collections, switch environments in one click and see how your endpoints perform over time.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/features" className="btn btn-secondary btn-lg">Explore Features</Link>
          </div>
        </div>
        <div className="container"><div className="preview-frame"><ProductPreview /></div></div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">What you can do</h2>
          <p className="section-sub">The parts of an API workflow, in one place.</p>
          <div className="grid-3">
            {featured.map(({ icon: Icon, title, text }) => (
              <article className="card feature" key={title}>
                <span className="feature-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
          <Link to="/features" className="text-link">See all features <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split">
          <div>
            <h2 className="section-title">From first request to performance report</h2>
            <p className="section-sub">Create a request, send it, add checks, and keep the result. Every step happens in the same window.</p>
            <Link to="/how-it-works" className="text-link">See the full workflow <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ol className="mini-steps">
            {STEPS.filter((_, i) => [0, 2, 8, 10, 13].includes(i)).map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div><h2 className="section-title">Start testing your API</h2><p className="section-sub">Create an account and send your first request in a minute.</p></div>
          <Link to="/register" className="btn btn-primary btn-lg">Create account</Link>
        </div>
      </section>
    </>
  );
}

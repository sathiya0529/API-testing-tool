import { Link } from 'react-router-dom';
import { FEATURE_GROUPS } from '../../data/features';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function FeaturesPage() {
  useDocumentTitle('Features');
  return (
    <div className="container page-public">
      <header className="public-head">
        <h1>Features</h1>
        <p>Everything API Tester offers, grouped by what you are trying to do.</p>
      </header>
      {FEATURE_GROUPS.map((g) => (
        <section key={g.title} className="feature-group" aria-labelledby={`g-${g.title}`}>
          <h2 id={`g-${g.title}`} className="group-title">{g.title}</h2>
          <div className="grid-4">
            {g.items.map(({ icon: Icon, title, text }) => (
              <article className="card feature" key={title}>
                <span className="feature-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
      <div className="cta-band"><div><h2 className="section-title">Try it on your own API</h2></div><Link to="/register" className="btn btn-primary btn-lg">Get Started</Link></div>
    </div>
  );
}

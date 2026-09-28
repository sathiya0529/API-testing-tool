import { Link } from 'react-router-dom';
import { STEPS } from '../../data/steps';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function HowItWorksPage() {
  useDocumentTitle('How it works');
  return (
    <div className="container page-public">
      <header className="public-head">
        <h1>How API Tester works</h1>
        <p>Fourteen steps from a new account to a performance review of your endpoints.</p>
      </header>
      <ol className="steps">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="step">
            <span className="step-num" aria-hidden="true">{i + 1}</span>
            <div><h2 className="step-title">{title}</h2><p>{text}</p></div>
          </li>
        ))}
      </ol>
      <div className="cta-band"><div><h2 className="section-title">Ready to send your first request?</h2></div><Link to="/register" className="btn btn-primary btn-lg">Create account</Link></div>
    </div>
  );
}

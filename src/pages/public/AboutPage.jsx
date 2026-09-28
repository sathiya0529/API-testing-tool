import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const FLOW = [
  ['Explore', 'Try an endpoint quickly, adjust parameters and headers, and read the response.'],
  ['Build', 'Turn what works into a saved request inside a collection.'],
  ['Verify', 'Add assertions so a changed status code, slow response or missing field is caught.'],
  ['Repeat', 'Run requests and tests against Development, Staging or Production by switching environment.'],
  ['Review', 'Use history, the dashboard and performance pages to spot failures and slow endpoints.'],
];

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <div className="container page-public prose-page">
      <header className="public-head">
        <h1>About API Tester</h1>
        <p>A focused tool for developers who work with HTTP APIs every day.</p>
      </header>
      <section>
        <h2>Why it exists</h2>
        <p>Testing an API usually means juggling a terminal, a browser tab and a notes file. API Tester brings the request, the response, the checks and the history into one workspace so that debugging an endpoint does not mean losing context.</p>
        <p>It is built as a MERN application: a React front end that talks to a Node.js and Express back end, with MongoDB for storage. Requests are executed by the server, so calls are not limited by browser rules such as CORS.</p>
      </section>
      <section>
        <h2>The developer workflow</h2>
        <ol className="flow">{FLOW.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ol>
      </section>
      <section>
        <h2>Principles</h2>
        <ul className="plain-list">
          <li>Keep the interface compact and predictable, like the tools developers already use.</li>
          <li>Show what happened: status, time, size and any validation problem, in plain language.</li>
          <li>Keep secrets out of requests by using environment variables.</li>
        </ul>
      </section>
      <div className="cta-band"><div><h2 className="section-title">See it in action</h2></div><Link to="/how-it-works" className="btn btn-secondary btn-lg">How it works</Link></div>
    </div>
  );
}

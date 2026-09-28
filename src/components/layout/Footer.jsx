import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { GithubIcon } from '../common/BrandIcons';
import { env } from '../../config/env';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo to="/" />
          <p className="muted">A focused workspace for building, sending and testing HTTP requests, with collections, environments and automated checks.</p>
        </div>
        <nav aria-label="Quick links">
          <h2 className="footer-title">Quick links</h2>
          <ul className="footer-list">
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 className="footer-title">Legal</h2>
          <ul className="footer-list">
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span className="muted">© {new Date().getFullYear()} API Tester</span>
        <a href={env.githubUrl} target="_blank" rel="noopener noreferrer" className="icon-btn icon-btn-lg" aria-label="View the project on GitHub (opens in a new tab)"><GithubIcon /></a>
      </div>
    </footer>
  );
}

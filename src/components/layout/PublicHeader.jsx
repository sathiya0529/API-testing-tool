import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const LINKS = [['/how-it-works', 'How It Works'], ['/features', 'Features'], ['/about', 'About']];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <header className="pub-header">
      <div className="container pub-header-inner">
        <Logo to="/" />
        <nav className={`pub-nav ${open ? 'open' : ''}`} aria-label="Main">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} className="pub-link">{label}</NavLink>)}
          <div className="pub-nav-actions-mobile">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        </nav>
        <div className="pub-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost hide-md">Login</Link>
          <Link to="/register" className="btn btn-primary hide-md">Register</Link>
          <button className="icon-btn icon-btn-lg show-md" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 2.5l11.7 6.75v13.5L16 29.5 4.3 22.75V9.25z" fill="var(--accent)" />
    <path d="M13 11l-4 5 4 5M19 11l4 5-4 5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Logo({ to, size = 28, text = true }) {
  const inner = <><LogoMark size={size} />{text && <span className="logo-text">API Tester</span>}</>;
  return to ? <Link to={to} className="logo" aria-label="API Tester home">{inner}</Link> : <span className="logo">{inner}</span>;
}

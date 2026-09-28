import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, FolderOpen, History, Layers, LayoutDashboard, ListChecks, Activity, ArrowUpDown, Settings, User, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Logo from '../common/Logo';
import Avatar from '../ui/Avatar';
import CollectionTree from './CollectionTree';
import { useAuth } from '../../context/AuthContext';
import { usePrefs } from '../../utils/prefsStore';

const NAV = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/collections', 'Collections', FolderOpen, true],
  ['/history', 'History', History],
  ['/environments', 'Environments', Layers],
  ['/test-cases', 'Test Cases', ListChecks],
  ['/performance', 'Performance', Activity],
  ['/import-export', 'Import / Export', ArrowUpDown],
  ['/settings', 'Settings', Settings],
];

export default function Sidebar({ open, onNavigate }) {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = usePrefs();
  const { pathname } = useLocation();
  const collapsed = prefs.sidebarCollapsed;
  const inCollections = pathname.startsWith('/collections') || pathname.startsWith('/request');

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary">
      <div className="sidebar-top">
        <Logo to="/dashboard" text={!collapsed} />
        <button className="icon-btn collapse-btn" onClick={() => setPrefs({ sidebarCollapsed: !collapsed })} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Sections">
        {NAV.map(([to, label, Icon, hasTree]) => (
          <div key={to}>
            <NavLink to={to} end={!hasTree} onClick={onNavigate} title={label}
              className={({ isActive }) => `nav-item ${isActive || (hasTree && inCollections) ? 'active' : ''}`}>
              <Icon size={18} aria-hidden="true" /><span className="nav-label">{label}</span>
              {hasTree && <span className="nav-chevron">{inCollections ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>}
            </NavLink>
            {hasTree && inCollections && !collapsed && <div className="sidebar-tree"><CollectionTree onNavigate={onNavigate} /></div>}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/profile" onClick={onNavigate} className={({ isActive }) => `nav-item nav-user ${isActive ? 'active' : ''}`} title="Profile">
          <Avatar user={user} size="sm" /><span className="nav-label truncate">{user?.name || 'Profile'}</span>
        </NavLink>
        <button className="nav-item" onClick={() => logout()} title="Logout"><LogOut size={18} aria-hidden="true" /><span className="nav-label">Logout</span></button>
      </div>
    </aside>
  );
}

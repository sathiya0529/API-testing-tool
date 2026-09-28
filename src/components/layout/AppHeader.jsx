import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Menu as MenuIcon, Search, Settings, User } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import Avatar from '../ui/Avatar';
import { Menu, MenuItem } from '../ui/Menu';
import EnvSelector from './EnvSelector';
import NotificationMenu from './NotificationMenu';
import { useAuth } from '../../context/AuthContext';

export default function AppHeader({ onMenu, onSearch }) {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <button className="icon-btn icon-btn-lg show-lg" onClick={onMenu} aria-label="Open navigation menu"><MenuIcon size={20} /></button>
      <button className="search-trigger" onClick={onSearch} aria-label="Search collections, requests (Ctrl+K)">
        <Search size={16} aria-hidden="true" />
        <span className="hide-sm">Search collections, requests... (Ctrl + K)</span>
        <span className="show-sm-only">Search</span>
      </button>
      <div className="topbar-right">
        <EnvSelector />
        <ThemeToggle />
        <NotificationMenu />
        <Menu label="Account menu" align="right" button={{ className: 'user-chip', content: <><Avatar user={user} size="sm" /><span className="user-chip-name hide-sm">{user?.name}</span><ChevronDown size={15} className="hide-sm" /></> }}>
          {(close) => (
            <>
              <div className="menu-head"><strong>{user?.name}</strong><span className="muted">{user?.email}</span></div>
              <Link to="/profile" className="menu-item" role="menuitem" onClick={close}><User size={16} /><span>Profile</span></Link>
              <Link to="/settings" className="menu-item" role="menuitem" onClick={close}><Settings size={16} /><span>Settings</span></Link>
              <div className="menu-sep" />
              <MenuItem icon={LogOut} onClick={() => { close(); logout(); }}>Logout</MenuItem>
            </>
          )}
        </Menu>
      </div>
    </header>
  );
}

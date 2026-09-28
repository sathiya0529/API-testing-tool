import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import AppHeader from '../components/layout/AppHeader';
import CommandPalette from '../components/layout/CommandPalette';
import { usePrefs } from '../utils/prefsStore';

export default function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [prefs] = usePrefs();
  const { pathname } = useLocation();

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app ${prefs.sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Sidebar open={drawer} onNavigate={() => setDrawer(false)} />
      {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />}
      <div className="app-main">
        <AppHeader onMenu={() => setDrawer(true)} onSearch={() => setPalette(true)} />
        <main className="app-content" id="main"><Outlet /></main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

import { Bell, Palette, Save, Shield, SlidersHorizontal, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Switch, SelectField } from '../../components/ui/Fields';
import Avatar from '../../components/ui/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePrefs } from '../../utils/prefsStore';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { METHODS } from '../../utils/request';

const THEME_OPTS = [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match system']];

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { environments } = useWorkspace();
  const [prefs, setPrefs] = usePrefs();
  const toast = useToast();
  const list = environments.data || [];

  return (
    <div className="page settings-page">
      <PageHeader title="Settings" />

      <section className="card settings-section">
        <h2 className="card-title"><User size={17} /> Profile</h2>
        <div className="row-between">
          <div className="row gap-8"><Avatar user={user} /><div><div>{user?.name}</div><div className="muted small">{user?.email}</div></div></div>
          <Link to="/profile" className="btn btn-secondary">Edit profile</Link>
        </div>
      </section>

      <section className="card settings-section">
        <h2 className="card-title"><Palette size={17} /> Appearance</h2>
        <div className="seg" role="radiogroup" aria-label="Theme">
          {THEME_OPTS.map(([v, l]) => <button key={v} role="radio" aria-checked={theme === v} className={`seg-btn ${theme === v ? 'active' : ''}`} onClick={() => setTheme(v)}>{l}</button>)}
        </div>
      </section>

      <section className="card settings-section">
        <h2 className="card-title"><Bell size={17} /> Notifications</h2>
        <div className="row-between"><span>Enable real-time notifications</span><Switch checked={prefs.notifications} onChange={(v) => { setPrefs({ notifications: v }); toast.success(v ? 'Notifications enabled' : 'Notifications disabled'); }} label="Enable real-time notifications" /></div>
      </section>

      <section className="card settings-section">
        <h2 className="card-title"><SlidersHorizontal size={17} /> Request Preferences</h2>
        <div className="grid-2">
          <SelectField label="Default method" value={prefs.defaultMethod} onChange={(e) => setPrefs({ defaultMethod: e.target.value })}>{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</SelectField>
          <SelectField label="Default environment" value={prefs.defaultEnvId || ''} onChange={(e) => setPrefs({ defaultEnvId: e.target.value || null })}>
            <option value="">None</option>{list.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </SelectField>
        </div>
      </section>

      <section className="card settings-section">
        <h2 className="card-title"><Shield size={17} /> Security</h2>
        <div className="row-between"><span>Two-factor authentication</span><span className="pill pill-ok">Enabled</span></div>
        <div className="row-between"><span>Current session</span><span className="pill">Active</span></div>
      </section>
    </div>
  );
}

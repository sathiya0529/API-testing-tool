import { Link } from 'react-router-dom';
import { Check, ChevronDown, Settings2 } from 'lucide-react';
import { Menu, MenuItem } from '../ui/Menu';
import { useWorkspace } from '../../context/WorkspaceContext';

export const envTone = (name = '') => { const n = name.toLowerCase(); return n.includes('prod') ? 'muted' : n.includes('stag') ? 'warn' : n.includes('dev') ? 'ok' : 'info'; };
export const EnvDot = ({ name }) => <span className={`env-dot env-dot-${envTone(name)}`} aria-hidden="true" />;

export default function EnvSelector() {
  const { environments, activeEnv, setActiveEnvironment } = useWorkspace();
  const list = environments.data || [];
  return (
    <Menu label="Select environment" align="right" button={{ className: 'env-select', content: <><EnvDot name={activeEnv?.name} /><span className="env-select-name">{activeEnv?.name || 'No environment'}</span><ChevronDown size={15} /></> }}>
      {(close) => (
        <>
          {list.map((e) => (
            <MenuItem key={e.id} onClick={() => { setActiveEnvironment(e); close(); }} role="menuitemradio" aria-checked={activeEnv?.id === e.id}>
              <EnvDot name={e.name} /> {e.name} {activeEnv?.id === e.id && <Check size={14} className="menu-check" />}
            </MenuItem>
          ))}
          {!list.length && <div className="menu-note">No environments yet</div>}
          <div className="menu-sep" />
          <Link to="/environments" className="menu-item" role="menuitem" onClick={close}><Settings2 size={16} /><span>Manage environments</span></Link>
        </>
      )}
    </Menu>
  );
}

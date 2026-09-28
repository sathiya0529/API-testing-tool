import { useEffect, useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { MethodBadge } from '../ui/Badges';
import { useWorkspace } from '../../context/WorkspaceContext';

function RequestLink({ r, onNavigate }) {
  return (
    <NavLink to={`/request/${r.id}`} className={({ isActive }) => `tree-req ${isActive ? 'active' : ''}`} onClick={onNavigate}>
      <MethodBadge method={r.method} block /><span className="truncate">{r.name}</span>
    </NavLink>
  );
}

export default function CollectionTree({ onNavigate, filter = '' }) {
  const { collections } = useWorkspace();
  const active = useMatch('/request/:requestId');
  const [open, setOpen] = useState(() => new Set());
  const list = collections.data || [];

  // Keep the collection/folder of the open request expanded.
  useEffect(() => {
    if (!active) return;
    for (const c of list) {
      const r = c.requests.find((x) => x.id === active.params.requestId);
      if (r) setOpen((s) => new Set(s).add(c.id).add(r.folderId || c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.params.requestId, collections.data]);

  useEffect(() => { if (list.length && open.size === 0 && !active) setOpen(new Set([list[0].id])); /* eslint-disable-next-line */ }, [list.length]);

  const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const q = filter.trim().toLowerCase();

  if (collections.loading && !list.length) return <div className="tree-note">Loading collections…</div>;
  if (!list.length) return <div className="tree-note">No collections yet</div>;

  return (
    <ul className="tree" role="tree">
      {list.map((c) => {
        const reqs = q ? c.requests.filter((r) => r.name.toLowerCase().includes(q)) : c.requests;
        if (q && !reqs.length && !c.name.toLowerCase().includes(q)) return null;
        const isOpen = q || open.has(c.id);
        return (
          <li key={c.id} role="treeitem" aria-expanded={!!isOpen}>
            <button className="tree-node" onClick={() => toggle(c.id)}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
              <span className="truncate">{c.name}</span>
            </button>
            {isOpen && (
              <ul className="tree-children" role="group">
                {reqs.filter((r) => !r.folderId).map((r) => <li key={r.id}><RequestLink r={r} onNavigate={onNavigate} /></li>)}
                {c.folders.map((f) => {
                  const fr = reqs.filter((r) => r.folderId === f.id);
                  if (q && !fr.length) return null;
                  const fo = q || open.has(f.id);
                  return (
                    <li key={f.id}>
                      <button className="tree-node tree-folder" onClick={() => toggle(f.id)}>
                        {fo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Folder size={15} /><span className="truncate">{f.name}</span>
                      </button>
                      {fo && <ul className="tree-children">{fr.map((r) => <li key={r.id}><RequestLink r={r} onNavigate={onNavigate} /></li>)}</ul>}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

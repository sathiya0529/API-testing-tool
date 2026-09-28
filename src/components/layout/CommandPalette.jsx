import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, History, Layers, ListChecks, Search, SearchX, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import { MethodBadge } from '../ui/Badges';
import { useWorkspace } from '../../context/WorkspaceContext';
import { requestFromPayload } from '../../utils/request';

export default function CommandPalette({ open, onClose }) {
  const { collections, allRequests, history, environments, tests } = useWorkspace();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const listRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setIdx(0); } }, [open]);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const has = (...s) => !term || s.some((x) => x?.toLowerCase().includes(term));
    const cap = (a) => a.slice(0, term ? 8 : 4);
    return [
      { title: 'Requests', icon: Send, items: cap(allRequests.filter((r) => has(r.name, r.url, r.method, r.collectionName)).map((r) => ({ id: r.id, label: r.name, sub: r.collectionName, badge: r.method, go: () => navigate(`/request/${r.id}`) }))) },
      { title: 'Collections', icon: FolderOpen, items: cap((collections.data || []).filter((c) => has(c.name, c.description)).map((c) => ({ id: c.id, label: c.name, sub: `${c.requests.length} requests`, go: () => navigate(`/collections/${c.id}`) }))) },
      { title: 'History', icon: History, items: cap((history.data || []).filter((h) => has(h.url, h.method, String(h.status))).map((h) => ({ id: h.id, label: h.endpoint, sub: `${h.status}`, badge: h.method, go: () => navigate('/request/new', { state: { draft: requestFromPayload(h.request) } }) }))) },
      { title: 'Environments', icon: Layers, items: cap((environments.data || []).filter((e) => has(e.name)).map((e) => ({ id: e.id, label: e.name, sub: `${e.variables.length} variables`, go: () => navigate('/environments') }))) },
      { title: 'Test cases', icon: ListChecks, items: cap((tests.data || []).filter((t) => has(t.name)).map((t) => ({ id: t.id, label: t.name, sub: t.lastRun ? `${t.lastRun.passed}/${t.lastRun.total} passed` : 'Not run', go: () => navigate('/test-cases') }))) },
    ].filter((g) => g.items.length);
  }, [q, allRequests, collections.data, history.data, environments.data, tests.data, navigate]);

  const flat = groups.flatMap((g) => g.items);
  useEffect(() => setIdx(0), [q]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [idx]);

  const choose = (item) => { onClose(); item.go(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && flat[idx]) { e.preventDefault(); choose(flat[idx]); }
  };

  let n = -1;
  return (
    <Modal open={open} onClose={onClose} bare size="palette" title="Search">
      <div className="palette-input">
        <Search size={18} aria-hidden="true" />
        <input data-autofocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search collections, requests, history, environments, tests"
          role="combobox" aria-expanded="true" aria-controls="palette-list" aria-label="Search" aria-activedescendant={flat[idx] ? `pal-${flat[idx].id}` : undefined} />
        <kbd>Esc</kbd>
      </div>
      <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
        {!flat.length && <EmptyState compact icon={SearchX} title="No results" description={q ? `Nothing matches "${q}". Try a different name, URL or method.` : 'Create a collection or send a request to see it here.'} />}
        {groups.map((g) => (
          <div key={g.title} role="group" aria-label={g.title}>
            <div className="palette-group"><g.icon size={13} aria-hidden="true" />{g.title}</div>
            {g.items.map((it) => {
              n += 1; const mine = n;
              return (
                <button key={it.id} id={`pal-${it.id}`} role="option" aria-selected={mine === idx} className={`palette-item ${mine === idx ? 'active' : ''}`} onMouseEnter={() => setIdx(mine)} onClick={() => choose(it)}>
                  {it.badge && <MethodBadge method={it.badge} block />}<span className="truncate">{it.label}</span><span className="palette-sub">{it.sub}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Modal>
  );
}

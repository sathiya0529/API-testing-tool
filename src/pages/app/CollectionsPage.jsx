import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Menu, MenuItem } from '../../components/ui/Menu';
import { NameDialog, ConfirmDialog } from '../../components/ui/Modal';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Spinner';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { newRequestModel } from '../../utils/request';

export default function CollectionsPage() {
  useDocumentTitle('Collections');
  const { collections, createCollection, renameCollection, deleteCollection, createBlankRequest } = useWorkspace();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = collections.data || [];
  const filtered = q.trim() ? list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : list;

  const newRequestIn = async (c) => {
    const created = await createBlankRequest({ ...newRequestModel({ name: 'Untitled request', collectionId: c.id }) });
    if (created) navigate(`/request/${created.id}`);
  };

  return (
    <div className="page">
      <PageHeader title="Collections" description="Group related API requests together." actions={<Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New Collection</Button>} />
      <div className="toolbar">
        <div className="search-field"><Search size={15} aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search collections" aria-label="Search collections" /></div>
      </div>

      {collections.error && <ErrorState message={collections.error} onRetry={collections.reload} />}
      {!collections.error && collections.loading && !list.length && <div className="grid-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card"><Skeleton h={20} w="60%" /><Skeleton h={14} w="40%" style={{ marginTop: 10 }} /></div>)}</div>}
      {!collections.error && !collections.loading && !list.length && <EmptyState icon={FolderOpen} title="No collections yet" description="Create a collection to start organising your API requests." action={<Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New Collection</Button>} />}
      {!collections.error && filtered.length > 0 && (
        <div className="grid-3">
          {filtered.map((c) => (
            <article className="card col-card" key={c.id}>
              <div className="row-between">
                <Link to={`/collections/${c.id}`} className="col-card-title"><FolderOpen size={17} aria-hidden="true" /> {c.name}</Link>
                <Menu label={`Options for ${c.name}`} button={{ className: 'icon-btn', content: <MoreVertical size={16} /> }}>
                  {(close) => (<>
                    <MenuItem icon={Plus} onClick={() => { close(); newRequestIn(c); }}>Add request</MenuItem>
                    <MenuItem icon={Pencil} onClick={() => { close(); setRenaming(c); }}>Rename</MenuItem>
                    <MenuItem icon={Trash2} danger onClick={() => { close(); setDeleting(c); }}>Delete</MenuItem>
                  </>)}
                </Menu>
              </div>
              {c.description && <p className="muted small">{c.description}</p>}
              <span className="pill">{c.requests.length} request{c.requests.length === 1 ? '' : 's'}</span>
            </article>
          ))}
        </div>
      )}
      {!collections.error && q && !filtered.length && list.length > 0 && <EmptyState compact icon={Search} title="No matches" description={`Nothing matches "${q}".`} />}

      <NameDialog open={creating} title="New collection" label="Collection name" placeholder="e.g. User Management" submitLabel="Create" onSubmit={(name) => createCollection(name)} onClose={() => setCreating(false)} />
      <NameDialog open={!!renaming} title="Rename collection" label="Collection name" initial={renaming?.name} submitLabel="Save" onSubmit={(name) => renameCollection(renaming.id, name)} onClose={() => setRenaming(null)} />
      <ConfirmDialog open={!!deleting} title="Delete collection" message={`Delete "${deleting?.name}" and its ${deleting?.requests.length || 0} request(s)? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={() => deleteCollection(deleting.id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}

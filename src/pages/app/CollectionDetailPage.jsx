import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Folder, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Menu, MenuItem } from '../../components/ui/Menu';
import { MethodBadge } from '../../components/ui/Badges';
import { NameDialog, ConfirmDialog } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { newRequestModel } from '../../utils/request';

function RequestRow({ r, collectionId, onRename, onDuplicate, onDelete }) {
  return (
    <div className="req-row">
      <Link to={`/request/${r.id}`} className="req-row-link"><MethodBadge method={r.method} block /><span className="truncate">{r.name}</span><span className="muted small mono truncate url-col">{r.url}</span></Link>
      <Menu label={`Options for ${r.name}`} button={{ className: 'icon-btn', content: <MoreVertical size={16} /> }}>
        {(close) => (<>
          <MenuItem icon={Pencil} onClick={() => { close(); onRename(r); }}>Rename</MenuItem>
          <MenuItem icon={Copy} onClick={() => { close(); onDuplicate(r); }}>Duplicate</MenuItem>
          <MenuItem icon={Trash2} danger onClick={() => { close(); onDelete(r); }}>Delete</MenuItem>
        </>)}
      </Menu>
    </div>
  );
}

export default function CollectionDetailPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { collections, createFolder, renameFolder, deleteFolder, renameRequest, duplicateRequest, deleteRequest, createBlankRequest } = useWorkspace();
  const c = (collections.data || []).find((x) => x.id === collectionId);
  useDocumentTitle(c?.name || 'Collection');
  const [folderDialog, setFolderDialog] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState(null);
  const [renameReqTarget, setRenameReqTarget] = useState(null);
  const [deleteReqTarget, setDeleteReqTarget] = useState(null);

  if (collections.loading && !c) return <div className="page"><PageHeader title="Loading…" /></div>;
  if (!c) return <div className="page"><EmptyState icon={Folder} title="Collection not found" action={<Link to="/collections" className="btn btn-primary">Back to collections</Link>} /></div>;

  const unfiled = c.requests.filter((r) => !r.folderId);
  const addRequest = async (folderId = null) => { const created = await createBlankRequest(newRequestModel({ name: 'Untitled request', collectionId: c.id, folderId })); if (created) navigate(`/request/${created.id}`); };

  return (
    <div className="page">
      <Link to="/collections" className="link-back"><ArrowLeft size={16} /> Collections</Link>
      <PageHeader title={c.name} description={c.description || `${c.requests.length} request${c.requests.length === 1 ? '' : 's'}`}
        actions={<><Button icon={Folder} onClick={() => setFolderDialog(true)}>New Folder</Button><Button variant="primary" icon={Plus} onClick={() => addRequest()}>New Request</Button></>} />

      {!c.requests.length && !c.folders.length && <EmptyState icon={Folder} title="This collection is empty" description="Add your first request to get started." action={<Button variant="primary" icon={Plus} onClick={() => addRequest()}>New Request</Button>} />}

      {unfiled.length > 0 && <div className="card req-list">{unfiled.map((r) => <RequestRow key={r.id} r={r} onRename={setRenameReqTarget} onDuplicate={(req) => duplicateRequest(req.id)} onDelete={setDeleteReqTarget} />)}</div>}

      {c.folders.map((f) => {
        const reqs = c.requests.filter((r) => r.folderId === f.id);
        return (
          <div className="card req-list" key={f.id}>
            <div className="row-between folder-head">
              <span className="row gap-8"><Folder size={16} /> {f.name}</span>
              <Menu label={`Options for ${f.name}`} button={{ className: 'icon-btn', content: <MoreVertical size={16} /> }}>
                {(close) => (<>
                  <MenuItem icon={Plus} onClick={() => { close(); addRequest(f.id); }}>Add request</MenuItem>
                  <MenuItem icon={Pencil} onClick={() => { close(); setRenameFolderTarget(f); }}>Rename</MenuItem>
                  <MenuItem icon={Trash2} danger onClick={() => { close(); setDeleteFolderTarget(f); }}>Delete folder</MenuItem>
                </>)}
              </Menu>
            </div>
            {reqs.length ? reqs.map((r) => <RequestRow key={r.id} r={r} onRename={setRenameReqTarget} onDuplicate={(req) => duplicateRequest(req.id)} onDelete={setDeleteReqTarget} />) : <p className="muted small folder-empty">No requests in this folder yet.</p>}
          </div>
        );
      })}

      <NameDialog open={folderDialog} title="New folder" label="Folder name" submitLabel="Create" onSubmit={(name) => createFolder(c.id, name)} onClose={() => setFolderDialog(false)} />
      <NameDialog open={!!renameFolderTarget} title="Rename folder" label="Folder name" initial={renameFolderTarget?.name} submitLabel="Save" onSubmit={(name) => renameFolder(c.id, renameFolderTarget.id, name)} onClose={() => setRenameFolderTarget(null)} />
      <ConfirmDialog open={!!deleteFolderTarget} title="Delete folder" message={`Delete "${deleteFolderTarget?.name}"? Requests inside will move to the collection root.`} confirmLabel="Delete" danger onConfirm={() => deleteFolder(c.id, deleteFolderTarget.id)} onCancel={() => setDeleteFolderTarget(null)} />
      <NameDialog open={!!renameReqTarget} title="Rename request" label="Request name" initial={renameReqTarget?.name} submitLabel="Save" onSubmit={(name) => renameRequest(renameReqTarget, name)} onClose={() => setRenameReqTarget(null)} />
      <ConfirmDialog open={!!deleteReqTarget} title="Delete request" message={`Delete "${deleteReqTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={() => deleteRequest(deleteReqTarget.id)} onCancel={() => setDeleteReqTarget(null)} />
    </div>
  );
}

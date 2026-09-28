import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Save, Copy, Trash2, MoreVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Menu, MenuItem } from '../../components/ui/Menu';
import { ConfirmDialog } from '../../components/ui/Modal';
import MethodUrlBar from '../../components/request/MethodUrlBar';
import RequestTabs from '../../components/request/RequestTabs';
import ResponseViewer from '../../components/request/ResponseViewer';
import SaveRequestDialog from '../../components/request/SaveRequestDialog';
import UnsavedChangesPrompt from '../../components/request/UnsavedChangesPrompt';
import { useRequestBuilder } from '../../hooks/useRequestBuilder';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { newRequestModel } from '../../utils/request';

export default function RequestBuilderPage() {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { allRequests, duplicateRequest, deleteRequest } = useWorkspace();
  const existing = requestId && requestId !== 'new' ? allRequests.find((r) => r.id === requestId) : null;
  const initial = existing || location.state?.draft || newRequestModel();
  const { req, update, dirty, response, sending, sendError, send, save, urlPreview, blocker } = useRequestBuilder(initial);
  const [saveOpen, setSaveOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useDocumentTitle(req.name);

  useEffect(() => {
    if (requestId && requestId !== 'new' && !existing && allRequests.length) navigate('/collections', { replace: true });
  }, [requestId, existing, allRequests.length, navigate]);

  const quickSave = () => { if (req.id || req.collectionId) save(); else setSaveOpen(true); };
  const handleDelete = async () => { await deleteRequest(req.id); setConfirmDelete(false); navigate('/collections', { replace: true }); };
  const handleDuplicate = async () => { const copy = await duplicateRequest(req.id); if (copy) navigate(`/request/${copy.id}`); };

  return (
    <div className="builder">
      <UnsavedChangesPrompt blocker={blocker} />
      <div className="builder-head">
        <input className="req-name-input" value={req.name} onChange={(e) => update({ name: e.target.value })} aria-label="Request name" />
        <div className="row gap-8">
          {dirty && <span className="pill pill-warn">Unsaved changes</span>}
          <Button icon={Save} onClick={quickSave}>Save</Button>
          {req.id && (
            <Menu label="More actions" button={{ className: 'icon-btn icon-btn-lg', content: <MoreVertical size={18} /> }}>
              {(close) => (<>
                <MenuItem icon={Copy} onClick={() => { close(); handleDuplicate(); }}>Duplicate</MenuItem>
                <MenuItem icon={Trash2} danger onClick={() => { close(); setConfirmDelete(true); }}>Delete</MenuItem>
              </>)}
            </Menu>
          )}
        </div>
      </div>
      <MethodUrlBar req={req} update={update} onSend={send} sending={sending} urlPreview={urlPreview} />
      <div className="builder-grid">
        <RequestTabs req={req} update={update} />
        <ResponseViewer response={response} sending={sending} error={sendError} />
      </div>
      <SaveRequestDialog open={saveOpen} onClose={() => setSaveOpen(false)} req={req} onSaved={async (over) => { const saved = await save(over); return saved; }} />
      <ConfirmDialog open={confirmDelete} title="Delete request" message={`Delete "${req.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
}

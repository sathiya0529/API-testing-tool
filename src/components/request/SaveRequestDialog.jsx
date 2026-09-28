import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { TextField, SelectField } from '../ui/Fields';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function SaveRequestDialog({ open, onClose, req, onSaved }) {
  const { collections } = useWorkspace();
  const [name, setName] = useState(req.name);
  const [collectionId, setCollectionId] = useState(req.collectionId || '');
  const [folderId, setFolderId] = useState(req.folderId || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list = collections.data || [];
  const folders = list.find((c) => c.id === collectionId)?.folders || [];

  useEffect(() => { if (open) { setName(req.name); setCollectionId(req.collectionId || list[0]?.id || ''); setFolderId(req.folderId || ''); setError(''); } }, [open]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Request name is required'); return; }
    if (!collectionId) { setError('Choose a collection'); return; }
    setBusy(true);
    try { const saved = await onSaved({ name: name.trim(), collectionId, folderId: folderId || null }); if (saved) onClose(); }
    catch { /* toast already shown */ } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Save request" size="sm"
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} type="submit" form="save-req-form">Save</Button></>}>
      <form id="save-req-form" onSubmit={submit} noValidate>
        <TextField label="Request name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} error={error && !collectionId ? '' : error} data-autofocus />
        <SelectField label="Collection" value={collectionId} onChange={(e) => { setCollectionId(e.target.value); setFolderId(''); }} error={!collectionId ? error : ''}>
          <option value="" disabled>Select a collection</option>
          {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectField>
        {!!folders.length && (
          <SelectField label="Folder (optional)" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">No folder</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </SelectField>
        )}
      </form>
    </Modal>
  );
}

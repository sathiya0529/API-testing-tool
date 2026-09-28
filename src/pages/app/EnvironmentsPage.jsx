import { useEffect, useState } from 'react';
import { Layers, Plus, Save, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/Fields';
import KeyValueEditor from '../../components/ui/KeyValueEditor';
import { ConfirmDialog, NameDialog } from '../../components/ui/Modal';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Spinner';
import { EnvDot } from '../../components/layout/EnvSelector';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { row } from '../../utils/request';

export default function EnvironmentsPage() {
  useDocumentTitle('Environments');
  const { environments, activeEnv, setActiveEnvironment, createEnvironment, updateEnvironment, deleteEnvironment } = useWorkspace();
  const list = environments.data || [];
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!selectedId && list.length) setSelectedId(list[0].id); }, [list, selectedId]);
  const selected = list.find((e) => e.id === selectedId);
  useEffect(() => { setDraft(selected ? { name: selected.name, variables: selected.variables } : null); setReveal(false); }, [selected?.id, selected?.variables?.length]); // eslint-disable-line

  const dirty = selected && draft && JSON.stringify(draft) !== JSON.stringify({ name: selected.name, variables: selected.variables });

  const save = async () => {
    setSaving(true);
    try { await updateEnvironment(selected.id, draft); } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <PageHeader title="Environments" description="Store base URLs and tokens as reusable variables." actions={<Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New Environment</Button>} />
      {environments.error && <ErrorState message={environments.error} onRetry={environments.reload} />}
      {!environments.error && environments.loading && !list.length && <div className="card"><Skeleton h={200} /></div>}
      {!environments.error && !environments.loading && !list.length && <EmptyState icon={Layers} title="No environments yet" description="Create Development, Staging and Production environments to switch contexts quickly." action={<Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New Environment</Button>} />}
      {!!list.length && (
        <div className="env-layout">
          <div className="card env-list">
            {list.map((e) => (
              <button key={e.id} className={`env-item ${selectedId === e.id ? 'active' : ''}`} onClick={() => setSelectedId(e.id)}>
                <EnvDot name={e.name} /><span className="truncate">{e.name}</span>
                {activeEnv?.id === e.id && <span className="pill pill-ok">Active</span>}
              </button>
            ))}
          </div>
          {selected && draft && (
            <div className="card env-editor">
              <div className="row-between">
                <TextField label="Environment name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="env-name-field" />
                <div className="row gap-8 env-editor-actions">
                  {activeEnv?.id !== selected.id && <Button onClick={() => setActiveEnvironment(selected)}>Set active</Button>}
                  <Button onClick={() => setDeleting(selected)} disabled={list.length === 1}>Delete</Button>
                </div>
              </div>
              <div className="row-between">
                <label className="label" id="vars-label">Variables</label>
                <button className="link-btn" onClick={() => setReveal((r) => !r)}>{reveal ? 'Hide values' : 'Reveal values'}</button>
              </div>
              <KeyValueEditor rows={draft.variables} onChange={(variables) => setDraft((d) => ({ ...d, variables }))} addLabel="Add Variable" keyPlaceholder="BASE_URL" valuePlaceholder="https://api.example.com" maskPattern={/token|secret|key|password/i} reveal={reveal} label="Environment variables" />
              <div className="env-editor-footer"><Button variant="primary" icon={Save} loading={saving} disabled={!dirty} onClick={save}>Save changes</Button>{dirty && <span className="muted small">Unsaved changes</span>}</div>
            </div>
          )}
        </div>
      )}
      <NameDialog open={creating} title="New environment" label="Environment name" placeholder="e.g. QA" submitLabel="Create" onSubmit={async (name) => { const e = await createEnvironment({ name, variables: [row('BASE_URL', ''), row('TOKEN', '')] }); setSelectedId(e?.id); }} onClose={() => setCreating(false)} />
      <ConfirmDialog open={!!deleting} title="Delete environment" message={`Delete "${deleting?.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={async () => { await deleteEnvironment(deleting.id); setSelectedId(null); setDeleting(null); }} onCancel={() => setDeleting(null)} />
    </div>
  );
}

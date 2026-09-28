import { useState } from 'react';
import { CheckCircle2, ListChecks, Play, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TextField, SelectField } from '../../components/ui/Fields';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Spinner';
import { MethodBadge } from '../../components/ui/Badges';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ASSERTION_TYPES, newAssertion, describeAssertion } from '../../data/assertions';
import { timeAgo, formatMs } from '../../utils/format';

function TestEditor({ open, onClose, onSubmit, initial }) {
  const { allRequests } = useWorkspace();
  const [name, setName] = useState(initial?.name || '');
  const [requestId, setRequestId] = useState(initial?.requestId || '');
  const [assertions, setAssertions] = useState(initial?.assertions?.length ? initial.assertions : [newAssertion()]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (id, patch) => setAssertions((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Test name is required');
    if (!requestId) return setError('Choose a request');
    setBusy(true); setError('');
    try { await onSubmit({ name: name.trim(), requestId, assertions }); onClose(); }
    catch { /* toast already shown */ } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit test' : 'New test'} size="md"
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} type="submit" form="test-form">Save</Button></>}>
      <form id="test-form" onSubmit={submit} noValidate className="form">
        <TextField label="Test name" value={name} onChange={(e) => setName(e.target.value)} error={error && !name.trim() ? error : ''} placeholder="e.g. Get Users - Status 200" data-autofocus />
        <SelectField label="Request" value={requestId} onChange={(e) => setRequestId(e.target.value)} error={error && !requestId ? error : ''}>
          <option value="" disabled>Choose the request this test runs against</option>
          {allRequests.map((r) => <option key={r.id} value={r.id}>{r.collectionName} / {r.name}</option>)}
        </SelectField>
        <div className="row-between"><label className="label">Assertions</label><button type="button" className="link-btn" onClick={() => setAssertions((a) => [...a, newAssertion()])}><Plus size={15} /> Add assertion</button></div>
        {assertions.map((t) => {
          const def = ASSERTION_TYPES.find((x) => x.value === t.type);
          return (
            <div className="assertion-row" key={t.id}>
              <select className="input" value={t.type} onChange={(e) => set(t.id, { type: e.target.value, ...newAssertion(e.target.value) })} aria-label="Assertion type">
                {ASSERTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              {def.target && <input className="input mono" value={t.target} onChange={(e) => set(t.id, { target: e.target.value })} placeholder={def.targetPlaceholder} aria-label={def.target} />}
              {def.expected && <input className="input mono" value={t.expected} onChange={(e) => set(t.id, { expected: e.target.value })} placeholder={def.placeholder} aria-label={def.expected} />}
              <button type="button" className="icon-btn" onClick={() => setAssertions((a) => a.filter((x) => x.id !== t.id))} disabled={assertions.length === 1} aria-label="Remove assertion"><Trash2 size={15} /></button>
            </div>
          );
        })}
      </form>
    </Modal>
  );
}

export default function TestCasesPage() {
  useDocumentTitle('Test Cases');
  const { tests, allRequests, createTest, updateTest, deleteTest, runTest, runAllTests } = useWorkspace();
  const list = tests.data || [];
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [runningAll, setRunningAll] = useState(false);

  const requestFor = (id) => allRequests.find((r) => r.id === id);

  const runOne = async (t) => { setRunningId(t.id); try { await runTest(t.id); } finally { setRunningId(null); } };
  const runAll = async () => { setRunningAll(true); try { await runAllTests(); } finally { setRunningAll(false); } };

  return (
    <div className="page">
      <PageHeader title="Test Cases" description="Automated checks that run against your saved requests."
        actions={<><Button icon={RefreshCw} loading={runningAll} onClick={runAll} disabled={!list.length}>Run All</Button><Button variant="primary" icon={Plus} onClick={() => { setEditing(null); setEditorOpen(true); }}>New Test</Button></>} />

      {tests.error && <ErrorState message={tests.error} onRetry={tests.reload} />}
      {!tests.error && tests.loading && !list.length && <div className="card"><Skeleton h={200} /></div>}
      {!tests.error && !tests.loading && !list.length && <EmptyState icon={ListChecks} title="No test cases yet" description="Create a test to check a request's status, timing or response fields automatically." action={<Button variant="primary" icon={Plus} onClick={() => setEditorOpen(true)}>New Test</Button>} />}

      <div className="test-list">
        {list.map((t) => {
          const req = requestFor(t.requestId);
          return (
            <div className="card test-card" key={t.id}>
              <div className="row-between">
                <div className="row gap-8">
                  <h3 className="card-title">{t.name}</h3>
                  {req && <span className="row gap-4 muted small"><MethodBadge method={req.method} /> {req.name}</span>}
                </div>
                <div className="row gap-4">
                  <Button size="sm" icon={Play} loading={runningId === t.id} onClick={() => runOne(t)}>Run</Button>
                  <Button size="sm" onClick={() => { setEditing(t); setEditorOpen(true); }}>Edit</Button>
                  <button className="icon-btn" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}><Trash2 size={15} /></button>
                </div>
              </div>
              <ul className="assert-list assert-list-plain">{t.assertions.map((a) => <li key={a.id} className="muted small">{describeAssertion(a)}</li>)}</ul>
              {t.lastRun ? (
                <div className={`test-result ${t.lastRun.status === 'passed' ? 'ok' : 'err'}`}>
                  {t.lastRun.status === 'passed' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{t.lastRun.passed}/{t.lastRun.total} Passed</span>
                  <span className="muted small">{formatMs(t.lastRun.duration)} • ran {timeAgo(t.lastRun.ranAt)}</span>
                </div>
              ) : <p className="muted small">Not run yet</p>}
            </div>
          );
        })}
      </div>

      <TestEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)} onSubmit={(payload) => (editing ? updateTest(editing.id, payload) : createTest(payload))} />
      <ConfirmDialog open={!!deleting} title="Delete test" message={`Delete "${deleting?.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={() => deleteTest(deleting.id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}

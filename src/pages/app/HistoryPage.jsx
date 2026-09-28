import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, RotateCcw, Search, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { MethodBadge, StatusBadge } from '../../components/ui/Badges';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatBytes, formatDate, formatMs } from '../../utils/format';
import { requestFromPayload } from '../../utils/request';
import { METHODS } from '../../utils/request';

export default function HistoryPage() {
  useDocumentTitle('History');
  const { history, deleteHistoryItem, clearHistory } = useWorkspace();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [method, setMethod] = useState('all');
  const [clearOpen, setClearOpen] = useState(false);
  const list = history.data || [];

  const filtered = useMemo(() => list.filter((h) => (method === 'all' || h.method === method) && (!q.trim() || h.endpoint.toLowerCase().includes(q.toLowerCase()))), [list, method, q]);

  const openEntry = (h) => navigate('/request/new', { state: { draft: requestFromPayload(h.request) } });

  return (
    <div className="page">
      <PageHeader title="History" description="Every request you have sent." actions={<Button icon={Trash2} onClick={() => setClearOpen(true)} disabled={!list.length}>Clear History</Button>} />
      <div className="toolbar">
        <div className="search-field"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by endpoint" aria-label="Search history" /></div>
        <select className="input select toolbar-select" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by method">
          <option value="all">All methods</option>{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {history.error && <ErrorState message={history.error} onRetry={history.reload} />}
      {!history.error && history.loading && !list.length && <div className="card"><Skeleton h={200} /></div>}
      {!history.error && !history.loading && !list.length && <EmptyState icon={History} title="No history yet" description="Requests you send will appear here." />}
      {!history.error && !!filtered.length && (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Method</th><th>Endpoint</th><th>Status</th><th>Response Time</th><th>Size</th><th>Date</th><th className="col-action" /></tr></thead>
              <tbody>{filtered.map((h) => (
                <tr key={h.id} className="row-clickable" onClick={() => openEntry(h)}>
                  <td><MethodBadge method={h.method} /></td><td className="mono truncate">{h.endpoint}</td><td><StatusBadge status={h.status} /></td>
                  <td>{formatMs(h.time)}</td><td>{formatBytes(h.size)}</td><td className="muted">{formatDate(h.createdAt)}</td>
                  <td className="col-action">
                    <div className="row gap-4" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => openEntry(h)} aria-label="Re-run"><RotateCcw size={15} /></button>
                      <button className="icon-btn" onClick={() => deleteHistoryItem(h.id)} aria-label="Delete entry"><X size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {!history.error && q && list.length > 0 && !filtered.length && <EmptyState compact icon={Search} title="No matches" description="Try a different search or method filter." />}
      <ConfirmDialog open={clearOpen} title="Clear history" message="Delete all request history? This cannot be undone." confirmLabel="Clear" danger onConfirm={clearHistory} onCancel={() => setClearOpen(false)} />
    </div>
  );
}

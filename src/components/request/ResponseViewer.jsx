import { useMemo, useState } from 'react';
import { Copy, Download, Wand2, AlertTriangle, CheckCircle2, XCircle, Send } from 'lucide-react';
import { StatusBadge, Pill } from '../ui/Badges';
import { Tabs, TabPanel } from '../ui/Tabs';
import { CodeViewer } from '../ui/Code';
import EmptyState from '../ui/EmptyState';
import { formatBytes, formatMs } from '../../utils/format';
import { detectLanguage, formatBody } from '../../utils/highlight';
import { copyText, downloadText } from '../../utils/download';
import { useToast } from '../../context/ToastContext';

const VALIDATION_ICON = { success: CheckCircle2, warning: AlertTriangle, error: XCircle };

export default function ResponseViewer({ response, sending, error }) {
  const [tab, setTab] = useState('body');
  const [formatted, setFormatted] = useState(true);
  const toast = useToast();
  const lang = useMemo(() => (response ? detectLanguage(response.contentType, response.body) : 'text'), [response]);
  const displayed = useMemo(() => (response ? (formatted ? formatBody(response.body, lang) : response.body) : ''), [response, formatted, lang]);
  const ext = lang === 'json' ? 'json' : lang === 'xml' ? 'xml' : 'txt';

  if (sending) {
    return <div className="panel-block resp-empty"><EmptyState compact icon={Send} title="Sending request…" description="Waiting for the server to execute this call." /></div>;
  }
  if (error) {
    return <div className="panel-block resp-empty"><EmptyState compact icon={XCircle} title="Request failed" description={error} /></div>;
  }
  if (!response) {
    return <div className="panel-block resp-empty"><EmptyState compact icon={Send} title="No response yet" description="Send a request to see the status, timing and body here." /></div>;
  }

  const tabs = [
    { id: 'body', label: 'Body' },
    { id: 'headers', label: 'Headers', badge: Object.keys(response.headers || {}).length || null },
    { id: 'cookies', label: 'Cookies', badge: response.cookies?.length || null },
    ...(response.testResults?.length ? [{ id: 'tests', label: 'Test Results', badge: `${response.testResults.filter((t) => t.passed).length}/${response.testResults.length}`, tone: response.testResults.every((t) => t.passed) ? 'ok' : 'err' }] : []),
    { id: 'validation', label: 'Validation', badge: response.validation?.length || null },
  ];

  return (
    <div className="panel-block resp">
      <div className="resp-meta">
        <StatusBadge status={response.status} />
        <Pill>{formatMs(response.time)}</Pill>
        <Pill>{formatBytes(response.size)}</Pill>
      </div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Response" className="resp-tabs" />
      <TabPanel id="body" value={tab}>
        <div className="resp-toolbar">
          <button className="link-btn" onClick={async () => toast.success((await copyText(displayed)) ? 'Copied to clipboard' : 'Could not copy')}><Copy size={14} /> Copy</button>
          {lang !== 'text' && <button className="link-btn" onClick={() => setFormatted((f) => !f)}><Wand2 size={14} /> {formatted ? 'Raw' : 'Format'}</button>}
          <button className="link-btn" onClick={() => { downloadText(`response.${ext}`, displayed); toast.success('Response downloaded'); }}><Download size={14} /> Download</button>
        </div>
        {displayed ? <CodeViewer code={displayed} language={lang} label="Response body" /> : <p className="muted small resp-empty-body">Empty response body.</p>}
      </TabPanel>
      <TabPanel id="headers" value={tab}>
        <table className="table kv-table-static"><tbody>{Object.entries(response.headers || {}).map(([k, v]) => <tr key={k}><td className="mono kv-k">{k}</td><td className="mono">{v}</td></tr>)}</tbody></table>
        {!Object.keys(response.headers || {}).length && <p className="muted small">No headers returned.</p>}
      </TabPanel>
      <TabPanel id="cookies" value={tab}>
        {response.cookies?.length ? (
          <table className="table"><thead><tr><th>Name</th><th>Value</th><th>Path</th><th>Flags</th></tr></thead>
            <tbody>{response.cookies.map((c) => <tr key={c.name}><td className="mono">{c.name}</td><td className="mono truncate">{c.value}</td><td className="mono">{c.path}</td><td>{[c.httpOnly && 'HttpOnly', c.secure && 'Secure'].filter(Boolean).join(', ') || '—'}</td></tr>)}</tbody>
          </table>
        ) : <p className="muted small">No cookies were set.</p>}
      </TabPanel>
      {response.testResults?.length > 0 && (
        <TabPanel id="tests" value={tab}>
          <ul className="assert-list">
            {response.testResults.map((t) => (
              <li key={t.assertionId} className={t.passed ? 'ok' : 'err'}>{t.passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />}<span>{t.name}</span><span className="muted small">{t.message}</span></li>
            ))}
          </ul>
        </TabPanel>
      )}
      <TabPanel id="validation" value={tab}>
        <ul className="assert-list">
          {(response.validation || []).map((v, i) => { const Icon = VALIDATION_ICON[v.level]; return <li key={i} className={v.level === 'error' ? 'err' : v.level === 'warning' ? 'warn' : 'ok'}><Icon size={15} /><span>{v.message}</span></li>; })}
        </ul>
      </TabPanel>
    </div>
  );
}

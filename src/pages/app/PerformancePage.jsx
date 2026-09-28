import { useState } from 'react';
import { ArrowDown, ArrowUp, Gauge, XCircle, Zap } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { LineChart } from '../../components/ui/Charts';
import { Skeleton } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/EmptyState';
import { useResource } from '../../hooks/useResource';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { analyticsApi } from '../../api/analyticsApi';
import { formatMs } from '../../utils/format';

const RANGES = [[7, '7 days'], [14, '14 days'], [30, '30 days']];

function Metric({ icon: Icon, label, value, sub }) {
  return <div className="stat-card"><div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon size={16} /></span></div><div className="stat-value">{value}</div>{sub && <div className="stat-trend muted">{sub}</div>}</div>;
}

export default function PerformancePage() {
  useDocumentTitle('Performance');
  const [range, setRange] = useState(7);
  const { data, loading, error, reload } = useResource(() => analyticsApi.getPerformance(range), { deps: [range] });

  return (
    <div className="page">
      <PageHeader title="Performance" description="Response-time trends and reliability across your requests."
        actions={<div className="seg" role="radiogroup" aria-label="Time range">{RANGES.map(([v, l]) => <button key={v} role="radio" aria-checked={range === v} className={`seg-btn ${range === v ? 'active' : ''}`} onClick={() => setRange(v)}>{l}</button>)}</div>} />

      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && (
        <>
          <section className="stat-grid">
            {loading && !data ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="stat-card"><Skeleton h={14} w="60%" /><Skeleton h={28} w="40%" style={{ marginTop: 10 }} /></div>)
              : data && <>
                <Metric icon={Gauge} label="Average Response Time" value={formatMs(data.avgResponse)} />
                <Metric icon={ArrowUp} label="Fastest Request" value={data.fastest ? formatMs(data.fastest.time) : '—'} sub={data.fastest?.name} />
                <Metric icon={ArrowDown} label="Slowest Request" value={data.slowest ? formatMs(data.slowest.time) : '—'} sub={data.slowest?.name} />
                <Metric icon={Zap} label="Success Rate" value={`${data.successRate}%`} sub={`${data.failed} of ${data.total} failed`} />
              </>}
          </section>
          <section className="card chart-card">
            <h2 className="card-title">Response time trend</h2>
            {loading && !data ? <Skeleton h={200} /> : <LineChart data={data.trend} unit="ms" height={220} label="Response time trend" />}
          </section>
          <section className="card">
            <h2 className="card-title">Slowest endpoints</h2>
            {loading && !data ? <Skeleton h={160} /> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Endpoint</th><th>Avg Response Time</th><th>Calls</th></tr></thead>
                  <tbody>{data.endpoints.map((e) => <tr key={e.name}><td className="mono truncate">{e.name}</td><td>{formatMs(e.avg)}</td><td>{e.calls}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, FolderOpen, Gauge, History, Layers, ListChecks, Send, Zap } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { LineChart, BarChart } from '../../components/ui/Charts';
import { Skeleton } from '../../components/ui/Spinner';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import { MethodBadge, StatusBadge } from '../../components/ui/Badges';
import { EnvDot } from '../../components/layout/EnvSelector';
import { useResource } from '../../hooks/useResource';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { analyticsApi } from '../../api/analyticsApi';
import { formatBytes, formatDate, formatMs, pathOf } from '../../utils/format';

function StatCard({ label, value, trend, icon: Icon, invert }) {
  const up = trend > 0;
  const good = invert ? !up : up;
  return (
    <div className="stat-card">
      <div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon size={16} aria-hidden="true" /></span></div>
      <div className="stat-value">{value}</div>
      {trend != null && <div className={`stat-trend ${good ? 'trend-up' : 'trend-down'}`}>{up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(trend)}%</div>}
    </div>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { collections, history, environments, tests } = useWorkspace();
  const { data, loading, error, reload } = useResource(analyticsApi.getDashboard);

  return (
    <div className="page">
      <PageHeader title="Dashboard" description="An overview of your recent API activity." />

      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && (
        <>
          <section className="stat-grid" aria-label="Summary">
            {loading && !data ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="stat-card"><Skeleton h={14} w="60%" /><Skeleton h={28} w="40%" style={{ marginTop: 10 }} /></div>)
              : data && <>
                <StatCard label="Total Requests" value={data.totals.total} trend={data.trends.total} icon={Send} />
                <StatCard label="Success Rate" value={`${data.totals.successRate}%`} trend={data.trends.successRate} icon={Zap} />
                <StatCard label="Avg Response Time" value={formatMs(data.totals.avgResponse)} trend={data.trends.avgResponse} icon={Gauge} invert />
                <StatCard label="Failed Requests" value={data.totals.failed} trend={data.trends.failed} icon={ListChecks} invert />
              </>}
          </section>

          <section className="chart-grid">
            <div className="card chart-card">
              <h2 className="card-title">Request Activity</h2>
              {loading && !data ? <Skeleton h={180} /> : <LineChart data={data.activity} label="Request activity by day" />}
            </div>
            <div className="card chart-card">
              <h2 className="card-title">Response Time</h2>
              {loading && !data ? <Skeleton h={180} /> : <BarChart data={data.responseTimes} unit="ms" label="Response time by day" />}
            </div>
          </section>

          <section className="card">
            <div className="row-between"><h2 className="card-title">Recent Requests</h2><Link to="/history" className="text-link-sm">View all</Link></div>
            {loading && !data ? <Skeleton h={160} /> : data.recent.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Method</th><th>Endpoint</th><th>Status</th><th>Response Time</th><th>Response Size</th><th>Date</th></tr></thead>
                  <tbody>{data.recent.map((h) => (
                    <tr key={h.id}><td><MethodBadge method={h.method} /></td><td className="mono truncate">{h.endpoint}</td><td><StatusBadge status={h.status} /></td><td>{formatMs(h.time)}</td><td>{formatBytes(h.size)}</td><td className="muted">{formatDate(h.createdAt)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <EmptyState compact icon={Send} title="No requests yet" description="Send your first request to see activity here." />}
          </section>

          <section className="grid-3 dash-lists">
            <div className="card">
              <div className="row-between"><h2 className="card-title">Collections</h2><Link to="/collections" className="text-link-sm">Open</Link></div>
              {collections.data?.length ? <ul className="plain-list-tight">{collections.data.slice(0, 5).map((c) => <li key={c.id}><Link to={`/collections/${c.id}`} className="row gap-8"><FolderOpen size={15} /> {c.name}<span className="muted small">{c.requests.length}</span></Link></li>)}</ul> : <EmptyState compact icon={FolderOpen} title="No collections" />}
            </div>
            <div className="card">
              <div className="row-between"><h2 className="card-title">Environments</h2><Link to="/environments" className="text-link-sm">Manage</Link></div>
              {environments.data?.length ? <ul className="plain-list-tight">{environments.data.map((e) => <li key={e.id} className="row gap-8"><EnvDot name={e.name} /> {e.name}<span className="muted small">{e.variables.length} vars</span></li>)}</ul> : <EmptyState compact icon={Layers} title="No environments" />}
            </div>
            <div className="card">
              <div className="row-between"><h2 className="card-title">Test Cases</h2><Link to="/test-cases" className="text-link-sm">Open</Link></div>
              {tests.data?.length ? <ul className="plain-list-tight">{tests.data.slice(0, 5).map((t) => <li key={t.id} className="row-between"><span className="truncate">{t.name}</span>{t.lastRun ? <span className={`pill ${t.lastRun.status === 'passed' ? 'pill-ok' : 'pill-err'}`}>{t.lastRun.passed}/{t.lastRun.total}</span> : <span className="pill">Not run</span>}</li>)}</ul> : <EmptyState compact icon={ListChecks} title="No test cases" />}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

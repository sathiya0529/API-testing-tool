import { useRef } from 'react';

export function Tabs({ tabs, value, onChange, label, className = '' }) {
  const refs = useRef({});
  const onKey = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };
  return (
    <div className={`tabs ${className}`} role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => { refs.current[t.id] = el; }} role="tab" id={`tab-${t.id}`} aria-selected={value === t.id} aria-controls={`panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1} className={`tab ${value === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}>
          {t.label}{t.badge != null && <span className={`tab-badge ${t.tone ? `tab-badge-${t.tone}` : ''}`}>{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}

export const TabPanel = ({ id, value, children, className = '' }) =>
  value === id ? <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className={className}>{children}</div> : null;

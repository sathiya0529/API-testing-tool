import { Plus, Trash2 } from 'lucide-react';
import { row } from '../../utils/request';

export default function KeyValueEditor({ rows, onChange, addLabel = 'Add row', keyPlaceholder = 'Key', valuePlaceholder = 'Value', maskPattern, reveal, label = 'Key value pairs', compact }) {
  const update = (id, patch) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id) => onChange(rows.filter((r) => r.id !== id));
  const masked = (r) => maskPattern && !reveal && maskPattern.test(r.key);
  return (
    <div className={`kv ${compact ? 'kv-compact' : ''}`}>
      <div className="table-wrap">
        <table className="table kv-table" aria-label={label}>
          <thead><tr><th className="col-check"><span className="sr-only">Enabled</span></th><th>Key</th><th>Value</th><th className="col-action"><span className="sr-only">Delete</span></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.enabled ? '' : 'row-disabled'}>
                <td className="col-check"><input type="checkbox" checked={r.enabled} onChange={(e) => update(r.id, { enabled: e.target.checked })} aria-label={`Enable ${r.key || 'row'}`} /></td>
                <td><input className="input input-cell mono" value={r.key} placeholder={keyPlaceholder} aria-label="Key" onChange={(e) => update(r.id, { key: e.target.value })} /></td>
                <td><input className="input input-cell mono" type={masked(r) ? 'password' : 'text'} value={r.value} placeholder={valuePlaceholder} aria-label="Value" onChange={(e) => update(r.id, { value: e.target.value })} /></td>
                <td className="col-action"><button type="button" className="icon-btn" onClick={() => remove(r.id)} aria-label={`Delete ${r.key || 'row'}`}><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="kv-empty">Nothing added yet</td></tr>}
          </tbody>
        </table>
      </div>
      <button type="button" className="link-btn" onClick={() => onChange([...rows, row()])}><Plus size={15} aria-hidden="true" /> {addLabel}</button>
    </div>
  );
}

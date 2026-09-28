import { Plus, Trash2 } from 'lucide-react';
import { ASSERTION_TYPES, newAssertion } from '../../data/assertions';

export default function TestsPanel({ req, update }) {
  const tests = req.tests;
  const set = (id, patch) => update({ tests: tests.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const remove = (id) => update({ tests: tests.filter((t) => t.id !== id) });

  return (
    <div className="panel-block">
      <div className="row-between">
        <h3 className="panel-title">Tests</h3>
        <button type="button" className="link-btn" onClick={() => update({ tests: [...tests, newAssertion()] })}><Plus size={15} /> Add assertion</button>
      </div>
      {!tests.length && <p className="muted small">No assertions yet. Add one to check the response automatically after sending.</p>}
      {tests.map((t) => {
        const def = ASSERTION_TYPES.find((x) => x.value === t.type);
        return (
          <div className="assertion-row" key={t.id}>
            <select className="input" value={t.type} onChange={(e) => set(t.id, { type: e.target.value, ...newAssertion(e.target.value) })} aria-label="Assertion type">
              {ASSERTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            {def.target && <input className="input mono" value={t.target} onChange={(e) => set(t.id, { target: e.target.value })} placeholder={def.targetPlaceholder} aria-label={def.target} />}
            {def.expected && <input className="input mono" value={t.expected} onChange={(e) => set(t.id, { expected: e.target.value })} placeholder={def.placeholder} aria-label={def.expected} />}
            <button type="button" className="icon-btn" onClick={() => remove(t.id)} aria-label="Remove assertion"><Trash2 size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

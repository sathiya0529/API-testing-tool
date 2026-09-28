import { CodeEditor } from '../ui/Code';
import KeyValueEditor from '../ui/KeyValueEditor';
import { SelectField } from '../ui/Fields';

const TYPES = [['none', 'None'], ['json', 'JSON'], ['form-data', 'Form-data'], ['raw', 'Raw']];
const RAW_TYPES = ['text/plain', 'text/html', 'application/xml', 'application/javascript'];

export default function BodyPanel({ req, update }) {
  const body = req.body;
  const set = (patch) => update({ body: { ...body, ...patch } });
  let valid = null;
  if (body.type === 'json' && body.json.trim()) { try { JSON.parse(body.json); valid = true; } catch { valid = false; } }

  return (
    <div className="panel-block">
      <div className="row-between">
        <h3 className="panel-title">Request Body</h3>
        <div className="seg" role="radiogroup" aria-label="Body type">
          {TYPES.map(([v, l]) => <button key={v} role="radio" aria-checked={body.type === v} className={`seg-btn ${body.type === v ? 'active' : ''}`} onClick={() => set({ type: v })}>{l}</button>)}
        </div>
      </div>
      {body.type === 'none' && <p className="muted small">This request does not send a body.</p>}
      {body.type === 'json' && (
        <>
          <CodeEditor value={body.json} onChange={(json) => set({ json })} language="json" label="JSON body" placeholder={'{\n  "key": "value"\n}'} />
          {valid === false && <p className="field-error">This is not valid JSON.</p>}
          {valid === true && <p className="field-hint field-hint-ok">Valid JSON</p>}
        </>
      )}
      {body.type === 'form-data' && <KeyValueEditor rows={body.form} onChange={(form) => set({ form })} addLabel="Add Field" label="Form data" />}
      {body.type === 'raw' && (
        <>
          <SelectField label="Content type" value={body.rawType} onChange={(e) => set({ rawType: e.target.value })} className="raw-type-select">
            {RAW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
          <CodeEditor value={body.raw} onChange={(raw) => set({ raw })} language="text" label="Raw body" placeholder="Raw request body" />
        </>
      )}
    </div>
  );
}

import { TextField, SelectField } from '../ui/Fields';

const TYPES = [['none', 'No Auth'], ['apiKey', 'API Key'], ['bearer', 'Bearer Token'], ['basic', 'Basic Auth']];

export default function AuthPanel({ req, update }) {
  const auth = req.auth;
  const set = (patch) => update({ auth: { ...auth, ...patch } });
  const setKey = (patch) => set({ apiKey: { ...auth.apiKey, ...patch } });
  const setBearer = (patch) => set({ bearer: { ...auth.bearer, ...patch } });
  const setBasic = (patch) => set({ basic: { ...auth.basic, ...patch } });

  return (
    <div className="panel-block">
      <h3 className="panel-title">Authentication</h3>
      <SelectField label="Type" value={auth.type} onChange={(e) => set({ type: e.target.value })} className="auth-type-select">
        {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </SelectField>
      {auth.type === 'none' && <p className="muted small">This request does not use authentication.</p>}
      {auth.type === 'apiKey' && (
        <div className="grid-2">
          <TextField label="Key" value={auth.apiKey.key} onChange={(e) => setKey({ key: e.target.value })} placeholder="X-API-Key" className="mono" />
          <TextField label="Value" value={auth.apiKey.value} onChange={(e) => setKey({ value: e.target.value })} placeholder="{{TOKEN}}" className="mono" />
          <SelectField label="Add to" value={auth.apiKey.addTo} onChange={(e) => setKey({ addTo: e.target.value })}><option value="header">Header</option><option value="query">Query params</option></SelectField>
        </div>
      )}
      {auth.type === 'bearer' && <TextField label="Token" value={auth.bearer.token} onChange={(e) => setBearer({ token: e.target.value })} placeholder="{{TOKEN}}" className="mono" />}
      {auth.type === 'basic' && (
        <div className="grid-2">
          <TextField label="Username" value={auth.basic.username} onChange={(e) => setBasic({ username: e.target.value })} />
          <TextField label="Password" type="password" value={auth.basic.password} onChange={(e) => setBasic({ password: e.target.value })} />
        </div>
      )}
    </div>
  );
}

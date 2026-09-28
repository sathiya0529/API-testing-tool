import { Send } from 'lucide-react';
import Button from '../ui/Button';
import { METHODS } from '../../utils/request';

export default function MethodUrlBar({ req, update, onSend, sending, urlPreview }) {
  return (
    <div className="req-bar">
      <select className={`method-select method-select-${req.method.toLowerCase()}`} value={req.method} onChange={(e) => update({ method: e.target.value })} aria-label="HTTP method">
        {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <div className="url-field">
        <input className="input url-input mono" value={req.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://api.example.com/users" aria-label="Request URL" spellCheck={false} />
        {urlPreview && urlPreview !== req.url && <div className="url-preview mono truncate" title={urlPreview}>{urlPreview}</div>}
      </div>
      <Button variant="primary" icon={Send} loading={sending} onClick={onSend}>Send</Button>
    </div>
  );
}

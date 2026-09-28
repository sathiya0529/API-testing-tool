import KeyValueEditor from '../ui/KeyValueEditor';

export default function HeadersPanel({ req, update }) {
  return (
    <div className="panel-block">
      <h3 className="panel-title">Headers</h3>
      <KeyValueEditor rows={req.headers} onChange={(headers) => update({ headers })} addLabel="Add Header" keyPlaceholder="Content-Type" valuePlaceholder="application/json" label="Headers" />
    </div>
  );
}

import KeyValueEditor from '../ui/KeyValueEditor';

export default function ParamsPanel({ req, update }) {
  return (
    <div className="panel-block">
      <h3 className="panel-title">Query Parameters</h3>
      <KeyValueEditor rows={req.params} onChange={(params) => update({ params })} addLabel="Add Parameter" keyPlaceholder="page" valuePlaceholder="1" label="Query parameters" />
    </div>
  );
}

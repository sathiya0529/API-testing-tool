import { useRef, useState } from 'react';
import { CheckCircle2, Download, FileJson, Upload, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { SelectField } from '../../components/ui/Fields';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { collectionApi } from '../../api/collectionApi';
import { getErrorMessage } from '../../api/errors';
import { downloadText } from '../../utils/download';

export default function ImportExportPage() {
  useDocumentTitle('Import / Export');
  const { collections, reloadCollections } = useWorkspace();
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exportTarget, setExportTarget] = useState('all');
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef(null);
  const list = collections.data || [];

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.json')) { setImportStatus({ ok: false, message: 'Please choose a .json collection file' }); return; }
    setImporting(true); setImportStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await collectionApi.importCollections(parsed);
      setImportStatus({ ok: true, message: `Imported ${result.collections} collection${result.collections === 1 ? '' : 's'} (${result.requests} requests)` });
      toast.success('Import successful');
      reloadCollections();
    } catch (e) { setImportStatus({ ok: false, message: e instanceof SyntaxError ? 'That file is not valid JSON' : getErrorMessage(e) }); }
    finally { setImporting(false); }
  };

  const doExport = async () => {
    setExporting(true);
    try {
      const ids = exportTarget === 'all' ? null : [exportTarget];
      const data = await collectionApi.exportCollections(ids);
      downloadText(exportTarget === 'all' ? 'api-tester-collections.json' : `${list.find((c) => c.id === exportTarget)?.name || 'collection'}.json`, JSON.stringify(data, null, 2), 'application/json');
      toast.success('Export downloaded');
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setExporting(false); }
  };

  return (
    <div className="page">
      <PageHeader title="Import / Export" description="Move collections in and out of API Tester as JSON files." />
      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Import</h2>
          <p className="muted small">Import a collection JSON file exported from API Tester.</p>
          <div className={`dropzone ${dragOver ? 'dragover' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()} aria-label="Drop a collection JSON file or browse">
            <FileJson size={26} aria-hidden="true" />
            <p><strong>Drag and drop</strong> a .json file here, or <span className="text-link-inline">browse</span></p>
            <input ref={fileRef} type="file" accept="application/json" className="sr-only" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          <Button icon={Upload} loading={importing} onClick={() => fileRef.current?.click()}>Browse file</Button>
          {importStatus && <div className={`alert ${importStatus.ok ? 'alert-ok' : 'alert-err'}`} role="status">{importStatus.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {importStatus.message}</div>}
        </section>
        <section className="card">
          <h2 className="card-title">Export</h2>
          <p className="muted small">Download your collections as a JSON file you can share or back up.</p>
          <SelectField label="What to export" value={exportTarget} onChange={(e) => setExportTarget(e.target.value)}>
            <option value="all">All collections</option>
            {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <Button variant="primary" icon={Download} loading={exporting} onClick={doExport} disabled={!list.length}>Export</Button>
        </section>
      </div>
    </div>
  );
}

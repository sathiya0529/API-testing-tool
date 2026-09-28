import { Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import { PRIVACY, TERMS, legalAsText } from '../../data/legal';
import { downloadText } from '../../utils/download';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

function LegalPage({ doc }) {
  const toast = useToast();
  useDocumentTitle(doc.title);
  const download = () => { downloadText(doc.file, legalAsText(doc)); toast.success(`${doc.title} downloaded`); };
  return (
    <div className="container page-public prose-page">
      <header className="public-head public-head-row">
        <div><h1>{doc.title}</h1><p>Last updated {doc.updated}</p></div>
        <Button icon={Download} onClick={download}>Download {doc.title}</Button>
      </header>
      <p className="lead">{doc.intro}</p>
      <nav className="toc" aria-label="Sections">
        <ol>{doc.sections.map(([h], i) => <li key={h}><a href={`#s${i + 1}`}>{h}</a></li>)}</ol>
      </nav>
      {doc.sections.map(([h, t], i) => (
        <section key={h} id={`s${i + 1}`} className="legal-section"><h2>{i + 1}. {h}</h2><p>{t}</p></section>
      ))}
    </div>
  );
}

export const PrivacyPage = () => <LegalPage doc={PRIVACY} />;
export const TermsPage = () => <LegalPage doc={TERMS} />;

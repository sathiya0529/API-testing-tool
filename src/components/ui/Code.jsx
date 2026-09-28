import { useMemo, useRef } from 'react';
import { tokenizeLine } from '../../utils/highlight';

const Tokens = ({ line, lang }) => tokenizeLine(line, lang).map((s, i) => (s.c ? <span key={i} className={s.c}>{s.t}</span> : s.t));
const MAX_LINES = 3000;

export function CodeViewer({ code, language = 'text', label = 'Code' }) {
  const lines = useMemo(() => code.split('\n'), [code]);
  const shown = lines.length > MAX_LINES ? lines.slice(0, MAX_LINES) : lines;
  return (
    <div className="code" role="region" aria-label={label} tabIndex={0}>
      {shown.map((l, i) => (
        <div className="code-line" key={i}>
          <span className="ln" aria-hidden="true">{i + 1}</span>
          <span className="lc"><Tokens line={l} lang={language} />{'\u200b'}</span>
        </div>
      ))}
      {lines.length > MAX_LINES && <div className="code-note">Showing the first {MAX_LINES} lines. Use Download to get the full response.</div>}
    </div>
  );
}

// Textarea layered over a highlighted <pre>, with a synced line-number gutter.
export function CodeEditor({ value, onChange, language = 'json', label = 'Editor', placeholder, height = 240 }) {
  const preRef = useRef(null);
  const gutterRef = useRef(null);
  const lines = value.split('\n');
  const sync = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    if (preRef.current) { preRef.current.scrollTop = scrollTop; preRef.current.scrollLeft = scrollLeft; }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };
  return (
    <div className="editor" style={{ height }}>
      <div className="editor-gutter" ref={gutterRef} aria-hidden="true">{lines.map((_, i) => <div key={i}>{i + 1}</div>)}<div className="editor-pad" /></div>
      <div className="editor-main">
        <pre className="editor-pre" ref={preRef} aria-hidden="true">
          {lines.map((l, i) => <div key={i}><Tokens line={l} lang={language} />{'\u200b'}</div>)}
        </pre>
        <textarea className="editor-input" value={value} onChange={(e) => onChange(e.target.value)} onScroll={sync} spellCheck={false}
          aria-label={label} placeholder={placeholder} autoCapitalize="off" autoCorrect="off" wrap="off" />
      </div>
    </div>
  );
}

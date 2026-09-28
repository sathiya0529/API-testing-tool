// Tiny tokenizers used by the response viewer and JSON editor.
const JSON_RE = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
const XML_RE = /(<!--.*?-->)|(<\/?)([\w:.-]+)|([\w:.-]+)(=)("[^"]*")|(\/?>)/g;

export function tokenizeLine(line, lang) {
  const out = [];
  let last = 0;
  const push = (t, c) => { if (t) out.push({ t, c }); };
  if (lang === 'json') {
    line.replace(JSON_RE, (m, str, colon, lit, offset) => {
      push(line.slice(last, offset));
      if (str) { push(str, colon ? 'tok-key' : 'tok-str'); push(colon); }
      else if (lit) push(m, 'tok-lit');
      else push(m, 'tok-num');
      last = offset + m.length;
      return m;
    });
  } else if (lang === 'xml') {
    line.replace(XML_RE, (m, comment, open, tag, attr, eq, val, close, offset) => {
      push(line.slice(last, offset));
      if (comment) push(comment, 'tok-com');
      else if (tag) { push(open, 'tok-punc'); push(tag, 'tok-tag'); }
      else if (attr) { push(attr, 'tok-attr'); push(eq, 'tok-punc'); push(val, 'tok-str'); }
      else push(close, 'tok-punc');
      last = offset + m.length;
      return m;
    });
  } else return [{ t: line }];
  push(line.slice(last));
  return out;
}

export function detectLanguage(contentType = '', body = '') {
  const ct = contentType.toLowerCase();
  if (ct.includes('json')) return 'json';
  if (ct.includes('xml') || ct.includes('html')) return 'xml';
  const s = body.trim();
  if (s.startsWith('{') || s.startsWith('[')) { try { JSON.parse(s); return 'json'; } catch { /* not json */ } }
  if (s.startsWith('<')) return 'xml';
  return 'text';
}

function formatXml(xml) {
  const parts = xml.replace(/>\s+</g, '><').replace(/></g, '>\n<').split('\n');
  let depth = 0;
  return parts.map((p) => {
    if (/^<\//.test(p)) depth = Math.max(0, depth - 1);
    const line = '  '.repeat(depth) + p;
    if (/^<[^!?/][^>]*[^/]>$/.test(p) && !/<\/.+>$/.test(p)) depth += 1;
    return line;
  }).join('\n');
}

export function formatBody(body, lang) {
  try {
    if (lang === 'json') return JSON.stringify(JSON.parse(body), null, 2);
    if (lang === 'xml') return formatXml(body);
  } catch { /* fall through to raw */ }
  return body;
}

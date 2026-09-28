const VAR = /\{\{\s*([\w.-]+)\s*\}\}/g;

export const varsFromEnvironment = (environment) =>
  Object.fromEntries((environment?.variables || []).filter((v) => v.enabled !== false && v.key).map((v) => [v.key, v.value]));

export const resolveVars = (text = '', vars = {}) =>
  String(text ?? '').replace(VAR, (m, k) => (k in vars ? vars[k] : m));

export const findUnresolved = (text = '', vars = {}) => {
  const out = new Set();
  String(text ?? '').replace(VAR, (m, k) => { if (!(k in vars)) out.add(k); return m; });
  return [...out];
};

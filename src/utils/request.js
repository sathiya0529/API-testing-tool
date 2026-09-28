import { uid } from './uid';
import { resolveVars } from './variables';

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export const row = (key = '', value = '', enabled = true) => ({ id: uid('kv'), key, value, enabled });

export const newRequestModel = (over = {}) => ({
  id: null,
  name: 'Untitled request',
  method: 'GET',
  url: '',
  params: [row()],
  headers: [row()],
  body: { type: 'none', json: '', raw: '', rawType: 'text/plain', form: [row()] },
  auth: { type: 'none', apiKey: { key: '', value: '', addTo: 'header' }, bearer: { token: '' }, basic: { username: '', password: '' } },
  tests: [],
  collectionId: null,
  folderId: null,
  ...over,
});

// Backend records may be partial; make sure the builder always has the full shape.
export const hydrateRequest = (r) => {
  const base = newRequestModel();
  return {
    ...base, ...r,
    params: r.params?.length ? r.params : base.params,
    headers: r.headers?.length ? r.headers : base.headers,
    body: { ...base.body, ...(r.body || {}), form: r.body?.form?.length ? r.body.form : base.body.form },
    auth: { ...base.auth, ...(r.auth || {}) },
    tests: r.tests || [],
  };
};

const active = (rows) => rows.filter((r) => r.enabled && r.key.trim());

export function buildUrlPreview(url, params, vars) {
  const base = resolveVars(url.trim(), vars);
  const qs = active(params).map((p) => `${encodeURIComponent(resolveVars(p.key, vars))}=${encodeURIComponent(resolveVars(p.value, vars))}`).join('&');
  if (!qs) return base;
  return base + (base.includes('?') ? '&' : '?') + qs;
}

// Shape sent to POST /requests/execute. Variables are resolved client-side.
export function toExecutePayload(req, vars, environmentId) {
  const r = (s) => resolveVars(s, vars);
  const obj = (rows) => Object.fromEntries(active(rows).map((x) => [r(x.key), r(x.value)]));
  const { body, auth } = req;
  return {
    requestId: req.id,
    name: req.name,
    environmentId: environmentId || null,
    method: req.method,
    url: r(req.url.trim()),
    params: obj(req.params),
    headers: obj(req.headers),
    body: body.type === 'none' ? { type: 'none' }
      : body.type === 'json' ? { type: 'json', content: r(body.json) }
      : body.type === 'raw' ? { type: 'raw', contentType: body.rawType, content: r(body.raw) }
      : { type: 'form-data', fields: obj(body.form) },
    auth: auth.type === 'none' ? { type: 'none' }
      : auth.type === 'bearer' ? { type: 'bearer', token: r(auth.bearer.token) }
      : auth.type === 'basic' ? { type: 'basic', username: r(auth.basic.username), password: r(auth.basic.password) }
      : { type: 'apikey', key: r(auth.apiKey.key), value: r(auth.apiKey.value), addTo: auth.apiKey.addTo },
    tests: req.tests,
  };
}

// Turn an executed payload (from history) back into an editable builder model.
export function requestFromPayload(p) {
  const rows = (o) => { const list = Object.entries(o || {}).map(([k, v]) => row(k, String(v))); return list.length ? list : [row()]; };
  const b = p.body || { type: 'none' };
  const a = p.auth || { type: 'none' };
  return newRequestModel({
    name: `${p.method} ${p.url}`,
    method: p.method, url: p.url,
    params: rows(p.params), headers: rows(p.headers),
    body: {
      type: b.type, json: b.type === 'json' ? b.content : '', raw: b.type === 'raw' ? b.content : '',
      rawType: b.contentType || 'text/plain', form: rows(b.fields),
    },
    auth: {
      type: a.type,
      apiKey: { key: a.key || '', value: a.value || '', addTo: a.addTo || 'header' },
      bearer: { token: a.token || '' },
      basic: { username: a.username || '', password: a.password || '' },
    },
    tests: p.tests || [],
  });
}

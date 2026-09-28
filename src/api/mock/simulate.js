// Pretends to be "the internet" so the request builder has something realistic to display.
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];
const products = [
  { id: 1, name: 'Mechanical Keyboard', price: 89.0, stock: 24 },
  { id: 2, name: 'USB-C Hub', price: 39.5, stock: 112 },
  { id: 3, name: 'Monitor Arm', price: 64.9, stock: 8 },
];
const STATUS = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 500: 'Internal Server Error', 503: 'Service Unavailable' };

export function simulateHttp(p) {
  let path = '/';
  let host = '';
  try { const u = new URL(p.url); path = u.pathname; host = u.hostname; } catch { return out(400, { error: 'Invalid URL', message: `Could not parse "${p.url}"` }); }
  let payload = null;
  try { payload = p.body?.type === 'json' ? JSON.parse(p.body.content || 'null') : null; } catch { return out(400, { error: 'Malformed JSON body' }); }
  const hasAuth = p.auth?.type && p.auth.type !== 'none' || Object.keys(p.headers || {}).some((h) => h.toLowerCase() === 'authorization');
  const m = p.method;

  if (host.includes('down') || path.startsWith('/error')) return out(503, { error: 'Service unavailable' });
  if (path.startsWith('/secure') && !hasAuth) return out(401, { error: 'Missing credentials' });
  if (path.endsWith('.xml') || path === '/xml') {
    return { ...out(200, null), contentType: 'application/xml; charset=utf-8', body: '<?xml version="1.0" encoding="UTF-8"?><response><status>ok</status><users><user id="1"><name>John Doe</name></user><user id="2"><name>Jane Smith</name></user></users></response>' };
  }
  if (path.endsWith('.txt') || path === '/health') return { ...out(200, null), contentType: 'text/plain; charset=utf-8', body: 'OK' };
  if (path === '/auth/login' && m === 'POST') return out(200, { token: 'eyJhbGciOiJIUzI1NiJ9.mock.signature', tokenType: 'Bearer', expiresIn: 3600 });
  if (path === '/users') {
    if (m === 'GET') return out(200, { users, page: Number(p.params?.page || 1), limit: Number(p.params?.limit || 10), total: 2 });
    if (m === 'POST') return out(201, { id: 3, ...(payload || {}), createdAt: new Date().toISOString() });
  }
  const um = path.match(/^\/users\/(\d+)$/);
  if (um) {
    const id = Number(um[1]);
    if (id > 10) return out(404, { error: 'User not found', id });
    if (m === 'GET') return out(200, users.find((u) => u.id === id) || { id, name: `User ${id}`, email: `user${id}@example.com` });
    if (m === 'PUT' || m === 'PATCH') return out(200, { id, ...(payload || {}), updatedAt: new Date().toISOString() });
    if (m === 'DELETE') return out(200, { deleted: true, id });
  }
  if (path === '/products' && m === 'GET') return out(200, { products, total: products.length });
  const pm = path.match(/^\/products\/(\d+)$/);
  if (pm) { const f = products.find((x) => x.id === Number(pm[1])); return f ? out(200, f) : out(404, { error: 'Product not found' }); }
  if (m === 'POST') return out(201, { id: Math.floor(Math.random() * 9000) + 1000, ...(payload || {}), status: 'created' });
  if (m === 'DELETE') return out(200, { deleted: true });
  return out(200, { message: 'OK', method: m, path });
}

function out(status, json) {
  const body = json === null ? '' : JSON.stringify(json);
  const time = Math.round(120 + Math.random() * 320 + (status >= 500 ? 700 : 0));
  return {
    status, statusText: STATUS[status] || '', contentType: 'application/json; charset=utf-8', body, time,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
      'x-request-id': Math.random().toString(16).slice(2, 14),
      server: 'mock-upstream/1.0',
      date: new Date().toUTCString(),
    },
    cookies: status < 400 ? [{ name: 'session_id', value: Math.random().toString(36).slice(2, 12), path: '/', httpOnly: true, secure: true }] : [],
  };
}

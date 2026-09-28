import { AxiosError } from 'axios';
import { getDb, saveDb } from './mockDb';
import { simulateHttp } from './simulate';
import { evaluateAssertions, validateResponse } from './evaluate';
import { mockBus } from './mockBus';
import { uid } from '../../utils/uid';
import { toExecutePayload, hydrateRequest } from '../../utils/request';
import { varsFromEnvironment } from '../../utils/variables';
import { pathOf } from '../../utils/format';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
const ok = (data, status = 200) => ({ status, data });

const publicUser = ({ password, ...u }) => u;
const SESSION_MS = 8 * 60 * 60 * 1000;

function authUser(ctx) {
  const db = getDb();
  const token = (ctx.headers.Authorization || ctx.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const s = db.sessions[token];
  if (!s || s.expiresAt < Date.now()) fail(401, 'Your session has expired. Please log in again.');
  return db.users.find((u) => u.id === s.userId) || fail(401, 'Session invalid');
}

function notify(type, message) {
  const db = getDb();
  const n = { id: uid('n'), type, message, createdAt: new Date().toISOString(), read: false };
  db.notifications.unshift(n);
  db.notifications = db.notifications.slice(0, 50);
  saveDb();
  mockBus.emit(type, n);
}

const nested = (db, c) => ({ ...c, requests: db.requests.filter((r) => r.collectionId === c.id) });
const need = (v, msg = 'Not found') => v || fail(404, msg);

function runAgainst(db, request) {
  const env = db.environments[0];
  const payload = toExecutePayload(hydrateRequest(request), varsFromEnvironment(env), env?.id);
  return { payload, res: simulateHttp(payload) };
}

function runTestRecord(db, test) {
  const request = need(db.requests.find((r) => r.id === test.requestId), 'The request for this test no longer exists');
  const { res } = runAgainst(db, request);
  const results = evaluateAssertions(test.assertions, res);
  const passed = results.filter((r) => r.passed).length;
  test.lastRun = { status: passed === results.length ? 'passed' : 'failed', passed, total: results.length, results, ranAt: new Date().toISOString(), duration: res.time };
  return test;
}

const routes = [];
const route = (method, pattern, handler, { public: isPublic = false } = {}) => {
  const keys = [];
  const rx = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; })}$`);
  routes.push({ method, rx, keys, handler, isPublic });
};

/* ---------- auth ---------- */
route('POST', '/auth/register', ({ body }) => {
  const db = getDb();
  if (!body?.name || !body?.email || !body?.password) fail(422, 'Name, email and password are required.');
  if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) fail(409, 'An account with this email already exists.');
  db.users.push({ id: uid('u'), name: body.name, email: body.email, password: body.password, username: body.email.split('@')[0], role: 'Developer', avatarUrl: null, twoFactorEnabled: true, createdAt: new Date().toISOString() });
  saveDb();
  return ok({ message: 'Account created. Sign in to continue.' }, 201);
}, { public: true });

route('POST', '/auth/login', ({ body }) => {
  const db = getDb();
  const u = db.users.find((x) => x.email.toLowerCase() === (body?.email || '').toLowerCase());
  if (!u || u.password !== body.password) fail(401, 'Invalid email or password.');
  const challengeId = uid('ch');
  db.challenges[challengeId] = { userId: u.id, code: '123456', expiresAt: Date.now() + 5 * 60000 };
  saveDb();
  return ok({ otpRequired: true, challengeId, email: u.email, expiresIn: 60 });
}, { public: true });

route('POST', '/auth/verify-otp', ({ body }) => {
  const db = getDb();
  const ch = db.challenges[body?.challengeId];
  if (!ch || ch.expiresAt < Date.now()) fail(400, 'This code has expired. Request a new one.');
  if (String(body.otp) !== ch.code) fail(400, 'That code is not correct. Try again.');
  delete db.challenges[body.challengeId];
  const token = `mock.${uid('jwt')}`;
  db.sessions[token] = { userId: ch.userId, expiresAt: Date.now() + SESSION_MS };
  saveDb();
  return ok({ user: publicUser(db.users.find((u) => u.id === ch.userId)), token });
}, { public: true });

route('POST', '/auth/resend-otp', ({ body }) => {
  const db = getDb();
  const ch = db.challenges[body?.challengeId] || fail(400, 'Verification request not found. Sign in again.');
  ch.expiresAt = Date.now() + 5 * 60000; saveDb();
  return ok({ expiresIn: 60 });
}, { public: true });

route('GET', '/auth/me', (ctx) => ok({ user: publicUser(authUser(ctx)) }));
route('POST', '/auth/logout', (ctx) => {
  const db = getDb();
  const token = (ctx.headers.Authorization || '').replace(/^Bearer\s+/i, '');
  delete db.sessions[token]; saveDb();
  return ok({ message: 'Signed out' });
}, { public: true });

route('POST', '/auth/google/mock', () => {
  const db = getDb();
  const token = `mock.${uid('jwt')}`;
  db.sessions[token] = { userId: db.users[0].id, expiresAt: Date.now() + SESSION_MS };
  saveDb();
  return ok({ user: publicUser(db.users[0]), token });
}, { public: true });

route('POST', '/__mock/expire-session', () => { const db = getDb(); db.sessions = {}; saveDb(); return ok({ expired: true }); }, { public: true });

/* ---------- collections ---------- */
route('GET', '/collections/export', ({ query }) => {
  const db = getDb();
  const ids = query.ids ? String(query.ids).split(',') : null;
  const cols = db.collections.filter((c) => !ids || ids.includes(c.id)).map((c) => nested(db, c));
  return ok({ format: 'api-tester', version: 1, exportedAt: new Date().toISOString(), collections: cols });
});
route('POST', '/collections/import', ({ body }) => {
  const db = getDb();
  const list = body?.collections;
  if (!Array.isArray(list) || !list.length) fail(422, 'No collections found in the file.');
  let requests = 0;
  list.forEach((c) => {
    const colId = uid('col');
    const folderMap = {};
    const folders = (c.folders || []).map((f) => { const id = uid('fld'); folderMap[f.id || f.name] = id; folderMap[f.name] = id; return { id, name: f.name }; });
    db.collections.push({ id: colId, name: c.name, description: c.description || '', folders });
    (c.requests || []).forEach((r) => {
      requests += 1;
      db.requests.push({ ...hydrateRequest({}), ...r, id: uid('rq'), collectionId: colId, folderId: folderMap[r.folderId] || folderMap[r.folder] || null });
    });
  });
  saveDb();
  notify('collectionImported', `Imported ${list.length} collection${list.length > 1 ? 's' : ''} (${requests} requests)`);
  return ok({ collections: list.length, requests }, 201);
});
route('GET', '/collections', () => { const db = getDb(); return ok(db.collections.map((c) => nested(db, c))); });
route('POST', '/collections', ({ body }) => {
  const db = getDb();
  if (!body?.name?.trim()) fail(422, 'Collection name is required.');
  const c = { id: uid('col'), name: body.name.trim(), description: body.description || '', folders: [] };
  db.collections.push(c); saveDb(); return ok(nested(db, c), 201);
});
route('PUT', '/collections/:id', ({ params, body }) => {
  const db = getDb(); const c = need(db.collections.find((x) => x.id === params.id));
  if (body.name !== undefined) c.name = body.name.trim() || c.name;
  if (body.description !== undefined) c.description = body.description;
  saveDb(); return ok(nested(db, c));
});
route('DELETE', '/collections/:id', ({ params }) => {
  const db = getDb(); need(db.collections.find((x) => x.id === params.id));
  const removed = db.requests.filter((r) => r.collectionId === params.id).map((r) => r.id);
  db.collections = db.collections.filter((c) => c.id !== params.id);
  db.requests = db.requests.filter((r) => r.collectionId !== params.id);
  db.tests = db.tests.filter((t) => !removed.includes(t.requestId));
  saveDb(); return ok({ deleted: true });
});
route('POST', '/collections/:id/folders', ({ params, body }) => {
  const db = getDb(); const c = need(db.collections.find((x) => x.id === params.id));
  if (!body?.name?.trim()) fail(422, 'Folder name is required.');
  c.folders.push({ id: uid('fld'), name: body.name.trim() }); saveDb(); return ok(nested(db, c), 201);
});
route('PUT', '/collections/:id/folders/:fid', ({ params, body }) => {
  const db = getDb(); const c = need(db.collections.find((x) => x.id === params.id));
  const f = need(c.folders.find((x) => x.id === params.fid)); f.name = body.name.trim() || f.name; saveDb(); return ok(nested(db, c));
});
route('DELETE', '/collections/:id/folders/:fid', ({ params }) => {
  const db = getDb(); const c = need(db.collections.find((x) => x.id === params.id));
  c.folders = c.folders.filter((f) => f.id !== params.fid);
  db.requests.forEach((r) => { if (r.folderId === params.fid) r.folderId = null; });
  saveDb(); return ok(nested(db, c));
});

/* ---------- requests & history ---------- */
route('POST', '/requests/execute', ({ body }) => {
  const db = getDb();
  if (!body?.url) fail(422, 'A URL is required.');
  const res = simulateHttp(body);
  const size = new Blob([res.body]).size;
  const testResults = evaluateAssertions(body.tests || [], res);
  const entry = {
    id: uid('h'), createdAt: new Date().toISOString(), method: body.method, url: body.url, endpoint: pathOf(body.url),
    status: res.status, time: res.time, size, request: { ...body, tests: body.tests || [] },
  };
  db.history.unshift(entry); db.history = db.history.slice(0, 200);
  db.stats.total += 1; db.stats.totalTime += res.time; if (res.status >= 400) db.stats.failed += 1;
  saveDb();
  notify('requestCompleted', `${body.method} ${entry.endpoint} completed with ${res.status} in ${res.time} ms`);
  return { status: 200, data: { ...res, size, testResults, validation: validateResponse(res), historyId: entry.id, executedAt: entry.createdAt }, delay: Math.min(res.time, 700) };
});
route('POST', '/requests/:id/duplicate', ({ params }) => {
  const db = getDb(); const r = need(db.requests.find((x) => x.id === params.id));
  const copy = { ...JSON.parse(JSON.stringify(r)), id: uid('rq'), name: `${r.name} (copy)` };
  db.requests.push(copy); saveDb(); return ok(copy, 201);
});
route('POST', '/requests', ({ body }) => {
  const db = getDb();
  if (!body?.collectionId || !db.collections.some((c) => c.id === body.collectionId)) fail(422, 'Choose a collection for this request.');
  if (!body.name?.trim()) fail(422, 'Request name is required.');
  const r = { ...body, id: uid('rq') };
  db.requests.push(r); saveDb(); return ok(r, 201);
});
route('GET', '/requests/:id', ({ params }) => ok(need(getDb().requests.find((x) => x.id === params.id), 'Request not found')));
route('PUT', '/requests/:id', ({ params, body }) => {
  const db = getDb(); const i = db.requests.findIndex((x) => x.id === params.id); need(i >= 0 || null, 'Request not found');
  db.requests[i] = { ...db.requests[i], ...body, id: params.id }; saveDb(); return ok(db.requests[i]);
});
route('DELETE', '/requests/:id', ({ params }) => {
  const db = getDb(); need(db.requests.find((x) => x.id === params.id), 'Request not found');
  db.requests = db.requests.filter((r) => r.id !== params.id);
  db.tests = db.tests.filter((t) => t.requestId !== params.id);
  saveDb(); return ok({ deleted: true });
});
route('GET', '/history', () => ok(getDb().history));
route('DELETE', '/history/:id', ({ params }) => { const db = getDb(); db.history = db.history.filter((h) => h.id !== params.id); saveDb(); return ok({ deleted: true }); });
route('DELETE', '/history', () => { const db = getDb(); db.history = []; saveDb(); return ok({ cleared: true }); });

/* ---------- environments ---------- */
route('GET', '/environments', () => ok(getDb().environments));
route('POST', '/environments', ({ body }) => {
  const db = getDb();
  if (!body?.name?.trim()) fail(422, 'Environment name is required.');
  if (db.environments.some((e) => e.name.toLowerCase() === body.name.trim().toLowerCase())) fail(409, 'An environment with this name already exists.');
  const e = { id: uid('env'), name: body.name.trim(), variables: body.variables || [] };
  db.environments.push(e); saveDb(); notify('environmentChanged', `Environment "${e.name}" was created`); return ok(e, 201);
});
route('PUT', '/environments/:id', ({ params, body }) => {
  const db = getDb(); const e = need(db.environments.find((x) => x.id === params.id));
  if (db.environments.some((x) => x.id !== e.id && x.name.toLowerCase() === (body.name || '').trim().toLowerCase())) fail(409, 'An environment with this name already exists.');
  Object.assign(e, { name: body.name?.trim() || e.name, variables: body.variables ?? e.variables });
  saveDb(); notify('environmentChanged', `Environment "${e.name}" was updated`); return ok(e);
});
route('DELETE', '/environments/:id', ({ params }) => {
  const db = getDb(); need(db.environments.find((x) => x.id === params.id));
  if (db.environments.length === 1) fail(409, 'You need at least one environment.');
  db.environments = db.environments.filter((e) => e.id !== params.id); saveDb(); return ok({ deleted: true });
});

/* ---------- tests ---------- */
route('POST', '/tests/run-all', () => {
  const db = getDb();
  db.tests.forEach((t) => { try { runTestRecord(db, t); } catch { /* request removed */ } });
  saveDb();
  const failed = db.tests.filter((t) => t.lastRun?.status === 'failed').length;
  notify(failed ? 'testFailed' : 'testPassed', failed ? `${failed} of ${db.tests.length} tests failed` : `All ${db.tests.length} tests passed`);
  return { status: 200, data: db.tests, delay: 500 };
});
route('POST', '/tests/:id/run', ({ params }) => {
  const db = getDb(); const t = runTestRecord(db, need(db.tests.find((x) => x.id === params.id))); saveDb();
  notify(t.lastRun.status === 'passed' ? 'testPassed' : 'testFailed', `${t.name}: ${t.lastRun.passed}/${t.lastRun.total} passed`);
  return { status: 200, data: t, delay: 300 };
});
route('GET', '/tests', () => ok(getDb().tests));
route('POST', '/tests', ({ body }) => {
  const db = getDb();
  if (!body?.name?.trim()) fail(422, 'Test name is required.');
  if (!body.requestId) fail(422, 'Choose the request this test runs against.');
  if (!body.assertions?.length) fail(422, 'Add at least one assertion.');
  const t = { id: uid('ts'), name: body.name.trim(), requestId: body.requestId, assertions: body.assertions, lastRun: null };
  db.tests.push(t); saveDb(); return ok(t, 201);
});
route('PUT', '/tests/:id', ({ params, body }) => {
  const db = getDb(); const t = need(db.tests.find((x) => x.id === params.id));
  Object.assign(t, { name: body.name ?? t.name, requestId: body.requestId ?? t.requestId, assertions: body.assertions ?? t.assertions, lastRun: null });
  saveDb(); return ok(t);
});
route('DELETE', '/tests/:id', ({ params }) => { const db = getDb(); db.tests = db.tests.filter((t) => t.id !== params.id); saveDb(); return ok({ deleted: true }); });

/* ---------- users ---------- */
route('GET', '/users/profile', (ctx) => ok({ user: publicUser(authUser(ctx)) }));
route('PUT', '/users/profile', (ctx) => {
  const u = authUser(ctx); const { name, username } = ctx.body || {};
  if (name !== undefined && !name.trim()) fail(422, 'Name cannot be empty.');
  if (username !== undefined && !/^[a-z0-9_.-]{3,24}$/i.test(username)) fail(422, 'Username must be 3-24 characters: letters, numbers, dots, dashes or underscores.');
  if (name !== undefined) u.name = name.trim();
  if (username !== undefined) u.username = username;
  saveDb(); return ok({ user: publicUser(u) });
});
route('POST', '/users/profile/picture', async (ctx) => {
  const u = authUser(ctx);
  const file = ctx.body instanceof FormData ? ctx.body.get('avatar') : null;
  if (!file) fail(422, 'No image was uploaded.');
  u.avatarUrl = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
  saveDb(); return ok({ avatarUrl: u.avatarUrl });
});
route('DELETE', '/users/profile/picture', (ctx) => { const u = authUser(ctx); u.avatarUrl = null; saveDb(); return ok({ avatarUrl: null }); });

/* ---------- analytics ---------- */
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function series(days, base, spread, seedOffset = 0) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    const wave = Math.sin((i + seedOffset) * 1.7) * 0.5 + Math.cos((i + seedOffset) * 0.6) * 0.5;
    return { label: days <= 7 ? DAY[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`, value: Math.round(base + wave * spread) };
  });
}
route('GET', '/analytics/dashboard', () => {
  const db = getDb(); const s = db.stats;
  return ok({
    totals: { total: s.total, successRate: +(((s.total - s.failed) / s.total) * 100).toFixed(1), avgResponse: Math.round(s.totalTime / s.total), failed: s.failed },
    trends: { total: 12, successRate: 5, avgResponse: -3, failed: -42 },
    activity: series(7, 62, 34, 1), responseTimes: series(7, 260, 130, 4), recent: db.history.slice(0, 5),
  });
});
route('GET', '/analytics/performance', ({ query }) => {
  const db = getDb(); const days = Number(query.range) || 7; const s = db.stats;
  const timed = [...db.history].sort((a, b) => a.time - b.time);
  const byEndpoint = {};
  db.history.forEach((h) => { const k = `${h.method} ${h.endpoint}`; (byEndpoint[k] ||= []).push(h.time); });
  const endpoints = Object.entries(byEndpoint).map(([name, t]) => ({ name, avg: Math.round(t.reduce((a, b) => a + b, 0) / t.length), calls: t.length })).sort((a, b) => b.avg - a.avg);
  return ok({
    avgResponse: Math.round(s.totalTime / s.total), successRate: +(((s.total - s.failed) / s.total) * 100).toFixed(1), failed: s.failed, total: s.total,
    fastest: timed[0] ? { name: `${timed[0].method} ${timed[0].endpoint}`, time: timed[0].time } : null,
    slowest: timed.length ? { name: `${timed.at(-1).method} ${timed.at(-1).endpoint}`, time: timed.at(-1).time } : null,
    trend: series(days, 230, 90, days), endpoints: endpoints.slice(0, 6),
  });
});

/* ---------- notifications ---------- */
route('GET', '/notifications', () => ok(getDb().notifications));
route('PUT', '/notifications/read-all', () => { const db = getDb(); db.notifications.forEach((n) => { n.read = true; }); saveDb(); return ok({ ok: true }); });
route('PUT', '/notifications/:id/read', ({ params }) => { const db = getDb(); const n = db.notifications.find((x) => x.id === params.id); if (n) n.read = true; saveDb(); return ok({ ok: true }); });

/* ---------- dispatcher ---------- */
export async function dispatch(config) {
  const method = config.method.toUpperCase();
  const [rawPath, search = ''] = (config.url || '').split('?');
  const path = rawPath.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api(?=\/)/, '');
  const query = { ...Object.fromEntries(new URLSearchParams(search)), ...(config.params || {}) };
  let body = config.data;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { /* keep string */ } }
  const headers = typeof config.headers?.toJSON === 'function' ? config.headers.toJSON() : { ...config.headers };

  for (const r of routes) {
    if (r.method !== method) continue;
    const m = path.match(r.rx);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const ctx = { params, query, body, headers };
    if (!r.isPublic) authUser(ctx);
    return r.handler(ctx);
  }
  fail(404, `No mock route for ${method} ${path}`);
}

export function toAxiosError(e, config) {
  const status = e instanceof HttpError ? e.status : 500;
  const message = e instanceof HttpError ? e.message : 'Unexpected mock error';
  const response = { status, statusText: '', data: { message }, headers: {}, config, request: {} };
  return new AxiosError(message, status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, {}, response);
}

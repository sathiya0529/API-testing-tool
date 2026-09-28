// In-browser stand-in for the backend database. Used ONLY when VITE_USE_MOCK_API=true.
import { uid } from '../../utils/uid';

const KEY = 'apit.mockdb.v2';
const ago = (min) => new Date(Date.now() - min * 60000).toISOString();
const kv = (key, value, enabled = true) => ({ id: uid('kv'), key, value, enabled });
const A = (type, target = '', expected = '') => ({ id: uid('as'), type, target, expected });

function req(id, colId, name, method, path, extra = {}) {
  return {
    id, collectionId: colId, folderId: null, name, method, url: `{{BASE_URL}}${path}`,
    params: [], headers: [kv('Content-Type', 'application/json'), kv('Authorization', 'Bearer {{TOKEN}}')],
    body: { type: 'none', json: '', raw: '', rawType: 'text/plain', form: [] },
    auth: { type: 'bearer', bearer: { token: '{{TOKEN}}' } },
    tests: [], ...extra,
  };
}

const hist = (id, min, method, url, status, time, size, extra = {}) => ({
  id, createdAt: ago(min), method, url: `https://api.example.com${url}`, endpoint: url, status, time, size,
  request: { method, url: `https://api.example.com${url}`, params: {}, headers: { 'Content-Type': 'application/json' }, body: { type: 'none' }, auth: { type: 'none' }, tests: [], ...extra },
});

function seed() {
  const users = [{
    id: 'u_1', name: 'Sathiya Kumar', email: 'demo@apitester.dev', password: 'Demo@1234', username: 'sathiya',
    role: 'Developer', avatarUrl: null, twoFactorEnabled: true, createdAt: ago(60 * 24 * 30),
  }];
  const getUsers = req('rq_1', 'col_1', 'Get Users', 'GET', '/users', {
    params: [kv('page', '1'), kv('limit', '10')],
    tests: [A('status_equals', '', '200'), A('body_contains_field', 'users'), A('response_time_lt', '', '1000')],
  });
  const collections = [
    { id: 'col_1', name: 'User Management', description: 'CRUD endpoints for user accounts', folders: [] },
    { id: 'col_2', name: 'Product APIs', description: 'Catalog and inventory', folders: [] },
    { id: 'col_3', name: 'Auth APIs', description: 'Login and token endpoints', folders: [] },
    { id: 'col_4', name: 'Payment APIs', description: 'Payments and refunds', folders: [] },
  ];
  const requests = [
    getUsers,
    req('rq_2', 'col_1', 'Create User', 'POST', '/users', { body: { type: 'json', json: '{\n  "name": "Alex Morgan",\n  "email": "alex@example.com"\n}', raw: '', rawType: 'text/plain', form: [] } }),
    req('rq_3', 'col_1', 'Update User', 'PUT', '/users/10', { body: { type: 'json', json: '{\n  "name": "Alex M."\n}', raw: '', rawType: 'text/plain', form: [] } }),
    req('rq_4', 'col_1', 'Delete User', 'DELETE', '/users/12'),
    req('rq_5', 'col_2', 'List Products', 'GET', '/products', { params: [kv('category', 'all')] }),
    req('rq_6', 'col_2', 'Get Product', 'GET', '/products/1'),
    req('rq_7', 'col_3', 'Login', 'POST', '/auth/login', { auth: { type: 'none' }, body: { type: 'json', json: '{\n  "email": "demo@apitester.dev",\n  "password": "secret"\n}', raw: '', rawType: 'text/plain', form: [] } }),
    req('rq_8', 'col_4', 'Create Payment', 'POST', '/payments', { body: { type: 'json', json: '{\n  "amount": 1200,\n  "currency": "INR"\n}', raw: '', rawType: 'text/plain', form: [] } }),
  ];
  const environments = [
    { id: 'env_1', name: 'Development', variables: [kv('BASE_URL', 'https://api.example.com'), kv('TOKEN', 'dev-token-4f9a1c')] },
    { id: 'env_2', name: 'Staging', variables: [kv('BASE_URL', 'https://staging-api.example.com'), kv('TOKEN', 'stg-token-82b7e0')] },
    { id: 'env_3', name: 'Production', variables: [kv('BASE_URL', 'https://prod-api.example.com'), kv('TOKEN', 'prod-token-c31d55')] },
  ];
  const history = [
    hist('h_1', 12, 'GET', '/users', 200, 245, 1229),
    hist('h_2', 15, 'POST', '/users', 201, 312, 1536),
    hist('h_3', 18, 'GET', '/products', 200, 198, 819),
    hist('h_4', 21, 'DELETE', '/users/12', 404, 142, 614),
    hist('h_5', 24, 'PUT', '/users/10', 200, 276, 1126),
    hist('h_6', 95, 'GET', '/products/1', 200, 187, 402),
    hist('h_7', 180, 'POST', '/auth/login', 200, 421, 388),
    hist('h_8', 60 * 26, 'GET', '/users', 200, 233, 1229),
    hist('h_9', 60 * 27, 'POST', '/payments', 503, 1180, 96),
  ];
  const tests = [{
    id: 'ts_1', name: 'Get Users - Status 200', requestId: 'rq_1',
    assertions: getUsers.tests,
    lastRun: {
      status: 'passed', passed: 3, total: 3, ranAt: ago(40), duration: 231,
      results: getUsers.tests.map((a) => ({ assertionId: a.id, passed: true, message: 'Passed' })),
    },
  }, {
    id: 'ts_2', name: 'Create User returns 201', requestId: 'rq_2',
    assertions: [A('status_equals', '', '201'), A('json_property_exists', 'id')], lastRun: null,
  }];
  const notifications = [
    { id: 'n_1', type: 'requestCompleted', message: 'GET /users completed with 200 in 245 ms', createdAt: ago(12), read: false },
    { id: 'n_2', type: 'testPassed', message: 'Get Users - Status 200 passed (3/3)', createdAt: ago(40), read: false },
    { id: 'n_3', type: 'systemNotification', message: 'Welcome to API Tester. Notifications appear here in real time.', createdAt: ago(600), read: true },
  ];
  return {
    users, sessions: {}, challenges: {}, collections, requests, environments, history, tests, notifications,
    stats: { total: 248, failed: 13, totalTime: 248 * 214 },
  };
}

let db = null;
export function getDb() {
  if (!db) {
    try { const raw = localStorage.getItem(KEY); db = raw ? JSON.parse(raw) : seed(); } catch { db = seed(); }
  }
  return db;
}
export function saveDb() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ } }
export function resetDb() { db = seed(); saveDb(); }

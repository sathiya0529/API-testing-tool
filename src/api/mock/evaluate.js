import { describeAssertion } from '../../data/assertions';

export function getPath(obj, path) {
  if (!path) return { found: false };
  const parts = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]; else return { found: false };
  }
  return { found: true, value: cur };
}

export function evaluateAssertions(assertions = [], res) {
  let json = null;
  try { json = JSON.parse(res.body); } catch { /* not json */ }
  return assertions.map((a) => {
    let passed = false, message = '';
    switch (a.type) {
      case 'status_equals':
        passed = res.status === Number(a.expected); message = passed ? 'Passed' : `Expected ${a.expected}, received ${res.status}`; break;
      case 'response_time_lt':
        passed = res.time < Number(a.expected); message = passed ? 'Passed' : `Took ${Math.round(res.time)}ms (limit ${a.expected}ms)`; break;
      case 'body_contains_field':
        passed = json ? (a.target in json || JSON.stringify(json).includes(`"${a.target}"`)) : res.body.includes(a.target);
        message = passed ? 'Passed' : `Field "${a.target}" not found`; break;
      case 'json_property_exists': {
        const r = getPath(json, a.target); passed = r.found; message = passed ? 'Passed' : `Property "${a.target}" not found`; break;
      }
      case 'json_property_equals': {
        const r = getPath(json, a.target); passed = r.found && String(r.value) === String(a.expected);
        message = passed ? 'Passed' : r.found ? `Expected ${a.expected}, received ${r.value}` : `Property "${a.target}" not found`; break;
      }
      default: message = 'Unknown assertion';
    }
    return { assertionId: a.id, name: describeAssertion(a), passed, message };
  });
}

export function validateResponse(res) {
  const out = [];
  if (res.status >= 500) out.push({ level: 'error', message: `Server error (${res.status}). The API failed to handle the request.` });
  else if (res.status >= 400) out.push({ level: 'error', message: `Client error (${res.status}). Check the URL, credentials and payload.` });
  else out.push({ level: 'success', message: `Status ${res.status} indicates success.` });
  if (res.time > 1000) out.push({ level: 'warning', message: `Response time ${Math.round(res.time)}ms is above 1000ms.` });
  else out.push({ level: 'success', message: `Response time ${Math.round(res.time)}ms is within 1000ms.` });
  if (res.contentType.includes('json')) {
    try { JSON.parse(res.body); out.push({ level: 'success', message: 'Response body is valid JSON.' }); }
    catch { out.push({ level: 'error', message: 'Content-Type is JSON but the body could not be parsed.' }); }
  }
  if (!res.body) out.push({ level: 'warning', message: 'Response body is empty.' });
  return out;
}

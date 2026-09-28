export const ASSERTION_TYPES = [
  { value: 'status_equals', label: 'Status code equals', target: null, expected: 'Status', placeholder: '200' },
  { value: 'body_contains_field', label: 'Response contains field', target: 'Field name', expected: null, targetPlaceholder: 'users' },
  { value: 'response_time_lt', label: 'Response time below', target: null, expected: 'Milliseconds', placeholder: '1000' },
  { value: 'json_property_exists', label: 'JSON property exists', target: 'JSON path', expected: null, targetPlaceholder: 'users.0.id' },
  { value: 'json_property_equals', label: 'JSON property equals', target: 'JSON path', expected: 'Expected value', targetPlaceholder: 'users.0.name', placeholder: 'John Doe' },
];

export const newAssertion = (type = 'status_equals') => ({
  id: `as_${Math.random().toString(36).slice(2, 8)}`,
  type,
  target: '',
  expected: type === 'status_equals' ? '200' : type === 'response_time_lt' ? '1000' : '',
});

export function describeAssertion(a) {
  switch (a.type) {
    case 'status_equals': return `Status code = ${a.expected}`;
    case 'body_contains_field': return `Response contains "${a.target}"`;
    case 'response_time_lt': return `Response time < ${a.expected}ms`;
    case 'json_property_exists': return `JSON property "${a.target}" exists`;
    case 'json_property_equals': return `"${a.target}" equals ${a.expected}`;
    default: return a.type;
  }
}

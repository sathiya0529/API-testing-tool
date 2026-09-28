export const MethodBadge = ({ method, block }) => (
  <span className={`method method-${method.toLowerCase()} ${block ? 'method-block' : ''}`}>{method}</span>
);

export const StatusBadge = ({ status }) => {
  const cls = status >= 500 ? 'err' : status >= 400 ? 'err' : status >= 300 ? 'info' : 'ok';
  return <span className={`status status-${cls}`}>{status}</span>;
};

export const Pill = ({ tone = 'neutral', children, ...rest }) => <span className={`pill pill-${tone}`} {...rest}>{children}</span>;

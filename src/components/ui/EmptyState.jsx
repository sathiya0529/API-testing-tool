export default function EmptyState({ icon: Icon, title, description, action, compact }) {
  return (
    <div className={`empty ${compact ? 'empty-compact' : ''}`}>
      {Icon && <span className="empty-icon"><Icon size={compact ? 20 : 26} aria-hidden="true" /></span>}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty empty-error" role="alert">
      <h3 className="empty-title">We could not load this</h3>
      <p className="empty-desc">{message}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

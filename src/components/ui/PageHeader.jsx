export default function PageHeader({ title, description, actions, icon: Icon }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{Icon && <Icon size={20} aria-hidden="true" />}{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

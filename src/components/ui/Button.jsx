import { Loader2 } from 'lucide-react';

export default function Button({ variant = 'secondary', size, icon: Icon, loading, disabled, children, className = '', type = 'button', ...rest }) {
  return (
    <button type={type} className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

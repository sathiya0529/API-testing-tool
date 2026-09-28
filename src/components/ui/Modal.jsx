import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, footer, size = 'md', role = 'dialog', bare = false }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const el = ref.current;
    const first = el.querySelector('[data-autofocus]') || el.querySelector('input, select, textarea') || el.querySelector('.modal-footer button:last-child') || el;
    first.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current?.(); }
      if (e.key === 'Tab') {
        const nodes = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
        if (!nodes.length) return;
        const a = nodes[0], b = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey, true); document.body.style.overflow = ''; previous?.focus?.(); };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal modal-${size}`} role={role} aria-modal="true" aria-labelledby={title ? titleId : undefined} ref={ref} tabIndex={-1}>
        {!bare && (
          <div className="modal-header">
            <h2 id={titleId} className="modal-title">{title}</h2>
            <button className="icon-btn modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
          </div>
        )}
        {bare ? children : <div className="modal-body">{children}</div>}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={busy ? undefined : onCancel} title={title} role="alertdialog" size="sm"
      footer={<><Button onClick={onCancel} disabled={busy}>{cancelLabel}</Button><Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={run}>{confirmLabel}</Button></>}>
      <p className="modal-text">{message}</p>
    </Modal>
  );
}

// Single text input dialog used for create / rename flows.
export function NameDialog({ open, title, label, initial = '', placeholder, submitLabel = 'Save', onSubmit, onClose }) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setValue(initial); setError(''); } }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) { setError(`${label} is required`); return; }
    setBusy(true);
    try { await onSubmit(value.trim()); onClose(); } catch { /* toast already shown */ } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} type="submit" form="name-dialog-form">{submitLabel}</Button></>}>
      <form id="name-dialog-form" onSubmit={submit} noValidate>
        <label className="label" htmlFor="name-dialog-input">{label}</label>
        <input id="name-dialog-input" className={`input ${error ? 'input-error' : ''}`} value={value} placeholder={placeholder}
          onChange={(e) => { setValue(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'name-dialog-err' : undefined} />
        {error && <p id="name-dialog-err" className="field-error">{error}</p>}
      </form>
    </Modal>
  );
}

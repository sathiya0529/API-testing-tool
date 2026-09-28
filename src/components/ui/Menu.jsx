import { useCallback, useRef, useState } from 'react';
import { useDismiss } from '../../hooks/useDismiss';

// Small popover menu. `button` = { className, content }, children may be a render function receiving close().
export function Menu({ label, button, children, align = 'left', panelClassName = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  return (
    <div className="menu" ref={ref}>
      <button type="button" className={button.className} aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        {button.content}
      </button>
      {open && <div className={`menu-panel menu-${align} ${panelClassName}`} role="menu">{typeof children === 'function' ? children(close) : children}</div>}
    </div>
  );
}

export function MenuItem({ icon: Icon, danger, children, onClick, ...rest }) {
  return (
    <button type="button" role="menuitem" className={`menu-item ${danger ? 'menu-item-danger' : ''}`} onClick={onClick} {...rest}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

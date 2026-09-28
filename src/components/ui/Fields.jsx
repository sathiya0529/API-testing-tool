import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const TextField = forwardRef(function TextField({ label, error, hint, className = '', id, ...rest }, ref) {
  const auto = useId(); const fid = id || auto;
  return (
    <div className={`field ${className}`}>
      {label && <label className="label" htmlFor={fid}>{label}</label>}
      <input id={fid} ref={ref} className={`input ${error ? 'input-error' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} {...rest} />
      {error ? <p id={`${fid}-e`} className="field-error">{error}</p> : hint ? <p id={`${fid}-h`} className="field-hint">{hint}</p> : null}
    </div>
  );
});

export const PasswordField = forwardRef(function PasswordField({ label, error, hint, className = '', id, ...rest }, ref) {
  const auto = useId(); const fid = id || auto;
  const [show, setShow] = useState(false);
  return (
    <div className={`field ${className}`}>
      {label && <label className="label" htmlFor={fid}>{label}</label>}
      <div className="input-wrap">
        <input id={fid} ref={ref} type={show ? 'text' : 'password'} className={`input input-pad-right ${error ? 'input-error' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} {...rest} />
        <button type="button" className="input-adorn icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <p id={`${fid}-e`} className="field-error">{error}</p> : hint ? <p id={`${fid}-h`} className="field-hint">{hint}</p> : null}
    </div>
  );
});

export function SelectField({ label, error, className = '', id, children, ...rest }) {
  const auto = useId(); const fid = id || auto;
  return (
    <div className={`field ${className}`}>
      {label && <label className="label" htmlFor={fid}>{label}</label>}
      <select id={fid} className={`input select ${error ? 'input-error' : ''}`} aria-invalid={!!error} {...rest}>{children}</select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, error, id, children, ...rest }) {
  const auto = useId(); const fid = id || auto;
  return (
    <div className="field">
      <label className="check" htmlFor={fid}>
        <input id={fid} type="checkbox" {...rest} />
        <span>{label || children}</span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }) {
  return (
    <button type="button" role="switch" id={id} aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="switch-knob" />
    </button>
  );
}

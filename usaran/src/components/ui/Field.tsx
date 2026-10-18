import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/format';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string, describedBy?: string) => ReactNode;
}

/** Wraps a control with label, hint and validation message. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const descId = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cx('field', className)}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="req" aria-hidden="true">*</span>}
        </label>
      )}
      {children(id, descId)}
      {error ? (
        <span id={descId} className="field__error" role="alert">{error}</span>
      ) : hint ? (
        <span id={descId} className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

type BaseProps = { label?: ReactNode; hint?: ReactNode; error?: string; fieldClassName?: string };

export function Input({ label, hint, error, required, fieldClassName, className, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      {(id, d) => <input id={id} aria-describedby={d} aria-invalid={error ? true : undefined} required={required} className={cx('input', className)} {...rest} />}
    </Field>
  );
}

export function Textarea({ label, hint, error, required, fieldClassName, className, ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      {(id, d) => <textarea id={id} aria-describedby={d} aria-invalid={error ? true : undefined} required={required} className={cx('textarea', className)} {...rest} />}
    </Field>
  );
}

export interface Option {
  value: string;
  label: string;
}

export function Select({ label, hint, error, required, fieldClassName, className, options, ...rest }: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      {(id, d) => (
        <select id={id} aria-describedby={d} aria-invalid={error ? true : undefined} required={required} className={cx('select', className)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({ label, className, ...rest }: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cx('check', className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Toggle({ label, description, checked, onChange }: { label: ReactNode; description?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>
        <span className="strong small" style={{ display: 'block', color: 'var(--navy-900)' }}>{label}</span>
        {description && <span className="xs muted">{description}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  );
}

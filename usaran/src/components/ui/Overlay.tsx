import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cx } from '../../lib/format';
import { Button } from './Button';

/* ---------- Modal ---------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('input, textarea, select, button:not(.modal__close)');
    first?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={cx('modal', size === 'lg' && 'modal--lg')} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Փակել">
            <X />
          </button>
        </div>
        {children && <div className="modal__body">{children}</div>}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Confirm dialog ---------- */

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'warning';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, text, confirmLabel, tone = 'danger' }: ConfirmProps) {
  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" style={{ maxWidth: 440 }}>
        <div className="modal__body" style={{ paddingTop: 24 }}>
          <div className={cx('confirm-icon', tone === 'warning' && 'confirm-icon--warning')}>{tone === 'danger' ? <Trash2 size={20} /> : <AlertTriangle size={20} />}</div>
          <h2 id="confirm-title" style={{ fontSize: 'var(--fs-lg)', marginBottom: 6 }}>{title}</h2>
          <p className="secondary small">{text}</p>
        </div>
        <div className="modal__footer">
          <Button variant="secondary" onClick={onClose} autoFocus>Չեղարկել</Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Dropdown ---------- */

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'left' | 'right';
  width?: number;
}

export function Dropdown({ trigger, children, align = 'right', width }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div className="dropdown" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={cx('dropdown__menu', align === 'left' && 'dropdown__menu--left')} role="menu" style={width ? { width } : undefined}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}

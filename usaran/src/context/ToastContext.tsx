import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { tr } from '../i18n';

type ToastTone = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  text?: string;
}

interface ToastApi {
  show: (tone: ToastTone, title: string, text?: string) => void;
  success: (title: string, text?: string) => void;
  warning: (title: string, text?: string) => void;
  error: (title: string, text?: string) => void;
  info: (title: string, text?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (tone: ToastTone, title: string, text?: string) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, title, text }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (a, b) => show('success', a, b),
      warning: (a, b) => show('warning', a, b),
      error: (a, b) => show('error', a, b),
      info: (a, b) => show('info', a, b),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div key={t.id} className={`toast toast--${t.tone}`} role="status">
              <Icon className="toast__icon" size={18} aria-hidden="true" />
              <div>
                <div className="toast__title">{t.title}</div>
                {t.text && <div className="toast__text">{t.text}</div>}
              </div>
              <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label={tr("Dismiss notification", "Փակել ծանուցումը")}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

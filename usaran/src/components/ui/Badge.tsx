import type { ReactNode } from 'react';
import { cx } from '../../lib/format';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export function Badge({ tone = 'neutral', dot, outline, children, className }: { tone?: Tone; dot?: boolean; outline?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('badge', tone !== 'neutral' && `badge--${tone}`, outline && 'badge--outline', className)}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  // assignments
  'not-started': { label: 'Չսկսված', tone: 'neutral' },
  draft: { label: 'Սևագիր', tone: 'info' },
  submitted: { label: 'Սպասում է գնահատման', tone: 'warning' },
  graded: { label: 'Գնահատված', tone: 'success' },
  returned: { label: 'Վերադարձված', tone: 'success' },
  overdue: { label: 'Ժամկետանց', tone: 'danger' },
  // courses / enrollment
  'in-progress': { label: 'Ընթացքում', tone: 'accent' },
  completed: { label: 'Ավարտված', tone: 'success' },
  published: { label: 'Հրապարակված', tone: 'success' },
  archived: { label: 'Արխիվացված', tone: 'neutral' },
  // quizzes
  available: { label: 'Հասանելի', tone: 'accent' },
  passed: { label: 'Հանձնված', tone: 'success' },
  failed: { label: 'Չհանձնված', tone: 'danger' },
  locked: { label: 'Փակ', tone: 'neutral' },
  // students
  active: { label: 'Ակտիվ', tone: 'success' },
  'at-risk': { label: 'Ռիսկային', tone: 'warning' },
  inactive: { label: 'Պասիվ', tone: 'neutral' },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = STATUS[status] ?? { label: status, tone: 'neutral' as Tone };
  return (
    <Badge tone={s.tone} dot>
      {label ?? s.label}
    </Badge>
  );
}

export function statusLabel(status: string): string {
  return STATUS[status]?.label ?? status;
}

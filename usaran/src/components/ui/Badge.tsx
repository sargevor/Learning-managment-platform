import type { ReactNode } from 'react';
import { cx } from '../../lib/format';
import { tr } from '../../i18n';

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
  'not-started': { label: tr("Not started", "Չսկսված"), tone: 'neutral' },
  draft: { label: tr("Draft", "Սևագիր"), tone: 'info' },
  submitted: { label: tr("Awaiting grading", "Սպասում է գնահատման"), tone: 'warning' },
  graded: { label: tr("Graded", "Գնահատված"), tone: 'success' },
  returned: { label: tr("Returned", "Վերադարձված"), tone: 'success' },
  overdue: { label: tr("Overdue", "Ժամկետանց"), tone: 'danger' },
  // courses / enrollment
  'in-progress': { label: tr("In progress", "Ընթացքում"), tone: 'accent' },
  completed: { label: tr("Completed", "Ավարտված"), tone: 'success' },
  published: { label: tr("Published", "Հրապարակված"), tone: 'success' },
  archived: { label: tr("Archived", "Արխիվացված"), tone: 'neutral' },
  // quizzes
  available: { label: tr("Available", "Հասանելի"), tone: 'accent' },
  passed: { label: tr("Passed", "Հանձնված"), tone: 'success' },
  failed: { label: tr("Not passed", "Չհանձնված"), tone: 'danger' },
  locked: { label: tr("Locked", "Փակ"), tone: 'neutral' },
  // students
  active: { label: tr("Active", "Ակտիվ"), tone: 'success' },
  'at-risk': { label: tr("At risk", "Ռիսկի գոտում"), tone: 'warning' },
  inactive: { label: tr("Inactive", "Ոչ ակտիվ"), tone: 'neutral' },
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

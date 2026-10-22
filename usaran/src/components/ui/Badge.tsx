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
  'not-started': { label: "Not started", tone: 'neutral' },
  draft: { label: "Draft", tone: 'info' },
  submitted: { label: "Awaiting grading", tone: 'warning' },
  graded: { label: "Graded", tone: 'success' },
  returned: { label: "Returned", tone: 'success' },
  overdue: { label: "Overdue", tone: 'danger' },
  // courses / enrollment
  'in-progress': { label: "In progress", tone: 'accent' },
  completed: { label: "Completed", tone: 'success' },
  published: { label: "Published", tone: 'success' },
  archived: { label: "Archived", tone: 'neutral' },
  // quizzes
  available: { label: "Available", tone: 'accent' },
  passed: { label: "Passed", tone: 'success' },
  failed: { label: "Not passed", tone: 'danger' },
  locked: { label: "Locked", tone: 'neutral' },
  // students
  active: { label: "Active", tone: 'success' },
  'at-risk': { label: "At risk", tone: 'warning' },
  inactive: { label: "Inactive", tone: 'neutral' },
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

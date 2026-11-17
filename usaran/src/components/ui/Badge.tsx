import type { ReactNode } from 'react';
import { BookOpen, Check, CircleAlert, Clock, FileText, Lock, Minus, Play, Send, Sparkles, Trophy, X } from 'lucide-react';
import { cx } from '../../lib/format';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export function Badge({ tone = 'neutral', dot, outline, icon, children, className }: { tone?: Tone; dot?: boolean; outline?: boolean; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx('badge', tone !== 'neutral' && `badge--${tone}`, outline && 'badge--outline', className)}>
      {icon ? <span className="badge__icon" aria-hidden="true">{icon}</span> : dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

type Icon = typeof Check;

/* Calm palette: grey for neutral states, blue for good/active, red only for problems. */
const STATUS: Record<string, { label: string; tone: Tone; icon: Icon }> = {
  // assignments
  'not-started': { label: 'New', tone: 'neutral', icon: Sparkles },
  draft: { label: 'Draft', tone: 'neutral', icon: FileText },
  submitted: { label: 'Sent', tone: 'neutral', icon: Send },
  graded: { label: 'Graded', tone: 'accent', icon: Check },
  returned: { label: 'Returned', tone: 'accent', icon: Check },
  overdue: { label: 'Overdue', tone: 'danger', icon: Clock },
  // courses / enrollment
  'in-progress': { label: 'Active', tone: 'accent', icon: Play },
  completed: { label: 'Done', tone: 'accent', icon: Trophy },
  published: { label: 'Published', tone: 'accent', icon: Check },
  archived: { label: 'Archived', tone: 'neutral', icon: Minus },
  // quizzes
  available: { label: 'Open', tone: 'accent', icon: BookOpen },
  passed: { label: 'Passed', tone: 'accent', icon: Check },
  failed: { label: 'Not passed', tone: 'danger', icon: X },
  locked: { label: 'Locked', tone: 'neutral', icon: Lock },
  // students
  active: { label: 'Active', tone: 'accent', icon: Check },
  'at-risk': { label: 'At risk', tone: 'danger', icon: CircleAlert },
  inactive: { label: 'Inactive', tone: 'neutral', icon: Minus },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = STATUS[status];
  if (!s) return <Badge>{label ?? status}</Badge>;
  const I = s.icon;
  return (
    <Badge tone={s.tone} icon={<I />}>
      {label ?? s.label}
    </Badge>
  );
}

export function statusLabel(status: string): string {
  return STATUS[status]?.label ?? status;
}

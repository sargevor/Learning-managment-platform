import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../lib/format';

/*
  Visual building blocks of the redesign ("show, don't write").
  Styles live in styles/redesign.css under the `v-` prefix.
  Palette: navy, one blue, greys; red only for urgent/overdue.
*/

type BoxTone = 'grey' | 'white' | 'navy' | 'blue' | 'red' | 'glass';

/** Square icon box: grey with a navy icon by default. */
export function IconBox({ icon, size = 'md', tone = 'grey', className }: { icon: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: BoxTone; className?: string }) {
  return (
    <span className={cx('v-iconbox', `v-iconbox--${size}`, `v-tone--${tone}`, className)} aria-hidden="true">
      {icon}
    </span>
  );
}

/** Small pill with an optional icon: "2 d", "Programming", "80%". */
export function Chip({ icon, tone = 'grey', children, className, title }: { icon?: ReactNode; tone?: BoxTone; children?: ReactNode; className?: string; title?: string }) {
  return (
    <span className={cx('v-chip', `v-tone--${tone}`, className)} title={title}>
      {icon}
      {children}
    </span>
  );
}

/** Progress ring drawn with a conic gradient; the centre shows `children` or the percentage. */
export function Ring({ value, size = 56, thickness, color = 'var(--accent-600)', track = 'var(--accent-100)', inner = 'var(--surface)', label, children, className }: { value: number; size?: number; thickness?: number; color?: string; track?: string; inner?: string; label?: string; children?: ReactNode; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const t = thickness ?? Math.max(5, Math.round(size * 0.12));
  return (
    <span
      className={cx('v-ring', className)}
      role="img"
      aria-label={`${label ?? 'Progress'}: ${v}%`}
      style={{ width: size, height: size, background: `conic-gradient(${color} 0 ${v}%, ${track} 0)` }}
    >
      <span className="v-ring__inner" style={{ inset: t, background: inner, fontSize: Math.max(11, Math.round(size * 0.24)) }}>
        {children ?? `${v}%`}
      </span>
    </span>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Date block: big day number over a short month. Red when urgent. */
export function DateBlock({ date, urgent, size = 'md' }: { date: string; urgent?: boolean; size?: 'sm' | 'md' }) {
  const d = new Date(date);
  return (
    <span className={cx('v-date', urgent && 'v-date--urgent', size === 'sm' && 'v-date--sm')}>
      <b>{d.getDate()}</b>
      <span>{MONTHS[d.getMonth()]}</span>
    </span>
  );
}

/** Section heading with an optional "All >" link or custom action. */
export function SectionHead({ title, to, linkLabel = 'All', action, as: Tag = 'h2' }: { title: ReactNode; to?: string; linkLabel?: string; action?: ReactNode; as?: 'h2' | 'h3' }) {
  return (
    <div className="v-section-head">
      <Tag>{title}</Tag>
      {action}
      {to && (
        <Link to={to} className="v-more">
          {linkLabel}
          <ChevronRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Thin horizontal meter (HTML bar). */
export function Meter({ value, color = 'var(--accent-600)', label, height = 8 }: { value: number; color?: string; label?: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="v-meter" style={{ height }} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
      <span style={{ width: `${v}%`, background: color }} />
    </span>
  );
}

/** One line at the bottom of app pages marking sample data. */
export function DemoNote({ text = 'Demo workspace with sample data' }: { text?: string }) {
  return <p className="v-demo-note">{text}</p>;
}

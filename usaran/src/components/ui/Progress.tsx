import { cx } from '../../lib/format';

function toneFor(value: number, auto?: boolean) {
  if (!auto) return '';
  if (value >= 100) return 'progress__fill--success';
  return '';
}

export function ProgressBar({ value, showValue = true, size = 'md', tone, autoTone = true, label }: { value: number; showValue?: boolean; size?: 'md' | 'lg'; tone?: 'success' | 'warning' | 'danger'; autoTone?: boolean; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx('progress', size === 'lg' && 'progress--lg')}>
      <div className="progress__track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
        <div className={cx('progress__fill', tone ? `progress__fill--${tone}` : toneFor(v, autoTone))} style={{ width: `${v}%` }} />
      </div>
      {showValue && <span className="progress__value">{v}%</span>}
    </div>
  );
}

export function ProgressRing({ value, size = 96, stroke = 9, label, color = 'var(--navy-900)' }: { value: number; size?: number; stroke?: number; label?: string; color?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Progress"}: ${Math.round(v)}%`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div className="ring__label">
        <div className="ring__value" style={{ fontSize: size * 0.22 }}>{Math.round(v)}%</div>
        {label && <div className="xs muted">{label}</div>}
      </div>
    </div>
  );
}

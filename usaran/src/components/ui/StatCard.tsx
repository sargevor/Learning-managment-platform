import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { cx } from '../../lib/format';

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  /** Kept for compatibility; every tone now renders as the neutral grey icon box (calm palette). */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'navy';
  /** Short change chip, e.g. "+6" or "+2%". Rendered blue with a trend icon. */
  trend?: ReactNode;
  /** Optional one-line context (keep it to a few words). */
  meta?: ReactNode;
  /** Makes the whole tile a link. */
  to?: string;
}

/** KPI tile: grey icon box, big number, short label, optional trend chip. One row of these replaces summary blocks. */
export function StatCard({ label, value, unit, icon, tone, trend, meta, to }: Props) {
  const body = (
    <>
      {icon && <span className={cx('stat__icon', tone === 'danger' && 'stat__icon--danger')} aria-hidden="true">{icon}</span>}
      <span className="stat__main">
        <span className="stat__value">
          {value}
          {unit && <small>{unit}</small>}
        </span>
        <span className="stat__label">{label}</span>
        {meta && <span className="stat__meta">{meta}</span>}
      </span>
      {trend && (
        <span className="stat__trend">
          <TrendingUp aria-hidden="true" />
          {trend}
        </span>
      )}
    </>
  );
  return to ? (
    <Link to={to} className="stat stat--link">
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

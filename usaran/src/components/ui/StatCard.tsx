import type { ReactNode } from 'react';
import { cx } from '../../lib/format';

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'navy';
  meta?: ReactNode;
}

/** KPI tile: tinted icon, large number, label, optional context line. */
export function StatCard({ label, value, unit, icon, tone = 'accent', meta }: Props) {
  return (
    <div className="stat">
      {icon && (
        <div className="stat__top">
          <span className={cx('stat__icon', tone !== 'accent' && `stat__icon--${tone}`)} aria-hidden="true">{icon}</span>
        </div>
      )}
      <div>
        <div className="stat__value">
          {value}
          {unit && <small>{unit}</small>}
        </div>
        <div className="stat__label">{label}</div>
      </div>
      {meta && <div className="stat__meta">{meta}</div>}
    </div>
  );
}

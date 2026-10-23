import { Link } from 'react-router-dom';
import { cx } from '../../lib/format';
import { tr } from '../../i18n';

/** Arch mark: a stone arch in brand navy with the periwinkle keystone line. */
export function BrandMark({ light }: { light?: boolean }) {
  return (
    <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M4 36V18C4 10.3 11.2 4 20 4s16 6.3 16 14v18z" fill={light ? '#ffffff' : '#0F1E3D'} />
      <path d="M12 36V20c0-4.4 3.6-8 8-8s8 3.6 8 8v16" fill="none" stroke={light ? '#0F1E3D' : '#ffffff'} strokeWidth="3.2" />
      <path d="M20 12v24" stroke="#8C99EC" strokeWidth="3.2" />
    </svg>
  );
}

export function Brand({ light, to = '/', compactText }: { light?: boolean; to?: string; compactText?: boolean }) {
  return (
    <Link to={to} className={cx('brand', light && 'brand--light')} aria-label={tr("LearnSpace — Home", "LearnSpace — գլխավոր էջ")}>
      <BrandMark light={light} />
      <span className={cx('brand__text', compactText && 'label')}>{tr("LearnSpace", "LearnSpace")}</span>
    </Link>
  );
}

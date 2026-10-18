import { Link } from 'react-router-dom';
import { cx } from '../../lib/format';

export function BrandMark({ light }: { light?: boolean }) {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={light ? '#ffffff' : '#0F1E3D'} fillOpacity={light ? 0.1 : 1} />
      <path d="M8 10.5c2.8-1.2 5.5-1 8 .8 2.5-1.8 5.2-2 8-.8V22c-2.8-1.2-5.5-1-8 .8-2.5-1.8-5.2-2-8-.8z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 11.3v11.5" stroke="#8C99EC" strokeWidth="1.8" />
    </svg>
  );
}

export function Brand({ light, to = '/', compactText }: { light?: boolean; to?: string; compactText?: boolean }) {
  return (
    <Link to={to} className={cx('brand', light && 'brand--light')} aria-label="Ուսարան — գլխավոր էջ">
      <BrandMark light={light} />
      <span className={cx('brand__text', compactText && 'label')}>Ուսարան</span>
    </Link>
  );
}

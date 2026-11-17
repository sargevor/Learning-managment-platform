import { Link } from 'react-router-dom';
import { cx } from '../../lib/format';

/**
 * "Online cap" mark: a graduation cap whose tassel ends in a mouse pointer.
 * `light` is the reversed version for navy backgrounds.
 */
export function BrandMark({ light, size, className }: { light?: boolean; size?: number; className?: string }) {
  const ink = light ? '#ffffff' : '#0F1E3D';
  const accent = light ? '#AEB8EE' : '#4A5BD0';
  return (
    <svg className={cx('brand__mark', className)} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" overflow="visible">
      <path d="M18 30v11c0 5 7 8 14 8s14-3 14-8V30L32 36z" fill={ink} />
      <path d="M32 8l28 12-28 12L4 20z" fill={ink} />
      <path d="M32 20l20 4v14" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M47 40v20l5-5 4 8 4-2-4-8h7z" fill={accent} />
    </svg>
  );
}

/** Logo lockup: mark + lowercase "learnspace" wordmark in Outfit. */
export function Brand({ light, to = '/', compactText }: { light?: boolean; to?: string; compactText?: boolean }) {
  return (
    <Link to={to} className={cx('brand', light && 'brand--light')} aria-label="LearnSpace home">
      <BrandMark light={light} />
      <span className={cx('brand__text', compactText && 'label')}>learnspace</span>
    </Link>
  );
}

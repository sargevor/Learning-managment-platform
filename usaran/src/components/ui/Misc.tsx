import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, FlaskConical, Info, XCircle, BookOpen } from 'lucide-react';
import { cx } from '../../lib/format';
import { avatarTint, photoFor } from '../../lib/visual';
import { tr } from '../../i18n';

/* ---------- Card ---------- */

export function Card({ title, subtitle, actions, children, footer, padded = true, className }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; footer?: ReactNode; padded?: boolean; className?: string }) {
  return (
    <section className={cx('card', className)}>
      {(title || actions) && (
        <header className="card__header">
          <div className="grow">
            {title && <h2>{title}</h2>}
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          {actions && <div className="row row--wrap" style={{ ['--gap' as string]: '8px' }}>{actions}</div>}
        </header>
      )}
      {padded ? <div className="card__body">{children}</div> : children}
      {footer && <footer className="card__footer">{footer}</footer>}
    </section>
  );
}

/* ---------- Page header ---------- */

export function PageHeader({ title, description, actions, breadcrumbs }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; breadcrumbs?: Crumb[] }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1>{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

/* ---------- Breadcrumbs ---------- */

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label={tr("Breadcrumbs", "Էջի ուղի")} className="breadcrumbs">
      {items.map((c, i) => (
        <span key={i} className="row" style={{ ['--gap' as string]: '4px' }}>
          {i > 0 && <ChevronRight aria-hidden="true" />}
          {c.to && i < items.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ---------- Tabs ---------- */

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  count?: number;
}

export function Tabs<K extends string>({ items, value, onChange, label = tr("Sections", "Բաժիններ") }: { items: TabItem<K>[]; value: K; onChange: (k: K) => void; label?: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.key} type="button" role="tab" className="tabs__tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}>
          {t.label}
          {t.count !== undefined && <span className="tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Segmented ---------- */

export function Segmented<K extends string>({ items, value, onChange, label }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {items.map((t) => (
        <button key={t.key} type="button" aria-pressed={value === t.key} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Pagination ---------- */

export function Pagination({ page, pageCount, onChange, total, pageSize }: { page: number; pageCount: number; onChange: (p: number) => void; total?: number; pageSize?: number }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className="pagination" aria-label={tr("Pagination", "Էջավորում")}>
      {total !== undefined && pageSize ? (
        <span className="small muted">{tr(`Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`, `Ցուցադրված է ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}-ը՝ ${total}-ից`)}</span>
      ) : (
        <span />
      )}
      <div className="pagination__pages">
        <button type="button" className="pagination__btn" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label={tr("Previous page", "Նախորդ էջ")}>
          <ChevronLeft />
        </button>
        {pages.map((p) => (
          <button key={p} type="button" className="pagination__btn" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button type="button" className="pagination__btn" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label={tr("Next page", "Հաջորդ էջ")}>
          <ChevronRight />
        </button>
      </div>
    </nav>
  );
}

/* ---------- Notice ---------- */

const NOTICE_ICON = { info: Info, warning: AlertTriangle, success: CheckCircle2, danger: XCircle, neutral: Info };

export function Notice({ tone = 'info', children, className }: { tone?: keyof typeof NOTICE_ICON; children: ReactNode; className?: string }) {
  const Icon = NOTICE_ICON[tone];
  return (
    <div className={cx('notice', tone !== 'info' && `notice--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Small marker distinguishing illustrative numbers from real analytics. */
export function DemoFlag({ text = tr("Sample data", "Ցուցադրական տվյալներ") }: { text?: string }) {
  return (
    <span className="demo-flag" title={tr("These figures are illustrative and do not represent real analytics", "Թվերը հորինված են և չեն արտացոլում իրական վերլուծություն")}>
      <FlaskConical aria-hidden="true" />
      {text}
    </span>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  const photo = photoFor(name);
  return (
    <span className={cx('avatar', !photo && avatarTint(name))} style={{ ['--size' as string]: `${size}px` }} aria-hidden="true">
      {photo ? <img src={photo} alt="" loading="lazy" /> : initials}
    </span>
  );
}

export function Person({ name, sub, size = 36 }: { name: string; sub?: ReactNode; size?: number }) {
  return (
    <div className="person">
      <Avatar name={name} size={size} />
      <div className="person__text" style={{ minWidth: 0 }}>
        <div className="person__name">{name}</div>
        {sub && <div className="person__sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Thumbnail with graceful fallback ---------- */

export function Thumb({ src, alt, className, ratio }: { src: string; alt: string; className?: string; ratio?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cx('thumb', className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      {!failed && <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />}
      {failed && (
        <div className="thumb__fallback" style={{ background: 'linear-gradient(135deg, var(--navy-800), var(--accent-700))' }}>
          <BookOpen aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/* ---------- Empty state & skeleton ---------- */

export { EmptyState } from './EmptyState';

export function Skeleton({ width = '100%', height = 14, radius }: { width?: number | string; height?: number | string; radius?: number }) {
  return <span className="skeleton" style={{ display: 'block', width, height, borderRadius: radius }} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton height={150} radius={0} />
      <div className="stack" style={{ padding: 18, ['--gap' as string]: '10px' }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="85%" height={18} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="70%" height={12} />
      </div>
    </div>
  );
}

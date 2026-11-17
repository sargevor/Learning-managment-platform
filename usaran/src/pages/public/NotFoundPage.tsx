import { House, LayoutDashboard, LibraryBig } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cx } from '../../lib/format';

/** Empty archway with a dotted path: the brand arch, nobody home. */
function ArchArt() {
  return (
    <svg className="pub-nf__art" viewBox="0 0 360 260" role="img" aria-label="An empty archway">
      <ellipse className="f-track" cx="180" cy="236" rx="168" ry="14" />
      <path className="s-blue200" d="M54 234V112a126 126 0 0 1 252 0v122" fill="none" strokeWidth="3" strokeLinecap="round" />
      <path className="f-accent100" d="M128 234V124a52 52 0 0 1 104 0v110z" />
      <circle className="f-blue300" cx="180" cy="116" r="14" />
      <path className="s-accent" d="M180 232C180 210 152 206 160 186S196 170 184 150" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
      <path className="f-navy" d="M92 234V124a88 88 0 0 1 176 0v110h-36V124a52 52 0 0 0-104 0v110z" />
      <rect className="f-navy700" x="80" y="226" width="64" height="10" rx="5" />
      <rect className="f-navy700" x="216" y="226" width="64" height="10" rx="5" />
      <path className="f-accent" d="M312 40c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10z" />
      <path className="f-peri" d="M40 58c.4 4 3.6 7.2 7.6 7.6-4 .4-7.2 3.6-7.6 7.6-.4-4-3.6-7.2-7.6-7.6 4-.4 7.2-3.6 7.6-7.6z" />
      <circle className="f-blue200" cx="300" cy="150" r="4" />
      <circle className="f-blue200" cx="62" cy="168" r="3" />
    </svg>
  );
}

export function NotFoundPage({ inApp }: { inApp?: boolean }) {
  const { pathname } = useLocation();
  const area = pathname.startsWith('/teacher') ? 'teacher' : pathname.startsWith('/student') ? 'student' : null;
  const home = area ? `/${area}/dashboard` : '/';
  const courses = area ? `/${area}/courses` : '/courses';
  return (
    <div className={cx('pub-nf', inApp ? 'pub-nf--app' : 'pub-page')}>
      <div className="pub-nf__inner">
        <ArchArt />
        <div className="pub-nf__code" aria-hidden="true">404</div>
        <h1 className="pub-nf__title">Page not found</h1>
        <div className="pub-actions pub-actions--center">
          <Link to={home} className="pub-btn pub-btn--dark pub-btn--sm">
            {inApp ? <LayoutDashboard aria-hidden="true" /> : <House aria-hidden="true" />}
            {inApp ? 'Dashboard' : 'Home'}
          </Link>
          <Link to={courses} className="pub-btn pub-btn--light pub-btn--sm pub-btn--bordered"><LibraryBig aria-hidden="true" />Courses</Link>
        </div>
      </div>
    </div>
  );
}

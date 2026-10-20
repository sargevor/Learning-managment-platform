import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { ButtonLink } from '../ui/Button';
import { categories } from '../../data/courses';
import { cx } from '../../lib/format';

const NAV = [
  { to: '/', label: 'Գլխավոր', end: true },
  { to: '/courses', label: 'Դասընթացներ' },
  { to: '/about', label: 'Հարթակի մասին' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setOpen(false);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="public">
      <header className={cx('site-header', (scrolled || open) && 'is-scrolled')}>
        <div className="container site-header__inner">
          <Brand />
          <nav className="site-nav" aria-label="Հիմնական նավարկում">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="site-header__actions">
            <ButtonLink to="/login" variant="ghost" className="hide-mobile">
              Մուտք
            </ButtonLink>
            <ButtonLink to="/register" variant="primary" className="hide-mobile">
              Գրանցվել
            </ButtonLink>
            <button type="button" className="icon-btn site-header__burger" aria-label={open ? 'Փակել ընտրացանկը' : 'Բացել ընտրացանկը'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Բջջային նավարկում">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="row row--between">
                {n.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
            <Link to="/login" className="row row--between">
              Մուտք
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <ButtonLink to="/register" variant="primary" size="lg" block>
              Գրանցվել
            </ButtonLink>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand stack" style={{ ['--gap' as string]: '14px' }}>
            <Brand />
            <p style={{ maxWidth: 320 }}>Առցանց ուսուցման միասնական միջավայր դասավանդողների և ուսանողների համար՝ դասընթացներից մինչև գնահատականներ։</p>
          </div>
          <div>
            <h4>Ուղղություններ</h4>
            <ul>
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/courses?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Հարթակ</h4>
            <ul>
              <li><Link to="/about">Հարթակի մասին</Link></li>
              <li><Link to="/courses">Դասընթացների կատալոգ</Link></li>
              <li><Link to="/about#teachers">Դասավանդողների համար</Link></li>
              <li><Link to="/about#faq">Հաճախ տրվող հարցեր</Link></li>
            </ul>
          </div>
          <div>
            <h4>Դեմո միջավայր</h4>
            <ul>
              <li><Link to="/student/dashboard">Ուսանողի վահանակ</Link></li>
              <li><Link to="/teacher/dashboard">Դասավանդողի վահանակ</Link></li>
              <li><Link to="/login">Մուտք</Link></li>
              <li><Link to="/register">Գրանցում</Link></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 Ուսարան։ Ցուցադրական նախագիծ՝ օրինակային տվյալներով։</span>
          <span>Պատրաստված է Երևանում</span>
        </div>
      </div>
    </footer>
  );
}

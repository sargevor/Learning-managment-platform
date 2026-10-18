import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { ButtonLink } from '../ui/Button';
import { categories } from '../../data/courses';

const NAV = [
  { to: '/', label: 'Գլխավոր', end: true },
  { to: '/courses', label: 'Դասընթացներ' },
  { to: '/about', label: 'Հարթակի մասին' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="public">
      <header className="site-header">
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
              <Link key={n.to} to={n.to}>
                {n.label}
              </Link>
            ))}
            <Link to="/login">Մուտք</Link>
            <Link to="/register">Գրանցում</Link>
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
          <div className="stack" style={{ ['--gap' as string]: '14px' }}>
            <Brand light />
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
          <span>Հայերեն</span>
        </div>
      </div>
    </footer>
  );
}

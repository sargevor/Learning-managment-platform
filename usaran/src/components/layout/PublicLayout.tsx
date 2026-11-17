import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { ButtonLink } from '../ui/Button';
import { categories } from '../../data/courses';
import { cx } from '../../lib/format';

const NAV = [
  { to: '/', label: "Home", end: true },
  { to: '/courses', label: "Courses" },
  { to: '/about', label: "About" },
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

  /* Sign in / sign up are full-screen split layouts with their own logo. */
  if (pathname === '/login' || pathname === '/register') {
    return (
      <div className="public public--bare">
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="public">
      <header className={cx('site-header', (scrolled || open) && 'is-scrolled')}>
        <div className="container site-header__inner">
          <Brand />
          <nav className="site-nav" aria-label="Main navigation">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="site-header__actions">
            <ButtonLink to="/login" variant="ghost" className="hide-mobile">Sign in</ButtonLink>
            <ButtonLink to="/register" variant="primary" className="hide-mobile">Sign up</ButtonLink>
            <button type="button" className="icon-btn site-header__burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="row row--between">
                {n.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
            <Link to="/login" className="row row--between">Sign in<ArrowRight size={18} aria-hidden="true" />
            </Link>
            <ButtonLink to="/register" variant="primary" size="lg" block>Sign up</ButtonLink>
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
            <Brand light />
            <p style={{ maxWidth: 280 }}>Courses, tasks and grades in one place.</p>
          </div>
          <div>
            <h4>Learn</h4>
            <ul>
              <li><Link to="/courses">Courses</Link></li>
              {categories.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link to={`/courses?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
              <li><Link to="/student/dashboard">Student demo</Link></li>
            </ul>
          </div>
          <div>
            <h4>Teach</h4>
            <ul>
              <li><Link to="/about#teachers">For teachers</Link></li>
              <li><Link to="/teacher/dashboard">Teacher demo</Link></li>
              <li><Link to="/register">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/about#faq">Help</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 LearnSpace</span>
          <span>Demo with sample data</span>
        </div>
      </div>
    </footer>
  );
}

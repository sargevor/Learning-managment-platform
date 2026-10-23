import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { LangSwitch } from './LangSwitch';
import { ButtonLink } from '../ui/Button';
import { categories } from '../../data/courses';
import { cx } from '../../lib/format';
import { tr } from '../../i18n';

const NAV = [
  { to: '/', label: tr("Home", "Գլխավոր"), end: true },
  { to: '/courses', label: tr("Courses", "Դասընթացներ") },
  { to: '/about', label: tr("About", "Հարթակի մասին") },
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
          <nav className="site-nav" aria-label={tr("Main navigation", "Հիմնական նավարկում")}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="site-header__actions">
            <LangSwitch />
            <ButtonLink to="/login" variant="ghost" className="hide-mobile">{tr("Sign in", "Մուտք")}</ButtonLink>
            <ButtonLink to="/register" variant="primary" className="hide-mobile">{tr("Sign up", "Գրանցվել")}</ButtonLink>
            <button type="button" className="icon-btn site-header__burger" aria-label={open ? tr("Close menu", "Փակել ընտրացանկը") : tr("Open menu", "Բացել ընտրացանկը")} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label={tr("Mobile navigation", "Բջջային նավարկում")}>
            <LangSwitch />
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="row row--between">
                {n.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
            <Link to="/login" className="row row--between">{tr("Sign in", "Մուտք")}<ArrowRight size={18} aria-hidden="true" />
            </Link>
            <ButtonLink to="/register" variant="primary" size="lg" block>{tr("Sign up", "Գրանցվել")}</ButtonLink>
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
            <p style={{ maxWidth: 320 }}>{tr("One place for students and teachers to manage courses, assignments, and grades.", "Ուսանողների և դասավանդողների ընդհանուր միջավայր՝ դասընթացները, առաջադրանքներն ու գնահատականները կառավարելու համար։")}</p>
          </div>
          <div>
            <h4>{tr("Subjects", "Ուղղություններ")}</h4>
            <ul>
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/courses?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{tr("Platform", "Հարթակ")}</h4>
            <ul>
              <li><Link to="/about">{tr("About", "Հարթակի մասին")}</Link></li>
              <li><Link to="/courses">{tr("Course catalog", "Դասընթացների կատալոգ")}</Link></li>
              <li><Link to="/about#teachers">{tr("For teachers", "Դասավանդողների համար")}</Link></li>
              <li><Link to="/about#faq">{tr("Frequently asked questions", "Հաճախ տրվող հարցեր")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{tr("Try the platform", "Փորձեք հարթակը")}</h4>
            <ul>
              <li><Link to="/student/dashboard">{tr("Student dashboard", "Ուսանողի վահանակ")}</Link></li>
              <li><Link to="/teacher/dashboard">{tr("Teacher dashboard", "Դասավանդողի վահանակ")}</Link></li>
              <li><Link to="/login">{tr("Sign in", "Մուտք")}</Link></li>
              <li><Link to="/register">{tr("Sign up", "Գրանցում")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>{tr("© 2026 LearnSpace. Demo project with sample data.", "© 2026 LearnSpace։ Ցուցադրական նախագիծ՝ հորինված տվյալներով։")}</span>
          <span>{tr("Made in Yerevan", "Պատրաստված է Երևանում")}</span>
        </div>
      </div>
    </footer>
  );
}

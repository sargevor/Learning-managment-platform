import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, BookOpen, BookMarked, CheckSquare, ChevronsLeft, ChevronsRight, ClipboardList, FileQuestion, GraduationCap,
  LayoutDashboard, LibraryBig, LogOut, Menu, Settings, TrendingUp, User, Users, FlaskConical, Repeat, ArrowRight, Presentation,
} from 'lucide-react';
import type { Role } from '../../types';
import { Brand } from './Brand';
import { Dropdown } from '../ui/Overlay';
import { Avatar, Person } from '../ui/Misc';
import { SearchBar } from '../ui/SearchBar';
import { notifications } from '../../data/analytics';
import { assignments, assignmentStatusFor, pendingTeacherSubmissions, studentSubmission } from '../../data/assignments';
import { getEnrolledCourses } from '../../data/enrollments';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { cx, relativeTime } from '../../lib/format';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

function useNav(role: Role): { group: string; items: NavItem[] }[] {
  return useMemo(() => {
    if (role === 'student') {
      const enrolledIds = getEnrolledCourses().map((e) => e.course.id);
      const open = assignments.filter((a) => enrolledIds.includes(a.courseId)).filter((a) => ['not-started', 'draft'].includes(assignmentStatusFor(a, studentSubmission(a.id)))).length;
      return [
        {
          group: 'Ուսուցում',
          items: [
            { to: '/student/dashboard', label: 'Վահանակ', icon: LayoutDashboard },
            { to: '/student/courses', label: 'Իմ դասընթացները', icon: BookOpen },
            { to: '/student/assignments', label: 'Առաջադրանքներ', icon: ClipboardList, badge: open },
            { to: '/student/quizzes', label: 'Թեստեր', icon: FileQuestion },
            { to: '/courses', label: 'Կատալոգ', icon: LibraryBig },
          ],
        },
        {
          group: 'Արդյունքներ',
          items: [
            { to: '/student/grades', label: 'Գնահատականներ', icon: GraduationCap },
            { to: '/student/progress', label: 'Առաջընթաց', icon: TrendingUp },
          ],
        },
        {
          group: 'Հաշիվ',
          items: [
            { to: '/student/profile', label: 'Պրոֆիլ', icon: User },
            { to: '/student/settings', label: 'Կարգավորումներ', icon: Settings },
          ],
        },
      ];
    }
    const pending = pendingTeacherSubmissions().length;
    return [
      {
        group: 'Դասավանդում',
        items: [
          { to: '/teacher/dashboard', label: 'Վահանակ', icon: LayoutDashboard },
          { to: '/teacher/courses', label: 'Դասընթացներ', icon: BookMarked },
          { to: '/teacher/assignments', label: 'Առաջադրանքներ', icon: ClipboardList },
          { to: '/teacher/quizzes', label: 'Թեստեր', icon: FileQuestion },
          { to: '/teacher/grading', label: 'Գնահատման կենտրոն', icon: CheckSquare, badge: pending },
        ],
      },
      {
        group: 'Ուսանողներ և վերլուծություն',
        items: [
          { to: '/teacher/students', label: 'Ուսանողներ', icon: Users },
          { to: '/teacher/reports', label: 'Հաշվետվություններ', icon: BarChart3 },
        ],
      },
      {
        group: 'Հաշիվ',
        items: [
          { to: '/teacher/profile', label: 'Պրոֆիլ', icon: User },
          { to: '/teacher/settings', label: 'Կարգավորումներ', icon: Settings },
        ],
      },
    ];
  }, [role]);
}

export function AppShell({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { student, teacher } = useDemoSession();
  const user = role === 'student' ? student : teacher;
  const name = `${user.firstName} ${user.lastName}`;
  const nav = useNav(role);
  const notes = notifications.filter((n) => n.role === role);
  const unread = notes.filter((n) => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const runSearch = () => {
    const q = query.trim();
    navigate(role === 'student' ? `/student/courses?q=${encodeURIComponent(q)}` : `/teacher/courses?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className={cx('shell', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open')}>
      <aside className="sidebar" aria-label="Կողային նավարկում">
        <div className="sidebar__top">
          <Brand to={`/${role}/dashboard`} />
        </div>
        <nav className="sidebar__nav">
          {nav.map((g) => (
            <div key={g.group} className="stack" style={{ ['--gap' as string]: '2px' }}>
              <div className="sidebar__group">{g.group}</div>
              {g.items.map((item) => (
                <NavLink key={item.to} to={item.to} className="sidebar__link" title={collapsed ? item.label : undefined} end={item.to.endsWith('dashboard')}>
                  <item.icon aria-hidden="true" />
                  <span className="label">{item.label}</span>
                  {item.badge ? <span className="sidebar__badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <div className={cx('sidebar__switch', role === 'student' ? 't-lilac' : 't-sky')}>
            <strong>{role === 'student' ? 'Դասավանդողի միջավայր' : 'Ուսանողի միջավայր'}</strong>
            <span>{role === 'student' ? 'Տեսեք, թե ինչպես է դասավանդողը գնահատում աշխատանքները։' : 'Տեսեք հարթակը ուսանողի աչքերով։'}</span>
            <Link to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} className="btn btn--primary btn--sm">
              Անցնել <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <button type="button" className="sidebar__link sidebar__collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Ընդլայնել կողային վահանակը' : 'Փոքրացնել կողային վահանակը'}>
            {collapsed ? <ChevronsRight aria-hidden="true" /> : <ChevronsLeft aria-hidden="true" />}
            <span className="label">Փոքրացնել</span>
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />

      <div className="shell__main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setMobileOpen(true)} aria-label="Բացել նավարկումը">
            <Menu />
          </button>
          <SearchBar className="topbar__search" value={query} onChange={setQuery} onSubmit={runSearch} placeholder={role === 'student' ? 'Որոնել իմ դասընթացներում…' : 'Որոնել դասընթացներ…'} />
          <div className="topbar__actions">
            <div className="role-switch" role="group" aria-label="Դեմո դերի ընտրություն">
              <Link to="/student/dashboard" className={cx(role === 'student' && 'active')} aria-label="Ուսանող">
                <GraduationCap aria-hidden="true" />
                <span>Ուսանող</span>
              </Link>
              <Link to="/teacher/dashboard" className={cx(role === 'teacher' && 'active')} aria-label="Դասավանդող">
                <Presentation aria-hidden="true" />
                <span>Դասավանդող</span>
              </Link>
            </div>
            <Dropdown
              width={340}
              trigger={({ toggle, open }) => (
                <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={`Ծանուցումներ${unread ? `, ${unread} չընթերցված` : ''}`}>
                  <Bell />
                  {unread > 0 && <span className="icon-btn__dot" />}
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="dropdown__head row row--between">
                    <strong className="small">Ծանուցումներ</strong>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReadIds(new Set(notes.map((n) => n.id)))}>
                      Նշել որպես ընթերցված
                    </button>
                  </div>
                  {notes.map((n) => {
                    const isUnread = n.unread && !readIds.has(n.id);
                    return (
                      <Link
                        key={n.id}
                        to={n.to}
                        className="dropdown__item"
                        style={{ alignItems: 'flex-start' }}
                        onClick={() => {
                          setReadIds((s) => new Set(s).add(n.id));
                          close();
                        }}
                      >
                        <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', flex: 'none', background: isUnread ? 'var(--accent-600)' : 'transparent' }} aria-hidden="true" />
                        <span>
                          <span className="strong" style={{ display: 'block', color: 'var(--navy-900)' }}>{n.title}</span>
                          <span className="xs secondary" style={{ display: 'block' }}>{n.text}</span>
                          <span className="xs muted">{relativeTime(n.time)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </>
              )}
            </Dropdown>
            <Dropdown
              trigger={({ toggle, open }) => (
                <button type="button" className="profile-btn" onClick={toggle} aria-expanded={open} aria-label="Օգտատիրոջ ընտրացանկ">
                  <Person name={name} sub={role === 'student' ? 'Ուսանող' : 'Դասավանդող'} size={34} />
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="dropdown__head row">
                    <Avatar name={name} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <div className="strong small">{name}</div>
                      <div className="xs muted">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown__sep" />
                  <Link className="dropdown__item" to={`/${role}/profile`} onClick={close}><User />Իմ պրոֆիլը</Link>
                  <Link className="dropdown__item" to={`/${role}/settings`} onClick={close}><Settings />Կարգավորումներ</Link>
                  <Link className="dropdown__item" to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} onClick={close}>
                    <Repeat />Անցնել {role === 'student' ? 'դասավանդողի' : 'ուսանողի'} դերին
                  </Link>
                  <div className="dropdown__sep" />
                  <button
                    type="button"
                    className="dropdown__item dropdown__item--danger"
                    onClick={() => {
                      close();
                      toast.info('Դուք դուրս եկաք դեմո միջավայրից', 'Իրական նստաշրջան չի եղել, ուստի ոչինչ չի պահպանվել։');
                      navigate('/login');
                    }}
                  >
                    <LogOut />Ելք
                  </button>
                </>
              )}
            </Dropdown>
          </div>
        </header>
        <div className="demo-banner" role="note">
          <FlaskConical aria-hidden="true" />
          Ցուցադրական միջավայր. բոլոր տվյալները օրինակային են, փոփոխությունները պահվում են միայն այս էջում և չեն ուղարկվում սերվեր։
        </div>
        <main className="content" id="main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© 2026 Ուսարան, ցուցադրական տարբերակ</span>
          <nav aria-label="Լրացուցիչ նավարկում">
            <Link to="/">Գլխավոր էջ</Link>
            <Link to="/courses">Կատալոգ</Link>
            <Link to="/about">Հարթակի մասին</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}


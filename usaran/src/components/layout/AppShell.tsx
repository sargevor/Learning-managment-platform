import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, BookOpen, BookMarked, CheckSquare, ChevronsLeft, ChevronsRight, ClipboardList, FileQuestion, GraduationCap,
  LayoutDashboard, LibraryBig, LogOut, Menu, Settings, TrendingUp, User, Users, FlaskConical, Repeat, ArrowRight, Presentation,
} from 'lucide-react';
import type { Role } from '../../types';
import { Brand } from './Brand';
import { LangSwitch } from './LangSwitch';
import { Dropdown } from '../ui/Overlay';
import { Avatar, Person } from '../ui/Misc';
import { SearchBar } from '../ui/SearchBar';
import { notifications } from '../../data/analytics';
import { assignments, assignmentStatusFor, pendingTeacherSubmissions, studentSubmission } from '../../data/assignments';
import { getEnrolledCourses } from '../../data/enrollments';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { cx, relativeTime } from '../../lib/format';
import { tr } from '../../i18n';

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
          group: tr("Learning", "Ուսուցում"),
          items: [
            { to: '/student/dashboard', label: tr("Dashboard", "Վահանակ"), icon: LayoutDashboard },
            { to: '/student/courses', label: tr("My courses", "Իմ դասընթացները"), icon: BookOpen },
            { to: '/student/assignments', label: tr("Assignments", "Առաջադրանքներ"), icon: ClipboardList, badge: open },
            { to: '/student/quizzes', label: tr("Quizzes", "Թեստեր"), icon: FileQuestion },
            { to: '/courses', label: tr("Course catalog", "Կատալոգ"), icon: LibraryBig },
          ],
        },
        {
          group: tr("Results", "Արդյունքներ"),
          items: [
            { to: '/student/grades', label: tr("Grades", "Գնահատականներ"), icon: GraduationCap },
            { to: '/student/progress', label: tr("Progress", "Առաջընթաց"), icon: TrendingUp },
          ],
        },
        {
          group: tr("Account", "Հաշիվ"),
          items: [
            { to: '/student/profile', label: tr("Profile", "Անձնական էջ"), icon: User },
            { to: '/student/settings', label: tr("Settings", "Կարգավորումներ"), icon: Settings },
          ],
        },
      ];
    }
    const pending = pendingTeacherSubmissions().length;
    return [
      {
        group: tr("Teaching", "Դասավանդում"),
        items: [
          { to: '/teacher/dashboard', label: tr("Dashboard", "Վահանակ"), icon: LayoutDashboard },
          { to: '/teacher/courses', label: tr("Courses", "Դասընթացներ"), icon: BookMarked },
          { to: '/teacher/assignments', label: tr("Assignments", "Առաջադրանքներ"), icon: ClipboardList },
          { to: '/teacher/quizzes', label: tr("Quizzes", "Թեստեր"), icon: FileQuestion },
          { to: '/teacher/grading', label: tr("Grading center", "Գնահատման կենտրոն"), icon: CheckSquare, badge: pending },
        ],
      },
      {
        group: tr("Students and analytics", "Ուսանողներ և վերլուծություն"),
        items: [
          { to: '/teacher/students', label: tr("Students", "Ուսանողներ"), icon: Users },
          { to: '/teacher/reports', label: tr("Reports", "Հաշվետվություններ"), icon: BarChart3 },
        ],
      },
      {
        group: tr("Account", "Հաշիվ"),
        items: [
          { to: '/teacher/profile', label: tr("Profile", "Անձնական էջ"), icon: User },
          { to: '/teacher/settings', label: tr("Settings", "Կարգավորումներ"), icon: Settings },
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
      <aside className="sidebar" aria-label={tr("Sidebar navigation", "Կողային նավարկում")}>
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
            <strong>{role === 'student' ? tr("Teacher workspace", "Դասավանդողի միջավայր") : tr("Student workspace", "Ուսանողի միջավայր")}</strong>
            <span>{role === 'student' ? tr("See how teachers review and grade assignments.", "Տեսեք, թե ինչպես է դասավանդողը գնահատում աշխատանքները։") : tr("Explore the platform from a student's perspective.", "Տեսեք հարթակն ուսանողի աչքերով։")}</span>
            <Link to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} className="btn btn--primary btn--sm">{tr("Switch ", "Անցնել ")}<ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <button type="button" className="sidebar__link sidebar__collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? tr("Expand sidebar", "Բացել կողային վահանակը") : tr("Collapse sidebar", "Ծալել կողային վահանակը")}>
            {collapsed ? <ChevronsRight aria-hidden="true" /> : <ChevronsLeft aria-hidden="true" />}
            <span className="label">{tr("Collapse", "Ծալել")}</span>
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />

      <div className="shell__main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setMobileOpen(true)} aria-label={tr("Open navigation", "Բացել նավարկումը")}>
            <Menu />
          </button>
          <SearchBar className="topbar__search" value={query} onChange={setQuery} onSubmit={runSearch} placeholder={role === 'student' ? tr("Search my courses…", "Որոնել իմ դասընթացներում…") : tr("Search courses…", "Որոնել դասընթացներ…")} />
          <div className="topbar__actions">
            <LangSwitch />
            <div className="role-switch" role="group" aria-label={tr("Choose a role", "Դերի ընտրություն")}>
              <Link to="/student/dashboard" className={cx(role === 'student' && 'active')} aria-label={tr("Student", "Ուսանող")}>
                <GraduationCap aria-hidden="true" />
                <span>{tr("Student", "Ուսանող")}</span>
              </Link>
              <Link to="/teacher/dashboard" className={cx(role === 'teacher' && 'active')} aria-label={tr("Teacher", "Դասավանդող")}>
                <Presentation aria-hidden="true" />
                <span>{tr("Teacher", "Դասավանդող")}</span>
              </Link>
            </div>
            <Dropdown
              width={340}
              trigger={({ toggle, open }) => (
                <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={tr(`Notifications${unread ? `, ${unread} unread` : ''}`, `Ծանուցումներ${unread ? `, ${unread} չընթերցված` : ''}`)}>
                  <Bell />
                  {unread > 0 && <span className="icon-btn__dot" />}
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="dropdown__head row row--between">
                    <strong className="small">{tr("Notifications", "Ծանուցումներ")}</strong>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReadIds(new Set(notes.map((n) => n.id)))}>{tr("Mark all as read", "Բոլորը նշել որպես ընթերցված")}</button>
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
                <button type="button" className="profile-btn" onClick={toggle} aria-expanded={open} aria-label={tr("User menu", "Օգտատիրոջ ընտրացանկ")}>
                  <Person name={name} sub={role === 'student' ? tr("Student", "Ուսանող") : tr("Teacher", "Դասավանդող")} size={34} />
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
                  <Link className="dropdown__item" to={`/${role}/profile`} onClick={close}><User />{tr("My profile", "Անձնական էջ")}</Link>
                  <Link className="dropdown__item" to={`/${role}/settings`} onClick={close}><Settings />{tr("Settings", "Կարգավորումներ")}</Link>
                  <Link className="dropdown__item" to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} onClick={close}>
                    <Repeat />{tr("Switch to ", "Անցնել ")}{role === 'student' ? tr("teacher", "դասավանդողի") : tr("student", "ուսանողի")}{tr(" view", " դերին")}</Link>
                  <div className="dropdown__sep" />
                  <button
                    type="button"
                    className="dropdown__item dropdown__item--danger"
                    onClick={() => {
                      close();
                      toast.info(tr("You have left the demo", "Դուք դուրս եկաք ցուցադրական միջավայրից"), tr("No real session was created, so nothing was saved.", "Իրական նստաշրջան չի եղել, ուստի ոչինչ չի պահպանվել։"));
                      navigate('/login');
                    }}
                  >
                    <LogOut />{tr("Sign out", "Ելք")}</button>
                </>
              )}
            </Dropdown>
          </div>
        </header>
        <div className="demo-banner" role="note">
          <FlaskConical aria-hidden="true" />{tr("Demo workspace: all data is illustrative. Changes stay on this page and are not sent to a server.", "Ցուցադրական միջավայր։ Բոլոր տվյալները հորինված են, իսկ փոփոխությունները պահվում են միայն այս էջում և չեն ուղարկվում սերվեր։")}</div>
        <main className="content" id="main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>{tr("© 2026 LearnSpace · Demo", "© 2026 LearnSpace, ցուցադրական տարբերակ")}</span>
          <nav aria-label={tr("Additional navigation", "Լրացուցիչ նավարկում")}>
            <Link to="/">{tr("Home", "Գլխավոր էջ")}</Link>
            <Link to="/courses">{tr("Course catalog", "Կատալոգ")}</Link>
            <Link to="/about">{tr("About", "Հարթակի մասին")}</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}


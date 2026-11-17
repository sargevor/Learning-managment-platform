import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, BookOpen, ClipboardList, FileQuestion, GraduationCap, House, LibraryBig, LogOut, Presentation, Repeat,
  Search, Settings, SquareCheckBig, TrendingUp, User, Users, X,
} from 'lucide-react';
import type { Role } from '../../types';
import { BrandMark } from './Brand';
import { Dropdown } from '../ui/Overlay';
import { Avatar } from '../ui/Misc';
import { DemoNote } from '../ui/Visual';
import { notifications } from '../../data/analytics';
import { assignments, assignmentStatusFor, pendingTeacherSubmissions, studentSubmission } from '../../data/assignments';
import { getEnrolledCourses } from '../../data/enrollments';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { cx, relativeTime } from '../../lib/format';

/* ---------- Page title in the top bar ---------- */

const TitleSlot = createContext<HTMLElement | null>(null);

/**
 * Puts the page title (and a short icon meta line) into the shell's top bar,
 * on the same row as search, role switch, notifications and avatar.
 * Use once per app page: <ShellTitle title="My courses" meta={<>…</>} />
 */
export function ShellTitle({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  const slot = useContext(TitleSlot);
  if (!slot) return null;
  return createPortal(
    <>
      <h1>{title}</h1>
      {meta && <div className="topbar2__meta">{meta}</div>}
    </>,
    slot,
  );
}

/* ---------- Navigation ---------- */

interface NavItem {
  to: string;
  label: string;
  icon: typeof House;
  badge?: number;
  end?: boolean;
}

function useNav(role: Role): NavItem[] {
  return useMemo(() => {
    if (role === 'student') {
      const enrolledIds = getEnrolledCourses().map((e) => e.course.id);
      const open = assignments
        .filter((a) => enrolledIds.includes(a.courseId))
        .filter((a) => ['not-started', 'draft'].includes(assignmentStatusFor(a, studentSubmission(a.id)))).length;
      return [
        { to: '/student/dashboard', label: 'Home', icon: House, end: true },
        { to: '/student/courses', label: 'Courses', icon: BookOpen },
        { to: '/student/assignments', label: 'Tasks', icon: ClipboardList, badge: open },
        { to: '/student/quizzes', label: 'Quizzes', icon: FileQuestion },
        { to: '/student/grades', label: 'Grades', icon: GraduationCap },
        { to: '/student/progress', label: 'Progress', icon: TrendingUp },
        { to: '/courses', label: 'Catalog', icon: LibraryBig },
      ];
    }
    const pending = pendingTeacherSubmissions().length;
    return [
      { to: '/teacher/dashboard', label: 'Home', icon: House, end: true },
      { to: '/teacher/courses', label: 'Courses', icon: BookOpen },
      { to: '/teacher/assignments', label: 'Tasks', icon: ClipboardList },
      { to: '/teacher/quizzes', label: 'Quizzes', icon: FileQuestion },
      { to: '/teacher/grading', label: 'Grading', icon: SquareCheckBig, badge: pending },
      { to: '/teacher/students', label: 'Students', icon: Users },
      { to: '/teacher/reports', label: 'Reports', icon: BarChart3 },
    ];
  }, [role]);
}

export function AppShell({ role }: { role: Role }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
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
    window.scrollTo(0, 0);
    setSearchOpen(false);
  }, [pathname]);

  const runSearch = () => {
    const q = query.trim();
    navigate(role === 'student' ? `/student/courses?q=${encodeURIComponent(q)}` : `/teacher/courses?q=${encodeURIComponent(q)}`);
  };

  return (
    <TitleSlot.Provider value={slot}>
      <div className="app">
        <nav className="rail" aria-label="Main">
          <Link to={`/${role}/dashboard`} className="rail__logo" aria-label="LearnSpace home">
            <BrandMark light />
          </Link>
          <div className="rail__items">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="rail__link">
                <item.icon aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? <b className="rail__badge" aria-label={`${item.badge} new`}>{item.badge}</b> : null}
              </NavLink>
            ))}
          </div>
          <NavLink to={`/${role}/settings`} className="rail__link rail__settings" aria-label="Settings">
            <Settings aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="app__main">
          <header className="topbar2">
            <div className="topbar2__title" ref={setSlot} />

            {searchOpen ? (
              <form
                className="topbar2__search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch();
                }}
              >
                <Search aria-hidden="true" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={role === 'student' ? 'Search my courses' : 'Search courses'} aria-label="Search courses" />
                <button type="button" className="round-btn round-btn--plain" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                  <X />
                </button>
              </form>
            ) : (
              <button type="button" className="round-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search />
              </button>
            )}

            <div className="role-switch2" role="group" aria-label="Role">
              <Link to="/student/dashboard" className={cx(role === 'student' && 'active')}>
                <GraduationCap aria-hidden="true" />
                <span>Student</span>
              </Link>
              <Link to="/teacher/dashboard" className={cx(role === 'teacher' && 'active')}>
                <Presentation aria-hidden="true" />
                <span>Teacher</span>
              </Link>
            </div>

            <Dropdown
              width={340}
              trigger={({ toggle, open }) => (
                <button type="button" className="round-btn" onClick={toggle} aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                  <Bell />
                  {unread > 0 && <span className="round-btn__dot" />}
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="dropdown__head row row--between">
                    <strong className="small">Notifications</strong>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReadIds(new Set(notes.map((n) => n.id)))}>
                      Mark all read
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
                        <span className={cx('note-dot', isUnread && 'is-unread')} aria-hidden="true" />
                        <span style={{ minWidth: 0 }}>
                          <span className="strong" style={{ display: 'block', color: 'var(--navy-900)' }}>{n.title}</span>
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
                <button type="button" className="avatar-btn" onClick={toggle} aria-expanded={open} aria-label="User menu">
                  <Avatar name={name} size={44} />
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
                  <Link className="dropdown__item" to={`/${role}/profile`} onClick={close}>
                    <User />
                    My profile
                  </Link>
                  <Link className="dropdown__item" to={`/${role}/settings`} onClick={close}>
                    <Settings />
                    Settings
                  </Link>
                  <Link className="dropdown__item" to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} onClick={close}>
                    <Repeat />
                    Switch to {role === 'student' ? 'teacher' : 'student'}
                  </Link>
                  <div className="dropdown__sep" />
                  <button
                    type="button"
                    className="dropdown__item dropdown__item--danger"
                    onClick={() => {
                      close();
                      toast.info('You left the demo', 'Nothing was saved.');
                      navigate('/login');
                    }}
                  >
                    <LogOut />
                    Sign out
                  </button>
                </>
              )}
            </Dropdown>
          </header>

          <main className="app__content" id="main">
            <Outlet />
            <DemoNote />
          </main>
        </div>
      </div>
    </TitleSlot.Provider>
  );
}

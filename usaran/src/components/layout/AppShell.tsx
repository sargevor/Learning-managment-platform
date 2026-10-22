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
          group: "Learning",
          items: [
            { to: '/student/dashboard', label: "Dashboard", icon: LayoutDashboard },
            { to: '/student/courses', label: "My courses", icon: BookOpen },
            { to: '/student/assignments', label: "Assignments", icon: ClipboardList, badge: open },
            { to: '/student/quizzes', label: "Quizzes", icon: FileQuestion },
            { to: '/courses', label: "Course catalog", icon: LibraryBig },
          ],
        },
        {
          group: "Results",
          items: [
            { to: '/student/grades', label: "Grades", icon: GraduationCap },
            { to: '/student/progress', label: "Progress", icon: TrendingUp },
          ],
        },
        {
          group: "Account",
          items: [
            { to: '/student/profile', label: "Profile", icon: User },
            { to: '/student/settings', label: "Settings", icon: Settings },
          ],
        },
      ];
    }
    const pending = pendingTeacherSubmissions().length;
    return [
      {
        group: "Teaching",
        items: [
          { to: '/teacher/dashboard', label: "Dashboard", icon: LayoutDashboard },
          { to: '/teacher/courses', label: "Courses", icon: BookMarked },
          { to: '/teacher/assignments', label: "Assignments", icon: ClipboardList },
          { to: '/teacher/quizzes', label: "Quizzes", icon: FileQuestion },
          { to: '/teacher/grading', label: "Grading center", icon: CheckSquare, badge: pending },
        ],
      },
      {
        group: "Students and analytics",
        items: [
          { to: '/teacher/students', label: "Students", icon: Users },
          { to: '/teacher/reports', label: "Reports", icon: BarChart3 },
        ],
      },
      {
        group: "Account",
        items: [
          { to: '/teacher/profile', label: "Profile", icon: User },
          { to: '/teacher/settings', label: "Settings", icon: Settings },
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
      <aside className="sidebar" aria-label="Sidebar navigation">
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
            <strong>{role === 'student' ? "Teacher workspace" : "Student workspace"}</strong>
            <span>{role === 'student' ? "See how teachers review and grade assignments." : "Explore the platform from a student's perspective."}</span>
            <Link to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} className="btn btn--primary btn--sm">Switch <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <button type="button" className="sidebar__link sidebar__collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronsRight aria-hidden="true" /> : <ChevronsLeft aria-hidden="true" />}
            <span className="label">Collapse</span>
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />

      <div className="shell__main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <SearchBar className="topbar__search" value={query} onChange={setQuery} onSubmit={runSearch} placeholder={role === 'student' ? "Search my courses…" : "Search courses…"} />
          <div className="topbar__actions">
            <div className="role-switch" role="group" aria-label="Choose a role">
              <Link to="/student/dashboard" className={cx(role === 'student' && 'active')} aria-label="Student">
                <GraduationCap aria-hidden="true" />
                <span>Student</span>
              </Link>
              <Link to="/teacher/dashboard" className={cx(role === 'teacher' && 'active')} aria-label="Teacher">
                <Presentation aria-hidden="true" />
                <span>Teacher</span>
              </Link>
            </div>
            <Dropdown
              width={340}
              trigger={({ toggle, open }) => (
                <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                  <Bell />
                  {unread > 0 && <span className="icon-btn__dot" />}
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="dropdown__head row row--between">
                    <strong className="small">Notifications</strong>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReadIds(new Set(notes.map((n) => n.id)))}>Mark as read</button>
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
                <button type="button" className="profile-btn" onClick={toggle} aria-expanded={open} aria-label="User menu">
                  <Person name={name} sub={role === 'student' ? "Student" : "Teacher"} size={34} />
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
                  <Link className="dropdown__item" to={`/${role}/profile`} onClick={close}><User />My profile</Link>
                  <Link className="dropdown__item" to={`/${role}/settings`} onClick={close}><Settings />Settings</Link>
                  <Link className="dropdown__item" to={role === 'student' ? '/teacher/dashboard' : '/student/dashboard'} onClick={close}>
                    <Repeat />Switch to {role === 'student' ? "teacher" : "student"} view</Link>
                  <div className="dropdown__sep" />
                  <button
                    type="button"
                    className="dropdown__item dropdown__item--danger"
                    onClick={() => {
                      close();
                      toast.info("You have left the demo", "No real session was created, so nothing was saved.");
                      navigate('/login');
                    }}
                  >
                    <LogOut />Sign out</button>
                </>
              )}
            </Dropdown>
          </div>
        </header>
        <div className="demo-banner" role="note">
          <FlaskConical aria-hidden="true" />Demo workspace: all data is illustrative. Changes stay on this page and are not sent to a server.</div>
        <main className="content" id="main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© 2026 LearnSpace · Demo</span>
          <nav aria-label="Additional navigation">
            <Link to="/">Home</Link>
            <Link to="/courses">Course catalog</Link>
            <Link to="/about">About</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}


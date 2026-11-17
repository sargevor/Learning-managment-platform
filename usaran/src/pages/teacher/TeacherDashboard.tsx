import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Check, ChevronRight, CircleAlert, ClipboardList, FileQuestionMark, Plus, Presentation, Send,
  SquareCheckBig, Star, Target, Users, Video,
} from 'lucide-react';
import type { Assignment, Course } from '../../types';
import { shortTitle, teacherCourses, teacherSubmissionRows } from '../../data/teacherView';
import { coursePerformance, recentActivity, studentRecords } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { useDemoSession } from '../../context/DemoSession';
import { ShellTitle } from '../../components/layout/AppShell';
import { StatCard } from '../../components/ui/StatCard';
import { IconBox } from '../../components/ui/Visual';
import { CATEGORY_ICONS, photoFor } from '../../lib/visual';
import { average, cx, formatNumber, TODAY } from '../../lib/format';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const todayLabel = () => `${WEEKDAYS[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]}`;

/** Short "ago" chip text: 40 min, 2 h, 1 d. */
function ago(v: string) {
  const min = Math.max(1, Math.round((TODAY.getTime() - new Date(v).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `${h} h` : `${Math.round(h / 24)} d`;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
}

/** Round portrait (or initials) used in the hero, chips and feed. */
function Face({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const photo = photoFor(name);
  return (
    <span className={cx('tc-face', className)} style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }} aria-hidden="true">
      {photo ? <img src={photo} alt="" loading="lazy" /> : initials(name)}
    </span>
  );
}

const ACTIVITY_ICON = { submission: Send, quiz: FileQuestionMark, lesson: Check, enroll: Plus };

/** English labels for the sample activity texts in data/analytics.ts (stored in Armenian there). */
const ACTIVITY_WHAT: Record<string, string> = {
  e1: 'Component Library',
  e2: 'Lists and keys',
  e3: 'pandas Fundamentals',
  e5: 'Query Collection',
  e6: 'React Core Concepts',
};

export function TeacherDashboard() {
  const { teacher } = useDemoSession();
  const pending = teacherSubmissionRows().filter((r) => r.submission.status === 'submitted');
  const published = teacherCourses.filter((c) => c.status === 'published');
  const totalStudents = published.reduce((n, c) => n + c.enrolled, 0);
  const rated = teacherCourses.filter((c) => c.rating > 0);
  const rating = rated.length ? rated.reduce((n, c) => n + c.rating, 0) / rated.length : 0;

  // Grading hero: unique students waiting + per-task queue.
  const waiting = [...new Map(pending.map((r) => [r.student.id, r.student])).values()];
  const faces = waiting.slice(0, 4);
  const byTask = new Map<string, { a: Assignment; course: Course; n: number }>();
  pending.forEach((r) => byTask.set(r.assignment.id, { a: r.assignment, course: r.course, n: (byTask.get(r.assignment.id)?.n ?? 0) + 1 }));
  const queue = [...byTask.values()].sort((x, y) => y.n - x.n).slice(0, 3);

  const perf = coursePerformance.map((p) => ({ ...p, course: getCourse(p.courseId) }));
  const lead = [...perf].sort((a, b) => b.avgAssignment + b.avgQuiz - (a.avgAssignment + a.avgQuiz))[0];
  const lag = [...perf].sort((a, b) => a.completionRate - b.completionRate)[0];
  const atRisk = studentRecords.filter((s) => s.status === 'at-risk');

  const create = [
    { label: 'New course', icon: BookOpen, to: '/teacher/courses/create' },
    { label: 'New task', icon: ClipboardList, to: '/teacher/assignments?new=1' },
    { label: 'New quiz', icon: FileQuestionMark, to: '/teacher/quizzes/new/edit' },
    { label: 'New lesson', icon: Video, to: `/teacher/courses/${teacherCourses[0]?.id}/content` },
  ];

  return (
    <div className="tc-page">
      <ShellTitle
        title={`Good morning, ${teacher.firstName}`}
        meta={<><Presentation aria-hidden="true" /><b>{teacherCourses.length} courses</b><span className="tc-dot" aria-hidden="true" />{todayLabel()}</>}
      />

      <section className="tc-hero-row">
        <div className="tc-queue">
          <div className="tc-queue__main">
            <div className="tc-queue__kicker"><SquareCheckBig aria-hidden="true" />Grading queue</div>
            <div className="tc-queue__count"><b>{pending.length}</b><span>to grade</span></div>
            {faces.length > 0 && (
              <div className="tc-faces">
                {faces.map((s) => <Face key={s.id} name={fullName(s)} />)}
                {waiting.length > faces.length && <span className="tc-face tc-face--more">+{waiting.length - faces.length}</span>}
              </div>
            )}
            <Link to="/teacher/grading" className="tc-pill tc-pill--white">Start grading<ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="tc-queue__list">
            {queue.map(({ a, course, n }) => {
              const Icon = CATEGORY_ICONS[course.category];
              return (
                <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="tc-queue__item">
                  <span className="tc-queue__icon" aria-hidden="true"><Icon /></span>
                  <span className="tc-grow">
                    <span className="tc-ellipsis tc-queue__title">{a.title}</span>
                    <span className="tc-ellipsis tc-queue__course">{course.title}</span>
                  </span>
                  <b className="tc-queue__n">{n}</b>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="tc-create">
          {create.map(({ label, icon: Icon, to }) => (
            <Link key={label} to={to} className="tc-create__tile v-lift">
              <IconBox icon={<Icon />} size="lg" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Summary" className="tc-stats">
        <StatCard label="Courses" value={teacherCourses.length} icon={<BookOpen />} to="/teacher/courses" />
        <StatCard label="Students" value={formatNumber(totalStudents)} icon={<Users />} trend="+214" to="/teacher/students" />
        <StatCard label="Average result" value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<Target />} trend="+3%" to="/teacher/reports" />
        <StatCard label="Course rating" value={rating.toFixed(1)} icon={<Star />} to="/teacher/reports" />
      </section>

      <section className="tc-split">
        <div className="tc-split__main">
          <div className="tc-card">
            <div className="tc-card__head">
              <h2>{lead && lag ? `${shortTitle(lead.courseId)} leads, ${shortTitle(lag.courseId)} completion lags` : 'Course performance'}</h2>
              <div className="tc-legend">
                <span><i className="tc-sw tc-sw--navy" />Tasks</span>
                <span><i className="tc-sw tc-sw--blue" />Quizzes</span>
                <span><i className="tc-sw tc-sw--light" />Completion</span>
              </div>
            </div>
            <div className="tc-perf">
              {perf.map((p) => {
                const Icon = p.course ? CATEGORY_ICONS[p.course.category] : BookOpen;
                return (
                  <Link key={p.courseId} to={`/teacher/courses/${p.courseId}`} className="tc-perf__row">
                    <span className="tc-perf__name">
                      <IconBox icon={<Icon />} size="md" />
                      <span className="tc-grow">
                        <b>{shortTitle(p.courseId)}</b>
                        <span className="tc-mini"><Users aria-hidden="true" />{formatNumber(p.enrolled)}</span>
                      </span>
                    </span>
                    <span className="tc-perf__bars">
                      {([['Tasks', p.avgAssignment, 'navy'], ['Quizzes', p.avgQuiz, 'blue'], ['Completion', p.completionRate, 'light']] as const).map(([label, v, tone]) => (
                        <span key={label} className="tc-bar" role="img" aria-label={`${label}: ${v}%`}>
                          <span className="tc-bar__track"><span className={`tc-bar__fill tc-sw--${tone}`} style={{ width: `${v}%` }} /></span>
                          <span className="tc-bar__v">{v}%</span>
                        </span>
                      ))}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {atRisk.length > 0 && (
            <div className="tc-card tc-alert">
              <IconBox icon={<CircleAlert />} size="lg" tone="red" />
              <div className="tc-alert__text">
                <b>{atRisk.length} {atRisk.length === 1 ? 'student is' : 'students are'} falling behind</b>
                <span>Low score or progress</span>
              </div>
              <div className="tc-alert__people">
                {atRisk.map((r) => {
                  const u = getUser(r.userId);
                  return (
                    <Link key={r.userId} to={`/teacher/students/${r.userId}`} className="tc-person-chip">
                      <Face name={fullName(u)} size={32} />
                      {u?.firstName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="tc-card tc-feed">
          <div className="tc-card__head">
            <h2>Activity</h2>
            <Link to="/teacher/students" className="v-more">All<ChevronRight aria-hidden="true" /></Link>
          </div>
          <div className="tc-feed__list">
            {recentActivity.map((e) => {
              const Icon = ACTIVITY_ICON[e.kind];
              const name = fullName(getUser(e.studentId));
              const course = getCourse(e.courseId);
              const score = e.kind === 'quiz' ? e.text.match(/(\d+)%/)?.[1] : undefined;
              const what = e.kind === 'enroll' ? `Joined ${course?.title ?? ''}` : ACTIVITY_WHAT[e.id] ?? course?.title ?? '';
              return (
                <Link key={e.id} to={`/teacher/students/${e.studentId}`} className="tc-feed__row">
                  <span className="tc-feed__av">
                    <Face name={name} size={44} className="tc-face--soft" />
                    <span className="tc-feed__badge" aria-hidden="true"><Icon /></span>
                  </span>
                  <span className="tc-grow">
                    <b className="tc-ellipsis">{name}</b>
                    <span className="tc-ellipsis tc-sub">{what}</span>
                  </span>
                  <span className={cx('tc-tag', score && 'tc-tag--blue')}>{score ? `${score}%` : ago(e.time)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

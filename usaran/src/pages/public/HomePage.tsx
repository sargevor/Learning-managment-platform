import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, BarChart3, Bell, BookOpen, Check, ClipboardList, Clock, FileText, GraduationCap, GripVertical, HelpCircle,
  Layers, LayoutDashboard, Lock, Play, PlayCircle, Plus, Presentation, Search, Star, TrendingUp, Users,
} from 'lucide-react';
import type { CategoryId, Course } from '../../types';
import { categories, findLesson, getCourse, publishedCourses } from '../../data/courses';
import { fullName, getUser, teachers } from '../../data/users';
import { getEnrolledCourses } from '../../data/enrollments';
import { getGradeRows, getStudentAssignments, scoreTone } from '../../data/studentView';
import { shortTitle, teacherSubmissionRows } from '../../data/teacherView';
import { coursePerformance, studentRecords, studentWeeklyMinutes } from '../../data/analytics';
import { CourseCard } from '../../components/course/CourseBits';
import { BrandMark } from '../../components/layout/Brand';
import { Avatar } from '../../components/ui/Misc';
import { ButtonLink } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/Progress';
import { useDemoSession } from '../../context/DemoSession';
import { average, cx, daysUntil, formatNumber, relativeDue } from '../../lib/format';
import { CATEGORY_ICONS, CATEGORY_TINT, SCENES, categoryImage, photoFor } from '../../lib/visual';

/* Four-point star used as a small decorative accent. */
function Spark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
    </svg>
  );
}

const byCategory = (id: CategoryId) => publishedCourses.filter((c) => c.category === id).sort((a, b) => b.rating - a.rating);
const avgRating = (list: Course[]) => (list.length ? list.reduce((n, c) => n + c.rating, 0) / list.length : 0);

export function HomePage() {
  const enrolled = getEnrolledCourses();
  const grades = getGradeRows().filter((g) => g.percent >= 0);
  const current = [...enrolled].filter((e) => e.state === 'in-progress').sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))[0] ?? enrolled[0];
  const currentLesson = findLesson(current.enrollment.lastLessonId);
  const moduleIndex = currentLesson ? current.course.modules.findIndex((m) => m.id === currentLesson.module.id) : 0;
  const lessonIndex = currentLesson ? currentLesson.module.lessons.findIndex((l) => l.id === currentLesson.lesson.id) : 0;
  const latestGrade = [...grades].filter((g) => g.kind === 'assignment').sort((a, b) => b.date.localeCompare(a.date))[0];
  const platformRating = avgRating(publishedCourses);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="lp-hero">
        <div className="container lp-hero__grid">
          <div>
            <span className="lp-badge"><b>New</b>Your space to learn online</span>
            <h1>Learn with {' '}
              <span className="hl">inspiration<svg viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 12 C 50 3, 110 3, 150 9 S 215 15, 237 6" />
                </svg>
              </span>
            </h1>
            <p className="lp-hero__lead">Video lessons, quizzes, and personal feedback, all in one place.</p>
            <div className="lp-hero__actions">
              <ButtonLink to="/register" variant="accent" size="lg" iconRight={<ArrowRight />}>Start Learning</ButtonLink>
              <button type="button" className="lp-play" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                <span><Play aria-hidden="true" /></span>How It Works</button>
            </div>
            <div className="lp-proof">
              <div className="avatar-stack">
                {["Tigran Melkonyan", "Ani Hakobyan", "Sona Mikayelyan", "Hayk Vardanyan"].map((n) => <Avatar key={n} name={n} size={44} />)}
              </div>
              <div className="lp-proof__text">
                <div><span className="lp-stars" aria-hidden="true">★★★★★</span> <b className="tabular">{platformRating.toFixed(1)}</b></div>average course rating</div>
            </div>
          </div>

          <div className="lp-stage">
            <div className="lp-arch-bg" aria-hidden="true" />
            <div className="lp-arch"><img src={SCENES.hero} alt="Students laughing while working together on laptops" /></div>
            <div className="lp-orb"><img src={SCENES.study} alt="Students working on an assignment together" /></div>
            <Spark className="lp-spark lp-spark--a" />
            <Spark className="lp-spark lp-spark--b" />
            <div className="lp-float lp-float--course" aria-hidden="true">
              <img src={current.course.image} alt="" />
              <div className="grow">
                <b>{shortTitle(current.course.id)}</b>
                <small>Module {moduleIndex + 1} · {lessonIndex + 1} / {currentLesson?.module.lessons.length ?? 0} lessons</small>
                <ProgressBar value={current.progress} showValue={false} />
              </div>
            </div>
            {latestGrade && (
              <div className="lp-float lp-float--grade" aria-hidden="true">
                <span className="tint-box t-mint"><Award /></span>
                <div>
                  <small>New grade</small>
                  <b className="tabular">{latestGrade.score} / {latestGrade.max}</b>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CategoryExplorer />

      {/* ───────── Popular courses ───────── */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="lp-head">
            <div>
              <span className="kicker">Courses</span>
              <h2 className="lp-h2">Featured Courses</h2>
            </div>
            <Link to="/courses" className="lp-more">All Courses <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="lp-courses">
            {publishedCourses.filter((c) => c.featured).slice(0, 4).map((c) => <CourseCard key={c.id} course={c} hideDescription />)}
          </div>
        </div>
      </section>

      <Showcase />
      <Features />

      {/* ───────── Teachers ───────── */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="kicker">Instructors</span>
          <h2 className="lp-h2">Meet your <span className="hl">instructors</span></h2>
          <div className="lp-teachers">
            {teachers.slice(0, 4).map((t, i) => {
              const name = fullName(t);
              const mine = publishedCourses.filter((c) => c.teacherId === t.id);
              return (
                <div key={t.id} className={cx('lp-teacher', ['t-sky', 't-rose', 't-sun', 't-lilac'][i])}>
                  <div className="lp-teacher__img"><img src={photoFor(name)} alt={name} loading="lazy" /></div>
                  <h3>{name}</h3>
                  <p>{t.title}</p>
                  <div className="lp-teacher__meta">
                    <span><Star aria-hidden="true" />{avgRating(mine).toFixed(1)}</span>
                    <span>{mine.length} courses</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ForTeachers />

      {/* ───────── CTA ───────── */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="lp-cta">
            <div>
              <span className="kicker">Start Today</span>
              <h2 className="lp-h2">Choose a course and <span className="hl">start learning</span></h2>
              <div className="lp-cta__actions">
                <ButtonLink to="/register" variant="accent" size="lg" iconRight={<ArrowRight />}>Create Account</ButtonLink>
                <ButtonLink to="/student/dashboard" variant="secondary" size="lg">Try the Student Experience</ButtonLink>
              </div>
            </div>
            <div className="lp-cta__art">
              <span className="lp-cta__ring" aria-hidden="true" />
              <div className="lp-cta__arch"><img src={SCENES.cta} alt="Students studying together in a library" loading="lazy" /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────── Category explorer: list on the left, the selected direction on the right ───────── */
function CategoryExplorer() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const paused = useRef(false);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const cat = categories[index];
  const list = byCategory(cat.id);
  const Icon = CATEGORY_ICONS[cat.id];

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % categories.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [auto]);

  const choose = (i: number, focus = false) => {
    setAuto(false);
    setIndex(i);
    if (focus) items.current[i]?.focus();
  };

  return (
    <section className="lp-section" id="categories" style={{ paddingTop: 'clamp(24px, 4vw, 48px)' }}>
      <div className="container">
        <div className="lp-head">
          <div>
            <span className="kicker">Subjects</span>
            <h2 className="lp-h2">What would you like to <span className="hl">learn?</span></h2>
          </div>
          <Link to="/courses" className="lp-more">All Categories <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="lp-explore" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
          <div className="lp-clist" role="tablist" aria-label="Subjects" aria-orientation="vertical">
            {categories.map((c, i) => {
              const CIcon = CATEGORY_ICONS[c.id];
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`cat-${c.id}`}
                  aria-controls="cat-panel"
                  aria-selected={i === index}
                  tabIndex={i === index ? 0 : -1}
                  className={cx('lp-citem', CATEGORY_TINT[c.id])}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => {
                    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                    if (!d) return;
                    e.preventDefault();
                    choose((i + d + categories.length) % categories.length, true);
                  }}
                >
                  <span className="tint-box"><CIcon /></span>
                  <span className="lp-citem__text">
                    <span className="lp-citem__name">{c.name}</span>
                    <span className="lp-citem__count">{byCategory(c.id).length} courses</span>
                  </span>
                  <span className="lp-citem__go" aria-hidden="true"><ArrowRight /></span>
                </button>
              );
            })}
          </div>
          <div className={cx('lp-cpanel', CATEGORY_TINT[cat.id])} id="cat-panel" role="tabpanel" aria-labelledby={`cat-${cat.id}`}>
            <div className="lp-cpanel__copy" key={cat.id}>
              <span className="lp-cpanel__count"><span className="tint-box"><Icon /></span>{list.length} courses</span>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <ul className="lp-cc">
                {list.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link to={`/courses/${c.id}`}>
                      <span className="tint-box"><BookOpen /></span>
                      <span className="lp-cc__text">
                        <b>{c.title}</b>
                        <span className="lp-cc__meta">
                          <span className="r"><Star aria-hidden="true" />{c.rating.toFixed(1)}</span>
                          <span><Clock aria-hidden="true" />{c.durationHours} hr</span>
                        </span>
                      </span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink to={`/courses?category=${cat.id}`} variant="primary" iconRight={<ArrowRight />}>Browse courses in this category</ButtonLink>
            </div>
            <div className="lp-cpanel__art">
              <div className="lp-cpanel__arch"><img key={cat.id} src={categoryImage(cat.id)} alt={cat.name} /></div>
              <div className="lp-cpanel__rating">
                <span className="tint-box t-sun"><Star /></span>
                <div><b className="tabular">{avgRating(list).toFixed(1)}</b>average rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Showcase: a live slice of both dashboards ───────── */
function Showcase() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  return (
    <section className="lp-section lp-showcase" id="demo">
      <div className="container">
        <div className="lp-head">
          <div>
            <span className="kicker">The Platform</span>
            <h2 className="lp-h2">Keep track of your <span className="hl">learning</span></h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Workspace" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button type="button" role="tab" className="tabs__tab" aria-selected={role === 'student'} onClick={() => setRole('student')}>
              <GraduationCap size={16} aria-hidden="true" />Student</button>
            <button type="button" role="tab" className="tabs__tab" aria-selected={role === 'teacher'} onClick={() => setRole('teacher')}>
              <Presentation size={16} aria-hidden="true" />Instructor</button>
          </div>
        </div>
        <div className="lp-browser">
          <div className="lp-browser__bar">
            <div className="lp-dots" aria-hidden="true"><i /><i /><i /></div>
            <div className="lp-address"><Lock aria-hidden="true" />learnspace.example/{role}/dashboard</div>
            <div className="lp-dots" aria-hidden="true" style={{ visibility: 'hidden' }}><i /><i /><i /></div>
          </div>
          {role === 'student' ? <StudentDemo key="s" /> : <TeacherDemo key="t" />}
        </div>
        <div className="lp-showcase__foot">
          <span className="demo-flag">Sample data</span>
          <ButtonLink to={`/${role}/dashboard`} variant="primary" iconRight={<ArrowRight />}>Open {role === 'student' ? "student" : "teacher"} Dashboard</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function DemoSide({ items }: { items: { label: string; icon: typeof BookOpen; badge?: number }[] }) {
  return (
    <div className="lp-side" aria-hidden="true">
      <span className="brand"><BrandMark /><span className="brand__text">LearnSpace</span></span>
      {items.map((it, i) => (
        <span key={it.label} className={cx('lp-side__item', i === 0 && 'on')}>
          <it.icon />
          <span>{it.label}</span>
          {it.badge ? <b>{it.badge}</b> : null}
        </span>
      ))}
    </div>
  );
}

function StudentDemo() {
  const { student } = useDemoSession();
  const enrolled = getEnrolledCourses();
  const assignments = getStudentAssignments();
  const grades = getGradeRows().filter((g) => g.percent >= 0);
  const open = assignments.filter((a) => a.status === 'not-started' || a.status === 'draft').sort((a, b) => a.assignment.dueDate.localeCompare(b.assignment.dueDate));
  const current = [...enrolled].filter((e) => e.state === 'in-progress').sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))[0] ?? enrolled[0];
  const next = findLesson(current.enrollment.lastLessonId);
  const max = Math.max(...studentWeeklyMinutes.map((p) => p.value), 1);
  const peak = studentWeeklyMinutes.reduce((b, p, i) => (p.value > studentWeeklyMinutes[b].value ? i : b), 0);
  const total = studentWeeklyMinutes.reduce((n, p) => n + p.value, 0);
  const recent = [...grades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const tone = { good: 't-mint', mid: 't-sun', low: 't-rose' } as const;

  return (
    <div className="lp-app">
      <DemoSide
        items={[
          { label: "Dashboard", icon: LayoutDashboard },
          { label: "My courses", icon: BookOpen },
          { label: "Assignments", icon: ClipboardList, badge: open.length },
          { label: "Quizzes", icon: HelpCircle },
          { label: "Progress", icon: TrendingUp },
        ]}
      />
      <div className="lp-main">
        <div className="lp-main__head">
          <div>
            <h3>Welcome back, {student.firstName}</h3>
            <p>Thursday, October 15</p>
          </div>
          <div className="row" style={{ ['--gap' as string]: '10px' }}>
            <span className="icon-btn lp-hide-sm" aria-hidden="true"><Search /></span>
            <span className="icon-btn" aria-hidden="true"><Bell /><span className="icon-btn__dot" /></span>
            <Avatar name={`${student.firstName} ${student.lastName}`} size={44} />
          </div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-sky"><BookOpen /></span><div><b>{enrolled.filter((e) => e.state === 'in-progress').length}</b><span>active courses</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-mint"><Check /></span><div><b>{assignments.filter((a) => a.status === 'graded' || a.status === 'submitted').length}</b><span>submitted assignments</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-sun"><Star /></span><div><b>{average(grades.map((g) => g.percent))}</b><span>average score</span></div></div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-span2">
            <div className="lp-resume">
              <div className="lp-resume__img"><img src={current.course.image} alt="" /><span className="lp-pbtn"><Play aria-hidden="true" /></span></div>
              <div className="lp-resume__body">
                <span className={cx('lp-tag', CATEGORY_TINT[current.course.category])}>Continue Learning</span>
                <h4>{current.course.title}</h4>
                {next && <p>Up next: {next.lesson.title} · {next.lesson.durationMin} min</p>}
                <ProgressBar value={current.progress} />
              </div>
            </div>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">Deadlines</div>
            <ul className="lp-rows">
              {open.slice(0, 3).map((a) => {
                const d = daysUntil(a.assignment.dueDate);
                return (
                  <li key={a.assignment.id}>
                    <span className={cx('tint-box', d <= 3 ? 't-rose' : 't-sky')}><ClipboardList /></span>
                    <div className="lp-rows__text"><b>{a.assignment.title}</b><span>{shortTitle(a.course.id)}</span></div>
                    <span className={cx('badge', d <= 3 ? 'badge--danger' : 'badge--info')}>{relativeDue(a.assignment.dueDate)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-span2">
            <div className="lp-panel__title">Learning Minutes<span>this week · {formatNumber(total)} min</span></div>
            <div className="lp-bars" role="img" aria-label={`Learning minutes by day: ${studentWeeklyMinutes.map((p) => `${p.label} ${p.value}`).join(', ')}`}>
              {studentWeeklyMinutes.map((p, i) => (
                <div key={p.label} className={cx(i === peak && 'peak')}>
                  <i style={{ ['--h' as string]: `${(p.value / max) * 92}%` }} data-v={`${p.value} min`} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">Recent Grades</div>
            <ul className="lp-rows">
              {recent.map((g) => (
                <li key={g.id}>
                  <div className="lp-rows__text"><b>{g.title}</b><span>{shortTitle(g.course.id)}</span></div>
                  <span className={cx('badge', tone[scoreTone(g.percent)] === 't-mint' ? 'badge--success' : tone[scoreTone(g.percent)] === 't-sun' ? 'badge--warning' : 'badge--danger')}>{g.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDemo() {
  const { teacher } = useDemoSession();
  const rows = teacherSubmissionRows();
  const pending = rows.filter((r) => r.submission.status === 'submitted');
  const totalStudents = coursePerformance.reduce((n, p) => n + p.enrolled, 0);
  const completion = average(coursePerformance.map((p) => p.completionRate));

  return (
    <div className="lp-app">
      <DemoSide
        items={[
          { label: "Dashboard", icon: LayoutDashboard },
          { label: "Courses", icon: Layers },
          { label: "Grading", icon: Award, badge: pending.length },
          { label: "Students", icon: Users },
          { label: "Reports", icon: BarChart3 },
        ]}
      />
      <div className="lp-main">
        <div className="lp-main__head">
          <div>
            <h3>Hello, {teacher.firstName}</h3>
            <p>{pending.length} submissions awaiting review</p>
          </div>
          <div className="row" style={{ ['--gap' as string]: '10px' }}>
            <span className="icon-btn lp-hide-sm" aria-hidden="true"><Search /></span>
            <span className="icon-btn" aria-hidden="true"><Bell /><span className="icon-btn__dot" /></span>
            <Avatar name={`${teacher.firstName} ${teacher.lastName}`} size={44} />
          </div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-lilac"><Users /></span><div><b>{formatNumber(totalStudents)}</b><span>enrolled students</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-peach"><ClipboardList /></span><div><b>{pending.length}</b><span>pending submissions</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-mint"><TrendingUp /></span><div><b>{completion}%</b><span>average completion rate</span></div></div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-span2">
            <div className="lp-panel__title">Grading Queue<span>{studentRecords.length} students</span></div>
            <ul className="lp-rows">
              {pending.slice(0, 4).map((r) => (
                <li key={r.submission.id}>
                  <Avatar name={fullName(r.student)} size={38} />
                  <div className="lp-rows__text"><b>{fullName(r.student)}</b><span>{r.assignment.title} · {shortTitle(r.course.id)}</span></div>
                  <span className="lp-mini-btn">Grade</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">Average Result</div>
            <div style={{ marginTop: 12 }}>
              {coursePerformance.map((p) => (
                <div key={p.courseId} className="lp-hb">
                  <b>{shortTitle(p.courseId)}</b>
                  <ProgressBar value={p.avgAssignment} showValue={false} />
                  <span>{p.avgAssignment}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Features: video, a playable quiz question, teacher feedback ───────── */
function Features() {
  const [picked, setPicked] = useState<string | null>(null);
  const feedback = useMemo(() => getStudentAssignments().find((a) => a.status === 'graded' && a.submission?.feedback), []);
  const answer = 'object';
  const options = ['null', 'object', 'undefined', 'number'];
  const reviewer = feedback ? getUser(getCourse(feedback.course.id)?.teacherId) : undefined;

  return (
    <section className="lp-section">
      <div className="container">
        <span className="kicker">How Learning Works</span>
        <h2 className="lp-h2">Learn and <span className="hl">put your skills into practice</span></h2>
        <div className="lp-features">
          <article className="lp-feature">
            <div className="lp-feature__visual">
              <img src={SCENES.video} alt="A student pointing at a laptop screen" loading="lazy" />
              <span className="lp-vplay" aria-hidden="true"><Play /></span>
              <div className="lp-vbar" aria-hidden="true">
                <span className="tabular">06:12</span>
                <div className="progress__track"><div className="progress__fill" style={{ width: '34%' }} /></div>
                <span className="tabular">18:00</span>
              </div>
            </div>
            <div className="lp-feature__copy">
              <h3>Video Lessons</h3>
              <p>Short lessons you can watch whenever it suits you.</p>
            </div>
          </article>

          <article className="lp-feature t-lilac">
            <div className="lp-feature__visual">
              <div className="lp-qtitle">What does this code print?</div>
              <div className="lp-code"><span className="k">console</span>.<span className="f">log</span>(<span className="k">typeof</span> null)</div>
              <div className="lp-opts">
                {options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={cx('lp-opt', picked && (o === answer ? 'is-right' : o === picked ? 'is-wrong' : 'is-dim'))}
                    disabled={!!picked}
                    onClick={() => setPicked(o)}
                  >
                    "{o}"
                  </button>
                ))}
              </div>
              <div className="lp-qout" aria-live="polite">
                {picked ? (
                  <>
                    <span>{picked === answer ? "Correct! This is a well-known historical quirk." : `The correct answer is: ${answer}"`}</span>
                    <button type="button" onClick={() => setPicked(null)}>Try Again</button>
                  </>
                ) : (
                  "Choose an Answer"
                )}
              </div>
            </div>
            <div className="lp-feature__copy">
              <h3>Quizzes</h3>
              <p>Answer the question and check your result immediately.</p>
            </div>
          </article>

          <article className="lp-feature t-mint">
            <div className="lp-feature__visual">
              {feedback && feedback.submission && (
                <>
                  <div className="lp-fb-card">
                    <span className="tint-box t-mint"><ClipboardList /></span>
                    <div style={{ minWidth: 0 }}><b>{feedback.assignment.title}</b><span>Graded</span></div>
                    <span className="lp-fb-score">{feedback.submission.score}<small>/{feedback.assignment.maxScore}</small></span>
                  </div>
                  <div className="lp-fb-bubble">{feedback.submission.feedback}</div>
                  {reviewer && <div className="lp-fb-who">{fullName(reviewer)} <Avatar name={fullName(reviewer)} size={26} /></div>}
                </>
              )}
            </div>
            <div className="lp-feature__copy">
              <h3>Instructor Feedback</h3>
              <p>Personal feedback from your instructor on every assignment.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ───────── For teachers: classroom photo with a course-builder card ───────── */
function ForTeachers() {
  const course = getCourse('react')!;
  const module = course.modules[2];
  const TYPE_ICON = { video: PlayCircle, text: FileText, resource: BookOpen, assignment: ClipboardList, quiz: HelpCircle } as const;
  const TYPE_TINT = { video: 't-sky', text: 't-lilac', resource: 't-mint', assignment: 't-peach', quiz: 't-sun' } as const;
  return (
    <section className="lp-section lp-showcase">
      <div className="container lp-split">
        <div className="lp-split__visual">
          <div className="lp-split__photo"><img src={SCENES.teacher} alt="An instructor teaching in a classroom" loading="lazy" /></div>
          <div className="lp-builder" aria-hidden="true">
            <div className="lp-builder__head"><b>Module 3 · {module.title}</b><span className="badge badge--success">Published</span></div>
            <ul className="lp-rows">
              {module.lessons.slice(0, 3).map((l) => {
                const I = TYPE_ICON[l.type];
                return (
                  <li key={l.id}>
                    <GripVertical className="lp-grip" />
                    <span className={cx('tint-box', TYPE_TINT[l.type])}><I /></span>
                    <div className="lp-rows__text"><b>{l.title}</b><span>{l.durationMin} min</span></div>
                  </li>
                );
              })}
            </ul>
            <div className="lp-add"><Plus />Add Lesson</div>
          </div>
        </div>
        <div>
          <span className="kicker">For teachers</span>
          <h2 className="lp-h2">Create your <span className="hl">course</span></h2>
          <ul className="lp-checks">
            <li><span className="tint-box t-sky"><Layers /></span>Modules, lessons, and materials</li>
            <li><span className="tint-box t-lilac"><HelpCircle /></span>Quizzes and assignments</li>
            <li><span className="tint-box t-mint"><BarChart3 /></span>Individual student reports</li>
          </ul>
          <ButtonLink to="/teacher/dashboard" variant="primary" size="lg" iconRight={<ArrowRight />}>Explore the Instructor Dashboard</ButtonLink>
        </div>
      </div>
    </section>
  );
}

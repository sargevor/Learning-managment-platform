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
import { tr } from '../../i18n';

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
            <span className="lp-badge"><b>{tr("New", "Նոր")}</b>{tr("Your space to learn online", "Առցանց ուսում՝ հայերենով")}</span>
            <h1>{tr("Learn with ", "Սովորեք")}{' '}
              <span className="hl">{tr("inspiration", "ոգեշնչմամբ")}<svg viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 12 C 50 3, 110 3, 150 9 S 215 15, 237 6" />
                </svg>
              </span>
            </h1>
            <p className="lp-hero__lead">{tr("Video lessons, quizzes, and personal feedback, all in one place.", "Տեսադասեր, թեստեր և անհատական հետադարձ կապ՝ մեկ հարթակում։")}</p>
            <div className="lp-hero__actions">
              <ButtonLink to="/register" variant="accent" size="lg" iconRight={<ArrowRight />}>{tr("Start Learning", "Սկսել ուսումը")}</ButtonLink>
              <button type="button" className="lp-play" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                <span><Play aria-hidden="true" /></span>{tr("How It Works", "Ինչպես է աշխատում")}</button>
            </div>
            <div className="lp-proof">
              <div className="avatar-stack">
                {[tr("Tigran Melkonyan", "Տիգրան Մելքոնյան"), tr("Ani Hakobyan", "Անի Հակոբյան"), tr("Sona Mikayelyan", "Սոնա Միքայելյան"), tr("Hayk Vardanyan", "Հայկ Վարդանյան")].map((n) => <Avatar key={n} name={n} size={44} />)}
              </div>
              <div className="lp-proof__text">
                <div><span className="lp-stars" aria-hidden="true">★★★★★</span> <b className="tabular">{platformRating.toFixed(1)}</b></div>{tr("average course rating", "դասընթացների միջին վարկանիշը")}</div>
            </div>
          </div>

          <div className="lp-stage">
            <div className="lp-arch-bg" aria-hidden="true" />
            <div className="lp-arch"><img src={SCENES.hero} alt={tr("Students laughing while working together on laptops", "Ուսանողները ծիծաղում են՝ միասին աշխատելով նոութբուքերի վրա")} /></div>
            <div className="lp-orb"><img src={SCENES.study} alt={tr("Students working on an assignment together", "Ուսանողները միասին լուծում են առաջադրանք")} /></div>
            <Spark className="lp-spark lp-spark--a" />
            <Spark className="lp-spark lp-spark--b" />
            <div className="lp-float lp-float--course" aria-hidden="true">
              <img src={current.course.image} alt="" />
              <div className="grow">
                <b>{shortTitle(current.course.id)}</b>
                <small>{tr("Module ", "Մոդուլ ")}{moduleIndex + 1} · {lessonIndex + 1} / {currentLesson?.module.lessons.length ?? 0}{tr(" lessons", " դաս")}</small>
                <ProgressBar value={current.progress} showValue={false} />
              </div>
            </div>
            {latestGrade && (
              <div className="lp-float lp-float--grade" aria-hidden="true">
                <span className="tint-box t-mint"><Award /></span>
                <div>
                  <small>{tr("New grade", "Նոր գնահատական")}</small>
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
              <span className="kicker">{tr("Courses", "Դասընթացներ")}</span>
              <h2 className="lp-h2">{tr("Featured Courses", "Առաջարկվող դասընթացներ")}</h2>
            </div>
            <Link to="/courses" className="lp-more">{tr("All Courses ", "Բոլոր դասընթացները ")}<ArrowRight aria-hidden="true" /></Link>
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
          <span className="kicker">{tr("Instructors", "Դասավանդողներ")}</span>
          <h2 className="lp-h2">{tr("Meet your ", "Ծանոթացեք ձեր ")}<span className="hl">{tr("instructors", "դասավանդողներին")}</span></h2>
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
                    <span>{mine.length}{tr(" courses", " դասընթաց")}</span>
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
              <span className="kicker">{tr("Start Today", "Սկսեք այսօր")}</span>
              <h2 className="lp-h2">{tr("Choose a course and ", "Ընտրեք դասընթաց և ")}<span className="hl">{tr("start learning", "սկսեք սովորել")}</span></h2>
              <div className="lp-cta__actions">
                <ButtonLink to="/register" variant="accent" size="lg" iconRight={<ArrowRight />}>{tr("Create Account", "Ստեղծել հաշիվ")}</ButtonLink>
                <ButtonLink to="/student/dashboard" variant="secondary" size="lg">{tr("Try the Student Experience", "Փորձել ուսանողի միջավայրը")}</ButtonLink>
              </div>
            </div>
            <div className="lp-cta__art">
              <span className="lp-cta__ring" aria-hidden="true" />
              <div className="lp-cta__arch"><img src={SCENES.cta} alt={tr("Students studying together in a library", "Ուսանողները միասին պարապում են գրադարանում")} loading="lazy" /></div>
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
            <span className="kicker">{tr("Subjects", "Ուղղություններ")}</span>
            <h2 className="lp-h2">{tr("What would you like to ", "Ի՞նչ եք ցանկանում ")}<span className="hl">{tr("learn?", "սովորել")}</span></h2>
          </div>
          <Link to="/courses" className="lp-more">{tr("All Categories ", "Բոլոր ուղղությունները ")}<ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="lp-explore" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
          <div className="lp-clist" role="tablist" aria-label={tr("Subjects", "Ուղղություններ")} aria-orientation="vertical">
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
                    <span className="lp-citem__count">{byCategory(c.id).length}{tr(" courses", " դասընթաց")}</span>
                  </span>
                  <span className="lp-citem__go" aria-hidden="true"><ArrowRight /></span>
                </button>
              );
            })}
          </div>
          <div className={cx('lp-cpanel', CATEGORY_TINT[cat.id])} id="cat-panel" role="tabpanel" aria-labelledby={`cat-${cat.id}`}>
            <div className="lp-cpanel__copy" key={cat.id}>
              <span className="lp-cpanel__count"><span className="tint-box"><Icon /></span>{list.length}{tr(" courses", " դասընթաց")}</span>
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
                          <span><Clock aria-hidden="true" />{c.durationHours}{tr(" hr", " ժամ")}</span>
                        </span>
                      </span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink to={`/courses?category=${cat.id}`} variant="primary" iconRight={<ArrowRight />}>{tr("Browse courses in this category", "Դիտել ուղղության դասընթացները")}</ButtonLink>
            </div>
            <div className="lp-cpanel__art">
              <div className="lp-cpanel__arch"><img key={cat.id} src={categoryImage(cat.id)} alt={cat.name} /></div>
              <div className="lp-cpanel__rating">
                <span className="tint-box t-sun"><Star /></span>
                <div><b className="tabular">{avgRating(list).toFixed(1)}</b>{tr("average rating", "միջին վարկանիշ")}</div>
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
            <span className="kicker">{tr("The Platform", "Հարթակը")}</span>
            <h2 className="lp-h2">{tr("Keep track of your ", "Հետևեք ձեր ")}<span className="hl">{tr("learning", "առաջընթացին")}</span></h2>
          </div>
          <div className="tabs" role="tablist" aria-label={tr("Workspace", "Միջավայր")} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button type="button" role="tab" className="tabs__tab" aria-selected={role === 'student'} onClick={() => setRole('student')}>
              <GraduationCap size={16} aria-hidden="true" />{tr("Student", "Ուսանող")}</button>
            <button type="button" role="tab" className="tabs__tab" aria-selected={role === 'teacher'} onClick={() => setRole('teacher')}>
              <Presentation size={16} aria-hidden="true" />{tr("Instructor", "Դասավանդող")}</button>
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
          <span className="demo-flag">{tr("Sample data", "Ցուցադրական տվյալներ")}</span>
          <ButtonLink to={`/${role}/dashboard`} variant="primary" iconRight={<ArrowRight />}>{tr("Open ", "Բացել ")}{role === 'student' ? tr("student", "ուսանողի") : tr("teacher", "դասավանդողի")}{tr(" Dashboard", " վահանակը")}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function DemoSide({ items }: { items: { label: string; icon: typeof BookOpen; badge?: number }[] }) {
  return (
    <div className="lp-side" aria-hidden="true">
      <span className="brand"><BrandMark /><span className="brand__text">{tr("LearnSpace", "LearnSpace")}</span></span>
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
          { label: tr("Dashboard", "Վահանակ"), icon: LayoutDashboard },
          { label: tr("My courses", "Իմ դասընթացները"), icon: BookOpen },
          { label: tr("Assignments", "Առաջադրանքներ"), icon: ClipboardList, badge: open.length },
          { label: tr("Quizzes", "Թեստեր"), icon: HelpCircle },
          { label: tr("Progress", "Առաջընթաց"), icon: TrendingUp },
        ]}
      />
      <div className="lp-main">
        <div className="lp-main__head">
          <div>
            <h3>{tr("Welcome back, ", "Բարի վերադարձ, ")}{student.firstName}</h3>
            <p>{tr("Thursday, October 15", "Հինգշաբթի, 15 հոկտեմբերի")}</p>
          </div>
          <div className="row" style={{ ['--gap' as string]: '10px' }}>
            <span className="icon-btn lp-hide-sm" aria-hidden="true"><Search /></span>
            <span className="icon-btn" aria-hidden="true"><Bell /><span className="icon-btn__dot" /></span>
            <Avatar name={`${student.firstName} ${student.lastName}`} size={44} />
          </div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-sky"><BookOpen /></span><div><b>{enrolled.filter((e) => e.state === 'in-progress').length}</b><span>{tr("active courses", "ակտիվ դասընթաց")}</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-mint"><Check /></span><div><b>{assignments.filter((a) => a.status === 'graded' || a.status === 'submitted').length}</b><span>{tr("submitted assignments", "հանձնված աշխատանք")}</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-sun"><Star /></span><div><b>{average(grades.map((g) => g.percent))}</b><span>{tr("average score", "միջին միավոր")}</span></div></div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-span2">
            <div className="lp-resume">
              <div className="lp-resume__img"><img src={current.course.image} alt="" /><span className="lp-pbtn"><Play aria-hidden="true" /></span></div>
              <div className="lp-resume__body">
                <span className={cx('lp-tag', CATEGORY_TINT[current.course.category])}>{tr("Continue Learning", "Շարունակել ուսումը")}</span>
                <h4>{current.course.title}</h4>
                {next && <p>{tr("Up next: ", "Հաջորդը՝ ")}{next.lesson.title} · {next.lesson.durationMin}{tr(" min", " րոպե")}</p>}
                <ProgressBar value={current.progress} />
              </div>
            </div>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">{tr("Deadlines", "Վերջնաժամկետներ")}</div>
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
            <div className="lp-panel__title">{tr("Learning Minutes", "Ուսման րոպեներ")}<span>{tr("this week · ", "այս շաբաթ · ")}{formatNumber(total)}{tr(" min", " րոպե")}</span></div>
            <div className="lp-bars" role="img" aria-label={tr(`Learning minutes by day: ${studentWeeklyMinutes.map((p) => `${p.label} ${p.value}`).join(', ')}`, `Ուսման րոպեներն ըստ օրերի՝ ${studentWeeklyMinutes.map((p) => `${p.label} ${p.value}`).join(', ')}`)}>
              {studentWeeklyMinutes.map((p, i) => (
                <div key={p.label} className={cx(i === peak && 'peak')}>
                  <i style={{ ['--h' as string]: `${(p.value / max) * 92}%` }} data-v={tr(`${p.value} min`, `${p.value} ր`)} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">{tr("Recent Grades", "Վերջին գնահատականներ")}</div>
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
          { label: tr("Dashboard", "Վահանակ"), icon: LayoutDashboard },
          { label: tr("Courses", "Դասընթացներ"), icon: Layers },
          { label: tr("Grading", "Գնահատում"), icon: Award, badge: pending.length },
          { label: tr("Students", "Ուսանողներ"), icon: Users },
          { label: tr("Reports", "Հաշվետվություններ"), icon: BarChart3 },
        ]}
      />
      <div className="lp-main">
        <div className="lp-main__head">
          <div>
            <h3>{tr("Hello, ", "Բարև, ")}{teacher.firstName}</h3>
            <p>{pending.length}{tr(" submissions awaiting review", " աշխատանք սպասում է գնահատման")}</p>
          </div>
          <div className="row" style={{ ['--gap' as string]: '10px' }}>
            <span className="icon-btn lp-hide-sm" aria-hidden="true"><Search /></span>
            <span className="icon-btn" aria-hidden="true"><Bell /><span className="icon-btn__dot" /></span>
            <Avatar name={`${teacher.firstName} ${teacher.lastName}`} size={44} />
          </div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-lilac"><Users /></span><div><b>{formatNumber(totalStudents)}</b><span>{tr("enrolled students", "գրանցված ուսանող")}</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-peach"><ClipboardList /></span><div><b>{pending.length}</b><span>{tr("pending submissions", "սպասող աշխատանք")}</span></div></div>
          <div className="lp-panel lp-kpi lp-kpi-panel"><span className="tint-box t-mint"><TrendingUp /></span><div><b>{completion}%</b><span>{tr("average completion rate", "միջին ավարտման մակարդակ")}</span></div></div>
        </div>
        <div className="lp-grid3">
          <div className="lp-panel lp-span2">
            <div className="lp-panel__title">{tr("Grading Queue", "Գնահատման հերթ")}<span>{studentRecords.length}{tr(" students", " ուսանող")}</span></div>
            <ul className="lp-rows">
              {pending.slice(0, 4).map((r) => (
                <li key={r.submission.id}>
                  <Avatar name={fullName(r.student)} size={38} />
                  <div className="lp-rows__text"><b>{fullName(r.student)}</b><span>{r.assignment.title} · {shortTitle(r.course.id)}</span></div>
                  <span className="lp-mini-btn">{tr("Grade", "Գնահատել")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-panel">
            <div className="lp-panel__title">{tr("Average Result", "Միջին արդյունք")}</div>
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
        <span className="kicker">{tr("How Learning Works", "Ինչպես է կազմակերպված ուսումը")}</span>
        <h2 className="lp-h2">{tr("Learn and ", "Սովորեք և ")}<span className="hl">{tr("put your skills into practice", "կիրառեք ձեր գիտելիքները")}</span></h2>
        <div className="lp-features">
          <article className="lp-feature">
            <div className="lp-feature__visual">
              <img src={SCENES.video} alt={tr("A student pointing at a laptop screen", "Ուսանողը մատնացույց է անում նոութբուքի էկրանին")} loading="lazy" />
              <span className="lp-vplay" aria-hidden="true"><Play /></span>
              <div className="lp-vbar" aria-hidden="true">
                <span className="tabular">06:12</span>
                <div className="progress__track"><div className="progress__fill" style={{ width: '34%' }} /></div>
                <span className="tabular">18:00</span>
              </div>
            </div>
            <div className="lp-feature__copy">
              <h3>{tr("Video Lessons", "Տեսադասեր")}</h3>
              <p>{tr("Short lessons you can watch whenever it suits you.", "Կարճ դասեր, որոնք կարող եք դիտել ցանկացած պահի։")}</p>
            </div>
          </article>

          <article className="lp-feature t-lilac">
            <div className="lp-feature__visual">
              <div className="lp-qtitle">{tr("What does this code print?", "Ի՞նչ կտպի այս կոդը")}</div>
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
                    <span>{picked === answer ? tr("Correct! This is a well-known historical quirk.", "Ճիշտ է։ Սա JavaScript-ի հայտնի պատմական առանձնահատկությունն է։") : tr(`The correct answer is "${answer}".`, `Ճիշտ պատասխանը՝ «${answer}»`)}</span>
                    <button type="button" onClick={() => setPicked(null)}>{tr("Try Again", "Կրկին փորձել")}</button>
                  </>
                ) : (
                  tr("Choose an Answer", "Ընտրեք պատասխանը")
                )}
              </div>
            </div>
            <div className="lp-feature__copy">
              <h3>{tr("Quizzes", "Թեստեր")}</h3>
              <p>{tr("Answer the question and check your result immediately.", "Փորձեք հենց հիմա․ արդյունքը կտեսնեք անմիջապես։")}</p>
            </div>
          </article>

          <article className="lp-feature t-mint">
            <div className="lp-feature__visual">
              {feedback && feedback.submission && (
                <>
                  <div className="lp-fb-card">
                    <span className="tint-box t-mint"><ClipboardList /></span>
                    <div style={{ minWidth: 0 }}><b>{feedback.assignment.title}</b><span>{tr("Graded", "Գնահատված է")}</span></div>
                    <span className="lp-fb-score">{feedback.submission.score}<small>/{feedback.assignment.maxScore}</small></span>
                  </div>
                  <div className="lp-fb-bubble">{feedback.submission.feedback}</div>
                  {reviewer && <div className="lp-fb-who">{fullName(reviewer)} <Avatar name={fullName(reviewer)} size={26} /></div>}
                </>
              )}
            </div>
            <div className="lp-feature__copy">
              <h3>{tr("Instructor Feedback", "Դասավանդողի մեկնաբանություններ")}</h3>
              <p>{tr("Personal feedback from your instructor on every assignment.", "Անհատական մեկնաբանություն դասավանդողից՝ յուրաքանչյուր առաջադրանքի համար։")}</p>
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
          <div className="lp-split__photo"><img src={SCENES.teacher} alt={tr("An instructor teaching in a classroom", "Դասավանդողը դասախոսություն է կարդում լսարանում")} loading="lazy" /></div>
          <div className="lp-builder" aria-hidden="true">
            <div className="lp-builder__head"><b>{tr("Module 3 · ", "Մոդուլ 3 · ")}{module.title}</b><span className="badge badge--success">{tr("Published", "Հրապարակված")}</span></div>
            <ul className="lp-rows">
              {module.lessons.slice(0, 3).map((l) => {
                const I = TYPE_ICON[l.type];
                return (
                  <li key={l.id}>
                    <GripVertical className="lp-grip" />
                    <span className={cx('tint-box', TYPE_TINT[l.type])}><I /></span>
                    <div className="lp-rows__text"><b>{l.title}</b><span>{l.durationMin}{tr(" min", " րոպե")}</span></div>
                  </li>
                );
              })}
            </ul>
            <div className="lp-add"><Plus />{tr("Add Lesson", "Ավելացնել դաս")}</div>
          </div>
        </div>
        <div>
          <span className="kicker">{tr("For teachers", "Դասավանդողների համար")}</span>
          <h2 className="lp-h2">{tr("Create your ", "Ստեղծեք ձեր ")}<span className="hl">{tr("course", "դասընթացը")}</span></h2>
          <ul className="lp-checks">
            <li><span className="tint-box t-sky"><Layers /></span>{tr("Modules, lessons, and materials", "Մոդուլներ, դասեր և նյութեր")}</li>
            <li><span className="tint-box t-lilac"><HelpCircle /></span>{tr("Quizzes and assignments", "Թեստեր և առաջադրանքներ")}</li>
            <li><span className="tint-box t-mint"><BarChart3 /></span>{tr("Individual student reports", "Հաշվետվություններ ըստ ուսանողի")}</li>
          </ul>
          <ButtonLink to="/teacher/dashboard" variant="primary" size="lg" iconRight={<ArrowRight />}>{tr("Explore the Instructor Dashboard", "Տեսնել դասավանդողի վահանակը")}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

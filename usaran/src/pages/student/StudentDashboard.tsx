import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleCheck, ClipboardList, Clock, FileQuestion, Flame, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { getEnrolledCourses, type EnrolledCourse } from '../../data/enrollments';
import { allLessons, categoryName } from '../../data/courses';
import { getGradeRows, getStudentAssignments, getStudentQuizzes } from '../../data/studentView';
import { studentWeeklyMinutes } from '../../data/analytics';
import { useDemoSession } from '../../context/DemoSession';
import { ShellTitle } from '../../components/layout/AppShell';
import { StatCard } from '../../components/ui/StatCard';
import { Tabs } from '../../components/ui/Misc';
import { EmptyState } from '../../components/ui/EmptyState';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, DateBlock, Ring, SectionHead } from '../../components/ui/Visual';
import { LESSON_ICONS } from '../../components/course/CourseBits';
import { average, cx, daysUntil, TODAY } from '../../lib/format';
import { CATEGORY_ICONS } from '../../lib/visual';
import type { EnrollmentState } from '../../types';

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Weekly study goal in minutes (the app's existing goal: 6 h). */
const WEEK_GOAL_MIN = 360;

/** "Quiz: Core Concepts" -> "Core Concepts" (the type is shown as an icon). */
const bare = (title: string) => title.replace(/^(Quiz|Assignment):\s*/, '');

/** First lesson the student hasn't completed yet, with its module position. */
function upNext(e: EnrolledCourse) {
  const lessons = allLessons(e.course);
  const next = lessons.find((l) => !e.enrollment.completedLessonIds.includes(l.id));
  const moduleIndex = next ? e.course.modules.findIndex((m) => m.id === next.moduleId) : e.course.modules.length - 1;
  return { next, moduleIndex, total: lessons.length };
}

const learnUrl = (e: EnrolledCourse, lessonId?: string) => `/student/courses/${e.course.id}/learn${lessonId ? `?lesson=${lessonId}` : ''}`;

export function StudentDashboard() {
  const { student } = useDemoSession();
  const enrolled = getEnrolledCourses();
  const [tab, setTab] = useState<EnrollmentState>('in-progress');
  const assignments = getStudentAssignments();
  const quizzes = getStudentQuizzes();
  const grades = getGradeRows().filter((g) => g.percent >= 0);

  /* Week + streak from the weekly minutes series (Mon..Sun). */
  const todayIndex = (TODAY.getDay() + 6) % 7;
  const weekMinutes = studentWeeklyMinutes.reduce((n, p) => n + p.value, 0);
  const goalPct = Math.min(100, Math.round((weekMinutes / WEEK_GOAL_MIN) * 100));
  const minutesLeft = Math.max(0, WEEK_GOAL_MIN - weekMinutes);
  const maxMin = Math.max(...studentWeeklyMinutes.map((p) => p.value), 1);
  let streak = 0;
  for (let i = todayIndex; i >= 0 && studentWeeklyMinutes[i]?.value > 0; i--) streak++;
  const dateLabel = `${WEEKDAYS_LONG[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS_LONG[TODAY.getMonth()]}`;

  /* Deadlines */
  const open = assignments.filter((a) => a.status === 'not-started' || a.status === 'draft');
  const deadlines = [
    ...open.map((a) => ({ id: a.assignment.id, title: a.assignment.title, due: a.assignment.dueDate, kind: 'Task', Icon: ClipboardList, to: `/student/assignments/${a.assignment.id}` })),
    ...quizzes.filter((q) => q.state === 'available').map((q) => ({ id: q.quiz.id, title: bare(q.quiz.title), due: q.quiz.dueDate, kind: 'Quiz', Icon: FileQuestion, to: `/student/quizzes/${q.quiz.id}` })),
  ]
    .filter((d) => daysUntil(d.due) >= 0)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  const recentQuiz = quizzes
    .flatMap((q) => q.attempts.map((a) => ({ q, a })))
    .sort((x, y) => y.a.completedAt.localeCompare(x.a.completedAt))
    .slice(0, 3);

  /* Stats */
  const completedLessons = enrolled.reduce((n, e) => n + e.enrollment.completedLessonIds.length, 0);
  const submittedCount = assignments.filter((a) => a.status === 'submitted' || a.status === 'graded').length;
  const openQuizzes = quizzes.filter((q) => q.state === 'available').length;

  const counts = {
    'in-progress': enrolled.filter((e) => e.state === 'in-progress').length,
    'not-started': enrolled.filter((e) => e.state === 'not-started').length,
    completed: enrolled.filter((e) => e.state === 'completed').length,
  };
  const shown = enrolled.filter((e) => e.state === tab);
  const continueCourse = [...enrolled].filter((e) => e.state === 'in-progress').sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))[0];
  const hero = continueCourse ? upNext(continueCourse) : undefined;

  return (
    <>
      <ShellTitle
        title={`Hi, ${student.firstName}`}
        meta={
          <>
            <Flame aria-hidden="true" />
            <b>{streak}-day streak</b>
            <span className="sl-dot" aria-hidden="true" />
            {dateLabel}
          </>
        }
      />

      {/* Hero row */}
      <section className="sl-hero-row">
        {continueCourse && hero ? (
          <Link to={learnUrl(continueCourse, hero.next?.id)} className="sl-hero v-lift">
            <img src={continueCourse.course.image} alt="" className="sl-hero__img" />
            <span className="sl-hero__scrim" aria-hidden="true" />
            <span className="sl-hero__body">
              <span className="sl-hero__chips">
                <Chip tone="glass" icon={(() => { const I = CATEGORY_ICONS[continueCourse.course.category]; return <I aria-hidden="true" />; })()}>
                  {categoryName(continueCourse.course.category)}
                </Chip>
                {hero.next && (
                  <Chip tone="glass" icon={(() => { const I = LESSON_ICONS[hero.next.type]; return <I aria-hidden="true" />; })()}>
                    Next: {bare(hero.next.title)}
                  </Chip>
                )}
              </span>
              <span className="sl-hero__text">
                <span className="sl-hero__eyebrow">Continue learning</span>
                <span className="sl-hero__title">{continueCourse.course.title}</span>
              </span>
              <span className="sl-hero__foot">
                <span className="sl-hero__play" aria-hidden="true"><Play /></span>
                <span className="sl-hero__progress">
                  <span className="sl-hero__progress-head">
                    <span>Module {hero.moduleIndex + 1} of {continueCourse.course.modules.length}</span>
                    <span>{continueCourse.progress}%</span>
                  </span>
                  <span className="sl-hero__bar"><span style={{ width: `${continueCourse.progress}%` }} /></span>
                </span>
              </span>
            </span>
          </Link>
        ) : (
          <div className="sl-card sl-hero-empty">
            <EmptyState compact title="Nothing in progress" action={<ButtonLink to="/courses" icon={<BookOpen />}>Catalog</ButtonLink>} />
          </div>
        )}

        <div className="sl-card sl-week">
          <div className="sl-week__head">
            <h2>This week</h2>
            <span className="sl-week__goal"><Target aria-hidden="true" />Goal {WEEK_GOAL_MIN / 60} h</span>
          </div>
          <div className="sl-week__body">
            <Ring value={goalPct} size={116} thickness={14} label="Weekly goal">
              <span className="sl-week__ring">
                <b>{(weekMinutes / 60).toFixed(1)}<small>h</small></b>
                <span>{goalPct}%</span>
              </span>
            </Ring>
            <div className="sl-week__bars" role="img" aria-label="Study minutes per day this week">
              {studentWeeklyMinutes.map((p, i) => (
                <span key={p.label + i} className="sl-week__day" title={`${p.label}: ${p.value} min`}>
                  <span className="sl-week__track">
                    <span
                      className={cx('sl-week__bar', i === todayIndex && 'is-today', p.value === 0 && 'is-empty')}
                      style={{ height: `${Math.max(6, Math.round((p.value / maxMin) * 100))}%` }}
                    />
                  </span>
                  <span className="sl-week__label">{p.label[0]}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="sl-week__note">
            <Sparkles aria-hidden="true" />
            {minutesLeft > 0 ? <span><b>{minutesLeft} min</b> to goal</span> : <span><b>Goal reached</b></span>}
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <section aria-label="Summary" className="sl-stats">
        {/* "+6" and "+2%" trends are illustrative sample values (kept from the original dashboard). */}
        <StatCard label="Lessons done" value={completedLessons} icon={<BookOpen />} trend="+6" to="/student/progress" />
        <StatCard label="Tasks handed in" value={submittedCount} unit={`/${assignments.length}`} icon={<ClipboardList />} to="/student/assignments" />
        <StatCard label="Average grade" value={average(grades.map((g) => g.percent))} unit="%" icon={<Trophy />} trend="+2%" to="/student/grades" />
        <StatCard label="Quizzes open" value={openQuizzes} icon={<FileQuestion />} to="/student/quizzes" />
      </section>

      {/* Courses + side column */}
      <section className="sl-main-row">
        <div className="sl-courses">
          <div className="sl-courses__head">
            <h2>My courses</h2>
            <Tabs
              value={tab}
              onChange={setTab}
              label="Course status"
              items={[
                { key: 'in-progress', label: 'Active', count: counts['in-progress'], icon: <Play /> },
                { key: 'not-started', label: 'New', count: counts['not-started'], icon: <BookOpen /> },
                { key: 'completed', label: 'Done', count: counts.completed, icon: <Trophy /> },
              ]}
            />
          </div>
          {shown.length === 0 ? (
            <div className="sl-card">
              <EmptyState compact title="No courses here" action={<ButtonLink to="/courses" variant="secondary" icon={<BookOpen />}>Catalog</ButtonLink>} />
            </div>
          ) : (
            <div className="sl-course-grid">
              {shown.map((e) => {
                const { next } = upNext(e);
                const CatIcon = CATEGORY_ICONS[e.course.category];
                const NextIcon = next ? LESSON_ICONS[next.type] : CircleCheck;
                return (
                  <Link key={e.course.id} to={learnUrl(e, next?.id)} className="sl-ccard v-lift">
                    <span className="sl-ccard__media">
                      <img src={e.course.image} alt="" loading="lazy" />
                      <Chip tone="white" className="sl-ccard__cat" icon={<CatIcon aria-hidden="true" />}>{categoryName(e.course.category)}</Chip>
                      <span className="sl-ccard__ring">
                        <Ring value={e.progress} size={48} thickness={5} label={`${e.course.title} progress`} />
                      </span>
                    </span>
                    <span className="sl-ccard__body">
                      <span className="sl-ccard__title">{e.course.title}</span>
                      <span className="sl-next">
                        <NextIcon aria-hidden="true" className="sl-next__icon" />
                        <span className="sl-next__text">{next ? bare(next.title) : 'All lessons done'}</span>
                        <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="sl-side">
          <div className="sl-card sl-card--tight">
            <SectionHead title="Up next" to="/student/assignments" />
            {deadlines.length === 0 ? (
              <EmptyState compact icon={<Target size={22} />} title="All done" />
            ) : (
              <div className="sl-deadlines">
                {deadlines.map((d) => {
                  const left = daysUntil(d.due);
                  const urgent = left <= 2;
                  return (
                    <Link key={d.id} to={d.to} className="sl-deadline">
                      <DateBlock date={d.due} urgent={urgent} />
                      <span className="sl-deadline__text">
                        <span className="sl-deadline__title">{d.title}</span>
                        <span className="sl-deadline__kind"><d.Icon aria-hidden="true" />{d.kind}</span>
                      </span>
                      <Chip tone={urgent ? 'red' : 'grey'} icon={<Clock aria-hidden="true" />}>{left === 0 ? 'Today' : `${left} d`}</Chip>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sl-card sl-card--tight">
            <SectionHead title="Quiz scores" to="/student/quizzes" />
            {recentQuiz.length === 0 ? (
              <EmptyState compact title="No attempts yet" />
            ) : (
              <div className="sl-quizzes">
                {recentQuiz.map(({ q, a }) => {
                  const p = Math.round((a.score / a.maxScore) * 100);
                  return (
                    <Link key={a.id} to={`/student/quizzes/${q.quiz.id}/results`} className="sl-quiz">
                      <Ring value={p} size={66} thickness={7} label={bare(q.quiz.title)} />
                      <span>{bare(q.quiz.title)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

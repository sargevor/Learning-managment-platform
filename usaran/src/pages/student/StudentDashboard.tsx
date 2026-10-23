import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, ClipboardList, Clock, FileQuestion, GraduationCap, PlayCircle, Target, TrendingUp, Trophy } from 'lucide-react';
import { getEnrolledCourses } from '../../data/enrollments';
import { findLesson } from '../../data/courses';
import { getGradeRows, getStudentAssignments, getStudentQuizzes, scoreTone } from '../../data/studentView';
import { studentWeeklyMinutes } from '../../data/analytics';
import { useDemoSession } from '../../context/DemoSession';
import { BarChart, ChartCard } from '../../components/charts/Charts';
import { ButtonLink } from '../../components/ui/Button';
import { Card, EmptyState, Tabs, Thumb } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { StatusBadge } from '../../components/ui/Badge';
import { LESSON_ICONS } from '../../components/course/CourseBits';
import { average, cx, daysUntil, formatMinutes, dateParts, relativeDue, relativeTime } from '../../lib/format';
import { SCENES } from '../../lib/visual';
import type { EnrollmentState } from '../../types';
import { tr } from '../../i18n';

export function StudentDashboard() {
  const { student } = useDemoSession();
  const enrolled = getEnrolledCourses();
  const [tab, setTab] = useState<EnrollmentState>('in-progress');
  const assignments = getStudentAssignments();
  const quizzes = getStudentQuizzes();
  const grades = getGradeRows().filter((g) => g.percent >= 0);

  const open = assignments.filter((a) => a.status === 'not-started' || a.status === 'draft');
  const deadlines = [
    ...open.map((a) => ({ id: a.assignment.id, title: a.assignment.title, course: a.course.title, due: a.assignment.dueDate, kind: tr("Assignment", "Առաջադրանք"), to: `/student/assignments/${a.assignment.id}`, status: a.status as string })),
    ...quizzes.filter((q) => q.state === 'available').map((q) => ({ id: q.quiz.id, title: q.quiz.title, course: q.course.title, due: q.quiz.dueDate, kind: tr("Quiz", "Թեստ"), to: `/student/quizzes/${q.quiz.id}`, status: 'available' })),
  ]
    .filter((d) => daysUntil(d.due) >= 0)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  const recentQuiz = quizzes.flatMap((q) => q.attempts.map((a) => ({ q, a }))).sort((x, y) => y.a.completedAt.localeCompare(x.a.completedAt)).slice(0, 3);
  const recentLessons = [...enrolled]
    .filter((e) => e.state !== 'not-started')
    .sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))
    .slice(0, 4)
    .map((e) => ({ e, found: findLesson(e.enrollment.lastLessonId) }));

  const completedLessons = enrolled.reduce((n, e) => n + e.enrollment.completedLessonIds.length, 0);
  const weekMinutes = studentWeeklyMinutes.reduce((n, p) => n + p.value, 0);
  const counts = {
    'in-progress': enrolled.filter((e) => e.state === 'in-progress').length,
    'not-started': enrolled.filter((e) => e.state === 'not-started').length,
    completed: enrolled.filter((e) => e.state === 'completed').length,
  };
  const shown = enrolled.filter((e) => e.state === tab);
  const submittedCount = assignments.filter((a) => a.status === 'submitted' || a.status === 'graded').length;
  const continueCourse = [...enrolled].filter((e) => e.state === 'in-progress').sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))[0];

  return (
    <>
      <section className="welcome">
        <div className="welcome__text">
          <h1>{tr("Welcome back, ", "Բարի վերադարձ, ")}<span className="hl">{student.firstName}</span></h1>
          <p>{tr("This week, you have spent ", "Այս շաբաթ ուսմանը տրամադրել եք ")}{formatMinutes(weekMinutes)}{tr(". ", "։ ")}{deadlines[0] ? tr(`Your next deadline is ${deadlines[0].title}, ${relativeDue(deadlines[0].due)}.`, `Մոտակա վերջնաժամկետը՝ «${deadlines[0].title}», ${relativeDue(deadlines[0].due)}։`) : tr("No upcoming deadlines.", "Մոտակա վերջնաժամկետներ չկան։")}
          </p>
          <div className="welcome__actions">
            {continueCourse && (
              <ButtonLink to={`/student/courses/${continueCourse.course.id}/learn`} variant="primary" icon={<PlayCircle />}>{tr("Continue Learning", "Շարունակել ուսումը")}</ButtonLink>
            )}
            <ButtonLink to="/student/assignments" variant="secondary">{tr("Assignments", "Առաջադրանքներ")}</ButtonLink>
          </div>
        </div>
        <div className="welcome__stats">
          <div><strong>{counts['in-progress']}</strong><span>{tr("in progress", "ընթացքում")}</span></div>
          <div><strong>{counts.completed}</strong><span>{tr("completed", "ավարտված")}</span></div>
          <div><strong>{open.length}</strong><span>{tr("open assignments", "չկատարված առաջադրանք")}</span></div>
        </div>
        <div className="welcome__art" aria-hidden="true">
          <div className="welcome__arch"><img src={SCENES.study} alt="" /></div>
        </div>
      </section>

      <div className="quick-links" style={{ marginBottom: 24 }}>
        <Link to="/student/assignments" className="quick-link t-peach">
          <span className="list-row__icon"><ClipboardList /></span>
          <span>{tr("Assignments", "Առաջադրանքներ")}<span className="quick-link__sub">{open.length}{tr(" to complete", " սպասում է կատարման")}</span></span>
        </Link>
        <Link to="/student/quizzes" className="quick-link t-sun">
          <span className="list-row__icon"><FileQuestion /></span>
          <span>{tr("Quizzes", "Թեստեր")}<span className="quick-link__sub">{quizzes.filter((q) => q.state === 'available').length}{tr(" available", " հասանելի")}</span></span>
        </Link>
        <Link to="/student/grades" className="quick-link t-mint">
          <span className="list-row__icon"><GraduationCap /></span>
          <span>{tr("Grades", "Գնահատականներ")}<span className="quick-link__sub">{tr("Average: ", "Միջինը՝ ")}{average(grades.map((g) => g.percent))}%</span></span>
        </Link>
        <Link to="/student/progress" className="quick-link t-lilac">
          <span className="list-row__icon"><TrendingUp /></span>
          <span>{tr("Progress", "Առաջընթաց")}<span className="quick-link__sub">{completedLessons}{tr(" completed lessons", " ավարտված դաս")}</span></span>
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label={tr("Completed Lessons", "Ավարտված դասեր")} value={completedLessons} icon={<BookOpenCheck />} meta={<><span className="up">+6</span>{tr(" in the last 7 days", " վերջին 7 օրում")}</>} />
        <StatCard label={tr("Submitted Assignments", "Հանձնված աշխատանքներ")} value={submittedCount} unit={`/${assignments.length}`} icon={<ClipboardList />} tone="navy" meta={tr("across all courses", "բոլոր դասընթացներում")} />
        <StatCard label={tr("Average Grade", "Միջին գնահատական")} value={average(grades.map((g) => g.percent))} unit="%" icon={<Trophy />} tone="success" meta={<><span className="up">+2%</span>{tr(" compared with last month", " նախորդ ամսվա համեմատ")}</>} />
        <StatCard label={tr("Learning Time", "Ուսման ժամանակը")} value={(weekMinutes / 60).toFixed(1)} unit={tr("hr", "ժ")} icon={<Clock />} tone="warning" meta={tr("this week, goal: 6 hr", "այս շաբաթ, նպատակը՝ 6 ժ")} />
      </div>

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <Card title={tr("My courses", "Իմ դասընթացները")} actions={<ButtonLink to="/student/courses" variant="ghost" size="sm">{tr("All", "Բոլորը")}</ButtonLink>} padded={false}>
            <div style={{ padding: '0 20px' }}>
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { key: 'in-progress', label: tr("In progress", "Ընթացքում"), count: counts['in-progress'] },
                  { key: 'not-started', label: tr("Not started", "Չսկսված"), count: counts['not-started'] },
                  { key: 'completed', label: tr("Completed", "Ավարտված"), count: counts.completed },
                ]}
              />
            </div>
            {shown.length === 0 ? (
              <EmptyState compact title={tr("No courses in this section", "Այս բաժնում դասընթացներ չկան")} text={tr("Browse the catalog and enroll in a new course.", "Դիտեք կատալոգը և գրանցվեք նոր դասընթացի։")} action={<ButtonLink to="/courses" variant="secondary" size="sm">{tr("Browse Courses", "Բացել կատալոգը")}</ButtonLink>} />
            ) : (
              shown.map(({ course, enrollment, progress, state }) => {
                const last = findLesson(enrollment.lastLessonId);
                return (
                  <div key={course.id} className="enrolled-row">
                    <Thumb src={course.image} alt="" />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/student/courses/${course.id}/learn`} className="strong" style={{ color: 'var(--navy-900)' }}>{course.title}</Link>
                      <div className="xs muted" style={{ marginTop: 2 }}>
                        {state === 'not-started' ? tr("Not started yet", "Դեռ չեք սկսել") : state === 'completed' ? tr(`Completed, last visited: ${relativeTime(enrollment.lastAccessed)}`, `Ավարտված է, վերջին այցը՝ ${relativeTime(enrollment.lastAccessed)}`) : tr(`Last lesson: ${last?.lesson.title ?? '—'}`, `Վերջին դասը՝ ${last?.lesson.title ?? '—'}`)}
                      </div>
                    </div>
                    <ProgressBar value={progress} />
                    <ButtonLink to={`/student/courses/${course.id}/learn`} variant={state === 'completed' ? 'secondary' : 'primary'} size="sm">
                      {state === 'not-started' ? tr("Start", "Սկսել") : state === 'completed' ? tr("Review", "Վերանայել") : tr("Continue", "Շարունակել")}
                    </ButtonLink>
                  </div>
                );
              })
            )}
          </Card>

          <ChartCard title={tr("Weekly Activity", "Շաբաթական ակտիվություն")} subtitle={tr("Minutes spent learning each day", "Ուսմանը տրամադրված րոպեներ ըստ օրերի")} demo>
            <BarChart labels={studentWeeklyMinutes.map((p) => p.label)} series={[{ name: tr("Minutes", "Րոպե"), values: studentWeeklyMinutes.map((p) => p.value) }]} suffix={tr(" min", " ր")} height={200} ariaLabel={tr("Learning minutes by day of the week", "Ուսման րոպեներն ըստ շաբաթվա օրերի")} />
          </ChartCard>

          <Card title={tr("Recently Viewed Lessons", "Վերջերս դիտված դասեր")} padded={false}>
            <div className="list">
              {recentLessons.map(({ e, found }) => {
                const Icon = found ? LESSON_ICONS[found.lesson.type] : PlayCircle;
                return (
                  <Link key={e.course.id} to={`/student/courses/${e.course.id}/learn?lesson=${e.enrollment.lastLessonId}`} className="list-row">
                    <span className="list-row__icon"><Icon /></span>
                    <div className="grow">
                      <div className="list-row__title">{found?.lesson.title}</div>
                      <div className="list-row__sub">{e.course.title}, {found?.module.title}</div>
                    </div>
                    <span className="xs muted nowrap">{relativeTime(e.enrollment.lastAccessed)}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card title={tr("Upcoming Deadlines", "Մոտակա վերջնաժամկետներ")} actions={<ButtonLink to="/student/assignments" variant="ghost" size="sm">{tr("All", "Բոլորը")}</ButtonLink>} padded={false}>
            {deadlines.length === 0 ? (
              <EmptyState compact icon={<Target size={22} />} title={tr("All caught up", "Ամեն ինչ արված է")} text={tr("There are no deadlines in the next few days.", "Մոտակա օրերին վերջնաժամկետներ չկան։")} />
            ) : (
              <div className="list">
                {deadlines.map((d) => {
                  const urgent = daysUntil(d.due) <= 2;
                  const { day, month: mon } = dateParts(d.due);
                  return (
                    <Link key={d.id} to={d.to} className="list-row" style={{ padding: '12px 18px' }}>
                      <div className={cx('deadline-date', urgent && 'deadline-date--urgent')}>
                        <b>{day}</b>
                        <span>{mon}</span>
                      </div>
                      <div className="grow" style={{ minWidth: 0 }}>
                        <div className="list-row__title">{d.title}</div>
                        <div className="list-row__sub">{d.kind}, {relativeDue(d.due)}</div>
                      </div>
                      <StatusBadge status={d.status} />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title={tr("Recent Quiz Results", "Թեստերի վերջին արդյունքներ")} actions={<ButtonLink to="/student/quizzes" variant="ghost" size="sm">{tr("All", "Բոլորը")}</ButtonLink>} padded={false}>
            <div className="list">
              {recentQuiz.map(({ q, a }) => {
                const p = Math.round((a.score / a.maxScore) * 100);
                return (
                  <Link key={a.id} to={`/student/quizzes/${q.quiz.id}/results`} className="list-row" style={{ padding: '12px 18px' }}>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="list-row__title">{q.quiz.title}</div>
                      <div className="list-row__sub">{relativeTime(a.completedAt)}, {a.score}/{a.maxScore}{tr(" points", " միավոր")}</div>
                    </div>
                    <span className={`score-pill score-pill--${scoreTone(p)}`}>{p}%</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card title={tr("Overview", "Ընդհանուր պատկեր")}>
            <div className="stack" style={{ ['--gap' as string]: '14px' }}>
              {enrolled.map((e) => (
                <div key={e.course.id}>
                  <div className="row row--between xs" style={{ marginBottom: 4 }}>
                    <span className="secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course.title}</span>
                    <StatusBadge status={e.state} />
                  </div>
                  <ProgressBar value={e.progress} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

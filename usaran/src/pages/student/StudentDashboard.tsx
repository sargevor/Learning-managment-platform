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
import { average, cx, daysUntil, formatMinutes, formatShortDate, relativeDue, relativeTime } from '../../lib/format';
import type { EnrollmentState } from '../../types';

export function StudentDashboard() {
  const { student } = useDemoSession();
  const enrolled = getEnrolledCourses();
  const [tab, setTab] = useState<EnrollmentState>('in-progress');
  const assignments = getStudentAssignments();
  const quizzes = getStudentQuizzes();
  const grades = getGradeRows().filter((g) => g.percent >= 0);

  const open = assignments.filter((a) => a.status === 'not-started' || a.status === 'draft');
  const deadlines = [
    ...open.map((a) => ({ id: a.assignment.id, title: a.assignment.title, course: a.course.title, due: a.assignment.dueDate, kind: 'Առաջադրանք', to: `/student/assignments/${a.assignment.id}`, status: a.status as string })),
    ...quizzes.filter((q) => q.state === 'available').map((q) => ({ id: q.quiz.id, title: q.quiz.title, course: q.course.title, due: q.quiz.dueDate, kind: 'Թեստ', to: `/student/quizzes/${q.quiz.id}`, status: 'available' })),
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

  return (
    <>
      <section className="welcome">
        <div>
          <h1>Բարի վերադարձ, {student.firstName}</h1>
          <p className="small">
            Այս շաբաթ ուսմանը տրամադրել եք {formatMinutes(weekMinutes)}։ {deadlines[0] ? `Մոտակա վերջնաժամկետը՝ «${deadlines[0].title}», ${relativeDue(deadlines[0].due)}։` : 'Մոտակա վերջնաժամկետներ չկան։'}
          </p>
        </div>
        <div className="welcome__stats">
          <div><strong>{counts['in-progress']}</strong><span>ընթացքում</span></div>
          <div><strong>{counts.completed}</strong><span>ավարտված</span></div>
          <div><strong>{open.length}</strong><span>բաց առաջադրանք</span></div>
        </div>
      </section>

      <div className="quick-links" style={{ marginBottom: 24 }}>
        <Link to="/student/assignments" className="quick-link">
          <span className="list-row__icon"><ClipboardList /></span>
          <span>Առաջադրանքներ<span className="quick-link__sub">{open.length} սպասում է կատարման</span></span>
        </Link>
        <Link to="/student/quizzes" className="quick-link">
          <span className="list-row__icon"><FileQuestion /></span>
          <span>Թեստեր<span className="quick-link__sub">{quizzes.filter((q) => q.state === 'available').length} հասանելի</span></span>
        </Link>
        <Link to="/student/grades" className="quick-link">
          <span className="list-row__icon"><GraduationCap /></span>
          <span>Գնահատականներ<span className="quick-link__sub">Միջինը՝ {average(grades.map((g) => g.percent))}%</span></span>
        </Link>
        <Link to="/student/progress" className="quick-link">
          <span className="list-row__icon"><TrendingUp /></span>
          <span>Առաջընթաց<span className="quick-link__sub">{completedLessons} ավարտված դաս</span></span>
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Ավարտված դասեր" value={completedLessons} icon={<BookOpenCheck />} meta={<><span className="up">+6</span> վերջին 7 օրում</>} />
        <StatCard label="Հանձնված աշխատանքներ" value={submittedCount} unit={`/${assignments.length}`} icon={<ClipboardList />} tone="navy" meta="բոլոր դասընթացներում" />
        <StatCard label="Միջին գնահատական" value={average(grades.map((g) => g.percent))} unit="%" icon={<Trophy />} tone="success" meta={<><span className="up">+2%</span> նախորդ ամսվա համեմատ</>} />
        <StatCard label="Ուսման ժամանակը" value={(weekMinutes / 60).toFixed(1)} unit="ժ" icon={<Clock />} tone="warning" meta="այս շաբաթ, նպատակը՝ 6 ժ" />
      </div>

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <Card title="Իմ դասընթացները" actions={<ButtonLink to="/student/courses" variant="ghost" size="sm">Բոլորը</ButtonLink>} padded={false}>
            <div style={{ padding: '0 20px' }}>
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { key: 'in-progress', label: 'Ընթացքում', count: counts['in-progress'] },
                  { key: 'not-started', label: 'Չսկսված', count: counts['not-started'] },
                  { key: 'completed', label: 'Ավարտված', count: counts.completed },
                ]}
              />
            </div>
            {shown.length === 0 ? (
              <EmptyState compact title="Այս բաժնում դասընթացներ չկան" text="Դիտեք կատալոգը և գրանցվեք նոր դասընթացի։" action={<ButtonLink to="/courses" variant="secondary" size="sm">Բացել կատալոգը</ButtonLink>} />
            ) : (
              shown.map(({ course, enrollment, progress, state }) => {
                const last = findLesson(enrollment.lastLessonId);
                return (
                  <div key={course.id} className="enrolled-row">
                    <Thumb src={course.image} alt="" />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/student/courses/${course.id}/learn`} className="strong" style={{ color: 'var(--navy-900)' }}>{course.title}</Link>
                      <div className="xs muted" style={{ marginTop: 2 }}>
                        {state === 'not-started' ? 'Դեռ չեք սկսել' : state === 'completed' ? `Ավարտված է, վերջին այցը՝ ${relativeTime(enrollment.lastAccessed)}` : `Վերջին դասը՝ ${last?.lesson.title ?? '—'}`}
                      </div>
                    </div>
                    <ProgressBar value={progress} />
                    <ButtonLink to={`/student/courses/${course.id}/learn`} variant={state === 'completed' ? 'secondary' : 'primary'} size="sm">
                      {state === 'not-started' ? 'Սկսել' : state === 'completed' ? 'Կրկնել' : 'Շարունակել'}
                    </ButtonLink>
                  </div>
                );
              })
            )}
          </Card>

          <ChartCard title="Շաբաթական ակտիվություն" subtitle="Ուսմանը տրամադրված րոպեներ ըստ օրերի" demo>
            <BarChart labels={studentWeeklyMinutes.map((p) => p.label)} series={[{ name: 'Րոպե', values: studentWeeklyMinutes.map((p) => p.value) }]} suffix=" ր" height={200} ariaLabel="Ուսման րոպեները շաբաթվա օրերով" />
          </ChartCard>

          <Card title="Վերջերս դիտված դասեր" padded={false}>
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
          <Card title="Մոտակա վերջնաժամկետներ" actions={<ButtonLink to="/student/assignments" variant="ghost" size="sm">Բոլորը</ButtonLink>} padded={false}>
            {deadlines.length === 0 ? (
              <EmptyState compact icon={<Target size={22} />} title="Ամեն ինչ արված է" text="Մոտակա օրերին վերջնաժամկետներ չկան։" />
            ) : (
              <div className="list">
                {deadlines.map((d) => {
                  const urgent = daysUntil(d.due) <= 2;
                  const [day, mon] = formatShortDate(d.due).split(' ');
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

          <Card title="Թեստերի վերջին արդյունքներ" actions={<ButtonLink to="/student/quizzes" variant="ghost" size="sm">Բոլորը</ButtonLink>} padded={false}>
            <div className="list">
              {recentQuiz.map(({ q, a }) => {
                const p = Math.round((a.score / a.maxScore) * 100);
                return (
                  <Link key={a.id} to={`/student/quizzes/${q.quiz.id}/results`} className="list-row" style={{ padding: '12px 18px' }}>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="list-row__title">{q.quiz.title}</div>
                      <div className="list-row__sub">{relativeTime(a.completedAt)}, {a.score}/{a.maxScore} միավոր</div>
                    </div>
                    <span className={`score-pill score-pill--${scoreTone(p)}`}>{p}%</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card title="Ընդհանուր պատկեր">
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, CheckSquare, ClipboardPlus, FilePlus2, FileQuestion, GraduationCap, LogIn, PlusCircle, Send, Target, Users } from 'lucide-react';
import { shortTitle, teacherCourses, teacherQuizzes, teacherSubmissionRows } from '../../data/teacherView';
import { teacherAssignments } from '../../data/assignments';
import { coursePerformance, enrollmentTrend, recentActivity, studentRecords, trendLabels } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { useDemoSession } from '../../context/DemoSession';
import { BarChart, CHART_COLORS, ChartCard, LineChart } from '../../components/charts/Charts';
import { ButtonLink } from '../../components/ui/Button';
import { Avatar, Card, EmptyState, PageHeader, Segmented } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { average, cx, daysUntil, formatNumber, formatShortDate, relativeDue, relativeTime } from '../../lib/format';

const ACTIVITY_ICON = { submission: Send, quiz: FileQuestion, lesson: GraduationCap, enroll: LogIn };

export function TeacherDashboard() {
  const { teacher } = useDemoSession();
  const [chart, setChart] = useState<'scores' | 'enroll'>('scores');
  const rows = teacherSubmissionRows();
  const pending = rows.filter((r) => r.submission.status === 'submitted');
  const published = teacherCourses.filter((c) => c.status === 'published');
  const totalStudents = published.reduce((n, c) => n + c.enrolled, 0);
  const perf = coursePerformance;

  const deadlines = [
    ...teacherAssignments.map((a) => ({ id: a.id, title: a.title, due: a.dueDate, kind: 'Առաջադրանք', courseId: a.courseId, to: `/teacher/assignments/${a.id}/submissions` })),
    ...teacherQuizzes.map((q) => ({ id: q.id, title: q.title, due: q.dueDate, kind: 'Թեստ', courseId: q.courseId, to: `/teacher/quizzes/${q.id}/edit` })),
  ]
    .filter((d) => daysUntil(d.due) >= 0)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Բարի օր, ${teacher.firstName}`}
        description={`Այսօր գնահատման է սպասում ${pending.length} աշխատանք, իսկ ${studentRecords.filter((s) => s.status === 'at-risk').length} ուսանող կարիք ունի ուշադրության։`}
        actions={
          <>
            <ButtonLink to="/teacher/quizzes/new/edit" variant="secondary" icon={<FilePlus2 />}>Նոր թեստ</ButtonLink>
            <ButtonLink to="/teacher/assignments?new=1" variant="secondary" icon={<ClipboardPlus />}>Նոր առաջադրանք</ButtonLink>
            <ButtonLink to="/teacher/courses/create" variant="primary" icon={<PlusCircle />}>Ստեղծել դասընթաց</ButtonLink>
          </>
        }
      />

      <div className="grid grid-4 mb-20">
        <StatCard label="Դասընթացներ" value={teacherCourses.length} icon={<BookMarked />} meta={`${published.length} հրապարակված, ${teacherCourses.length - published.length} սևագիր`} />
        <StatCard label="Գրանցված ուսանողներ" value={formatNumber(totalStudents)} icon={<Users />} tone="navy" meta={<><span className="up">+214</span> այս ամիս</>} />
        <StatCard label="Սպասող հանձնումներ" value={pending.length} icon={<CheckSquare />} tone="warning" meta={<Link to="/teacher/grading">Բացել գնահատման կենտրոնը</Link>} />
        <StatCard label="Միջին արդյունք" value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<Target />} tone="success" meta={<><span className="up">+3%</span> նախորդ ամսվա համեմատ</>} />
      </div>

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <ChartCard
            title="Դասընթացների արդյունավետություն"
            subtitle={chart === 'scores' ? 'Առաջադրանքների և թեստերի միջին միավորը, %' : 'Նոր գրանցումներ ըստ ամիսների'}
            legend={
              chart === 'scores'
                ? [
                    { label: 'Առաջադրանքներ', color: CHART_COLORS[0] },
                    { label: 'Թեստեր', color: CHART_COLORS[1] },
                    { label: 'Ավարտելիություն', color: CHART_COLORS[2] },
                  ]
                : perf.map((p, i) => ({ label: shortTitle(p.courseId), color: CHART_COLORS[i] }))
            }
            actions={<Segmented label="Գրաֆիկի տեսակ" value={chart} onChange={setChart} items={[{ key: 'scores', label: 'Արդյունքներ' }, { key: 'enroll', label: 'Գրանցումներ' }]} />}
          >
            {chart === 'scores' ? (
              <BarChart
                labels={perf.map((p) => shortTitle(p.courseId))}
                series={[
                  { name: 'Առաջադրանքներ', values: perf.map((p) => p.avgAssignment) },
                  { name: 'Թեստեր', values: perf.map((p) => p.avgQuiz) },
                  { name: 'Ավարտելիություն', values: perf.map((p) => p.completionRate) },
                ]}
                max={100}
                suffix="%"
                height={240}
                ariaLabel="Դասընթացների միջին արդյունքները"
              />
            ) : (
              <LineChart labels={trendLabels} series={perf.map((p, i) => ({ name: shortTitle(p.courseId), values: enrollmentTrend[p.courseId], color: CHART_COLORS[i] }))} height={240} ariaLabel="Գրանցումների դինամիկան" />
            )}
          </ChartCard>

          <Card title="Գնահատման սպասող աշխատանքներ" subtitle={`${pending.length} աշխատանք`} actions={<ButtonLink to="/teacher/grading" variant="ghost" size="sm">Գնահատման կենտրոն</ButtonLink>} padded={false}>
            {pending.length === 0 ? (
              <EmptyState compact title="Բոլոր աշխատանքները գնահատված են" />
            ) : (
              <div className="list">
                {pending.slice(0, 5).map((r) => (
                  <Link key={r.submission.id} to={`/teacher/grading?submission=${r.submission.id}`} className="list-row">
                    <Avatar name={fullName(r.student)} size={36} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="list-row__title">{fullName(r.student)}</div>
                      <div className="list-row__sub">{r.assignment.title}, {r.course.title}</div>
                    </div>
                    {r.submission.late && <Badge tone="danger">Ուշացած</Badge>}
                    <span className="xs muted nowrap">{relativeTime(r.submission.submittedAt!)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card title="Արագ գործողություններ">
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              <ButtonLink to="/teacher/courses/create" variant="secondary" block icon={<PlusCircle />} style={{ justifyContent: 'flex-start' }}>Ստեղծել դասընթաց</ButtonLink>
              <ButtonLink to="/teacher/assignments?new=1" variant="secondary" block icon={<ClipboardPlus />} style={{ justifyContent: 'flex-start' }}>Ավելացնել առաջադրանք</ButtonLink>
              <ButtonLink to="/teacher/quizzes/new/edit" variant="secondary" block icon={<FilePlus2 />} style={{ justifyContent: 'flex-start' }}>Ստեղծել թեստ</ButtonLink>
            </div>
          </Card>

          <Card title="Մոտակա վերջնաժամկետներ" padded={false}>
            <div className="list">
              {deadlines.map((d) => {
                const [day, mon] = formatShortDate(d.due).split(' ');
                return (
                  <Link key={d.id} to={d.to} className="list-row" style={{ padding: '12px 18px' }}>
                    <div className={cx('deadline-date', daysUntil(d.due) <= 2 && 'deadline-date--urgent')}>
                      <b>{day}</b>
                      <span>{mon}</span>
                    </div>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="list-row__title">{d.title}</div>
                      <div className="list-row__sub">{d.kind}, {relativeDue(d.due)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card title="Ուսանողների վերջին ակտիվությունը" padded={false}>
            <div className="list">
              {recentActivity.map((e) => {
                const Icon = ACTIVITY_ICON[e.kind];
                const s = getUser(e.studentId);
                return (
                  <Link key={e.id} to={`/teacher/students/${e.studentId}`} className="list-row" style={{ padding: '12px 18px', alignItems: 'flex-start' }}>
                    <span className="list-row__icon" style={{ width: 32, height: 32 }}><Icon size={16} /></span>
                    <div className="grow small" style={{ minWidth: 0 }}>
                      <span className="strong" style={{ color: 'var(--navy-900)' }}>{fullName(s)}</span> {e.text}
                      <div className="xs muted">{getCourse(e.courseId)?.title}, {relativeTime(e.time)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

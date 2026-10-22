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
import { Avatar, Card, EmptyState, Segmented } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { average, cx, daysUntil, formatNumber, formatShortDate, relativeDue, relativeTime } from '../../lib/format';
import { SCENES } from '../../lib/visual';

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
    ...teacherAssignments.map((a) => ({ id: a.id, title: a.title, due: a.dueDate, kind: "Assignment", courseId: a.courseId, to: `/teacher/assignments/${a.id}/submissions` })),
    ...teacherQuizzes.map((q) => ({ id: q.id, title: q.title, due: q.dueDate, kind: "Quiz", courseId: q.courseId, to: `/teacher/quizzes/${q.id}/edit` })),
  ]
    .filter((d) => daysUntil(d.due) >= 0)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  return (
    <>
      <section className="welcome welcome--teacher">
        <div className="welcome__text">
          <h1>Hello, <span className="hl">{teacher.firstName}</span></h1>
          <p>Today, {pending.length} submissions need grading and {studentRecords.filter((s) => s.status === 'at-risk').length} students need attention.</p>
          <div className="welcome__actions">
            <ButtonLink to="/teacher/grading" variant="primary" icon={<CheckSquare />}>Open Grading Center</ButtonLink>
            <ButtonLink to="/teacher/courses/create" variant="secondary" icon={<PlusCircle />}>Create Course</ButtonLink>
          </div>
        </div>
        <div className="welcome__art" aria-hidden="true">
          <div className="welcome__arch"><img src={SCENES.teacher} alt="" /></div>
        </div>
      </section>

      <div className="grid grid-4 mb-20">
        <StatCard label="Courses" value={teacherCourses.length} icon={<BookMarked />} meta={`${published.length} published, ${teacherCourses.length - published.length} drafts`} />
        <StatCard label="Enrolled Students" value={formatNumber(totalStudents)} icon={<Users />} tone="navy" meta={<><span className="up">+214</span> this month</>} />
        <StatCard label="Awaiting Review" value={pending.length} icon={<CheckSquare />} tone="warning" meta={<Link to="/teacher/grading">Open Grading Center</Link>} />
        <StatCard label="Average Result" value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<Target />} tone="success" meta={<><span className="up">+3%</span> compared with last month</>} />
      </div>

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <ChartCard
            title="Course Performance"
            subtitle={chart === 'scores' ? "Average assignment and quiz scores, %" : "New enrollments by month"}
            legend={
              chart === 'scores'
                ? [
                    { label: "Assignments", color: CHART_COLORS[0] },
                    { label: "Quizzes", color: CHART_COLORS[1] },
                    { label: "Completion Rate", color: CHART_COLORS[2] },
                  ]
                : perf.map((p, i) => ({ label: shortTitle(p.courseId), color: CHART_COLORS[i] }))
            }
            actions={<Segmented label="Chart Type" value={chart} onChange={setChart} items={[{ key: 'scores', label: "Results" }, { key: 'enroll', label: "Enrollments" }]} />}
          >
            {chart === 'scores' ? (
              <BarChart
                labels={perf.map((p) => shortTitle(p.courseId))}
                series={[
                  { name: "Assignments", values: perf.map((p) => p.avgAssignment) },
                  { name: "Quizzes", values: perf.map((p) => p.avgQuiz) },
                  { name: "Completion Rate", values: perf.map((p) => p.completionRate) },
                ]}
                max={100}
                suffix="%"
                height={240}
                ariaLabel="Average course results"
              />
            ) : (
              <LineChart labels={trendLabels} series={perf.map((p, i) => ({ name: shortTitle(p.courseId), values: enrollmentTrend[p.courseId], color: CHART_COLORS[i] }))} height={240} ariaLabel="Enrollment trends" />
            )}
          </ChartCard>

          <Card title="Awaiting Review" subtitle={`${pending.length} submissions`} actions={<ButtonLink to="/teacher/grading" variant="ghost" size="sm">Grading center</ButtonLink>} padded={false}>
            {pending.length === 0 ? (
              <EmptyState compact title="All submissions have been graded" />
            ) : (
              <div className="list">
                {pending.slice(0, 5).map((r) => (
                  <Link key={r.submission.id} to={`/teacher/grading?submission=${r.submission.id}`} className="list-row">
                    <Avatar name={fullName(r.student)} size={36} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="list-row__title">{fullName(r.student)}</div>
                      <div className="list-row__sub">{r.assignment.title}, {r.course.title}</div>
                    </div>
                    {r.submission.late && <Badge tone="danger">Late</Badge>}
                    <span className="xs muted nowrap">{relativeTime(r.submission.submittedAt!)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card title="Quick Actions">
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              <ButtonLink to="/teacher/courses/create" variant="secondary" block icon={<PlusCircle />} style={{ justifyContent: 'flex-start' }}>Create Course</ButtonLink>
              <ButtonLink to="/teacher/assignments?new=1" variant="secondary" block icon={<ClipboardPlus />} style={{ justifyContent: 'flex-start' }}>Add Assignment</ButtonLink>
              <ButtonLink to="/teacher/quizzes/new/edit" variant="secondary" block icon={<FilePlus2 />} style={{ justifyContent: 'flex-start' }}>Create Quiz</ButtonLink>
            </div>
          </Card>

          <Card title="Upcoming Deadlines" padded={false}>
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

          <Card title="Recent Student Activity" padded={false}>
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

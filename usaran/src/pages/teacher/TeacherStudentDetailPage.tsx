import { useParams } from 'react-router-dom';
import { Award, BookOpen, ClipboardCheck, FileQuestion, Mail, MessageSquare } from 'lucide-react';
import { getStudentRecord } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { teacherSubmissionRows, teacherQuizzes, shortTitle } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { BarChart, ChartCard } from '../../components/charts/Charts';
import { Button, ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar, Card, EmptyState, PageHeader } from '../../components/ui/Misc';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { formatDate, formatDateTime, letterGrade, relativeTime, WEEKDAYS_SHORT } from '../../lib/format';
import { tr } from '../../i18n';

export function TeacherStudentDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const record = getStudentRecord(id);
  const user = getUser(id);

  if (!record || !user) {
    return <div className="card"><EmptyState title={tr("Student not found", "Ուսանողը չի գտնվել")} text={tr("This student may no longer be enrolled in your courses.", "Հնարավոր է՝ ուսանողն այլևս գրանցված չէ ձեր դասընթացներին։")} action={<ButtonLink to="/teacher/students">{tr("Student List", "Ուսանողների ցուցակ")}</ButtonLink>} /></div>;
  }

  const name = fullName(user);
  const subs = teacherSubmissionRows().filter((r) => r.student.id === user.id);
  const quizzes = teacherQuizzes.filter((q) => q.status === 'published' && record.courseIds.includes(q.courseId));
  const totalMin = record.weeklyMinutes.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Students", "Ուսանողներ"), to: '/teacher/students' }, { label: name }]}
        title={name}
        description={`${user.program ?? ''}${user.institution ? `, ${user.institution}` : ''}`}
        actions={
          <>
            <Button variant="secondary" icon={<Mail />} onClick={() => toast.info(tr("Email", "Էլ. նամակ"), tr("Emails are not sent in this demo.", "Ցուցադրական տարբերակում նամակներ չեն ուղարկվում։"))}>{tr("Send Email", "Գրել նամակ")}</Button>
            <Button icon={<MessageSquare />} onClick={() => toast.info(tr("Message", "Հաղորդագրություն"), tr("Messages are not sent in this demo.", "Ցուցադրական տարբերակում հաղորդագրություններ չեն ուղարկվում։"))}>{tr("Message", "Հաղորդագրություն")}</Button>
          </>
        }
      />

      <div className="grid grid-aside-main">
        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card>
            <div className="stack" style={{ alignItems: 'center', textAlign: 'center', ['--gap' as string]: '10px' }}>
              <Avatar name={name} size={84} />
              <div>
                <div className="strong" style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>{name}</div>
                <div className="xs muted">{user.email}</div>
              </div>
              <StatusBadge status={record.status} />
            </div>
            <dl className="kv" style={{ marginTop: 20 }}>
              <dt>{tr("Year of Study", "Կուրս")}</dt><dd>{user.year ?? '—'}</dd>
              <dt>{tr("Enrollment Date", "Գրանցման ամսաթիվ")}</dt><dd>{formatDate(user.joinedAt)}</dd>
              <dt>{tr("Last Sign-In", "Վերջին մուտք")}</dt><dd>{relativeTime(record.lastActive)}</dd>
              <dt>{tr("This Week", "Այս շաբաթ")}</dt><dd>{Math.round(totalMin / 60 * 10) / 10}{tr(" hr", " ժամ")}</dd>
            </dl>
          </Card>
          <Card title={tr("Participation by Course", "Մասնակցություն ըստ դասընթացների")}>
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              {record.courseIds.map((cid, i) => {
                const p = Math.max(5, Math.min(100, record.progress + (i % 2 ? -12 : 8)));
                return (
                  <div key={cid}>
                    <div className="row row--between small" style={{ marginBottom: 4 }}>
                      <span className="strong" style={{ color: 'var(--navy-900)' }}>{getCourse(cid)?.title}</span>
                    </div>
                    <ProgressBar value={p} />
                    <div className="xs muted" style={{ marginTop: 4 }}>{p >= 100 ? tr("Completed", "Ավարտված") : p > 0 ? tr("In progress", "Ընթացքում") : tr("Not started", "Չսկսված")}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <div className="grid grid-4">
            <StatCard label={tr("Overall Progress", "Ընդհանուր առաջընթաց")} value={record.progress} unit="%" icon={<BookOpen />} />
            <StatCard label={tr("Average Grade", "Միջին գնահատական")} value={record.avgScore} unit="%" icon={<Award />} tone="success" meta={tr(`Grade: ${letterGrade(record.avgScore)}`, `Գնահատական՝ ${letterGrade(record.avgScore)}`)} />
            <StatCard label={tr("Assignments", "Առաջադրանքներ")} value={record.assignmentsDone} unit={`/${record.assignmentsTotal}`} icon={<ClipboardCheck />} tone="navy" />
            <StatCard label={tr("Quiz Average", "Թեստերի միջին")} value={record.quizAvg} unit="%" icon={<FileQuestion />} tone="warning" />
          </div>

          <ChartCard title={tr("This Week's Activity", "Այս շաբաթվա ակտիվությունը")} subtitle={tr("Minutes by day", "Րոպեներ ըստ օրերի")}>
            <BarChart labels={WEEKDAYS_SHORT} series={[{ name: tr("Minutes", "Րոպե"), values: record.weeklyMinutes }]} height={190} suffix={tr(" min", " ր")} ariaLabel={tr("Student activity by day", "Ուսանողի ակտիվությունն ըստ օրերի")} />
          </ChartCard>

          <Card title={tr("Submitted Assignments", "Հանձնված աշխատանքներ")} padded={false}>
            <DataTable
              caption={tr("Student Submissions", "Ուսանողի հանձնումները")}
              rows={subs}
              rowKey={(r) => r.submission.id}
              empty={<EmptyState compact title={tr("No submissions", "Հանձնումներ չկան")} text={tr("This student has not submitted any work in your courses yet.", "Ուսանողը դեռ աշխատանք չի հանձնել ձեր դասընթացներում։")} />}
              initialSort={{ key: 'd', dir: 'desc' }}
              columns={[
                { key: 'a', header: tr("Assignment", "Առաջադրանք"), sortValue: (r) => r.assignment.title, render: (r) => <><div className="cell-title">{r.assignment.title}</div><div className="cell-sub">{shortTitle(r.course.id)}</div></> },
                { key: 'd', header: tr("Submitted", "Հանձնված"), sortValue: (r) => r.submission.submittedAt ?? '', render: (r) => <span className="nowrap">{r.submission.submittedAt ? formatDateTime(r.submission.submittedAt) : '—'}</span> },
                { key: 's', header: tr("Status", "Կարգավիճակ"), render: (r) => <StatusBadge status={r.submission.status} /> },
                { key: 'sc', header: tr("Score", "Միավոր"), align: 'right', sortValue: (r) => r.submission.score ?? -1, render: (r) => (r.submission.score !== undefined ? <strong>{r.submission.score}/{r.assignment.maxScore}</strong> : <ButtonLink to={`/teacher/grading?submission=${r.submission.id}`} variant="secondary" size="sm">{tr("Grade", "Գնահատել")}</ButtonLink>) },
              ]}
            />
          </Card>

          <Card title={tr("Quiz Results", "Թեստերի արդյունքներ")} padded={false}>
            {quizzes.length === 0 ? (
              <EmptyState compact title={tr("No quizzes", "Թեստեր չկան")} />
            ) : (
              <div className="list">
                {quizzes.map((q, i) => {
                  const score = Math.max(40, Math.min(100, record.quizAvg + ((i * 7) % 15) - 6));
                  return (
                    <div key={q.id} className="list-row">
                      <span className="list-row__icon"><FileQuestion /></span>
                      <div className="grow">
                        <div className="list-row__title">{q.title}</div>
                        <div className="list-row__sub">{getCourse(q.courseId)?.title}</div>
                      </div>
                      <Badge tone={score >= q.passPercent ? 'success' : 'danger'}>{score}%</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

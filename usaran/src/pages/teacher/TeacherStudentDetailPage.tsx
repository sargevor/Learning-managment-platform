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

export function TeacherStudentDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const record = getStudentRecord(id);
  const user = getUser(id);

  if (!record || !user) {
    return <div className="card"><EmptyState title="Ուսանողը չի գտնվել" text="Հնարավոր է՝ ուսանողն այլևս գրանցված չէ ձեր դասընթացներին։" action={<ButtonLink to="/teacher/students">Ուսանողների ցուցակ</ButtonLink>} /></div>;
  }

  const name = fullName(user);
  const subs = teacherSubmissionRows().filter((r) => r.student.id === user.id);
  const quizzes = teacherQuizzes.filter((q) => q.status === 'published' && record.courseIds.includes(q.courseId));
  const totalMin = record.weeklyMinutes.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Ուսանողներ', to: '/teacher/students' }, { label: name }]}
        title={name}
        description={`${user.program ?? ''}${user.institution ? `, ${user.institution}` : ''}`}
        actions={
          <>
            <Button variant="secondary" icon={<Mail />} onClick={() => toast.info('Էլ. նամակ', 'Ցուցադրական տարբերակում նամակներ չեն ուղարկվում։')}>Գրել նամակ</Button>
            <Button icon={<MessageSquare />} onClick={() => toast.info('Հաղորդագրություն', 'Ցուցադրական տարբերակում հաղորդագրություններ չեն ուղարկվում։')}>Հաղորդագրություն</Button>
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
              <dt>Կուրս</dt><dd>{user.year ?? '—'}</dd>
              <dt>Հարթակում է</dt><dd>{formatDate(user.joinedAt)}-ից</dd>
              <dt>Վերջին մուտք</dt><dd>{relativeTime(record.lastActive)}</dd>
              <dt>Այս շաբաթ</dt><dd>{Math.round(totalMin / 60 * 10) / 10} ժամ</dd>
            </dl>
          </Card>
          <Card title="Մասնակցություն ըստ դասընթացների">
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              {record.courseIds.map((cid, i) => {
                const p = Math.max(5, Math.min(100, record.progress + (i % 2 ? -12 : 8)));
                return (
                  <div key={cid}>
                    <div className="row row--between small" style={{ marginBottom: 4 }}>
                      <span className="strong" style={{ color: 'var(--navy-900)' }}>{getCourse(cid)?.title}</span>
                    </div>
                    <ProgressBar value={p} />
                    <div className="xs muted" style={{ marginTop: 4 }}>{p >= 100 ? 'Ավարտված' : p > 0 ? 'Ընթացքում' : 'Չսկսված'}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <div className="grid grid-4">
            <StatCard label="Ընդհանուր առաջընթաց" value={record.progress} unit="%" icon={<BookOpen />} />
            <StatCard label="Միջին գնահատական" value={record.avgScore} unit="%" icon={<Award />} tone="success" meta={`Գնահատական՝ ${letterGrade(record.avgScore)}`} />
            <StatCard label="Առաջադրանքներ" value={record.assignmentsDone} unit={`/${record.assignmentsTotal}`} icon={<ClipboardCheck />} tone="navy" />
            <StatCard label="Թեստերի միջին" value={record.quizAvg} unit="%" icon={<FileQuestion />} tone="warning" />
          </div>

          <ChartCard title="Ակտիվություն այս շաբաթ" subtitle="Րոպեներ ըստ օրերի">
            <BarChart labels={WEEKDAYS_SHORT} series={[{ name: 'Րոպե', values: record.weeklyMinutes }]} height={190} suffix=" ր" ariaLabel="Ուսանողի ակտիվությունը ըստ օրերի" />
          </ChartCard>

          <Card title="Հանձնված աշխատանքներ" padded={false}>
            <DataTable
              caption="Ուսանողի հանձնումները"
              rows={subs}
              rowKey={(r) => r.submission.id}
              empty={<EmptyState compact title="Հանձնումներ չկան" text="Ուսանողը դեռ աշխատանք չի հանձնել ձեր դասընթացներում։" />}
              initialSort={{ key: 'd', dir: 'desc' }}
              columns={[
                { key: 'a', header: 'Առաջադրանք', sortValue: (r) => r.assignment.title, render: (r) => <><div className="cell-title">{r.assignment.title}</div><div className="cell-sub">{shortTitle(r.course.id)}</div></> },
                { key: 'd', header: 'Հանձնված', sortValue: (r) => r.submission.submittedAt ?? '', render: (r) => <span className="nowrap">{r.submission.submittedAt ? formatDateTime(r.submission.submittedAt) : '—'}</span> },
                { key: 's', header: 'Կարգավիճակ', render: (r) => <StatusBadge status={r.submission.status} /> },
                { key: 'sc', header: 'Միավոր', align: 'right', sortValue: (r) => r.submission.score ?? -1, render: (r) => (r.submission.score !== undefined ? <strong>{r.submission.score}/{r.assignment.maxScore}</strong> : <ButtonLink to={`/teacher/grading?submission=${r.submission.id}`} variant="secondary" size="sm">Գնահատել</ButtonLink>) },
              ]}
            />
          </Card>

          <Card title="Թեստերի արդյունքներ" padded={false}>
            {quizzes.length === 0 ? (
              <EmptyState compact title="Թեստեր չկան" />
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

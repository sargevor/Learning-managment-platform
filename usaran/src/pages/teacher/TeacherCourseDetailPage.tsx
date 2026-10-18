import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClipboardList, Eye, EyeOff, FileQuestion, FolderTree, Pencil, Trash2, Users } from 'lucide-react';
import { categoryName, difficultyLabel, getCourse, lessonCount } from '../../data/courses';
import { assignments, submissionsFor } from '../../data/assignments';
import { coursePerformance, enrollmentTrend, trendLabels } from '../../data/analytics';
import { studentsInCourse, teacherQuizzes } from '../../data/teacherView';
import { fullName, getUser, DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ChartCard, LineChart } from '../../components/charts/Charts';
import { Button, ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Card, EmptyState, PageHeader, Person, Tabs, Thumb } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { Toggle } from '../../components/ui/Field';
import { LessonItem } from '../../components/course/CourseBits';
import { formatDate, formatNumber, relativeTime } from '../../lib/format';

type Tab = 'overview' | 'students' | 'work' | 'settings';

export function TeacherCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const course = getCourse(id);
  const [tab, setTab] = useState<Tab>('overview');
  const [status, setStatus] = useState(course?.status ?? 'draft');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [settings, setSettings] = useState({ enroll: true, comments: true, certificate: true });

  if (!course || course.teacherId !== DEMO_TEACHER_ID) {
    return <div className="card"><EmptyState title="Դասընթացը չի գտնվել" text="Հնարավոր է՝ այն ջնջվել է կամ պատկանում է այլ դասավանդողի։" action={<ButtonLink to="/teacher/courses">Իմ դասընթացները</ButtonLink>} /></div>;
  }

  const perf = coursePerformance.find((p) => p.courseId === course.id);
  const students = studentsInCourse(course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = teacherQuizzes.filter((q) => q.courseId === course.id);
  const trend = enrollmentTrend[course.id];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Դասընթացներ', to: '/teacher/courses' }, { label: course.title }]}
        title={course.title}
        description={course.shortDescription}
        actions={
          <>
            {status === 'published' && <ButtonLink to={`/courses/${course.id}`} variant="secondary" icon={<Eye />}>Նախադիտում</ButtonLink>}
            <ButtonLink to={`/teacher/courses/${course.id}/content`} variant="secondary" icon={<FolderTree />}>Բովանդակություն</ButtonLink>
            <ButtonLink to={`/teacher/courses/${course.id}/edit`} variant="secondary" icon={<Pencil />}>Խմբագրել</ButtonLink>
            <Button variant={status === 'published' ? 'secondary' : 'primary'} icon={status === 'published' ? <EyeOff /> : <Eye />} onClick={() => setConfirmPublish(true)}>
              {status === 'published' ? 'Հանել հրապարակումից' : 'Հրապարակել'}
            </Button>
          </>
        }
      />

      <div className="card mb-20 course-summary">
        <Thumb src={course.image} alt="" className="course-summary__thumb" />
        <div className="course-summary__meta">
          <div><span className="xs muted">Կարգավիճակ</span><StatusBadge status={status} /></div>
          <div><span className="xs muted">Ուղղություն</span><strong className="small">{categoryName(course.category)}</strong></div>
          <div><span className="xs muted">Մակարդակ</span><strong className="small">{difficultyLabel[course.difficulty]}</strong></div>
          <div><span className="xs muted">Կառուցվածք</span><strong className="small">{course.modules.length} մոդուլ, {lessonCount(course)} դաս</strong></div>
          <div><span className="xs muted">Թարմացվել է</span><strong className="small">{formatDate(course.updatedAt)}</strong></div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: 'Ընդհանուր' },
          { key: 'students', label: 'Գրանցումներ', count: students.length },
          { key: 'work', label: 'Առաջադրանքներ և թեստեր', count: courseAssignments.length + courseQuizzes.length },
          { key: 'settings', label: 'Կարգավորումներ' },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label="Գրանցված ուսանողներ" value={formatNumber(course.enrolled)} icon={<Users />} />
              <StatCard label="Ավարտելիություն" value={perf?.completionRate ?? 0} unit="%" icon={<Eye />} tone="success" />
              <StatCard label="Առաջադրանքների միջին" value={perf?.avgAssignment ?? '—'} unit={perf ? '%' : ''} icon={<ClipboardList />} tone="navy" />
              <StatCard label="Թեստերի միջին" value={perf?.avgQuiz ?? '—'} unit={perf ? '%' : ''} icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-main-aside">
              <Card title="Դասընթացի կառուցվածք" actions={<ButtonLink to={`/teacher/courses/${course.id}/content`} variant="ghost" size="sm">Խմբագրել</ButtonLink>}>
                <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                  {course.modules.map((m, i) => (
                    <div key={m.id}>
                      <div className="small strong" style={{ color: 'var(--navy-900)', marginBottom: 4 }}>Մոդուլ {i + 1}. {m.title}</div>
                      {m.lessons.map((l) => <LessonItem key={l.id} lesson={l} showType />)}
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Ուսումնական նպատակներ">
                <ol className="instructions">
                  {course.objectives.map((o) => <li key={o}>{o}</li>)}
                </ol>
              </Card>
            </div>
          </div>
        )}

        {tab === 'students' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            {trend && (
              <ChartCard title="Գրանցումների դինամիկա" subtitle="Նոր ուսանողներ ըստ ամիսների">
                <LineChart labels={trendLabels} series={[{ name: 'Գրանցումներ', values: trend }]} height={200} ariaLabel="Նոր գրանցումներ ըստ ամիսների" />
              </ChartCard>
            )}
            <Card title="Գրանցված ուսանողներ" subtitle={`Ցուցադրված են խմբի ${students.length} ուսանողները`} padded={false}>
              <DataTable
                caption="Դասընթացի ուսանողներ"
                rows={students}
                rowKey={(r) => r.userId}
                onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
                empty={<EmptyState compact title="Գրանցված ուսանողներ դեռ չկան" text="Հրապարակեք դասընթացը, որպեսզի ուսանողները կարողանան գրանցվել։" />}
                columns={[
                  { key: 'n', header: 'Ուսանող', sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} sub={getUser(r.userId)?.email} size={32} /> },
                  { key: 'p', header: 'Առաջընթաց', sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 140 }}><ProgressBar value={r.progress} /></div> },
                  { key: 'a', header: 'Միջին միավոր', align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 's', header: 'Կարգավիճակ', render: (r) => <StatusBadge status={r.status} /> },
                  { key: 'l', header: 'Վերջին ակտիվություն', sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap">{relativeTime(r.lastActive)}</span> },
                ]}
              />
            </Card>
          </div>
        )}

        {tab === 'work' && (
          <div className="grid grid-2">
            <Card title="Առաջադրանքներ" actions={<ButtonLink to="/teacher/assignments?new=1" variant="ghost" size="sm">Ավելացնել</ButtonLink>} padded={false}>
              {courseAssignments.length === 0 ? (
                <EmptyState compact title="Առաջադրանքներ չկան" />
              ) : (
                <div className="list">
                  {courseAssignments.map((a) => {
                    const subs = submissionsFor(a.id);
                    return (
                      <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="list-row">
                        <span className="list-row__icon"><ClipboardList /></span>
                        <div className="grow">
                          <div className="list-row__title">{a.title}</div>
                          <div className="list-row__sub">Վերջնաժամկետ՝ {formatDate(a.dueDate)}, {subs.length} հանձնում</div>
                        </div>
                        {subs.some((s) => s.status === 'submitted') && <span className="badge badge--warning">{subs.filter((s) => s.status === 'submitted').length} նոր</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card title="Թեստեր" actions={<ButtonLink to="/teacher/quizzes/new/edit" variant="ghost" size="sm">Ավելացնել</ButtonLink>} padded={false}>
              {courseQuizzes.length === 0 ? (
                <EmptyState compact title="Թեստեր չկան" text="Ստեղծեք թեստ՝ ուսանողների գիտելիքները ստուգելու համար։" />
              ) : (
                <div className="list">
                  {courseQuizzes.map((q) => (
                    <Link key={q.id} to={`/teacher/quizzes/${q.id}/edit`} className="list-row">
                      <span className="list-row__icon"><FileQuestion /></span>
                      <div className="grow">
                        <div className="list-row__title">{q.title}</div>
                        <div className="list-row__sub">{q.questions.length} հարց, {q.timeLimitMin} րոպե</div>
                      </div>
                      <StatusBadge status={q.status} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'settings' && (
          <div className="stack" style={{ ['--gap' as string]: '20px', maxWidth: 760 }}>
            <Card title="Տեսանելիություն և մասնակցություն" footer={<Button onClick={() => toast.success('Կարգավորումները պահվեցին', 'Դեմո ռեժիմ։')}>Պահել</Button>}>
              <div className="settings-list">
                <Toggle label="Հրապարակված է կատալոգում" description="Անջատելու դեպքում դասընթացը տեսանելի կլինի միայն գրանցված ուսանողներին" checked={status === 'published'} onChange={(v) => setStatus(v ? 'published' : 'draft')} />
                <Toggle label="Բաց գրանցում" description="Նոր ուսանողները կարող են ինքնուրույն գրանցվել" checked={settings.enroll} onChange={(v) => setSettings({ ...settings, enroll: v })} />
                <Toggle label="Քննարկումներ դասերի տակ" description="Ուսանողները կարող են հարցեր տալ յուրաքանչյուր դասի ներքո" checked={settings.comments} onChange={(v) => setSettings({ ...settings, comments: v })} />
                <Toggle label="Ավարտական վկայական" description="Ավտոմատ տրամադրվում է դասընթացն ավարտելիս" checked={settings.certificate} onChange={(v) => setSettings({ ...settings, certificate: v })} />
              </div>
            </Card>
            <Card title="Ջնջել դասընթացը">
              <p className="small secondary" style={{ marginBottom: 14 }}>Կջնջվեն բոլոր մոդուլները, դասերը, առաջադրանքները և ուսանողների արդյունքները։</p>
              <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>Ջնջել դասընթացը</Button>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={() => {
          const next = status === 'published' ? 'draft' : 'published';
          setStatus(next);
          toast.success(next === 'published' ? 'Դասընթացը հրապարակվեց' : 'Դասընթացը հանվեց հրապարակումից', 'Դեմո ռեժիմ. փոփոխությունը տեղային է։');
        }}
        tone="warning"
        title={status === 'published' ? 'Հանե՞լ հրապարակումից' : 'Հրապարակե՞լ դասընթացը'}
        text={status === 'published' ? 'Դասընթացը կհեռացվի կատալոգից։ Արդեն գրանցված ուսանողները կշարունակեն մուտք ունենալ։' : 'Դասընթացը կհայտնվի հանրային կատալոգում և հասանելի կլինի գրանցման համար։'}
        confirmLabel={status === 'published' ? 'Հանել' : 'Հրապարակել'}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.success('Դասընթացը ջնջվեց', 'Դեմո ռեժիմ. իրականում ոչինչ չի ջնջվել։');
          navigate('/teacher/courses');
        }}
        title="Ջնջե՞լ դասընթացը"
        text={`«${course.title}» դասընթացը կջնջվի ամբողջությամբ։ Այս գործողությունը հնարավոր չէ հետարկել։`}
        confirmLabel="Ջնջել"
      />
    </>
  );
}

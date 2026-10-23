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
import { tr } from '../../i18n';

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
    return <div className="card"><EmptyState title={tr("Course not found", "Դասընթացը չի գտնվել")} text={tr("It may have been deleted or belongs to another instructor.", "Հնարավոր է՝ այն ջնջվել է կամ պատկանում է այլ դասավանդողի։")} action={<ButtonLink to="/teacher/courses">{tr("My courses", "Իմ դասընթացները")}</ButtonLink>} /></div>;
  }

  const perf = coursePerformance.find((p) => p.courseId === course.id);
  const students = studentsInCourse(course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = teacherQuizzes.filter((q) => q.courseId === course.id);
  const trend = enrollmentTrend[course.id];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Courses", "Դասընթացներ"), to: '/teacher/courses' }, { label: course.title }]}
        title={course.title}
        description={course.shortDescription}
        actions={
          <>
            {status === 'published' && <ButtonLink to={`/courses/${course.id}`} variant="secondary" icon={<Eye />}>{tr("Preview", "Նախադիտում")}</ButtonLink>}
            <ButtonLink to={`/teacher/courses/${course.id}/content`} variant="secondary" icon={<FolderTree />}>{tr("Content", "Բովանդակություն")}</ButtonLink>
            <ButtonLink to={`/teacher/courses/${course.id}/edit`} variant="secondary" icon={<Pencil />}>{tr("Edit", "Խմբագրել")}</ButtonLink>
            <Button variant={status === 'published' ? 'secondary' : 'primary'} icon={status === 'published' ? <EyeOff /> : <Eye />} onClick={() => setConfirmPublish(true)}>
              {status === 'published' ? tr("Unpublish", "Հանել հրապարակումից") : tr("Publish", "Հրապարակել")}
            </Button>
          </>
        }
      />

      <div className="card mb-20 course-summary">
        <Thumb src={course.image} alt="" className="course-summary__thumb" />
        <div className="course-summary__meta">
          <div><span className="xs muted">{tr("Status", "Կարգավիճակ")}</span><StatusBadge status={status} /></div>
          <div><span className="xs muted">{tr("Category", "Ուղղություն")}</span><strong className="small">{categoryName(course.category)}</strong></div>
          <div><span className="xs muted">{tr("Level", "Մակարդակ")}</span><strong className="small">{difficultyLabel[course.difficulty]}</strong></div>
          <div><span className="xs muted">{tr("Structure", "Կառուցվածք")}</span><strong className="small">{course.modules.length}{tr(" modules, ", " մոդուլ, ")}{lessonCount(course)}{tr(" lessons", " դաս")}</strong></div>
          <div><span className="xs muted">{tr("Last Updated", "Թարմացվել է")}</span><strong className="small">{formatDate(course.updatedAt)}</strong></div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: tr("Total", "Ընդհանուր") },
          { key: 'students', label: tr("Enrollments", "Գրանցումներ"), count: students.length },
          { key: 'work', label: tr("Assignments and Quizzes", "Առաջադրանքներ և թեստեր"), count: courseAssignments.length + courseQuizzes.length },
          { key: 'settings', label: tr("Settings", "Կարգավորումներ") },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label={tr("Enrolled Students", "Գրանցված ուսանողներ")} value={formatNumber(course.enrolled)} icon={<Users />} />
              <StatCard label={tr("Completion Rate", "Ավարտման մակարդակ")} value={perf?.completionRate ?? 0} unit="%" icon={<Eye />} tone="success" />
              <StatCard label={tr("Assignment Average", "Առաջադրանքների միջին")} value={perf?.avgAssignment ?? '—'} unit={perf ? '%' : ''} icon={<ClipboardList />} tone="navy" />
              <StatCard label={tr("Quiz Average", "Թեստերի միջին")} value={perf?.avgQuiz ?? '—'} unit={perf ? '%' : ''} icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-main-aside">
              <Card title={tr("Course Structure", "Դասընթացի կառուցվածք")} actions={<ButtonLink to={`/teacher/courses/${course.id}/content`} variant="ghost" size="sm">{tr("Edit", "Խմբագրել")}</ButtonLink>}>
                <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                  {course.modules.map((m, i) => (
                    <div key={m.id}>
                      <div className="small strong" style={{ color: 'var(--navy-900)', marginBottom: 4 }}>{tr("Module ", "Մոդուլ ")}{i + 1}. {m.title}</div>
                      {m.lessons.map((l) => <LessonItem key={l.id} lesson={l} showType />)}
                    </div>
                  ))}
                </div>
              </Card>
              <Card title={tr("Learning Objectives", "Ուսումնական նպատակներ")}>
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
              <ChartCard title={tr("Enrollment Trends", "Գրանցումների դինամիկա")} subtitle={tr("New students by month", "Նոր ուսանողներ ըստ ամիսների")}>
                <LineChart labels={trendLabels} series={[{ name: tr("Enrollments", "Գրանցումներ"), values: trend }]} height={200} ariaLabel={tr("New enrollments by month", "Նոր գրանցումներ ըստ ամիսների")} />
              </ChartCard>
            )}
            <Card title={tr("Enrolled Students", "Գրանցված ուսանողներ")} subtitle={tr(`Showing ${students.length} students from the group`, `Ցուցադրված են խմբի ${students.length} ուսանողները`)} padded={false}>
              <DataTable
                caption={tr("Course Students", "Դասընթացի ուսանողներ")}
                rows={students}
                rowKey={(r) => r.userId}
                onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
                empty={<EmptyState compact title={tr("No enrolled students yet", "Գրանցված ուսանողներ դեռ չկան")} text={tr("Publish the course so students can enroll.", "Հրապարակեք դասընթացը, որպեսզի ուսանողները կարողանան գրանցվել։")} />}
                columns={[
                  { key: 'n', header: tr("Student", "Ուսանող"), sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} sub={getUser(r.userId)?.email} size={32} /> },
                  { key: 'p', header: tr("Progress", "Առաջընթաց"), sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 140 }}><ProgressBar value={r.progress} /></div> },
                  { key: 'a', header: tr("Average Score", "Միջին միավոր"), align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 's', header: tr("Status", "Կարգավիճակ"), render: (r) => <StatusBadge status={r.status} /> },
                  { key: 'l', header: tr("Last Active", "Վերջին ակտիվություն"), sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap">{relativeTime(r.lastActive)}</span> },
                ]}
              />
            </Card>
          </div>
        )}

        {tab === 'work' && (
          <div className="grid grid-2">
            <Card title={tr("Assignments", "Առաջադրանքներ")} actions={<ButtonLink to="/teacher/assignments?new=1" variant="ghost" size="sm">{tr("Add", "Ավելացնել")}</ButtonLink>} padded={false}>
              {courseAssignments.length === 0 ? (
                <EmptyState compact title={tr("No assignments", "Առաջադրանքներ չկան")} />
              ) : (
                <div className="list">
                  {courseAssignments.map((a) => {
                    const subs = submissionsFor(a.id);
                    return (
                      <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="list-row">
                        <span className="list-row__icon"><ClipboardList /></span>
                        <div className="grow">
                          <div className="list-row__title">{a.title}</div>
                          <div className="list-row__sub">{tr("Deadline: ", "Վերջնաժամկետ՝ ")}{formatDate(a.dueDate)}, {subs.length}{tr(" submissions", " հանձնում")}</div>
                        </div>
                        {subs.some((s) => s.status === 'submitted') && <span className="badge badge--warning">{subs.filter((s) => s.status === 'submitted').length}{tr(" new", " նոր")}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card title={tr("Quizzes", "Թեստեր")} actions={<ButtonLink to="/teacher/quizzes/new/edit" variant="ghost" size="sm">{tr("Add", "Ավելացնել")}</ButtonLink>} padded={false}>
              {courseQuizzes.length === 0 ? (
                <EmptyState compact title={tr("No quizzes", "Թեստեր չկան")} text={tr("Create a quiz to assess your students' understanding.", "Ստեղծեք թեստ՝ ուսանողների գիտելիքները ստուգելու համար։")} />
              ) : (
                <div className="list">
                  {courseQuizzes.map((q) => (
                    <Link key={q.id} to={`/teacher/quizzes/${q.id}/edit`} className="list-row">
                      <span className="list-row__icon"><FileQuestion /></span>
                      <div className="grow">
                        <div className="list-row__title">{q.title}</div>
                        <div className="list-row__sub">{q.questions.length}{tr(" questions, ", " հարց, ")}{q.timeLimitMin}{tr(" min", " րոպե")}</div>
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
            <Card title={tr("Visibility and Participation", "Տեսանելիություն և մասնակցություն")} footer={<Button onClick={() => toast.success(tr("Settings saved", "Կարգավորումները պահվեցին"), tr("Demo only.", "Ցուցադրական ռեժիմ։"))}>{tr("Save", "Պահել")}</Button>}>
              <div className="settings-list">
                <Toggle label={tr("Show in the Course Catalog", "Ցուցադրել դասընթացների կատալոգում")} description={tr("When disabled, only enrolled students can see the course", "Անջատելու դեպքում դասընթացը տեսանելի կլինի միայն գրանցված ուսանողներին")} checked={status === 'published'} onChange={(v) => setStatus(v ? 'published' : 'draft')} />
                <Toggle label={tr("Open Enrollment", "Բաց գրանցում")} description={tr("New students can enroll on their own", "Նոր ուսանողները կարող են ինքնուրույն գրանցվել")} checked={settings.enroll} onChange={(v) => setSettings({ ...settings, enroll: v })} />
                <Toggle label={tr("Lesson Discussions", "Քննարկումներ դասերում")} description={tr("Students can ask questions below each lesson", "Ուսանողները կարող են հարցեր տալ յուրաքանչյուր դասի ներքո")} checked={settings.comments} onChange={(v) => setSettings({ ...settings, comments: v })} />
                <Toggle label={tr("Certificate of Completion", "Ավարտական վկայական")} description={tr("Automatically awarded on course completion", "Ավտոմատ տրամադրվում է դասընթացն ավարտելիս")} checked={settings.certificate} onChange={(v) => setSettings({ ...settings, certificate: v })} />
              </div>
            </Card>
            <Card title={tr("Delete Course", "Ջնջել դասընթացը")}>
              <p className="small secondary" style={{ marginBottom: 14 }}>{tr("All modules, lessons, assignments, and student results will be deleted.", "Կջնջվեն բոլոր մոդուլները, դասերը, առաջադրանքները և ուսանողների արդյունքները։")}</p>
              <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>{tr("Delete Course", "Ջնջել դասընթացը")}</Button>
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
          toast.success(next === 'published' ? tr("Course published", "Դասընթացը հրապարակվեց") : tr("Course unpublished", "Դասընթացը հանվեց հրապարակումից"), tr("Demo: this change is local only.", "Ցուցադրական ռեժիմ։ Փոփոխությունը պահվում է միայն այս էջում։"));
        }}
        tone="warning"
        title={status === 'published' ? tr("Unpublish this course?", "Հանե՞լ դասընթացը հրապարակումից") : tr("Publish this course?", "Հրապարակե՞լ դասընթացը")}
        text={status === 'published' ? tr("The course will be removed from the catalog. Students who are already enrolled will retain access.", "Դասընթացը կհեռացվի կատալոգից։ Արդեն գրանցված ուսանողները կշարունակեն մուտք ունենալ։") : tr("The course will appear in the public catalog and be open for enrollment.", "Դասընթացը կհայտնվի հանրային կատալոգում և հասանելի կլինի գրանցման համար։")}
        confirmLabel={status === 'published' ? tr("Unpublish", "Հանել հրապարակումից") : tr("Publish", "Հրապարակել")}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.success(tr("Course deleted", "Դասընթացը ջնջվեց"), tr("Demo: nothing has actually been deleted.", "Ցուցադրական ռեժիմ։ Իրականում ոչինչ չի ջնջվել։"));
          navigate('/teacher/courses');
        }}
        title={tr("Delete this course?", "Ջնջե՞լ դասընթացը")}
        text={tr(`${course.title} will be permanently deleted. This action cannot be undone.`, `«${course.title}» դասընթացը կջնջվի ընդմիշտ։ Այս գործողությունը հնարավոր չէ չեղարկել։`)}
        confirmLabel={tr("Delete", "Ջնջել")}
      />
    </>
  );
}

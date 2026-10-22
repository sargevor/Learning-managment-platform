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
    return <div className="card"><EmptyState title="Course not found" text="It may have been deleted or belongs to another instructor." action={<ButtonLink to="/teacher/courses">My courses</ButtonLink>} /></div>;
  }

  const perf = coursePerformance.find((p) => p.courseId === course.id);
  const students = studentsInCourse(course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = teacherQuizzes.filter((q) => q.courseId === course.id);
  const trend = enrollmentTrend[course.id];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Courses", to: '/teacher/courses' }, { label: course.title }]}
        title={course.title}
        description={course.shortDescription}
        actions={
          <>
            {status === 'published' && <ButtonLink to={`/courses/${course.id}`} variant="secondary" icon={<Eye />}>Preview</ButtonLink>}
            <ButtonLink to={`/teacher/courses/${course.id}/content`} variant="secondary" icon={<FolderTree />}>Content</ButtonLink>
            <ButtonLink to={`/teacher/courses/${course.id}/edit`} variant="secondary" icon={<Pencil />}>Edit</ButtonLink>
            <Button variant={status === 'published' ? 'secondary' : 'primary'} icon={status === 'published' ? <EyeOff /> : <Eye />} onClick={() => setConfirmPublish(true)}>
              {status === 'published' ? "Unpublish" : "Publish"}
            </Button>
          </>
        }
      />

      <div className="card mb-20 course-summary">
        <Thumb src={course.image} alt="" className="course-summary__thumb" />
        <div className="course-summary__meta">
          <div><span className="xs muted">Status</span><StatusBadge status={status} /></div>
          <div><span className="xs muted">Category</span><strong className="small">{categoryName(course.category)}</strong></div>
          <div><span className="xs muted">Level</span><strong className="small">{difficultyLabel[course.difficulty]}</strong></div>
          <div><span className="xs muted">Structure</span><strong className="small">{course.modules.length} modules, {lessonCount(course)} lessons</strong></div>
          <div><span className="xs muted">Last Updated</span><strong className="small">{formatDate(course.updatedAt)}</strong></div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: "Total" },
          { key: 'students', label: "Enrollments", count: students.length },
          { key: 'work', label: "Assignments and Quizzes", count: courseAssignments.length + courseQuizzes.length },
          { key: 'settings', label: "Settings" },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label="Enrolled Students" value={formatNumber(course.enrolled)} icon={<Users />} />
              <StatCard label="Completion Rate" value={perf?.completionRate ?? 0} unit="%" icon={<Eye />} tone="success" />
              <StatCard label="Assignment Average" value={perf?.avgAssignment ?? '—'} unit={perf ? '%' : ''} icon={<ClipboardList />} tone="navy" />
              <StatCard label="Quiz Average" value={perf?.avgQuiz ?? '—'} unit={perf ? '%' : ''} icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-main-aside">
              <Card title="Course Structure" actions={<ButtonLink to={`/teacher/courses/${course.id}/content`} variant="ghost" size="sm">Edit</ButtonLink>}>
                <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                  {course.modules.map((m, i) => (
                    <div key={m.id}>
                      <div className="small strong" style={{ color: 'var(--navy-900)', marginBottom: 4 }}>Module {i + 1}. {m.title}</div>
                      {m.lessons.map((l) => <LessonItem key={l.id} lesson={l} showType />)}
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Learning Objectives">
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
              <ChartCard title="Enrollment Trends" subtitle="New students by month">
                <LineChart labels={trendLabels} series={[{ name: "Enrollments", values: trend }]} height={200} ariaLabel="New enrollments by month" />
              </ChartCard>
            )}
            <Card title="Enrolled Students" subtitle={`Showing ${students.length} students from the group`} padded={false}>
              <DataTable
                caption="Course Students"
                rows={students}
                rowKey={(r) => r.userId}
                onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
                empty={<EmptyState compact title="No enrolled students yet" text="Publish the course so students can enroll." />}
                columns={[
                  { key: 'n', header: "Student", sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} sub={getUser(r.userId)?.email} size={32} /> },
                  { key: 'p', header: "Progress", sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 140 }}><ProgressBar value={r.progress} /></div> },
                  { key: 'a', header: "Average Score", align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 's', header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  { key: 'l', header: "Last Active", sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap">{relativeTime(r.lastActive)}</span> },
                ]}
              />
            </Card>
          </div>
        )}

        {tab === 'work' && (
          <div className="grid grid-2">
            <Card title="Assignments" actions={<ButtonLink to="/teacher/assignments?new=1" variant="ghost" size="sm">Add</ButtonLink>} padded={false}>
              {courseAssignments.length === 0 ? (
                <EmptyState compact title="No assignments" />
              ) : (
                <div className="list">
                  {courseAssignments.map((a) => {
                    const subs = submissionsFor(a.id);
                    return (
                      <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="list-row">
                        <span className="list-row__icon"><ClipboardList /></span>
                        <div className="grow">
                          <div className="list-row__title">{a.title}</div>
                          <div className="list-row__sub">Deadline: {formatDate(a.dueDate)}, {subs.length} submissions</div>
                        </div>
                        {subs.some((s) => s.status === 'submitted') && <span className="badge badge--warning">{subs.filter((s) => s.status === 'submitted').length} new</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
            <Card title="Quizzes" actions={<ButtonLink to="/teacher/quizzes/new/edit" variant="ghost" size="sm">Add</ButtonLink>} padded={false}>
              {courseQuizzes.length === 0 ? (
                <EmptyState compact title="No quizzes" text="Create a quiz to assess your students' understanding." />
              ) : (
                <div className="list">
                  {courseQuizzes.map((q) => (
                    <Link key={q.id} to={`/teacher/quizzes/${q.id}/edit`} className="list-row">
                      <span className="list-row__icon"><FileQuestion /></span>
                      <div className="grow">
                        <div className="list-row__title">{q.title}</div>
                        <div className="list-row__sub">{q.questions.length} questions, {q.timeLimitMin} min</div>
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
            <Card title="Visibility and Participation" footer={<Button onClick={() => toast.success("Settings saved", "Demo only.")}>Save</Button>}>
              <div className="settings-list">
                <Toggle label="Show in the Course Catalog" description="When disabled, only enrolled students can see the course" checked={status === 'published'} onChange={(v) => setStatus(v ? 'published' : 'draft')} />
                <Toggle label="Open Enrollment" description="New students can enroll on their own" checked={settings.enroll} onChange={(v) => setSettings({ ...settings, enroll: v })} />
                <Toggle label="Lesson Discussions" description="Students can ask questions below each lesson" checked={settings.comments} onChange={(v) => setSettings({ ...settings, comments: v })} />
                <Toggle label="Certificate of Completion" description="Automatically awarded on course completion" checked={settings.certificate} onChange={(v) => setSettings({ ...settings, certificate: v })} />
              </div>
            </Card>
            <Card title="Delete Course">
              <p className="small secondary" style={{ marginBottom: 14 }}>All modules, lessons, assignments, and student results will be deleted.</p>
              <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>Delete Course</Button>
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
          toast.success(next === 'published' ? "Course published" : "Course unpublished", "Demo: this change is local only.");
        }}
        tone="warning"
        title={status === 'published' ? "Unpublish this course?" : "Publish this course?"}
        text={status === 'published' ? "The course will be removed from the catalog. Students who are already enrolled will retain access." : "The course will appear in the public catalog and be open for enrollment."}
        confirmLabel={status === 'published' ? "Unpublish" : "Publish"}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.success("Course deleted", "Demo: nothing has actually been deleted.");
          navigate('/teacher/courses');
        }}
        title="Delete this course?"
        text={`${course.title} will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

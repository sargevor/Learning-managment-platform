import { BarChart3, Eye, FilePlus2, FileQuestion, MoreHorizontal, Pencil, Timer, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Quiz } from '../../types';
import { quizResultSummary, teacherCourses, teacherQuizzes } from '../../data/teacherView';
import { getCourse } from '../../data/courses';
import { quizMaxScore } from '../../data/quizzes';
import { ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState, PageHeader } from '../../components/ui/Misc';
import { Dropdown } from '../../components/ui/Overlay';
import { Select } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { formatDate } from '../../lib/format';

export function TeacherQuizzesPage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState('all');
  const rows = teacherQuizzes.filter((q) => course === 'all' || q.courseId === course);
  const published = teacherQuizzes.filter((q) => q.status === 'published');

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Quizzes" }]}
        title="Manage Quizzes"
        description="Create quizzes, manage questions, and analyze results."
        actions={<ButtonLink to="/teacher/quizzes/new/edit" icon={<FilePlus2 />}>New quiz</ButtonLink>}
      />
      <div className="grid grid-4 mb-20">
        <StatCard label="Quizzes" value={teacherQuizzes.length} icon={<FileQuestion />} meta={`${published.length} published`} />
        <StatCard label="Questions" value={teacherQuizzes.reduce((n, q) => n + q.questions.length, 0)} icon={<FileQuestion />} tone="navy" />
        <StatCard label="Attempts" value={published.reduce((n, q) => n + quizResultSummary(q).attempts, 0)} icon={<Users />} tone="success" meta="sample data" />
        <StatCard label="Average Result" value={Math.round(published.reduce((n, q) => n + quizResultSummary(q).avg, 0) / Math.max(1, published.length))} unit="%" icon={<BarChart3 />} tone="warning" meta="sample data" />
      </div>
      <div className="card">
        <div className="filters-bar" style={{ padding: 16 }}>
          <Select aria-label="Course" value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: "All Courses" }, ...teacherCourses.map((c) => ({ value: c.id, label: c.title }))]} />
        </div>
        <DataTable<Quiz>
          caption="Quizzes"
          rows={rows}
          rowKey={(q) => q.id}
          onRowClick={(q) => navigate(`/teacher/quizzes/${q.id}/edit`)}
          empty={<EmptyState icon={<FileQuestion size={24} />} title="This course has no quizzes" action={<ButtonLink to="/teacher/quizzes/new/edit" variant="secondary">Create Quiz</ButtonLink>} />}
          columns={[
            { key: 't', header: "Quiz", sortValue: (q) => q.title, render: (q) => <><div className="cell-title">{q.title}</div><div className="cell-sub">{getCourse(q.courseId)?.title}</div></> },
            { key: 'q', header: "Questions", align: 'right', sortValue: (q) => q.questions.length, render: (q) => `${q.questions.length} (${quizMaxScore(q)} points)` },
            { key: 'time', header: "Time", render: (q) => <span className="tag"><Timer aria-hidden="true" />{q.timeLimitMin} min</span> },
            { key: 'due', header: "Available Until", sortValue: (q) => q.dueDate, render: (q) => <span className="nowrap">{formatDate(q.dueDate)}</span> },
            { key: 's', header: "Status", render: (q) => <StatusBadge status={q.status} /> },
            { key: 'avg', header: "Average", align: 'right', sortValue: (q) => quizResultSummary(q).avg, render: (q) => (q.status === 'draft' ? <span className="muted">—</span> : `${quizResultSummary(q).avg}%`) },
            {
              key: 'a',
              header: '',
              render: (q) => (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Dropdown trigger={({ toggle, open }) => <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={`Actions: ${q.title}`}><MoreHorizontal /></button>}>
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit`} onClick={close}><Pencil />Edit Questions</Link>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=preview`} onClick={close}><Eye />Preview</Link>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=results`} onClick={close}><BarChart3 />Results</Link>
                      </>
                    )}
                  </Dropdown>
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}

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
import { tr } from '../../i18n';

export function TeacherQuizzesPage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState('all');
  const rows = teacherQuizzes.filter((q) => course === 'all' || q.courseId === course);
  const published = teacherQuizzes.filter((q) => q.status === 'published');

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Quizzes", "Թեստեր") }]}
        title={tr("Manage Quizzes", "Թեստերի կառավարում")}
        description={tr("Create quizzes, manage questions, and analyze results.", "Ստեղծեք թեստեր, կառավարեք հարցերը և վերլուծեք արդյունքները։")}
        actions={<ButtonLink to="/teacher/quizzes/new/edit" icon={<FilePlus2 />}>{tr("New quiz", "Նոր թեստ")}</ButtonLink>}
      />
      <div className="grid grid-4 mb-20">
        <StatCard label={tr("Quizzes", "Թեստեր")} value={teacherQuizzes.length} icon={<FileQuestion />} meta={tr(`${published.length} published`, `${published.length} հրապարակված`)} />
        <StatCard label={tr("Questions", "Հարցեր")} value={teacherQuizzes.reduce((n, q) => n + q.questions.length, 0)} icon={<FileQuestion />} tone="navy" />
        <StatCard label={tr("Attempts", "Փորձեր")} value={published.reduce((n, q) => n + quizResultSummary(q).attempts, 0)} icon={<Users />} tone="success" meta={tr("sample data", "ցուցադրական տվյալներ")} />
        <StatCard label={tr("Average Result", "Միջին արդյունք")} value={Math.round(published.reduce((n, q) => n + quizResultSummary(q).avg, 0) / Math.max(1, published.length))} unit="%" icon={<BarChart3 />} tone="warning" meta={tr("sample data", "ցուցադրական տվյալներ")} />
      </div>
      <div className="card">
        <div className="filters-bar" style={{ padding: 16 }}>
          <Select aria-label={tr("Course", "Դասընթաց")} value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: tr("All Courses", "Բոլոր դասընթացները") }, ...teacherCourses.map((c) => ({ value: c.id, label: c.title }))]} />
        </div>
        <DataTable<Quiz>
          caption={tr("Quizzes", "Թեստեր")}
          rows={rows}
          rowKey={(q) => q.id}
          onRowClick={(q) => navigate(`/teacher/quizzes/${q.id}/edit`)}
          empty={<EmptyState icon={<FileQuestion size={24} />} title={tr("This course has no quizzes", "Այս դասընթացում թեստեր չկան")} action={<ButtonLink to="/teacher/quizzes/new/edit" variant="secondary">{tr("Create Quiz", "Ստեղծել թեստ")}</ButtonLink>} />}
          columns={[
            { key: 't', header: tr("Quiz", "Թեստ"), sortValue: (q) => q.title, render: (q) => <><div className="cell-title">{q.title}</div><div className="cell-sub">{getCourse(q.courseId)?.title}</div></> },
            { key: 'q', header: tr("Questions", "Հարցեր"), align: 'right', sortValue: (q) => q.questions.length, render: (q) => tr(`${q.questions.length} (${quizMaxScore(q)} points)`, `${q.questions.length} (${quizMaxScore(q)} միավոր)`) },
            { key: 'time', header: tr("Time", "Ժամանակ"), render: (q) => <span className="tag"><Timer aria-hidden="true" />{q.timeLimitMin}{tr(" min", " ր")}</span> },
            { key: 'due', header: tr("Available Until", "Հասանելի է մինչև"), sortValue: (q) => q.dueDate, render: (q) => <span className="nowrap">{formatDate(q.dueDate)}</span> },
            { key: 's', header: tr("Status", "Կարգավիճակ"), render: (q) => <StatusBadge status={q.status} /> },
            { key: 'avg', header: tr("Average", "Միջին"), align: 'right', sortValue: (q) => quizResultSummary(q).avg, render: (q) => (q.status === 'draft' ? <span className="muted">—</span> : `${quizResultSummary(q).avg}%`) },
            {
              key: 'a',
              header: '',
              render: (q) => (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Dropdown trigger={({ toggle, open }) => <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={tr(`Actions: ${q.title}`, `Գործողություններ՝ ${q.title}`)}><MoreHorizontal /></button>}>
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit`} onClick={close}><Pencil />{tr("Edit Questions", "Խմբագրել հարցերը")}</Link>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=preview`} onClick={close}><Eye />{tr("Preview", "Նախադիտում")}</Link>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=results`} onClick={close}><BarChart3 />{tr("Results", "Արդյունքներ")}</Link>
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

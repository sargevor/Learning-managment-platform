import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, LayoutGrid, List } from 'lucide-react';
import type { AssignmentStatus } from '../../types';
import { getStudentAssignments } from '../../data/studentView';
import { getEnrolledCourses } from '../../data/enrollments';
import { AssignmentCard } from '../../components/course/CourseBits';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState, PageHeader, Tabs } from '../../components/ui/Misc';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Badge';
import { cx, daysUntil, formatDateTime, relativeDue } from '../../lib/format';

type Filter = 'all' | 'todo' | 'submitted' | 'graded' | 'overdue';

const MATCH: Record<Filter, AssignmentStatus[]> = {
  all: ['not-started', 'draft', 'submitted', 'graded', 'overdue'],
  todo: ['not-started', 'draft'],
  submitted: ['submitted'],
  graded: ['graded'],
  overdue: ['overdue'],
};

export function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const all = getStudentAssignments();
  const [filter, setFilter] = useState<Filter>('todo');
  const [course, setCourse] = useState('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const list = useMemo(
    () =>
      all.filter(
        (a) =>
          MATCH[filter].includes(a.status) &&
          (course === 'all' || a.course.id === course) &&
          (!q.trim() || a.assignment.title.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [all, filter, course, q],
  );

  const count = (f: Filter) => all.filter((a) => MATCH[f].includes(a.status)).length;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Վահանակ', to: '/student/dashboard' }, { label: 'Առաջադրանքներ' }]}
        title="Առաջադրանքներ"
        description="Բոլոր գործնական աշխատանքները՝ վերջնաժամկետներով, կարգավիճակով և գնահատականներով։"
      />
      <div className="stack" style={{ ['--gap' as string]: '18px' }}>
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'todo', label: 'Կատարման ենթակա', count: count('todo') },
            { key: 'submitted', label: 'Հանձնված', count: count('submitted') },
            { key: 'graded', label: 'Գնահատված', count: count('graded') },
            { key: 'overdue', label: 'Ժամկետանց', count: count('overdue') },
            { key: 'all', label: 'Բոլորը', count: all.length },
          ]}
        />
        <div className="filters-bar">
          <SearchBar value={q} onChange={setQ} placeholder="Որոնել ըստ անվանման" />
          <Select
            aria-label="Դասընթաց"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            options={[{ value: 'all', label: 'Բոլոր դասընթացները' }, ...getEnrolledCourses().map((e) => ({ value: e.course.id, label: e.course.title }))]}
          />
          <div className="segmented" role="group" aria-label="Ցուցադրման ձև">
            <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')} aria-label="Քարտեր"><LayoutGrid size={16} /></button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')} aria-label="Աղյուսակ"><List size={16} /></button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="card">
            <EmptyState icon={<ClipboardCheck size={24} />} title="Առաջադրանքներ չկան" text={filter === 'todo' ? 'Բոլոր ընթացիկ աշխատանքները հանձնված են։ Լավ աշխատանք։' : 'Այս զտիչներին համապատասխանող առաջադրանք չկա։'} />
          </div>
        ) : view === 'cards' ? (
          <div className="grid grid-2">
            {list.map((a) => (
              <AssignmentCard key={a.assignment.id} assignment={a.assignment} status={a.status} courseTitle={a.course.title} to={`/student/assignments/${a.assignment.id}`} score={a.submission?.status === 'graded' ? a.submission.score : undefined} />
            ))}
          </div>
        ) : (
          <div className="card">
            <DataTable
              caption="Առաջադրանքների ցուցակ"
              rows={list}
              rowKey={(r) => r.assignment.id}
              onRowClick={(r) => navigate(`/student/assignments/${r.assignment.id}`)}
              initialSort={{ key: 'due', dir: 'asc' }}
              columns={[
                { key: 'title', header: 'Առաջադրանք', sortValue: (r) => r.assignment.title, render: (r) => <><div className="cell-title">{r.assignment.title}</div><div className="cell-sub">{r.course.title}</div></> },
                {
                  key: 'due',
                  header: 'Վերջնաժամկետ',
                  sortValue: (r) => r.assignment.dueDate,
                  render: (r) => {
                    const d = daysUntil(r.assignment.dueDate);
                    return <><div className="nowrap">{formatDateTime(r.assignment.dueDate)}</div><div className={cx('cell-sub', d >= 0 && d <= 3 && r.status !== 'submitted' && r.status !== 'graded' && 'tag--urgent')}>{relativeDue(r.assignment.dueDate)}</div></>;
                  },
                },
                { key: 'status', header: 'Կարգավիճակ', sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
                { key: 'score', header: 'Միավոր', align: 'right', sortValue: (r) => r.submission?.score ?? -1, render: (r) => (r.submission?.score !== undefined ? <strong>{r.submission.score}/{r.assignment.maxScore}</strong> : <span className="muted">—/{r.assignment.maxScore}</span>) },
              ]}
            />
          </div>
        )}
      </div>
    </>
  );
}

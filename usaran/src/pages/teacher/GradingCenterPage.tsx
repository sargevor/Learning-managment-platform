import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, Inbox } from 'lucide-react';
import { teacherAssignments } from '../../data/assignments';
import { teacherCourses, teacherSubmissionRows, type SubmissionRow } from '../../data/teacherView';
import { fullName } from '../../data/users';
import { GradingPanel, type GradeOverride } from '../../components/course/GradingPanel';
import { Card, EmptyState, PageHeader, Tabs, Avatar } from '../../components/ui/Misc';
import { Select } from '../../components/ui/Field';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { cx, relativeTime } from '../../lib/format';

export function GradingCenterPage() {
  const [params, setParams] = useSearchParams();
  const all = useMemo(() => teacherSubmissionRows(), []);
  const [overrides, setOverrides] = useState<Record<string, GradeOverride>>({});
  const [course, setCourse] = useState('all');
  const [assignment, setAssignment] = useState('all');
  const [q, setQ] = useState('');
  const preselected = all.find((r) => r.submission.id === params.get('submission'));
  const [tab, setTab] = useState<'pending' | 'graded'>(preselected?.submission.status === 'graded' ? 'graded' : 'pending');
  const [selectedId, setSelectedId] = useState<string | undefined>(preselected?.submission.id);

  const statusOf = (r: SubmissionRow) => overrides[r.submission.id]?.status ?? r.submission.status;

  const filtered = all.filter(
    (r) =>
      (course === 'all' || r.course.id === course) &&
      (assignment === 'all' || r.assignment.id === assignment) &&
      (!q.trim() || fullName(r.student).toLowerCase().includes(q.trim().toLowerCase())),
  );
  const queue = filtered.filter((r) => (tab === 'pending' ? statusOf(r) !== 'graded' : statusOf(r) === 'graded'));
  const selected = queue.find((r) => r.submission.id === selectedId) ?? queue[0];
  const pendingCount = filtered.filter((r) => statusOf(r) !== 'graded').length;
  const assignmentOptions = teacherAssignments.filter((a) => course === 'all' || a.courseId === course);

  const select = (id: string) => {
    setSelectedId(id);
    setParams({ submission: id }, { replace: true });
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Grading center" }]}
        title="Grading center"
        description="Review submissions from all your courses in one queue. Select a submission to grade it and provide feedback."
      />
      <div className="filters-bar mb-20">
        <SearchBar value={q} onChange={setQ} placeholder="Search by student name" />
        <Select
          aria-label="Course"
          value={course}
          onChange={(e) => {
            setCourse(e.target.value);
            setAssignment('all');
          }}
          options={[{ value: 'all', label: "All Courses" }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]}
        />
        <Select aria-label="Assignment" value={assignment} onChange={(e) => setAssignment(e.target.value)} options={[{ value: 'all', label: "All Assignments" }, ...assignmentOptions.map((a) => ({ value: a.id, label: a.title }))]} />
      </div>

      <div className="grading-layout">
        <Card padded={false}>
          <div style={{ padding: '0 12px' }}>
            <Tabs
              value={tab}
              onChange={(t) => {
                setTab(t);
                setSelectedId(undefined);
              }}
              items={[
                { key: 'pending', label: "Pending", count: pendingCount },
                { key: 'graded', label: "Graded", count: filtered.length - pendingCount },
              ]}
            />
          </div>
          <div className="grading-queue" role="listbox" aria-label="Submission Queue">
            {queue.length === 0 ? (
              <EmptyState compact icon={<CheckSquare size={22} />} title={tab === 'pending' ? "The queue is empty" : "No graded submissions"} text={tab === 'pending' ? "All submissions matching these filters have been graded." : "Try changing your filters."} />
            ) : (
              queue.map((r) => {
                const active = selected?.submission.id === r.submission.id;
                const o = overrides[r.submission.id];
                return (
                  <button key={r.submission.id} type="button" role="option" aria-selected={active} className={cx('queue-item', active && 'is-active')} onClick={() => select(r.submission.id)}>
                    <Avatar name={fullName(r.student)} size={34} />
                    <span className="grow" style={{ minWidth: 0 }}>
                      <span className="row row--between" style={{ ['--gap' as string]: '8px' }}>
                        <span className="strong small" style={{ color: 'var(--navy-900)' }}>{fullName(r.student)}</span>
                        <span className="xs muted nowrap">{relativeTime(r.submission.submittedAt!)}</span>
                      </span>
                      <span className="xs secondary" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.assignment.title}</span>
                      <span className="row" style={{ ['--gap' as string]: '6px', marginTop: 4 }}>
                        <span className="xs muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.course.title}</span>
                        {r.submission.late && <Badge tone="danger">Late</Badge>}
                        {statusOf(r) === 'graded' && <Badge tone="success">{o?.score ?? r.submission.score}/{r.assignment.maxScore}</Badge>}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card padded={false}>
          {selected ? (
            <GradingPanel row={selected} override={overrides[selected.submission.id]} onSave={(id, g) => setOverrides((o) => ({ ...o, [id]: g }))} />
          ) : (
            <EmptyState icon={<Inbox size={24} />} title="Select a Submission" text="Choose a submission from the queue on the left to review and grade it." />
          )}
        </Card>
      </div>
    </>
  );
}

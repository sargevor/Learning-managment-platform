import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Hourglass, Inbox, UserX } from 'lucide-react';
import { getAssignment } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { studentsInCourse, teacherSubmissionRows, TEACHER_COURSE_IDS, type SubmissionRow } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { GradingPanel, type GradeOverride } from '../../components/course/GradingPanel';
import { ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Card, EmptyState, PageHeader, Person, Tabs } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Overlay';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { average, daysUntil, formatDateTime, relativeDue } from '../../lib/format';

export function AssignmentSubmissionsPage() {
  const { id } = useParams();
  const assignment = getAssignment(id);
  const [overrides, setOverrides] = useState<Record<string, GradeOverride>>({});
  const [tab, setTab] = useState<'all' | 'submitted' | 'graded' | 'missing'>('all');
  const [open, setOpen] = useState<SubmissionRow | null>(null);

  const rows = useMemo(() => (assignment ? teacherSubmissionRows().filter((r) => r.assignment.id === assignment.id) : []), [assignment]);

  if (!assignment || !TEACHER_COURSE_IDS.includes(assignment.courseId)) {
    return <div className="card"><EmptyState title="Assignment not found" action={<ButtonLink to="/teacher/assignments">All Assignments</ButtonLink>} /></div>;
  }

  const course = getCourse(assignment.courseId)!;
  const statusOf = (r: SubmissionRow) => overrides[r.submission.id]?.status ?? r.submission.status;
  const scoreOf = (r: SubmissionRow) => overrides[r.submission.id]?.score ?? r.submission.score;
  const submittedIds = new Set(rows.map((r) => r.student.id));
  const missing = studentsInCourse(course.id).filter((s) => !submittedIds.has(s.userId) && s.userId !== 's1');
  const graded = rows.filter((r) => statusOf(r) === 'graded');
  const shown = rows.filter((r) => tab === 'all' || (tab === 'submitted' ? statusOf(r) === 'submitted' : tab === 'graded' ? statusOf(r) === 'graded' : false));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Assignments", to: '/teacher/assignments' }, { label: assignment.title }]}
        title={assignment.title}
        description={`${course.title}. Deadline: ${formatDateTime(assignment.dueDate)} (${relativeDue(assignment.dueDate)}), maximum: ${assignment.maxScore} points.`}
        actions={<ButtonLink to="/teacher/grading" variant="secondary">Grading center</ButtonLink>}
      />

      <div className="grid grid-4 mb-20">
        <StatCard label="Submissions" value={rows.length} icon={<Inbox />} />
        <StatCard label="Awaiting grading" value={rows.length - graded.length} icon={<Hourglass />} tone="warning" />
        <StatCard label="Graded" value={graded.length} icon={<CheckCircle2 />} tone="success" meta={graded.length ? `Average: ${average(graded.map((r) => Math.round(((scoreOf(r) ?? 0) / assignment.maxScore) * 100)))}%` : undefined} />
        <StatCard label="Not Submitted" value={missing.length} icon={<UserX />} tone="danger" meta="of students in the group" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '0 16px' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'all', label: "All Submissions", count: rows.length },
              { key: 'submitted', label: "Ungraded", count: rows.length - graded.length },
              { key: 'graded', label: "Graded", count: graded.length },
              { key: 'missing', label: "Missing", count: missing.length },
            ]}
          />
        </div>
        {tab === 'missing' ? (
          missing.length === 0 ? (
            <EmptyState compact title="All students have submitted" />
          ) : (
            <div className="list">
              {missing.map((s) => (
                <div key={s.userId} className="list-row">
                  <Person name={fullName(getUser(s.userId))} sub={getUser(s.userId)?.email} size={34} />
                  <span className="grow" />
                  <Badge tone={daysUntil(assignment.dueDate) < 0 ? 'danger' : 'neutral'}>{daysUntil(assignment.dueDate) < 0 ? "Overdue" : "Not submitted yet"}</Badge>
                </div>
              ))}
            </div>
          )
        ) : (
          <DataTable<SubmissionRow>
            caption="Submitted Assignments"
            rows={shown}
            rowKey={(r) => r.submission.id}
            onRowClick={setOpen}
            initialSort={{ key: 'date', dir: 'desc' }}
            empty={<EmptyState compact title="No submissions" text="There are no submissions in this section yet." />}
            columns={[
              { key: 'student', header: "Student", sortValue: (r) => fullName(r.student), render: (r) => <Person name={fullName(r.student)} sub={r.student.email} size={32} /> },
              { key: 'date', header: "Submitted", sortValue: (r) => r.submission.submittedAt ?? '', render: (r) => <span className="nowrap">{r.submission.submittedAt ? formatDateTime(r.submission.submittedAt) : '—'}{r.submission.late && <Badge tone="danger" className="ml-6">Late</Badge>}</span> },
              { key: 'files', header: "Files", align: 'right', render: (r) => r.submission.attachments.length },
              { key: 'status', header: "Status", sortValue: (r) => statusOf(r), render: (r) => <StatusBadge status={statusOf(r)} /> },
              { key: 'score', header: "Score", align: 'right', sortValue: (r) => scoreOf(r) ?? -1, render: (r) => (statusOf(r) === 'graded' ? <strong>{scoreOf(r)}/{assignment.maxScore}</strong> : <span className="muted">—</span>) },
            ]}
          />
        )}
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title="Student Submission" description={open ? `${fullName(open.student)}, ${assignment.title}` : ''}>
        {open && (
          <div style={{ margin: '0 -24px -20px', borderTop: '1px solid var(--border)' }}>
            <GradingPanel row={open} override={overrides[open.submission.id]} onSave={(sid, g) => setOverrides((o) => ({ ...o, [sid]: g }))} />
          </div>
        )}
      </Modal>
    </>
  );
}

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
    return <div className="card"><EmptyState title="Առաջադրանքը չի գտնվել" action={<ButtonLink to="/teacher/assignments">Բոլոր առաջադրանքները</ButtonLink>} /></div>;
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
        breadcrumbs={[{ label: 'Առաջադրանքներ', to: '/teacher/assignments' }, { label: assignment.title }]}
        title={assignment.title}
        description={`${course.title}. Վերջնաժամկետ՝ ${formatDateTime(assignment.dueDate)} (${relativeDue(assignment.dueDate)}), առավելագույնը՝ ${assignment.maxScore} միավոր։`}
        actions={<ButtonLink to="/teacher/grading" variant="secondary">Գնահատման կենտրոն</ButtonLink>}
      />

      <div className="grid grid-4 mb-20">
        <StatCard label="Հանձնված" value={rows.length} icon={<Inbox />} />
        <StatCard label="Սպասում է գնահատման" value={rows.length - graded.length} icon={<Hourglass />} tone="warning" />
        <StatCard label="Գնահատված" value={graded.length} icon={<CheckCircle2 />} tone="success" meta={graded.length ? `Միջինը՝ ${average(graded.map((r) => Math.round(((scoreOf(r) ?? 0) / assignment.maxScore) * 100)))}%` : undefined} />
        <StatCard label="Չի հանձնել" value={missing.length} icon={<UserX />} tone="danger" meta="խմբի ուսանողներից" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '0 16px' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'all', label: 'Բոլոր հանձնումները', count: rows.length },
              { key: 'submitted', label: 'Չգնահատված', count: rows.length - graded.length },
              { key: 'graded', label: 'Գնահատված', count: graded.length },
              { key: 'missing', label: 'Չհանձնած', count: missing.length },
            ]}
          />
        </div>
        {tab === 'missing' ? (
          missing.length === 0 ? (
            <EmptyState compact title="Բոլոր ուսանողները հանձնել են" />
          ) : (
            <div className="list">
              {missing.map((s) => (
                <div key={s.userId} className="list-row">
                  <Person name={fullName(getUser(s.userId))} sub={getUser(s.userId)?.email} size={34} />
                  <span className="grow" />
                  <Badge tone={daysUntil(assignment.dueDate) < 0 ? 'danger' : 'neutral'}>{daysUntil(assignment.dueDate) < 0 ? 'Ժամկետանց' : 'Դեռ չի հանձնել'}</Badge>
                </div>
              ))}
            </div>
          )
        ) : (
          <DataTable<SubmissionRow>
            caption="Հանձնումներ"
            rows={shown}
            rowKey={(r) => r.submission.id}
            onRowClick={setOpen}
            initialSort={{ key: 'date', dir: 'desc' }}
            empty={<EmptyState compact title="Հանձնումներ չկան" text="Այս բաժնում դեռ աշխատանքներ չկան։" />}
            columns={[
              { key: 'student', header: 'Ուսանող', sortValue: (r) => fullName(r.student), render: (r) => <Person name={fullName(r.student)} sub={r.student.email} size={32} /> },
              { key: 'date', header: 'Հանձնված', sortValue: (r) => r.submission.submittedAt ?? '', render: (r) => <span className="nowrap">{r.submission.submittedAt ? formatDateTime(r.submission.submittedAt) : '—'}{r.submission.late && <Badge tone="danger" className="ml-6">Ուշ</Badge>}</span> },
              { key: 'files', header: 'Ֆայլեր', align: 'right', render: (r) => r.submission.attachments.length },
              { key: 'status', header: 'Կարգավիճակ', sortValue: (r) => statusOf(r), render: (r) => <StatusBadge status={statusOf(r)} /> },
              { key: 'score', header: 'Միավոր', align: 'right', sortValue: (r) => scoreOf(r) ?? -1, render: (r) => (statusOf(r) === 'graded' ? <strong>{scoreOf(r)}/{assignment.maxScore}</strong> : <span className="muted">—</span>) },
            ]}
          />
        )}
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title="Ուսանողի աշխատանքը" description={open ? `${fullName(open.student)}, ${assignment.title}` : ''}>
        {open && (
          <div style={{ margin: '0 -24px -20px', borderTop: '1px solid var(--border)' }}>
            <GradingPanel row={open} override={overrides[open.submission.id]} onSave={(sid, g) => setOverrides((o) => ({ ...o, [sid]: g }))} />
          </div>
        )}
      </Modal>
    </>
  );
}

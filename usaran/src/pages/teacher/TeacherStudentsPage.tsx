import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, UserCheck, Users, UserX } from 'lucide-react';
import type { StudentRecord } from '../../types';
import { studentRecords } from '../../data/analytics';
import { teacherCourses, shortTitle } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Card, EmptyState, PageHeader, Pagination, Person } from '../../components/ui/Misc';
import { Select } from '../../components/ui/Field';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { average, relativeTime } from '../../lib/format';

const PAGE = 8;

export function TeacherStudentsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return studentRecords.filter((r) => {
      const u = getUser(r.userId);
      return (course === 'all' || r.courseIds.includes(course)) && (status === 'all' || r.status === status) && (!term || fullName(u).toLowerCase().includes(term) || (u?.email ?? '').includes(term));
    });
  }, [q, course, status]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pageCount);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Students" }]}
        title="Students"
        description="View students enrolled in your courses, their participation, and their results."
        actions={<Button variant="secondary" icon={<Download />} onClick={() => toast.info("Export", "No file is created in this demo.")}>Export List</Button>}
      />
      <div className="grid grid-4 mb-20">
        <StatCard label="Total Students" value={studentRecords.length} icon={<Users />} meta="showing a selection of students from the group" />
        <StatCard label="Active" value={studentRecords.filter((r) => r.status === 'active').length} icon={<UserCheck />} tone="success" />
        <StatCard label="At risk" value={studentRecords.filter((r) => r.status === 'at-risk').length} icon={<AlertTriangle />} tone="warning" meta="low scores or progress" />
        <StatCard label="Inactive" value={studentRecords.filter((r) => r.status === 'inactive').length} icon={<UserX />} tone="danger" meta="more than 12 days" />
      </div>
      <Card padded={false}>
        <div className="filters-bar" style={{ padding: 16 }}>
          <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by name or email" />
          <Select aria-label="Course" value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }} options={[{ value: 'all', label: "All Courses" }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]} />
          <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={[{ value: 'all', label: "All Statuses" }, { value: 'active', label: "Active" }, { value: 'at-risk', label: "At risk" }, { value: 'inactive', label: "Inactive" }]} />
        </div>
        <DataTable<StudentRecord>
          caption="Student List"
          rows={rows.slice((current - 1) * PAGE, current * PAGE)}
          rowKey={(r) => r.userId}
          onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
          empty={<EmptyState icon={<Users size={24} />} title="No students found" text="Try changing your search criteria." />}
          columns={[
            { key: 'n', header: "Student", sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} sub={getUser(r.userId)?.email} size={34} /> },
            { key: 'c', header: "Courses", render: (r) => <div className="row row--wrap" style={{ ['--gap' as string]: '4px' }}>{r.courseIds.map((c) => <Badge key={c} outline>{shortTitle(c)}</Badge>)}</div> },
            { key: 'p', header: "Progress", sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 120 }}><ProgressBar value={r.progress} /></div> },
            { key: 'a', header: "Assignments", align: 'right', sortValue: (r) => r.assignmentsDone / r.assignmentsTotal, render: (r) => `${r.assignmentsDone}/${r.assignmentsTotal}` },
            { key: 'qz', header: "Quizzes", align: 'right', sortValue: (r) => r.quizAvg, render: (r) => `${r.quizAvg}%` },
            { key: 'avg', header: "Average", align: 'right', sortValue: (r) => r.avgScore, render: (r) => <strong>{r.avgScore}%</strong> },
            { key: 's', header: "Status", sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
            { key: 'l', header: "Last Sign-In", sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap small">{relativeTime(r.lastActive)}</span> },
          ]}
        />
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          {pageCount > 1 ? <Pagination page={current} pageCount={pageCount} onChange={setPage} total={rows.length} pageSize={PAGE} /> : <span className="small muted">Total: {rows.length} students, average result: {average(rows.map((r) => r.avgScore))}%</span>}
        </div>
      </Card>
    </>
  );
}

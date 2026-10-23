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
import { tr } from '../../i18n';

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
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Students", "Ուսանողներ") }]}
        title={tr("Students", "Ուսանողներ")}
        description={tr("View students enrolled in your courses, their participation, and their results.", "Ձեր դասընթացներին գրանցված ուսանողները, նրանց մասնակցությունը և արդյունքները։")}
        actions={<Button variant="secondary" icon={<Download />} onClick={() => toast.info(tr("Export", "Արտահանում"), tr("No file is created in this demo.", "Ցուցադրական տարբերակում ֆայլ չի ստեղծվում։"))}>{tr("Export List", "Արտահանել ցուցակը")}</Button>}
      />
      <div className="grid grid-4 mb-20">
        <StatCard label={tr("Total Students", "Ուսանողների ընդհանուր թիվ")} value={studentRecords.length} icon={<Users />} meta={tr("showing a selection of students from the group", "ցուցադրված է ուսանողների ընտրանին")} />
        <StatCard label={tr("Active", "Ակտիվ")} value={studentRecords.filter((r) => r.status === 'active').length} icon={<UserCheck />} tone="success" />
        <StatCard label={tr("At risk", "Ռիսկի գոտում")} value={studentRecords.filter((r) => r.status === 'at-risk').length} icon={<AlertTriangle />} tone="warning" meta={tr("low scores or progress", "ցածր միավոր կամ առաջընթաց")} />
        <StatCard label={tr("Inactive", "Ոչ ակտիվ")} value={studentRecords.filter((r) => r.status === 'inactive').length} icon={<UserX />} tone="danger" meta={tr("more than 12 days", "ավելի քան 12 օր")} />
      </div>
      <Card padded={false}>
        <div className="filters-bar" style={{ padding: 16 }}>
          <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={tr("Search by name or email", "Որոնել անունով կամ էլ. հասցեով")} />
          <Select aria-label={tr("Course", "Դասընթաց")} value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }} options={[{ value: 'all', label: tr("All Courses", "Բոլոր դասընթացները") }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]} />
          <Select aria-label={tr("Status", "Կարգավիճակ")} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={[{ value: 'all', label: tr("All Statuses", "Բոլոր կարգավիճակները") }, { value: 'active', label: tr("Active", "Ակտիվ") }, { value: 'at-risk', label: tr("At risk", "Ռիսկի գոտում") }, { value: 'inactive', label: tr("Inactive", "Ոչ ակտիվ") }]} />
        </div>
        <DataTable<StudentRecord>
          caption={tr("Student List", "Ուսանողների ցուցակ")}
          rows={rows.slice((current - 1) * PAGE, current * PAGE)}
          rowKey={(r) => r.userId}
          onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
          empty={<EmptyState icon={<Users size={24} />} title={tr("No students found", "Ուսանողներ չգտնվեցին")} text={tr("Try changing your search criteria.", "Փոխեք որոնման պայմանները։")} />}
          columns={[
            { key: 'n', header: tr("Student", "Ուսանող"), sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} sub={getUser(r.userId)?.email} size={34} /> },
            { key: 'c', header: tr("Courses", "Դասընթացներ"), render: (r) => <div className="row row--wrap" style={{ ['--gap' as string]: '4px' }}>{r.courseIds.map((c) => <Badge key={c} outline>{shortTitle(c)}</Badge>)}</div> },
            { key: 'p', header: tr("Progress", "Առաջընթաց"), sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 120 }}><ProgressBar value={r.progress} /></div> },
            { key: 'a', header: tr("Assignments", "Առաջադրանքներ"), align: 'right', sortValue: (r) => r.assignmentsDone / r.assignmentsTotal, render: (r) => `${r.assignmentsDone}/${r.assignmentsTotal}` },
            { key: 'qz', header: tr("Quizzes", "Թեստեր"), align: 'right', sortValue: (r) => r.quizAvg, render: (r) => `${r.quizAvg}%` },
            { key: 'avg', header: tr("Average", "Միջին"), align: 'right', sortValue: (r) => r.avgScore, render: (r) => <strong>{r.avgScore}%</strong> },
            { key: 's', header: tr("Status", "Կարգավիճակ"), sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
            { key: 'l', header: tr("Last Sign-In", "Վերջին մուտք"), sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap small">{relativeTime(r.lastActive)}</span> },
          ]}
        />
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          {pageCount > 1 ? <Pagination page={current} pageCount={pageCount} onChange={setPage} total={rows.length} pageSize={PAGE} /> : <span className="small muted">{tr("Total: ", "Ընդամենը ")}{rows.length}{tr(" students, average result: ", " ուսանող, միջին արդյունքը՝ ")}{average(rows.map((r) => r.avgScore))}%</span>}
        </div>
      </Card>
    </>
  );
}

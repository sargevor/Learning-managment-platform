import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, BookOpenCheck, CalendarRange, ChevronRight, ClipboardCheck, Download, FileBarChart, FileQuestion, FileSpreadsheet, FileText, Printer, Users, Activity } from 'lucide-react';
import type { StudentRecord } from '../../types';
import { coursePerformance, enrollmentTrend, studentRecords, teacherWeeklyActivity, trendLabels } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { shortTitle, teacherCourses } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { BarChart, CHART_COLORS, ChartCard, HBarChart, LineChart } from '../../components/charts/Charts';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Input, Select } from '../../components/ui/Field';
import { Card, DemoFlag, EmptyState, Notice, PageHeader, Person, Tabs } from '../../components/ui/Misc';
import { Dropdown } from '../../components/ui/Overlay';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { average, formatDate, formatNumber, relativeTime } from '../../lib/format';

type Tab = 'overview' | 'courses' | 'students' | 'saved';
type Range = '30' | '90' | '365' | 'custom';

const RANGE_MONTHS: Record<Range, number> = { '30': 2, '90': 3, '365': 12, custom: 6 };
const RANGE_LABEL: Record<Range, string> = { '30': "Last 30 Days", '90': "Last 3 Months", '365': "Last 12 Months", custom: "Custom Date Range" };

interface SavedReport {
  id: string;
  title: string;
  description: string;
  icon: typeof FileBarChart;
  created: string;
  kind: 'monthly' | 'risk' | 'assignments' | 'quizzes';
}

const SAVED: SavedReport[] = [
  { id: 'r1', kind: 'monthly', title: "Monthly Summary, September 2026", description: "Enrollments, completion rates, and average results across all courses", icon: FileBarChart, created: '2026-10-01' },
  { id: 'r2', kind: 'risk', title: "Students Needing Support", description: "Students making slow progress or inactive for an extended period", icon: Users, created: '2026-10-14' },
  { id: 'r3', kind: 'assignments', title: "Assignment Performance", description: "Submission counts, late work, and average scores by assignment", icon: ClipboardCheck, created: '2026-10-10' },
  { id: 'r4', kind: 'quizzes', title: "Quiz Results", description: "Average scores and pass rates", icon: FileQuestion, created: '2026-10-08' },
];

export function ReportsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [range, setRange] = useState<Range>('90');
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-10-15');
  const [course, setCourse] = useState('all');
  const [student, setStudent] = useState('all');
  const [report, setReport] = useState<SavedReport | null>(null);

  const perf = coursePerformance.filter((p) => course === 'all' || p.courseId === course);
  const months = RANGE_MONTHS[range];
  const labels = trendLabels.slice(-months);
  const scale = months / 12;
  const records: StudentRecord[] = useMemo(
    () => studentRecords.filter((r) => (course === 'all' || r.courseIds.includes(course)) && (student === 'all' || r.userId === student)),
    [course, student],
  );

  const newEnrollments = Math.round(perf.reduce((n, p) => n + enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0), 0));
  const exportAs = (fmt: string) => toast.info(`Export as ${fmt}`, "Demo action: no file is created and no request is sent to a server.");

  const filters = (
    <div className="card card--pad mb-20 no-print">
      <div className="filters-bar" style={{ alignItems: 'flex-end' }}>
        <Select label="Date Range" value={range} onChange={(e) => setRange(e.target.value as Range)} options={(Object.keys(RANGE_LABEL) as Range[]).map((r) => ({ value: r, label: RANGE_LABEL[r] }))} />
        {range === 'custom' && (
          <>
            <Input label="Start" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <Input label="End" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
        <Select label="Course" value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: "All Courses" }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]} />
        <Select label="Student" value={student} onChange={(e) => setStudent(e.target.value)} options={[{ value: 'all', label: "All Students" }, ...studentRecords.map((r) => ({ value: r.userId, label: fullName(getUser(r.userId)) }))]} />
        {(course !== 'all' || student !== 'all' || range !== '90') && (
          <Button variant="ghost" onClick={() => { setCourse('all'); setStudent('all'); setRange('90'); }}>Clear</Button>
        )}
      </div>
    </div>
  );

  const actions = (
    <>
      <Button variant="secondary" icon={<Printer />} onClick={() => window.print()}>Print</Button>
      <Dropdown
        trigger={({ toggle, open }) => (
          <Button icon={<Download />} onClick={toggle} aria-expanded={open}>Export</Button>
        )}
      >
        {(close) => (
          <>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('PDF'); close(); }}><FileText />PDF Document</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('Excel'); close(); }}><FileSpreadsheet />Excel Spreadsheet</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('CSV'); close(); }}><FileText />CSV File</button>
          </>
        )}
      </Dropdown>
    </>
  );

  if (report) {
    return <ReportDetail report={report} onBack={() => setReport(null)} actions={actions} />;
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Reports" }]}
        title="Analytics and Reports"
        description="Course, student, and performance statistics for the selected date range."
        actions={actions}
      />
      <Notice tone="warning" className="mb-20">All numbers and charts on this page are based on sample data and do not represent real analytics.</Notice>
      <div className="report-print-only small muted mb-20">LearnSpace report: {RANGE_LABEL[range]}, generated on {formatDate('2026-10-15')}</div>
      {filters}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: "Summary" },
          { key: 'courses', label: "Courses", count: perf.length },
          { key: 'students', label: "Students", count: records.length },
          { key: 'saved', label: "Saved Reports", count: SAVED.length },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label="New Enrollments" value={formatNumber(newEnrollments)} icon={<Users />} meta={RANGE_LABEL[range]} />
              <StatCard label="Completion Rate" value={average(perf.map((p) => p.completionRate))} unit="%" icon={<BookOpenCheck />} tone="success" meta="average across courses" />
              <StatCard label="Assignment Average" value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<ClipboardCheck />} tone="navy" />
              <StatCard label="Quiz Average" value={average(perf.map((p) => p.avgQuiz))} unit="%" icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-2">
              <ChartCard title="Enrollment Trends" subtitle="New students by month" legend={perf.map((p, i) => ({ label: shortTitle(p.courseId), color: CHART_COLORS[i % CHART_COLORS.length] }))}>
                <LineChart labels={labels} series={perf.map((p, i) => ({ name: shortTitle(p.courseId), values: enrollmentTrend[p.courseId].slice(-months), color: CHART_COLORS[i % CHART_COLORS.length] }))} area={perf.length === 1} ariaLabel="Enrollments by month" />
              </ChartCard>
              <ChartCard title="Average Results" subtitle="Assignments and quizzes, %" legend={[{ label: "Assignments", color: CHART_COLORS[0] }, { label: "Quizzes", color: CHART_COLORS[1] }]}>
                <BarChart labels={perf.map((p) => shortTitle(p.courseId))} series={[{ name: "Assignments", values: perf.map((p) => p.avgAssignment) }, { name: "Quizzes", values: perf.map((p) => p.avgQuiz) }]} max={100} suffix="%" ariaLabel="Average results by course" />
              </ChartCard>
            </div>
            <div className="grid grid-main-aside">
              <Card title="Completion rate by course" actions={<DemoFlag />}>
                <HBarChart items={perf.map((p) => ({ label: getCourse(p.courseId)?.title ?? p.courseId, value: p.completionRate, sub: `${formatNumber(p.enrolled)} students, ${formatNumber(Math.round(p.activeLast7 * (scale > 0.5 ? 1 : 0.8)))} active in the last 7 days` }))} />
              </Card>
              <ChartCard title="Student Activity" subtitle="Active students by day of the week">
                <BarChart labels={teacherWeeklyActivity.map((p) => p.label)} series={[{ name: "Active", values: teacherWeeklyActivity.map((p) => Math.round(p.value * (perf.length / coursePerformance.length))) }]} height={200} ariaLabel="Active students by day" />
              </ChartCard>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <Card title="Course Comparison" subtitle={RANGE_LABEL[range]} actions={<DemoFlag />} padded={false}>
            <DataTable
              caption="Course Comparison"
              rows={perf}
              rowKey={(p) => p.courseId}
              initialSort={{ key: 'e', dir: 'desc' }}
              columns={[
                { key: 'c', header: "Course", sortValue: (p) => getCourse(p.courseId)?.title ?? '', render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                { key: 'e', header: "Enrolled", align: 'right', sortValue: (p) => p.enrolled, render: (p) => formatNumber(p.enrolled) },
                { key: 'n', header: "New", align: 'right', sortValue: (p) => enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0), render: (p) => `+${enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0)}` },
                { key: 'cr', header: "Completion Rate", sortValue: (p) => p.completionRate, render: (p) => <div style={{ minWidth: 130 }}><ProgressBar value={p.completionRate} /></div> },
                { key: 'aa', header: "Assignments", align: 'right', sortValue: (p) => p.avgAssignment, render: (p) => `${p.avgAssignment}%` },
                { key: 'aq', header: "Quizzes", align: 'right', sortValue: (p) => p.avgQuiz, render: (p) => `${p.avgQuiz}%` },
                { key: 'a7', header: "Active (7 Days)", align: 'right', sortValue: (p) => p.activeLast7, render: (p) => formatNumber(p.activeLast7) },
              ]}
            />
          </Card>
        )}

        {tab === 'students' && (
          <Card title="Individual Progress" subtitle="A selection of students ranked by progress" actions={<DemoFlag />} padded={false}>
            <DataTable<StudentRecord>
              caption="Student progress"
              rows={records}
              rowKey={(r) => r.userId}
              initialSort={{ key: 'p', dir: 'desc' }}
              empty={<EmptyState compact title="No students match the selected filters" />}
              columns={[
                { key: 'n', header: "Student", sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} size={30} /> },
                { key: 'p', header: "Progress", sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 130 }}><ProgressBar value={r.progress} /></div> },
                { key: 'a', header: "Assignments", align: 'right', sortValue: (r) => r.assignmentsDone / r.assignmentsTotal, render: (r) => `${r.assignmentsDone}/${r.assignmentsTotal}` },
                { key: 'q', header: "Quizzes", align: 'right', sortValue: (r) => r.quizAvg, render: (r) => `${r.quizAvg}%` },
                { key: 'g', header: "Average", align: 'right', sortValue: (r) => r.avgScore, render: (r) => <strong>{r.avgScore}%</strong> },
                { key: 'w', header: "Min / Week", align: 'right', sortValue: (r) => r.weeklyMinutes.reduce((a, b) => a + b, 0), render: (r) => <span className="row" style={{ ['--gap' as string]: '6px', justifyContent: 'flex-end' }}><Activity size={13} className="muted" />{r.weeklyMinutes.reduce((a, b) => a + b, 0)}</span> },
                { key: 's', header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                { key: 'l', header: "Last Sign-In", sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap small">{relativeTime(r.lastActive)}</span> },
              ]}
            />
          </Card>
        )}

        {tab === 'saved' && (
          <div className="grid grid-2">
            {SAVED.map((r) => (
              <button key={r.id} type="button" className="card card--pad report-tile" onClick={() => setReport(r)}>
                <span className="list-row__icon"><r.icon /></span>
                <span className="grow" style={{ textAlign: 'left' }}>
                  <span className="strong" style={{ display: 'block', color: 'var(--navy-900)' }}>{r.title}</span>
                  <span className="small secondary" style={{ display: 'block', margin: '4px 0 8px' }}>{r.description}</span>
                  <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><CalendarRange size={13} />Generated on {formatDate(r.created)}</span>
                </span>
                <ChevronRight size={18} className="muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ReportDetail({ report, onBack, actions }: { report: SavedReport; onBack: () => void; actions: ReactNode }) {
  const atRisk = studentRecords.filter((r) => r.status !== 'active');
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Reports" }, { label: report.title }]}
        title={report.title}
        description={report.description}
        actions={
          <>
            <Button variant="ghost" icon={<ArrowLeft />} onClick={onBack} className="no-print">Back</Button>
            {actions}
          </>
        }
      />
      <Notice tone="warning" className="mb-20">Demo report generated from sample data.</Notice>
      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          {report.kind === 'risk' ? (
            <Card title="Students Needing Attention" subtitle={`${atRisk.length} students`} padded={false}>
              <DataTable<StudentRecord>
                caption="Students Needing Support"
                rows={atRisk}
                rowKey={(r) => r.userId}
                columns={[
                  { key: 'n', header: "Student", render: (r) => <Person name={fullName(getUser(r.userId))} sub={r.courseIds.map(shortTitle).join(', ')} size={30} /> },
                  { key: 'p', header: "Progress", align: 'right', sortValue: (r) => r.progress, render: (r) => `${r.progress}%` },
                  { key: 'g', header: "Average", align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 'l', header: "Last Sign-In", sortValue: (r) => r.lastActive, render: (r) => relativeTime(r.lastActive) },
                  { key: 's', header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                ]}
              />
            </Card>
          ) : (
            <>
              <ChartCard title={report.kind === 'quizzes' ? "Average Quiz Score" : report.kind === 'assignments' ? "Average Assignment Score" : "Completion Rates and Results"} subtitle="By course, %">
                <BarChart
                  labels={coursePerformance.map((p) => shortTitle(p.courseId))}
                  series={
                    report.kind === 'monthly'
                      ? [{ name: "Completion Rate", values: coursePerformance.map((p) => p.completionRate) }, { name: "Average", values: coursePerformance.map((p) => Math.round((p.avgAssignment + p.avgQuiz) / 2)) }]
                      : [{ name: "Average", values: coursePerformance.map((p) => (report.kind === 'quizzes' ? p.avgQuiz : p.avgAssignment)) }]
                  }
                  max={100}
                  suffix="%"
                  ariaLabel="Report chart"
                />
              </ChartCard>
              <Card title="Detailed Table" padded={false}>
                <DataTable
                  caption="Report table"
                  rows={coursePerformance}
                  rowKey={(p) => p.courseId}
                  columns={[
                    { key: 'c', header: "Course", render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                    { key: 'e', header: "Students", align: 'right', render: (p) => formatNumber(p.enrolled) },
                    { key: 'r', header: "Completion Rate", align: 'right', render: (p) => `${p.completionRate}%` },
                    { key: 'a', header: "Assignments", align: 'right', render: (p) => `${p.avgAssignment}%` },
                    { key: 'q', header: "Quizzes", align: 'right', render: (p) => `${p.avgQuiz}%` },
                  ]}
                />
              </Card>
            </>
          )}
        </div>
        <Card title="Report Settings">
          <dl className="kv">
            <dt>Type</dt><dd>{report.kind === 'monthly' ? "Monthly" : report.kind === 'risk' ? "Students" : report.kind === 'assignments' ? "Assignments" : "Quizzes"}</dd>
            <dt>Generated</dt><dd>{formatDate(report.created)}</dd>
            <dt>Courses</dt><dd>{coursePerformance.length}</dd>
            <dt>Students</dt><dd>{studentRecords.length}</dd>
            <dt>Source</dt><dd>Sample data</dd>
          </dl>
          <div className="mt-20 stack" style={{ ['--gap' as string]: '8px' }}>
            <div className="small strong" style={{ color: 'var(--navy-900)' }}>Key Observations</div>
            <ul className="small secondary" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>The JavaScript course has the highest completion rate.</li>
              <li>Activity in the SQL course is low. Consider sending students a reminder.</li>
              <li>The average quiz score is about 5 percentage points below the average assignment score.</li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

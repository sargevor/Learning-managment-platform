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
import { tr } from '../../i18n';

type Tab = 'overview' | 'courses' | 'students' | 'saved';
type Range = '30' | '90' | '365' | 'custom';

const RANGE_MONTHS: Record<Range, number> = { '30': 2, '90': 3, '365': 12, custom: 6 };
const RANGE_LABEL: Record<Range, string> = { '30': tr("Last 30 Days", "Վերջին 30 օր"), '90': tr("Last 3 Months", "Վերջին 3 ամիս"), '365': tr("Last 12 Months", "Վերջին 12 ամիս"), custom: tr("Custom Date Range", "Ընտրված ժամանակահատված") };

interface SavedReport {
  id: string;
  title: string;
  description: string;
  icon: typeof FileBarChart;
  created: string;
  kind: 'monthly' | 'risk' | 'assignments' | 'quizzes';
}

const SAVED: SavedReport[] = [
  { id: 'r1', kind: 'monthly', title: tr("Monthly Summary, September 2026", "Ամսական ամփոփում, սեպտեմբեր 2026"), description: tr("Enrollments, completion rates, and average results across all courses", "Գրանցումներ, ավարտման մակարդակ և միջին արդյունքներ բոլոր դասընթացներում"), icon: FileBarChart, created: '2026-10-01' },
  { id: 'r2', kind: 'risk', title: tr("Students Needing Support", "Աջակցության կարիք ունեցող ուսանողներ"), description: tr("Students making slow progress or inactive for an extended period", "Ցածր առաջընթացով կամ երկար ժամանակ ակտիվություն չունեցող ուսանողներ"), icon: Users, created: '2026-10-14' },
  { id: 'r3', kind: 'assignments', title: tr("Assignment Performance", "Առաջադրանքների կատարում"), description: tr("Submission counts, late work, and average scores by assignment", "Հանձնումների քանակը, ուշացումները և միջին միավորն ըստ առաջադրանքների"), icon: ClipboardCheck, created: '2026-10-10' },
  { id: 'r4', kind: 'quizzes', title: tr("Quiz Results", "Թեստերի արդյունքներ"), description: tr("Average scores and pass rates", "Միջին արդյունքներ և թեստը հանձնածների մասնաբաժինը"), icon: FileQuestion, created: '2026-10-08' },
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
  const exportAs = (fmt: string) => toast.info(tr(`Export as ${fmt}`, `Արտահանում ${fmt} ձևաչափով`), tr("Demo action: no file is created and no request is sent to a server.", "Ցուցադրական գործողություն․ ֆայլ չի ստեղծվում, և սերվերին հարցում չի ուղարկվում։"));

  const filters = (
    <div className="card card--pad mb-20 no-print">
      <div className="filters-bar" style={{ alignItems: 'flex-end' }}>
        <Select label={tr("Date Range", "Ժամանակահատված")} value={range} onChange={(e) => setRange(e.target.value as Range)} options={(Object.keys(RANGE_LABEL) as Range[]).map((r) => ({ value: r, label: RANGE_LABEL[r] }))} />
        {range === 'custom' && (
          <>
            <Input label={tr("Start", "Սկիզբ")} type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <Input label={tr("End", "Ավարտ")} type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
        <Select label={tr("Course", "Դասընթաց")} value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: tr("All Courses", "Բոլոր դասընթացները") }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]} />
        <Select label={tr("Student", "Ուսանող")} value={student} onChange={(e) => setStudent(e.target.value)} options={[{ value: 'all', label: tr("All Students", "Բոլոր ուսանողները") }, ...studentRecords.map((r) => ({ value: r.userId, label: fullName(getUser(r.userId)) }))]} />
        {(course !== 'all' || student !== 'all' || range !== '90') && (
          <Button variant="ghost" onClick={() => { setCourse('all'); setStudent('all'); setRange('90'); }}>{tr("Clear", "Մաքրել")}</Button>
        )}
      </div>
    </div>
  );

  const actions = (
    <>
      <Button variant="secondary" icon={<Printer />} onClick={() => window.print()}>{tr("Print", "Տպել")}</Button>
      <Dropdown
        trigger={({ toggle, open }) => (
          <Button icon={<Download />} onClick={toggle} aria-expanded={open}>{tr("Export", "Արտահանել")}</Button>
        )}
      >
        {(close) => (
          <>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('PDF'); close(); }}><FileText />{tr("PDF Document", "PDF փաստաթուղթ")}</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('Excel'); close(); }}><FileSpreadsheet />{tr("Excel Spreadsheet", "Excel աղյուսակ")}</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('CSV'); close(); }}><FileText />{tr("CSV File", "CSV ֆայլ")}</button>
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
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Reports", "Հաշվետվություններ") }]}
        title={tr("Analytics and Reports", "Վերլուծություն և հաշվետվություններ")}
        description={tr("Course, student, and performance statistics for the selected date range.", "Դասընթացների, ուսանողների և արդյունքների ցուցանիշներ ընտրված ժամանակահատվածի համար։")}
        actions={actions}
      />
      <Notice tone="warning" className="mb-20">{tr("All numbers and charts on this page are based on sample data and do not represent real analytics.", "Այս էջի բոլոր թվերն ու գրաֆիկները հիմնված են նմուշային տվյալների վրա և չեն արտացոլում իրական վերլուծություն։")}</Notice>
      <div className="report-print-only small muted mb-20">{tr("LearnSpace report: ", "LearnSpace, հաշվետվություն՝ ")}{RANGE_LABEL[range]}{tr(", generated on ", ", ձևավորված է ")}{formatDate('2026-10-15')}</div>
      {filters}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: tr("Summary", "Ամփոփում") },
          { key: 'courses', label: tr("Courses", "Դասընթացներ"), count: perf.length },
          { key: 'students', label: tr("Students", "Ուսանողներ"), count: records.length },
          { key: 'saved', label: tr("Saved Reports", "Պահված հաշվետվություններ"), count: SAVED.length },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label={tr("New Enrollments", "Նոր գրանցումներ")} value={formatNumber(newEnrollments)} icon={<Users />} meta={RANGE_LABEL[range]} />
              <StatCard label={tr("Completion Rate", "Ավարտման մակարդակ")} value={average(perf.map((p) => p.completionRate))} unit="%" icon={<BookOpenCheck />} tone="success" meta={tr("average across courses", "միջինը՝ ըստ դասընթացների")} />
              <StatCard label={tr("Assignment Average", "Առաջադրանքների միջին")} value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<ClipboardCheck />} tone="navy" />
              <StatCard label={tr("Quiz Average", "Թեստերի միջին")} value={average(perf.map((p) => p.avgQuiz))} unit="%" icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-2">
              <ChartCard title={tr("Enrollment Trends", "Գրանցումների դինամիկա")} subtitle={tr("New students by month", "Նոր ուսանողներ ըստ ամիսների")} legend={perf.map((p, i) => ({ label: shortTitle(p.courseId), color: CHART_COLORS[i % CHART_COLORS.length] }))}>
                <LineChart labels={labels} series={perf.map((p, i) => ({ name: shortTitle(p.courseId), values: enrollmentTrend[p.courseId].slice(-months), color: CHART_COLORS[i % CHART_COLORS.length] }))} area={perf.length === 1} ariaLabel={tr("Enrollments by month", "Գրանցումներն ըստ ամիսների")} />
              </ChartCard>
              <ChartCard title={tr("Average Results", "Միջին արդյունքներ")} subtitle={tr("Assignments and quizzes, %", "Առաջադրանքներ և թեստեր, %")} legend={[{ label: tr("Assignments", "Առաջադրանքներ"), color: CHART_COLORS[0] }, { label: tr("Quizzes", "Թեստեր"), color: CHART_COLORS[1] }]}>
                <BarChart labels={perf.map((p) => shortTitle(p.courseId))} series={[{ name: tr("Assignments", "Առաջադրանքներ"), values: perf.map((p) => p.avgAssignment) }, { name: tr("Quizzes", "Թեստեր"), values: perf.map((p) => p.avgQuiz) }]} max={100} suffix="%" ariaLabel={tr("Average results by course", "Միջին արդյունքներն ըստ դասընթացների")} />
              </ChartCard>
            </div>
            <div className="grid grid-main-aside">
              <Card title={tr("Completion rate by course", "Ավարտման մակարդակն ըստ դասընթացների")} actions={<DemoFlag />}>
                <HBarChart items={perf.map((p) => ({ label: getCourse(p.courseId)?.title ?? p.courseId, value: p.completionRate, sub: tr(`${formatNumber(p.enrolled)} students, ${formatNumber(Math.round(p.activeLast7 * (scale > 0.5 ? 1 : 0.8)))} active in the last 7 days`, `${formatNumber(p.enrolled)} ուսանող, ${formatNumber(Math.round(p.activeLast7 * (scale > 0.5 ? 1 : 0.8)))} ակտիվ վերջին 7 օրում`) }))} />
              </Card>
              <ChartCard title={tr("Student Activity", "Ուսանողների ակտիվությունը")} subtitle={tr("Active students by day of the week", "Ակտիվ ուսանողներ ըստ շաբաթվա օրերի")}>
                <BarChart labels={teacherWeeklyActivity.map((p) => p.label)} series={[{ name: tr("Active", "Ակտիվ"), values: teacherWeeklyActivity.map((p) => Math.round(p.value * (perf.length / coursePerformance.length))) }]} height={200} ariaLabel={tr("Active students by day", "Ակտիվ ուսանողներ ըստ օրերի")} />
              </ChartCard>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <Card title={tr("Course Comparison", "Դասընթացների համեմատություն")} subtitle={RANGE_LABEL[range]} actions={<DemoFlag />} padded={false}>
            <DataTable
              caption={tr("Course Comparison", "Դասընթացների համեմատություն")}
              rows={perf}
              rowKey={(p) => p.courseId}
              initialSort={{ key: 'e', dir: 'desc' }}
              columns={[
                { key: 'c', header: tr("Course", "Դասընթաց"), sortValue: (p) => getCourse(p.courseId)?.title ?? '', render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                { key: 'e', header: tr("Enrolled", "Գրանցված"), align: 'right', sortValue: (p) => p.enrolled, render: (p) => formatNumber(p.enrolled) },
                { key: 'n', header: tr("New", "Նոր"), align: 'right', sortValue: (p) => enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0), render: (p) => `+${enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0)}` },
                { key: 'cr', header: tr("Completion Rate", "Ավարտման մակարդակ"), sortValue: (p) => p.completionRate, render: (p) => <div style={{ minWidth: 130 }}><ProgressBar value={p.completionRate} /></div> },
                { key: 'aa', header: tr("Assignments", "Առաջադրանքներ"), align: 'right', sortValue: (p) => p.avgAssignment, render: (p) => `${p.avgAssignment}%` },
                { key: 'aq', header: tr("Quizzes", "Թեստեր"), align: 'right', sortValue: (p) => p.avgQuiz, render: (p) => `${p.avgQuiz}%` },
                { key: 'a7', header: tr("Active (7 Days)", "Ակտիվ (7 օր)"), align: 'right', sortValue: (p) => p.activeLast7, render: (p) => formatNumber(p.activeLast7) },
              ]}
            />
          </Card>
        )}

        {tab === 'students' && (
          <Card title={tr("Individual Progress", "Անհատական առաջընթաց")} subtitle={tr("A selection of students ranked by progress", "Ուսանողների ընտրանի՝ դասավորված ըստ առաջընթացի")} actions={<DemoFlag />} padded={false}>
            <DataTable<StudentRecord>
              caption={tr("Student progress", "Ուսանողների առաջընթաց")}
              rows={records}
              rowKey={(r) => r.userId}
              initialSort={{ key: 'p', dir: 'desc' }}
              empty={<EmptyState compact title={tr("No students match the selected filters", "Ընտրված զտիչներով ուսանողներ չկան")} />}
              columns={[
                { key: 'n', header: tr("Student", "Ուսանող"), sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} size={30} /> },
                { key: 'p', header: tr("Progress", "Առաջընթաց"), sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 130 }}><ProgressBar value={r.progress} /></div> },
                { key: 'a', header: tr("Assignments", "Առաջադրանքներ"), align: 'right', sortValue: (r) => r.assignmentsDone / r.assignmentsTotal, render: (r) => `${r.assignmentsDone}/${r.assignmentsTotal}` },
                { key: 'q', header: tr("Quizzes", "Թեստեր"), align: 'right', sortValue: (r) => r.quizAvg, render: (r) => `${r.quizAvg}%` },
                { key: 'g', header: tr("Average", "Միջին"), align: 'right', sortValue: (r) => r.avgScore, render: (r) => <strong>{r.avgScore}%</strong> },
                { key: 'w', header: tr("Min / Week", "Րոպե / շաբաթ"), align: 'right', sortValue: (r) => r.weeklyMinutes.reduce((a, b) => a + b, 0), render: (r) => <span className="row" style={{ ['--gap' as string]: '6px', justifyContent: 'flex-end' }}><Activity size={13} className="muted" />{r.weeklyMinutes.reduce((a, b) => a + b, 0)}</span> },
                { key: 's', header: tr("Status", "Կարգավիճակ"), render: (r) => <StatusBadge status={r.status} /> },
                { key: 'l', header: tr("Last Sign-In", "Վերջին մուտք"), sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap small">{relativeTime(r.lastActive)}</span> },
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
                  <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><CalendarRange size={13} />{tr("Generated on ", "Ձևավորված է ")}{formatDate(r.created)}</span>
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
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Reports", "Հաշվետվություններ") }, { label: report.title }]}
        title={report.title}
        description={report.description}
        actions={
          <>
            <Button variant="ghost" icon={<ArrowLeft />} onClick={onBack} className="no-print">{tr("Back", "Վերադառնալ")}</Button>
            {actions}
          </>
        }
      />
      <Notice tone="warning" className="mb-20">{tr("Demo report generated from sample data.", "Ցուցադրական հաշվետվություն՝ կազմված նմուշային տվյալներից։")}</Notice>
      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          {report.kind === 'risk' ? (
            <Card title={tr("Students Needing Attention", "Ուշադրության կարիք ունեցող ուսանողներ")} subtitle={tr(`${atRisk.length} students`, `${atRisk.length} ուսանող`)} padded={false}>
              <DataTable<StudentRecord>
                caption={tr("Students Needing Support", "Աջակցության կարիք ունեցող ուսանողներ")}
                rows={atRisk}
                rowKey={(r) => r.userId}
                columns={[
                  { key: 'n', header: tr("Student", "Ուսանող"), render: (r) => <Person name={fullName(getUser(r.userId))} sub={r.courseIds.map(shortTitle).join(', ')} size={30} /> },
                  { key: 'p', header: tr("Progress", "Առաջընթաց"), align: 'right', sortValue: (r) => r.progress, render: (r) => `${r.progress}%` },
                  { key: 'g', header: tr("Average", "Միջին"), align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 'l', header: tr("Last Sign-In", "Վերջին մուտք"), sortValue: (r) => r.lastActive, render: (r) => relativeTime(r.lastActive) },
                  { key: 's', header: tr("Status", "Կարգավիճակ"), render: (r) => <StatusBadge status={r.status} /> },
                ]}
              />
            </Card>
          ) : (
            <>
              <ChartCard title={report.kind === 'quizzes' ? tr("Average Quiz Score", "Թեստերի միջին արդյունքը") : report.kind === 'assignments' ? tr("Average Assignment Score", "Առաջադրանքների միջին միավորը") : tr("Completion Rates and Results", "Ավարտման մակարդակ և արդյունքներ")} subtitle={tr("By course, %", "Ըստ դասընթացների, %")}>
                <BarChart
                  labels={coursePerformance.map((p) => shortTitle(p.courseId))}
                  series={
                    report.kind === 'monthly'
                      ? [{ name: tr("Completion Rate", "Ավարտման մակարդակ"), values: coursePerformance.map((p) => p.completionRate) }, { name: tr("Average", "Միջին"), values: coursePerformance.map((p) => Math.round((p.avgAssignment + p.avgQuiz) / 2)) }]
                      : [{ name: tr("Average", "Միջին"), values: coursePerformance.map((p) => (report.kind === 'quizzes' ? p.avgQuiz : p.avgAssignment)) }]
                  }
                  max={100}
                  suffix="%"
                  ariaLabel={tr("Report chart", "Հաշվետվության գրաֆիկ")}
                />
              </ChartCard>
              <Card title={tr("Detailed Table", "Մանրամասն աղյուսակ")} padded={false}>
                <DataTable
                  caption={tr("Report table", "Հաշվետվության աղյուսակ")}
                  rows={coursePerformance}
                  rowKey={(p) => p.courseId}
                  columns={[
                    { key: 'c', header: tr("Course", "Դասընթաց"), render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                    { key: 'e', header: tr("Students", "Ուսանողներ"), align: 'right', render: (p) => formatNumber(p.enrolled) },
                    { key: 'r', header: tr("Completion Rate", "Ավարտման մակարդակ"), align: 'right', render: (p) => `${p.completionRate}%` },
                    { key: 'a', header: tr("Assignments", "Առաջադրանքներ"), align: 'right', render: (p) => `${p.avgAssignment}%` },
                    { key: 'q', header: tr("Quizzes", "Թեստեր"), align: 'right', render: (p) => `${p.avgQuiz}%` },
                  ]}
                />
              </Card>
            </>
          )}
        </div>
        <Card title={tr("Report Settings", "Հաշվետվության մանրամասներ")}>
          <dl className="kv">
            <dt>{tr("Type", "Տեսակ")}</dt><dd>{report.kind === 'monthly' ? tr("Monthly", "Ամսական") : report.kind === 'risk' ? tr("Students", "Ուսանողներ") : report.kind === 'assignments' ? tr("Assignments", "Առաջադրանքներ") : tr("Quizzes", "Թեստեր")}</dd>
            <dt>{tr("Generated", "Ձևավորված է")}</dt><dd>{formatDate(report.created)}</dd>
            <dt>{tr("Courses", "Դասընթացներ")}</dt><dd>{coursePerformance.length}</dd>
            <dt>{tr("Students", "Ուսանողներ")}</dt><dd>{studentRecords.length}</dd>
            <dt>{tr("Source", "Աղբյուր")}</dt><dd>{tr("Sample data", "Ցուցադրական տվյալներ")}</dd>
          </dl>
          <div className="mt-20 stack" style={{ ['--gap' as string]: '8px' }}>
            <div className="small strong" style={{ color: 'var(--navy-900)' }}>{tr("Key Observations", "Հիմնական դիտարկումներ")}</div>
            <ul className="small secondary" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>{tr("The JavaScript course has the highest completion rate.", "JavaScript դասընթացն ունի ավարտման ամենաբարձր մակարդակը։")}</li>
              <li>{tr("Activity in the SQL course is low. Consider sending students a reminder.", "SQL դասընթացում ակտիվությունը ցածր է։ Խորհուրդ է տրվում ուսանողներին հիշեցում ուղարկել։")}</li>
              <li>{tr("The average quiz score is about 5 percentage points below the average assignment score.", "Թեստերի միջին արդյունքը մոտ 5 տոկոսային կետով ցածր է առաջադրանքների միջինից։")}</li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

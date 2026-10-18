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
const RANGE_LABEL: Record<Range, string> = { '30': 'Վերջին 30 օր', '90': 'Վերջին 3 ամիս', '365': 'Վերջին 12 ամիս', custom: 'Ընտրված ժամանակահատված' };

interface SavedReport {
  id: string;
  title: string;
  description: string;
  icon: typeof FileBarChart;
  created: string;
  kind: 'monthly' | 'risk' | 'assignments' | 'quizzes';
}

const SAVED: SavedReport[] = [
  { id: 'r1', kind: 'monthly', title: 'Ամսական ամփոփում, սեպտեմբեր 2026', description: 'Գրանցումներ, ավարտելիություն և միջին արդյունքներ բոլոր դասընթացներում', icon: FileBarChart, created: '2026-10-01' },
  { id: 'r2', kind: 'risk', title: 'Ռիսկային ուսանողներ', description: 'Ցածր առաջընթացով կամ երկար ժամանակ ակտիվություն չունեցող ուսանողներ', icon: Users, created: '2026-10-14' },
  { id: 'r3', kind: 'assignments', title: 'Առաջադրանքների կատարողականություն', description: 'Հանձնումների քանակը, ուշացումները և միջին միավորը ըստ առաջադրանքների', icon: ClipboardCheck, created: '2026-10-10' },
  { id: 'r4', kind: 'quizzes', title: 'Թեստերի արդյունքներ', description: 'Միջին արդյունքներ և անցողիկ շեմը հաղթահարածների մասնաբաժինը', icon: FileQuestion, created: '2026-10-08' },
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
  const exportAs = (fmt: string) => toast.info(`Արտահանում ${fmt} ձևաչափով`, 'Ցուցադրական գործողություն. ֆայլ չի ստեղծվում և սերվեր չի կանչվում։');

  const filters = (
    <div className="card card--pad mb-20 no-print">
      <div className="filters-bar" style={{ alignItems: 'flex-end' }}>
        <Select label="Ժամանակահատված" value={range} onChange={(e) => setRange(e.target.value as Range)} options={(Object.keys(RANGE_LABEL) as Range[]).map((r) => ({ value: r, label: RANGE_LABEL[r] }))} />
        {range === 'custom' && (
          <>
            <Input label="Սկիզբ" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <Input label="Ավարտ" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
        <Select label="Դասընթաց" value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: 'Բոլոր դասընթացները' }, ...teacherCourses.filter((c) => c.status === 'published').map((c) => ({ value: c.id, label: c.title }))]} />
        <Select label="Ուսանող" value={student} onChange={(e) => setStudent(e.target.value)} options={[{ value: 'all', label: 'Բոլոր ուսանողները' }, ...studentRecords.map((r) => ({ value: r.userId, label: fullName(getUser(r.userId)) }))]} />
        {(course !== 'all' || student !== 'all' || range !== '90') && (
          <Button variant="ghost" onClick={() => { setCourse('all'); setStudent('all'); setRange('90'); }}>Մաքրել</Button>
        )}
      </div>
    </div>
  );

  const actions = (
    <>
      <Button variant="secondary" icon={<Printer />} onClick={() => window.print()}>Տպել</Button>
      <Dropdown
        trigger={({ toggle, open }) => (
          <Button icon={<Download />} onClick={toggle} aria-expanded={open}>Արտահանել</Button>
        )}
      >
        {(close) => (
          <>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('PDF'); close(); }}><FileText />PDF փաստաթուղթ</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('Excel'); close(); }}><FileSpreadsheet />Excel աղյուսակ</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('CSV'); close(); }}><FileText />CSV ֆայլ</button>
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
        breadcrumbs={[{ label: 'Վահանակ', to: '/teacher/dashboard' }, { label: 'Հաշվետվություններ' }]}
        title="Վերլուծություն և հաշվետվություններ"
        description="Դասընթացների, ուսանողների և արդյունքների ցուցանիշներ ընտրված ժամանակահատվածի համար։"
        actions={actions}
      />
      <Notice tone="warning" className="mb-20">
        Այս էջի բոլոր թվերն ու գրաֆիկները ցուցադրական են և ստեղծված են օրինակային տվյալներից։ Դրանք չեն արտացոլում իրական վերլուծություն։
      </Notice>
      <div className="report-print-only small muted mb-20">Ուսարան, հաշվետվություն՝ {RANGE_LABEL[range]}, ձևավորված է {formatDate('2026-10-15')}</div>
      {filters}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: 'Ամփոփում' },
          { key: 'courses', label: 'Դասընթացներ', count: perf.length },
          { key: 'students', label: 'Ուսանողներ', count: records.length },
          { key: 'saved', label: 'Պահված հաշվետվություններ', count: SAVED.length },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'overview' && (
          <div className="stack" style={{ ['--gap' as string]: '20px' }}>
            <div className="grid grid-4">
              <StatCard label="Նոր գրանցումներ" value={formatNumber(newEnrollments)} icon={<Users />} meta={RANGE_LABEL[range]} />
              <StatCard label="Ավարտելիություն" value={average(perf.map((p) => p.completionRate))} unit="%" icon={<BookOpenCheck />} tone="success" meta="միջինը դասընթացներով" />
              <StatCard label="Առաջադրանքների միջին" value={average(perf.map((p) => p.avgAssignment))} unit="%" icon={<ClipboardCheck />} tone="navy" />
              <StatCard label="Թեստերի միջին" value={average(perf.map((p) => p.avgQuiz))} unit="%" icon={<FileQuestion />} tone="warning" />
            </div>
            <div className="grid grid-2">
              <ChartCard title="Գրանցումների դինամիկա" subtitle="Նոր ուսանողներ ըստ ամիսների" legend={perf.map((p, i) => ({ label: shortTitle(p.courseId), color: CHART_COLORS[i % CHART_COLORS.length] }))}>
                <LineChart labels={labels} series={perf.map((p, i) => ({ name: shortTitle(p.courseId), values: enrollmentTrend[p.courseId].slice(-months), color: CHART_COLORS[i % CHART_COLORS.length] }))} area={perf.length === 1} ariaLabel="Գրանցումները ըստ ամիսների" />
              </ChartCard>
              <ChartCard title="Միջին արդյունքներ" subtitle="Առաջադրանքներ և թեստեր, %" legend={[{ label: 'Առաջադրանքներ', color: CHART_COLORS[0] }, { label: 'Թեստեր', color: CHART_COLORS[1] }]}>
                <BarChart labels={perf.map((p) => shortTitle(p.courseId))} series={[{ name: 'Առաջադրանքներ', values: perf.map((p) => p.avgAssignment) }, { name: 'Թեստեր', values: perf.map((p) => p.avgQuiz) }]} max={100} suffix="%" ariaLabel="Միջին արդյունքները ըստ դասընթացների" />
              </ChartCard>
            </div>
            <div className="grid grid-main-aside">
              <Card title="Ավարտելիությունը ըստ դասընթացների" actions={<DemoFlag />}>
                <HBarChart items={perf.map((p) => ({ label: getCourse(p.courseId)?.title ?? p.courseId, value: p.completionRate, sub: `${formatNumber(p.enrolled)} ուսանող, ${formatNumber(Math.round(p.activeLast7 * (scale > 0.5 ? 1 : 0.8)))} ակտիվ վերջին 7 օրում` }))} />
              </Card>
              <ChartCard title="Ուսանողների ակտիվությունը" subtitle="Ակտիվ ուսանողներ ըստ շաբաթվա օրերի">
                <BarChart labels={teacherWeeklyActivity.map((p) => p.label)} series={[{ name: 'Ակտիվ', values: teacherWeeklyActivity.map((p) => Math.round(p.value * (perf.length / coursePerformance.length))) }]} height={200} ariaLabel="Ակտիվ ուսանողներ ըստ օրերի" />
              </ChartCard>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <Card title="Դասընթացների համեմատություն" subtitle={RANGE_LABEL[range]} actions={<DemoFlag />} padded={false}>
            <DataTable
              caption="Դասընթացների համեմատություն"
              rows={perf}
              rowKey={(p) => p.courseId}
              initialSort={{ key: 'e', dir: 'desc' }}
              columns={[
                { key: 'c', header: 'Դասընթաց', sortValue: (p) => getCourse(p.courseId)?.title ?? '', render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                { key: 'e', header: 'Գրանցված', align: 'right', sortValue: (p) => p.enrolled, render: (p) => formatNumber(p.enrolled) },
                { key: 'n', header: 'Նոր', align: 'right', sortValue: (p) => enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0), render: (p) => `+${enrollmentTrend[p.courseId].slice(-months).reduce((a, b) => a + b, 0)}` },
                { key: 'cr', header: 'Ավարտելիություն', sortValue: (p) => p.completionRate, render: (p) => <div style={{ minWidth: 130 }}><ProgressBar value={p.completionRate} /></div> },
                { key: 'aa', header: 'Առաջադրանքներ', align: 'right', sortValue: (p) => p.avgAssignment, render: (p) => `${p.avgAssignment}%` },
                { key: 'aq', header: 'Թեստեր', align: 'right', sortValue: (p) => p.avgQuiz, render: (p) => `${p.avgQuiz}%` },
                { key: 'a7', header: 'Ակտիվ (7 օր)', align: 'right', sortValue: (p) => p.activeLast7, render: (p) => formatNumber(p.activeLast7) },
              ]}
            />
          </Card>
        )}

        {tab === 'students' && (
          <Card title="Անհատական առաջընթաց" subtitle="Խմբի նմուշ, դասավորված ըստ առաջընթացի" actions={<DemoFlag />} padded={false}>
            <DataTable<StudentRecord>
              caption="Ուսանողների առաջընթաց"
              rows={records}
              rowKey={(r) => r.userId}
              initialSort={{ key: 'p', dir: 'desc' }}
              empty={<EmptyState compact title="Ընտրված զտիչներով ուսանողներ չկան" />}
              columns={[
                { key: 'n', header: 'Ուսանող', sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} size={30} /> },
                { key: 'p', header: 'Առաջընթաց', sortValue: (r) => r.progress, render: (r) => <div style={{ minWidth: 130 }}><ProgressBar value={r.progress} /></div> },
                { key: 'a', header: 'Առաջադրանքներ', align: 'right', sortValue: (r) => r.assignmentsDone / r.assignmentsTotal, render: (r) => `${r.assignmentsDone}/${r.assignmentsTotal}` },
                { key: 'q', header: 'Թեստեր', align: 'right', sortValue: (r) => r.quizAvg, render: (r) => `${r.quizAvg}%` },
                { key: 'g', header: 'Միջին', align: 'right', sortValue: (r) => r.avgScore, render: (r) => <strong>{r.avgScore}%</strong> },
                { key: 'w', header: 'Րոպե / շաբաթ', align: 'right', sortValue: (r) => r.weeklyMinutes.reduce((a, b) => a + b, 0), render: (r) => <span className="row" style={{ ['--gap' as string]: '6px', justifyContent: 'flex-end' }}><Activity size={13} className="muted" />{r.weeklyMinutes.reduce((a, b) => a + b, 0)}</span> },
                { key: 's', header: 'Կարգավիճակ', render: (r) => <StatusBadge status={r.status} /> },
                { key: 'l', header: 'Վերջին մուտք', sortValue: (r) => r.lastActive, render: (r) => <span className="nowrap small">{relativeTime(r.lastActive)}</span> },
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
                  <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><CalendarRange size={13} />Ձևավորված է {formatDate(r.created)}</span>
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
        breadcrumbs={[{ label: 'Վահանակ', to: '/teacher/dashboard' }, { label: 'Հաշվետվություններ' }, { label: report.title }]}
        title={report.title}
        description={report.description}
        actions={
          <>
            <Button variant="ghost" icon={<ArrowLeft />} onClick={onBack} className="no-print">Վերադառնալ</Button>
            {actions}
          </>
        }
      />
      <Notice tone="warning" className="mb-20">Ցուցադրական հաշվետվություն՝ ստեղծված օրինակային տվյալներից։</Notice>
      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          {report.kind === 'risk' ? (
            <Card title="Ուշադրության կարիք ունեցող ուսանողներ" subtitle={`${atRisk.length} ուսանող`} padded={false}>
              <DataTable<StudentRecord>
                caption="Ռիսկային ուսանողներ"
                rows={atRisk}
                rowKey={(r) => r.userId}
                columns={[
                  { key: 'n', header: 'Ուսանող', render: (r) => <Person name={fullName(getUser(r.userId))} sub={r.courseIds.map(shortTitle).join(', ')} size={30} /> },
                  { key: 'p', header: 'Առաջընթաց', align: 'right', sortValue: (r) => r.progress, render: (r) => `${r.progress}%` },
                  { key: 'g', header: 'Միջին', align: 'right', sortValue: (r) => r.avgScore, render: (r) => `${r.avgScore}%` },
                  { key: 'l', header: 'Վերջին մուտք', sortValue: (r) => r.lastActive, render: (r) => relativeTime(r.lastActive) },
                  { key: 's', header: 'Կարգավիճակ', render: (r) => <StatusBadge status={r.status} /> },
                ]}
              />
            </Card>
          ) : (
            <>
              <ChartCard title={report.kind === 'quizzes' ? 'Թեստերի միջին արդյունքը' : report.kind === 'assignments' ? 'Առաջադրանքների միջին միավորը' : 'Ավարտելիություն և արդյունքներ'} subtitle="Ըստ դասընթացների, %">
                <BarChart
                  labels={coursePerformance.map((p) => shortTitle(p.courseId))}
                  series={
                    report.kind === 'monthly'
                      ? [{ name: 'Ավարտելիություն', values: coursePerformance.map((p) => p.completionRate) }, { name: 'Միջին', values: coursePerformance.map((p) => Math.round((p.avgAssignment + p.avgQuiz) / 2)) }]
                      : [{ name: 'Միջին', values: coursePerformance.map((p) => (report.kind === 'quizzes' ? p.avgQuiz : p.avgAssignment)) }]
                  }
                  max={100}
                  suffix="%"
                  ariaLabel="Հաշվետվության գրաֆիկ"
                />
              </ChartCard>
              <Card title="Մանրամասն աղյուսակ" padded={false}>
                <DataTable
                  caption="Հաշվետվության աղյուսակ"
                  rows={coursePerformance}
                  rowKey={(p) => p.courseId}
                  columns={[
                    { key: 'c', header: 'Դասընթաց', render: (p) => <span className="cell-title">{getCourse(p.courseId)?.title}</span> },
                    { key: 'e', header: 'Ուսանողներ', align: 'right', render: (p) => formatNumber(p.enrolled) },
                    { key: 'r', header: 'Ավարտելիություն', align: 'right', render: (p) => `${p.completionRate}%` },
                    { key: 'a', header: 'Առաջադրանքներ', align: 'right', render: (p) => `${p.avgAssignment}%` },
                    { key: 'q', header: 'Թեստեր', align: 'right', render: (p) => `${p.avgQuiz}%` },
                  ]}
                />
              </Card>
            </>
          )}
        </div>
        <Card title="Հաշվետվության պարամետրեր">
          <dl className="kv">
            <dt>Տեսակ</dt><dd>{report.kind === 'monthly' ? 'Ամսական' : report.kind === 'risk' ? 'Ուսանողներ' : report.kind === 'assignments' ? 'Առաջադրանքներ' : 'Թեստեր'}</dd>
            <dt>Ձևավորված է</dt><dd>{formatDate(report.created)}</dd>
            <dt>Դասընթացներ</dt><dd>{coursePerformance.length}</dd>
            <dt>Ուսանողներ</dt><dd>{studentRecords.length}</dd>
            <dt>Աղբյուր</dt><dd>Ցուցադրական տվյալներ</dd>
          </dl>
          <div className="mt-20 stack" style={{ ['--gap' as string]: '8px' }}>
            <div className="small strong" style={{ color: 'var(--navy-900)' }}>Հիմնական դիտարկումներ</div>
            <ul className="small secondary" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>JavaScript դասընթացն ունի ամենաբարձր ավարտելիությունը։</li>
              <li>SQL դասընթացում ակտիվությունը ցածր է. խորհուրդ է տրվում հիշեցում ուղարկել։</li>
              <li>Թեստերի միջինը մոտ 5 տոկոսային կետով զիջում է առաջադրանքներին։</li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, CalendarRange, ChartColumn, ChevronRight, CircleAlert, CircleCheck, ClipboardList, Clock, Download, FileQuestionMark, FileSpreadsheet, FileText, Layers, Printer, Target, TrendingDown, TrendingUp, User, UserPlus, Users, X } from 'lucide-react';
import type { StudentRecord } from '../../types';
import { coursePerformance, enrollmentTrend, studentRecords, trendLabels } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { shortTitle, teacherCourses } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { BarChart, CHART_COLORS } from '../../components/charts/Charts';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Dropdown } from '../../components/ui/Overlay';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Meter } from '../../components/ui/Visual';
import { average, cx, formatDate, formatNumber, formatShortDate } from '../../lib/format';
import { CourseIcon, shortAgo } from './TeacherStudentsPage';

type Range = '30' | '90' | '365' | 'custom';

const RANGE_MONTHS: Record<Range, number> = { '30': 2, '90': 3, '365': 12, custom: 6 };
const RANGES: { key: Range; label: string; icon: typeof Clock; report: string; when: string }[] = [
  { key: '30', label: 'Month', icon: Clock, report: 'Monthly report', when: 'in 30 days' },
  { key: '90', label: 'Term', icon: Layers, report: 'Term report', when: 'this term' },
  { key: '365', label: 'Year', icon: Calendar, report: 'Year report', when: 'this year' },
  { key: 'custom', label: 'Custom', icon: CalendarRange, report: 'Custom report', when: 'this period' },
];

interface SavedReport {
  id: string;
  title: string;
  icon: typeof FileText;
  created: string;
  kind: 'monthly' | 'risk' | 'assignments' | 'quizzes';
}

const SAVED: SavedReport[] = [
  { id: 'r1', kind: 'monthly', title: 'September summary', icon: FileText, created: '2026-10-01' },
  { id: 'r2', kind: 'risk', title: 'At-risk students', icon: CircleAlert, created: '2026-10-14' },
  { id: 'r3', kind: 'assignments', title: 'Task results', icon: ClipboardList, created: '2026-10-10' },
  { id: 'r4', kind: 'quizzes', title: 'Quiz results', icon: FileQuestionMark, created: '2026-10-08' },
];

const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);

/** "Nice" tick step for an axis. */
function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  return ([1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow);
}

export function ReportsPage() {
  const toast = useToast();
  const [range, setRange] = useState<Range>('90');
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-10-15');
  const [course, setCourse] = useState('all');
  const [student, setStudent] = useState('all');
  const [report, setReport] = useState<SavedReport | null>(null);

  const perf = coursePerformance.filter((p) => course === 'all' || p.courseId === course);
  const months = RANGE_MONTHS[range];
  const rangeInfo = RANGES.find((r) => r.key === range)!;
  const records: StudentRecord[] = useMemo(
    () => studentRecords.filter((r) => (course === 'all' || r.courseIds.includes(course)) && (student === 'all' || r.userId === student)),
    [course, student],
  );

  // Monthly new enrolments over the selected courses (12 months, Nov to Oct).
  const monthly = trendLabels.map((_, i) => sum(perf.map((p) => enrollmentTrend[p.courseId][i])));
  const win = monthly.slice(-months);
  const prev = months * 2 <= monthly.length ? monthly.slice(-2 * months, -months) : null;
  const growth = prev ? Math.round((sum(win) / sum(prev) - 1) * 100) : Math.round((win[win.length - 1] / win[0] - 1) * 100);
  const newEnrollments = sum(win);
  const title = `Enrolments ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth)}% ${rangeInfo.when}`;
  const period = range === 'custom' ? `${formatShortDate(from)} to ${formatShortDate(to)} ${to.slice(0, 4)}` : `${trendLabels[12 - months]} to ${trendLabels[11]} 2026`;

  const exportAs = (fmt: string) => toast.info(`Export as ${fmt}`, 'Demo only: no file is created.');
  const actions = (
    <>
      <Dropdown
        trigger={({ toggle, open }) => (
          <button type="button" className="tp-iconbtn tp-iconbtn--navy" aria-label="Export" aria-expanded={open} onClick={toggle}>
            <Download aria-hidden="true" />
          </button>
        )}
      >
        {(close) => (
          <>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('PDF'); close(); }}><FileText />PDF</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('Excel'); close(); }}><FileSpreadsheet />Excel</button>
            <button type="button" className="dropdown__item" onClick={() => { exportAs('CSV'); close(); }}><FileText />CSV</button>
          </>
        )}
      </Dropdown>
      <button type="button" className="tp-iconbtn" aria-label="Print" onClick={() => window.print()}>
        <Printer aria-hidden="true" />
      </button>
    </>
  );

  if (report) {
    return <ReportDetail report={report} onBack={() => setReport(null)} actions={actions} />;
  }

  /* Lead chart geometry */
  const W = 1200;
  const H = 260;
  const step = niceStep((Math.max(...monthly) - Math.min(...monthly)) / 3 || 1);
  const lo = Math.max(0, Math.floor(Math.min(...monthly) / step) * step - step);
  const hi = Math.ceil(Math.max(...monthly) / step) * step;
  const yOf = (v: number) => 250 - ((v - lo) / Math.max(1, hi - lo)) * 240;
  const pts = monthly.map((v, i) => [(i * W) / (monthly.length - 1), yOf(v)] as const);
  const line = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const ticks: number[] = [];
  for (let v = hi; v > lo; v -= step) ticks.push(v);
  const shadeLeft = ((12 - months) / 11) * 100;
  const marks = [0, monthly.length - 1];

  /* Course comparison */
  const perfRows = perf.map((p) => ({ ...p, avg: Math.round((p.avgAssignment + p.avgQuiz) / 2) }));
  const lagging = [...perfRows].sort((a, b) => a.completionRate - b.completionRate)[0];
  const compTitle = perfRows.length > 1 && lagging ? `${shortTitle(lagging.courseId)} completion lags` : lagging ? `${shortTitle(lagging.courseId)}: ${lagging.completionRate}% complete` : 'Courses';

  /* Score distribution */
  const buckets = [
    { label: '<60', title: 'under 60', test: (s: number) => s < 60 },
    { label: '60s', title: '60s', test: (s: number) => s >= 60 && s < 70 },
    { label: '70s', title: '70s', test: (s: number) => s >= 70 && s < 80 },
    { label: '80s', title: '80s', test: (s: number) => s >= 80 && s < 90 },
    { label: '90+', title: '90+', test: (s: number) => s >= 90 },
  ].map((b) => ({ ...b, n: records.filter((r) => b.test(r.avgScore)).length }));
  const maxN = Math.max(1, ...buckets.map((b) => b.n));
  const topBucket = buckets.reduce((a, b) => (b.n > a.n ? b : a), buckets[0]);

  /* Top students */
  const top = [...records].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
  const filtered = course !== 'all' || student !== 'all' || range !== '90';

  return (
    <>
      <ShellTitle
        title={title}
        meta={
          <>
            <ChartColumn aria-hidden="true" />
            <b>{rangeInfo.report}</b>
            <span className="tp-dot" aria-hidden="true" />
            {period}
          </>
        }
      />
      <div className="report-print-only small muted">Usaran report: {period}, created {formatDate('2026-10-15')}</div>

      <div className="tp-controls no-print">
        <div role="group" aria-label="Period" className="tp-seg">
          {RANGES.map((r) => (
            <button key={r.key} type="button" aria-pressed={range === r.key} className={cx('tp-seg__btn', range === r.key && 'tp-seg__btn--on')} onClick={() => setRange(r.key)}>
              <r.icon aria-hidden="true" />
              {r.label}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <>
            <label className="tp-pick">
              <span className="sr-only">From</span>
              <Calendar aria-hidden="true" />
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="tp-pick">
              <span className="sr-only">To</span>
              <Calendar aria-hidden="true" />
              <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
        <label className="tp-pick">
          <span className="sr-only">Course</span>
          <Layers aria-hidden="true" />
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">{coursePerformance.length} courses</option>
            {teacherCourses.filter((c) => c.status === 'published').map((c) => <option key={c.id} value={c.id}>{shortTitle(c.id)}</option>)}
          </select>
        </label>
        <label className="tp-pick">
          <span className="sr-only">Student</span>
          <User aria-hidden="true" />
          <select value={student} onChange={(e) => setStudent(e.target.value)}>
            <option value="all">All students</option>
            {studentRecords.map((r) => <option key={r.userId} value={r.userId}>{fullName(getUser(r.userId))}</option>)}
          </select>
        </label>
        {filtered && (
          <button type="button" className="tp-clear" onClick={() => { setCourse('all'); setStudent('all'); setRange('90'); }}>
            <X aria-hidden="true" />Clear
          </button>
        )}
        <div className="tp-grow" />
        {actions}
      </div>

      <section aria-label="Key figures" className="tp-tiles">
        <StatCard label="New enrolments" value={formatNumber(newEnrollments)} icon={growth >= 0 ? <UserPlus /> : <TrendingDown />} trend={growth > 0 ? `+${growth}%` : undefined} />
        <StatCard label="Active, last 7 days" value={formatNumber(sum(perf.map((p) => p.activeLast7)))} icon={<Users />} />
        <StatCard label="Completion" value={average(perf.map((p) => p.completionRate))} unit="%" icon={<CircleCheck />} />
        <StatCard label="Average score" value={average(perfRows.map((p) => p.avg))} unit="%" icon={<Target />} />
      </section>

      <section className="tp-card tp-lead">
        <div className="tp-head">
          <h2 className="tp-h2">New enrolments by month</h2>
          <div className="tp-legend">
            <span><i className="tp-legend__line" />{perf.length === 1 ? shortTitle(perf[0].courseId) : 'All courses'}</span>
            <span><i className="tp-legend__zone" />{rangeInfo.label}</span>
          </div>
        </div>
        <div className="tp-chart">
          <div className="tp-chart__y" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} style={{ top: `${(yOf(t) / H) * 100}%` }}>{t >= 1000 ? `${t / 1000}k` : t}</span>
            ))}
          </div>
          <div className="tp-chart__main">
            <div className="tp-chart__plot" role="img" aria-label={`New enrolments per month, from ${monthly[0]} in ${trendLabels[0]} to ${monthly[monthly.length - 1]} in ${trendLabels[trendLabels.length - 1]}`}>
              <div className="tp-chart__zone" style={{ left: `${shadeLeft}%` }} />
              {ticks.map((t) => <div key={t} className="tp-chart__grid" style={{ top: `${(yOf(t) / H) * 100}%` }} />)}
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
                <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="var(--blue-200)" fillOpacity="0.55" />
                <path d={line} fill="none" stroke="var(--navy-900)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
              {marks.map((i) => {
                const x = (i / (monthly.length - 1)) * 100;
                const y = (pts[i][1] / H) * 100;
                return (
                  <span key={i}>
                    <span className="tp-chart__dot" style={{ left: `${x}%`, top: `${y}%` }} />
                    <span className={cx('tp-chart__label', i === 0 && 'tp-chart__label--start', i > 0 && 'tp-chart__label--end')} style={{ left: `${x}%`, top: `${y}%` }}>{formatNumber(monthly[i])}</span>
                  </span>
                );
              })}
            </div>
            <div className="tp-chart__x" aria-hidden="true">
              {trendLabels.map((m, i) => (
                <span key={m} style={{ left: `${(i / (trendLabels.length - 1)) * 100}%` }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tp-split tp-split--stretch">
        <div className="tp-card tp-span2">
          <div className="tp-head">
            <h2 className="tp-h2">{compTitle}</h2>
            <div className="tp-legend">
              <span><i className="tp-legend__sq" />Completion</span>
              <span><i className="tp-legend__sq tp-legend__sq--light" />Average score</span>
            </div>
          </div>
          <div className="tp-rows">
            {perfRows.map((p) => (
              <div key={p.courseId} className="tp-perf">
                <div className="tp-perf__name">
                  <span className="tp-box" aria-hidden="true"><CourseIcon id={p.courseId} /></span>
                  <span className="tp-perf__text">
                    <b className="tp-ellipsis" title={getCourse(p.courseId)?.title}>{shortTitle(p.courseId)}</b>
                    <span><Users aria-hidden="true" />{formatNumber(p.enrolled)}</span>
                  </span>
                </div>
                <div className="tp-perf__bars">
                  <div className="tp-perf__bar">
                    <Meter value={p.completionRate} height={12} color="var(--navy-900)" label={`${shortTitle(p.courseId)} completion`} />
                    <b>{p.completionRate}%</b>
                  </div>
                  <div className="tp-perf__bar">
                    <Meter value={p.avg} height={12} color="var(--periwinkle)" label={`${shortTitle(p.courseId)} average score`} />
                    <b>{p.avg}%</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tp-card tp-dist">
          <div className="tp-head">
            <h2 className="tp-h2">{records.length ? `Most score ${topBucket.title}` : 'Scores'}</h2>
            <span className="tp-count"><Users aria-hidden="true" />{records.length}</span>
          </div>
          {records.length === 0 ? (
            <EmptyState compact title="No students" />
          ) : (
            <>
              <div className="tp-dist__plot" role="img" aria-label={`Average score distribution: ${buckets.map((b) => `${b.label} ${b.n}`).join(', ')}`}>
                {buckets.map((b) => (
                  <div key={b.label} className="tp-dist__col">
                    <span>{b.n}</span>
                    <div className={cx('tp-dist__bar', b === topBucket && 'tp-dist__bar--top')} style={{ height: `${Math.max(2, Math.round((b.n / maxN) * 78))}%` }} />
                  </div>
                ))}
              </div>
              <div className="tp-dist__labels" aria-hidden="true">
                {buckets.map((b) => <span key={b.label}>{b.label}</span>)}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="tp-split">
        <div className="tp-card">
          <div className="tp-head">
            <h2 className="tp-h2">Top students</h2>
            <Link to="/teacher/students" className="tp-more">All<ChevronRight aria-hidden="true" /></Link>
          </div>
          {top.length === 0 ? (
            <EmptyState compact title="No students" />
          ) : (
            <div className="tp-top">
              {top.map((r, i) => {
                const name = fullName(getUser(r.userId));
                return (
                  <Link key={r.userId} to={`/teacher/students/${r.userId}`} className="tp-top__row">
                    <span className={cx('tp-top__rank', i === 0 && 'tp-top__rank--first')}>{i + 1}</span>
                    <Avatar name={name} size={42} />
                    <span className="tp-top__main">
                      <span className="tp-ellipsis tp-top__name">{name}</span>
                      <span className="tp-top__sub">
                        {r.courseIds.length === 1 ? <><CourseIcon id={r.courseIds[0]} />{shortTitle(r.courseIds[0])}</> : <><BookOpen aria-hidden="true" />{r.courseIds.length} courses</>}
                      </span>
                    </span>
                    <span className="tp-chip tp-chip--lg tp-chip--blue">{r.avgScore}%</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="tp-card tp-span2">
          <h2 className="tp-h2" style={{ marginBottom: 14 }}>Saved reports</h2>
          <div className="tp-saved">
            {SAVED.map((r) => (
              <button key={r.id} type="button" className="tp-saved__tile v-lift" onClick={() => setReport(r)}>
                <span className="tp-saved__top">
                  <span className="tp-box tp-box--lg" aria-hidden="true"><r.icon /></span>
                  <ChevronRight aria-hidden="true" className="tp-chev" />
                </span>
                <span className="tp-saved__title">{r.title}</span>
                <span className="tp-chip tp-chip--soft"><Calendar aria-hidden="true" />{formatShortDate(r.created)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const KIND_LABEL: Record<SavedReport['kind'], string> = { monthly: 'Monthly', risk: 'Students', assignments: 'Tasks', quizzes: 'Quizzes' };

function ReportDetail({ report, onBack, actions }: { report: SavedReport; onBack: () => void; actions: ReactNode }) {
  const atRisk = studentRecords.filter((r) => r.status !== 'active');
  const best = [...coursePerformance].sort((a, b) => b.completionRate - a.completionRate)[0];
  const quiet = [...coursePerformance].sort((a, b) => a.activeLast7 / a.enrolled - b.activeLast7 / b.enrolled)[0];
  const gap = average(coursePerformance.map((p) => p.avgAssignment)) - average(coursePerformance.map((p) => p.avgQuiz));
  const values =
    report.kind === 'monthly'
      ? [{ name: 'Completion', values: coursePerformance.map((p) => p.completionRate) }, { name: 'Average', values: coursePerformance.map((p) => Math.round((p.avgAssignment + p.avgQuiz) / 2)) }]
      : [{ name: 'Average', values: coursePerformance.map((p) => (report.kind === 'quizzes' ? p.avgQuiz : p.avgAssignment)) }];

  return (
    <>
      <ShellTitle
        title={report.title}
        meta={
          <>
            <report.icon aria-hidden="true" />
            <b>Saved report</b>
            <span className="tp-dot" aria-hidden="true" />
            {formatDate(report.created)}
          </>
        }
      />
      <div className="tp-controls tp-controls--plain no-print">
        <button type="button" className="tp-back" onClick={onBack}>
          <span className="tp-back__icon"><ArrowLeft aria-hidden="true" /></span>
          Reports
        </button>
        <div className="tp-grow" />
        {actions}
      </div>

      <section className="tp-split">
        <div className="tp-span2 tp-stack">
          {report.kind === 'risk' ? (
            <div className="tp-card">
              <div className="tp-head">
                <h2 className="tp-h2">Need attention</h2>
                <span className="tp-count"><Users aria-hidden="true" />{atRisk.length}</span>
              </div>
              <div className="tp-top">
                {atRisk.map((r) => {
                  const name = fullName(getUser(r.userId));
                  return (
                    <Link key={r.userId} to={`/teacher/students/${r.userId}`} className="tp-top__row">
                      <Avatar name={name} size={42} />
                      <span className="tp-top__main">
                        <span className="tp-ellipsis tp-top__name">{name}</span>
                        <span className="tp-top__sub"><Clock aria-hidden="true" />{shortAgo(r.lastActive)} · {r.progress}% · {r.avgScore}%</span>
                      </span>
                      <StatusBadge status={r.status} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="tp-card">
                <div className="tp-head">
                  <h2 className="tp-h2">{report.kind === 'quizzes' ? 'Quiz average' : report.kind === 'assignments' ? 'Task average' : 'Completion and scores'}</h2>
                  {values.length > 1 && (
                    <div className="tp-legend">
                      {values.map((s, i) => <span key={s.name}><i className="tp-legend__sq" style={{ background: CHART_COLORS[i] }} />{s.name}</span>)}
                    </div>
                  )}
                </div>
                <BarChart labels={coursePerformance.map((p) => shortTitle(p.courseId))} series={values} max={100} suffix="%" ariaLabel="Report chart by course" />
              </div>
              <div className="tp-card tp-card--flush">
                <DataTable
                  caption="Report table"
                  rows={coursePerformance}
                  rowKey={(p) => p.courseId}
                  columns={[
                    { key: 'c', header: 'Course', render: (p) => <span className="tp-person" style={{ fontSize: 14 }}><span className="tp-box tp-box--sm"><CourseIcon id={p.courseId} /></span>{shortTitle(p.courseId)}</span> },
                    { key: 'e', header: 'Students', align: 'right', sortValue: (p) => p.enrolled, render: (p) => formatNumber(p.enrolled) },
                    { key: 'r', header: 'Completion', align: 'right', sortValue: (p) => p.completionRate, render: (p) => `${p.completionRate}%` },
                    { key: 'a', header: 'Tasks', align: 'right', sortValue: (p) => p.avgAssignment, render: (p) => `${p.avgAssignment}%` },
                    { key: 'q', header: 'Quizzes', align: 'right', sortValue: (p) => p.avgQuiz, render: (p) => `${p.avgQuiz}%` },
                  ]}
                />
              </div>
            </>
          )}
        </div>

        <div className="tp-card">
          <h2 className="tp-h2">Details</h2>
          <div className="tp-facts">
            <span><span className="tp-box tp-box--sm"><report.icon /></span>{KIND_LABEL[report.kind]}</span>
            <span><span className="tp-box tp-box--sm"><Calendar /></span>{formatDate(report.created)}</span>
            <span><span className="tp-box tp-box--sm"><Layers /></span>{coursePerformance.length} courses</span>
            <span><span className="tp-box tp-box--sm"><Users /></span>{studentRecords.length} students</span>
          </div>
          <h3 className="tp-h3">Key points</h3>
          <div className="tp-facts">
            <span><span className="tp-box tp-box--sm"><TrendingUp /></span>{shortTitle(best.courseId)}: best completion</span>
            <span><span className="tp-box tp-box--sm tp-box--red"><CircleAlert /></span>{shortTitle(quiet.courseId)}: low activity</span>
            <span><span className="tp-box tp-box--sm"><FileQuestionMark /></span>Quizzes {Math.abs(gap)} pts {gap >= 0 ? 'below' : 'above'} tasks</span>
          </div>
        </div>
      </section>
    </>
  );
}

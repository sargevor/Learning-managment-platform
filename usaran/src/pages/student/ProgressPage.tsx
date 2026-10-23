import { useState } from 'react';
import { BookOpenCheck, ClipboardCheck, Flame, Timer } from 'lucide-react';
import { getEnrolledCourses } from '../../data/enrollments';
import { lessonCount } from '../../data/courses';
import { getGradeRows, getStudentAssignments, getStudentQuizzes, scoreTone } from '../../data/studentView';
import { studentScoreTrend, studentWeeklyMinutes, studentWeeklyTrend } from '../../data/analytics';
import { BarChart, ChartCard, DonutChart, HBarChart, LineChart } from '../../components/charts/Charts';
import { Card, PageHeader, Segmented } from '../../components/ui/Misc';
import { ProgressRing } from '../../components/ui/Progress';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { average, letterGrade, percent } from '../../lib/format';
import { tr } from '../../i18n';

export function ProgressPage() {
  const enrolled = getEnrolledCourses();
  const assignments = getStudentAssignments();
  const quizzes = getStudentQuizzes();
  const grades = getGradeRows().filter((g) => g.percent >= 0);
  const [range, setRange] = useState<'12' | '6'>('12');

  const totalLessons = enrolled.reduce((n, e) => n + lessonCount(e.course), 0);
  const doneLessons = enrolled.reduce((n, e) => n + e.enrollment.completedLessonIds.length, 0);
  const submitted = assignments.filter((a) => a.status === 'submitted' || a.status === 'graded').length;
  const quizTaken = quizzes.filter((q) => q.bestPercent !== undefined);
  const trend = range === '12' ? studentWeeklyTrend : studentWeeklyTrend.slice(-6);
  const totalHours = Math.round(studentWeeklyTrend.reduce((n, p) => n + p.value, 0) / 60);

  return (
    <>
      <PageHeader breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/student/dashboard' }, { label: tr("Progress", "Առաջընթաց") }]} title={tr("My Progress", "Իմ առաջընթացը")} description={tr("An overview of completed lessons, submissions, quiz results, and activity.", "Ընդհանուր պատկեր՝ ավարտված դասեր, հանձնված աշխատանքներ, թեստերի արդյունքներ և ակտիվություն։")} />

      <div className="grid grid-main-aside mb-20">
        <Card>
          <div className="result-hero">
            <ProgressRing value={percent(doneLessons, totalLessons)} size={140} stroke={12} label={tr("overall", "ընդհանուր")} />
            <div className="stack grow" style={{ ['--gap' as string]: '12px', minWidth: 240 }}>
              <h2 style={{ fontSize: 'var(--fs-lg)' }}>{tr(`${doneLessons} of ${totalLessons} lessons completed`, `Ավարտված է ${doneLessons} դաս՝ ${totalLessons}-ից`)}</h2>
              <p className="small secondary">{tr("Includes all ", "Ընդգրկված են բոլոր ")}{enrolled.length}{tr(" courses you are enrolled in. Build a regular learning habit with at least 5 hours a week.", " դասընթացները, որոնց գրանցված եք։ Պահպանեք կանոնավոր ռիթմը՝ շաբաթական առնվազն 5 ժամ։")}</p>
              <div className="row row--wrap" style={{ ['--gap' as string]: '8px' }}>
                {(['completed', 'in-progress', 'not-started'] as const).map((s) => (
                  <span key={s} className="row" style={{ ['--gap' as string]: '6px' }}>
                    <StatusBadge status={s} />
                    <strong className="small">{enrolled.filter((e) => e.state === s).length}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card title={tr("Assignment Completion", "Առաջադրանքների կատարում")}>
          <DonutChart
            size={130}
            thickness={18}
            center={<><div className="ring__value" style={{ fontSize: 22 }}>{percent(submitted, assignments.length)}%</div><div className="xs muted">{tr("submitted", "հանձնված")}</div></>}
            segments={[
              { label: tr("Graded", "Գնահատված"), value: assignments.filter((a) => a.status === 'graded').length, color: 'var(--success-600)' },
              { label: tr("Awaiting Review", "Սպասում է ստուգման"), value: assignments.filter((a) => a.status === 'submitted').length, color: 'var(--warning-600)' },
              { label: tr("To Do", "Կատարման ենթակա"), value: assignments.filter((a) => a.status === 'not-started' || a.status === 'draft').length, color: '#c5cbf3' },
              { label: tr("Overdue", "Ժամկետանց"), value: assignments.filter((a) => a.status === 'overdue').length, color: 'var(--danger-600)' },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-4 mb-20">
        <StatCard label={tr("Completed Lessons", "Ավարտված դասեր")} value={doneLessons} icon={<BookOpenCheck />} meta={tr(`${percent(doneLessons, totalLessons)}% of all lessons`, `${percent(doneLessons, totalLessons)}% բոլոր դասերից`)} />
        <StatCard label={tr("Assignment Completion", "Առաջադրանքների կատարում")} value={percent(submitted, assignments.length)} unit="%" icon={<ClipboardCheck />} tone="navy" meta={tr(`${submitted} / ${assignments.length} submitted`, `${submitted} / ${assignments.length} հանձնված`)} />
        <StatCard label={tr("Quiz Average", "Թեստերի միջին")} value={average(quizTaken.map((q) => q.bestPercent!))} unit="%" icon={<Flame />} tone="success" meta={tr(`${quizTaken.length} quizzes`, `${quizTaken.length} թեստ`)} />
        <StatCard label={tr("Learning Hours", "Ուսման ժամեր")} value={totalHours} unit={tr("hr", "ժ")} icon={<Timer />} tone="warning" meta={tr("over the last 12 weeks", "վերջին 12 շաբաթում")} />
      </div>

      <div className="grid grid-2 mb-20">
        <ChartCard title={tr("Weekly Activity", "Ակտիվություն ըստ շաբաթների")} subtitle={tr("Minutes spent learning", "Ուսմանը տրամադրված րոպեներ")} actions={<Segmented label={tr("Date Range", "Ժամանակահատված")} value={range} onChange={setRange} items={[{ key: '6', label: tr("6 weeks", "6 շաբ.") }, { key: '12', label: tr("12 weeks", "12 շաբ.") }]} />}>
          <LineChart labels={trend.map((p) => p.label)} series={[{ name: tr("Minutes", "Րոպե"), values: trend.map((p) => p.value) }]} suffix={tr(" min", " ր")} ariaLabel={tr("Learning minutes by week", "Ուսման րոպեներն ըստ շաբաթների")} />
        </ChartCard>
        <ChartCard title={tr("Average Grade by Month", "Միջին գնահատականն ըստ ամիսների")} subtitle={tr("Assignments and quizzes combined", "Առաջադրանքներ և թեստեր միասին")}>
          <BarChart labels={studentScoreTrend.map((p) => p.label)} series={[{ name: tr("Average", "Միջին"), values: studentScoreTrend.map((p) => p.value) }]} max={100} suffix="%" highlightLast ariaLabel={tr("Average Grade by Month", "Միջին գնահատականն ըստ ամիսների")} />
        </ChartCard>
      </div>

      <div className="grid grid-main-aside">
        <Card title={tr("Progress by Course", "Առաջընթաց ըստ դասընթացների")}>
          <HBarChart items={enrolled.map((e) => ({ label: e.course.title, value: e.progress, sub: tr(`${e.enrollment.completedLessonIds.length} / ${lessonCount(e.course)} lessons`, `${e.enrollment.completedLessonIds.length} / ${lessonCount(e.course)} դաս`) }))} />
        </Card>
        <ChartCard title={tr("This Week", "Այս շաբաթ")} subtitle={tr("Minutes by day", "Րոպեներ ըստ օրերի")}>
          <BarChart labels={studentWeeklyMinutes.map((p) => p.label)} series={[{ name: tr("Minutes", "Րոպե"), values: studentWeeklyMinutes.map((p) => p.value) }]} height={180} suffix={tr(" min", " ր")} ariaLabel={tr("This Week's Activity", "Այս շաբաթվա ակտիվությունը")} />
        </ChartCard>
      </div>

      <Card title={tr("Grade Summary", "Գնահատականների ամփոփում")} padded={false} className="mt-20">
        <DataTable
          caption={tr("Grades by Course", "Գնահատականներ ըստ դասընթացների")}
          rows={enrolled}
          rowKey={(e) => e.course.id}
          columns={[
            { key: 'c', header: tr("Course", "Դասընթաց"), sortValue: (e) => e.course.title, render: (e) => <span className="cell-title">{e.course.title}</span> },
            { key: 's', header: tr("Status", "Կարգավիճակ"), render: (e) => <StatusBadge status={e.state} /> },
            { key: 'a', header: tr("Assignments", "Առաջադրանքներ"), align: 'right', render: (e) => { const g = grades.filter((x) => x.course.id === e.course.id && x.kind === 'assignment'); return g.length ? `${average(g.map((x) => x.percent))}%` : '—'; } },
            { key: 'q', header: tr("Quizzes", "Թեստեր"), align: 'right', render: (e) => { const g = grades.filter((x) => x.course.id === e.course.id && x.kind === 'quiz'); return g.length ? `${average(g.map((x) => x.percent))}%` : '—'; } },
            {
              key: 'f',
              header: tr("Total", "Ընդհանուր"),
              align: 'right',
              sortValue: (e) => average(grades.filter((x) => x.course.id === e.course.id).map((x) => x.percent)),
              render: (e) => {
                const g = grades.filter((x) => x.course.id === e.course.id);
                if (!g.length) return <span className="muted">—</span>;
                const a = average(g.map((x) => x.percent));
                return <span className={`score-pill score-pill--${scoreTone(a)}`}>{letterGrade(a)}, {a}%</span>;
              },
            },
          ]}
        />
      </Card>
    </>
  );
}

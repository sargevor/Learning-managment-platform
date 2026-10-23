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
      <PageHeader breadcrumbs={[{ label: 'Վահանակ', to: '/student/dashboard' }, { label: 'Առաջընթաց' }]} title="Իմ առաջընթացը" description="Ընդհանուր պատկեր՝ ավարտված դասեր, հանձնված աշխատանքներ, թեստերի արդյունքներ և ակտիվություն։" />

      <div className="grid grid-main-aside mb-20">
        <Card>
          <div className="result-hero">
            <ProgressRing value={percent(doneLessons, totalLessons)} size={140} stroke={12} label="ընդհանուր" />
            <div className="stack grow" style={{ ['--gap' as string]: '12px', minWidth: 240 }}>
              <h2 style={{ fontSize: 'var(--fs-lg)' }}>{doneLessons} դաս ավարտված՝ {totalLessons}-ից</h2>
              <p className="small secondary">Ընդգրկված են բոլոր {enrolled.length} դասընթացները, որոնց գրանցված եք։ Պահպանեք կանոնավոր ռիթմը՝ շաբաթական առնվազն 5 ժամ։</p>
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
        <Card title="Առաջադրանքների կատարում">
          <DonutChart
            size={130}
            thickness={18}
            center={<><div className="ring__value" style={{ fontSize: 22 }}>{percent(submitted, assignments.length)}%</div><div className="xs muted">հանձնված</div></>}
            segments={[
              { label: 'Գնահատված', value: assignments.filter((a) => a.status === 'graded').length, color: 'var(--success-600)' },
              { label: 'Ստուգման մեջ', value: assignments.filter((a) => a.status === 'submitted').length, color: 'var(--warning-600)' },
              { label: 'Կատարման ենթակա', value: assignments.filter((a) => a.status === 'not-started' || a.status === 'draft').length, color: '#c5cbf3' },
              { label: 'Ժամկետանց', value: assignments.filter((a) => a.status === 'overdue').length, color: 'var(--danger-600)' },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-4 mb-20">
        <StatCard label="Ավարտված դասեր" value={doneLessons} icon={<BookOpenCheck />} meta={`${percent(doneLessons, totalLessons)}% բոլոր դասերից`} />
        <StatCard label="Առաջադրանքների կատարում" value={percent(submitted, assignments.length)} unit="%" icon={<ClipboardCheck />} tone="navy" meta={`${submitted} / ${assignments.length} հանձնված`} />
        <StatCard label="Թեստերի միջին" value={average(quizTaken.map((q) => q.bestPercent!))} unit="%" icon={<Flame />} tone="success" meta={`${quizTaken.length} թեստ`} />
        <StatCard label="Ուսման ժամեր" value={totalHours} unit="ժ" icon={<Timer />} tone="warning" meta="վերջին 12 շաբաթում" />
      </div>

      <div className="grid grid-2 mb-20">
        <ChartCard title="Ակտիվություն ըստ շաբաթների" subtitle="Ուսմանը տրամադրված րոպեներ" actions={<Segmented label="Ժամանակահատված" value={range} onChange={setRange} items={[{ key: '6', label: '6 շաբ.' }, { key: '12', label: '12 շաբ.' }]} />}>
          <LineChart labels={trend.map((p) => p.label)} series={[{ name: 'Րոպե', values: trend.map((p) => p.value) }]} suffix=" ր" ariaLabel="Ուսման րոպեները ըստ շաբաթների" />
        </ChartCard>
        <ChartCard title="Միջին գնահատականը ըստ ամիսների" subtitle="Առաջադրանքներ և թեստեր միասին">
          <BarChart labels={studentScoreTrend.map((p) => p.label)} series={[{ name: 'Միջին', values: studentScoreTrend.map((p) => p.value) }]} max={100} suffix="%" highlightLast ariaLabel="Միջին գնահատականը ըստ ամիսների" />
        </ChartCard>
      </div>

      <div className="grid grid-main-aside">
        <Card title="Առաջընթաց ըստ դասընթացների">
          <HBarChart items={enrolled.map((e) => ({ label: e.course.title, value: e.progress, sub: `${e.enrollment.completedLessonIds.length} / ${lessonCount(e.course)} դաս` }))} />
        </Card>
        <ChartCard title="Այս շաբաթ" subtitle="Րոպեներ ըստ օրերի">
          <BarChart labels={studentWeeklyMinutes.map((p) => p.label)} series={[{ name: 'Րոպե', values: studentWeeklyMinutes.map((p) => p.value) }]} height={180} suffix=" ր" ariaLabel="Այս շաբաթվա ակտիվությունը" />
        </ChartCard>
      </div>

      <Card title="Գնահատականների ամփոփում" padded={false} className="mt-20">
        <DataTable
          caption="Գնահատականներ ըստ դասընթացների"
          rows={enrolled}
          rowKey={(e) => e.course.id}
          columns={[
            { key: 'c', header: 'Դասընթաց', sortValue: (e) => e.course.title, render: (e) => <span className="cell-title">{e.course.title}</span> },
            { key: 's', header: 'Կարգավիճակ', render: (e) => <StatusBadge status={e.state} /> },
            { key: 'a', header: 'Առաջադրանքներ', align: 'right', render: (e) => { const g = grades.filter((x) => x.course.id === e.course.id && x.kind === 'assignment'); return g.length ? `${average(g.map((x) => x.percent))}%` : '—'; } },
            { key: 'q', header: 'Թեստեր', align: 'right', render: (e) => { const g = grades.filter((x) => x.course.id === e.course.id && x.kind === 'quiz'); return g.length ? `${average(g.map((x) => x.percent))}%` : '—'; } },
            {
              key: 'f',
              header: 'Ընդհանուր',
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

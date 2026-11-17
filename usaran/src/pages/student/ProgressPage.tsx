import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Calendar, ChartColumn, ClipboardCheck, Flame, GraduationCap, Lock, Play, Sparkles, Star, Target, Timer, Trophy } from 'lucide-react';
import { getEnrolledCourses } from '../../data/enrollments';
import { lessonCount } from '../../data/courses';
import { getGradeRows, getStudentQuizzes } from '../../data/studentView';
import { studentWeeklyMinutes, studentWeeklyTrend } from '../../data/analytics';
import { ShellTitle } from '../../components/layout/AppShell';
import { Ring } from '../../components/ui/Visual';
import { average, cx, WEEKDAYS_SHORT } from '../../lib/format';

/* Heat-grid shades: grey track, then the blues, then navy. */
const SHADES = ['var(--track)', 'var(--blue-200)', 'var(--blue-300)', 'var(--periwinkle)', 'var(--accent-600)', 'var(--navy-900)'];
const level = (m: number) => (m === 0 ? 0 : m <= 25 ? 1 : m <= 45 ? 2 : m <= 65 ? 3 : m <= 85 ? 4 : 5);

/**
 * Daily minutes for the heat grid. The weekly totals are the real `studentWeeklyTrend` values and the
 * current week is the real `studentWeeklyMinutes`; how earlier weeks split into days is ILLUSTRATIVE
 * (deterministic pseudo-random split of each real weekly total, same method as the approved design).
 */
function dailyGrid(): number[][] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const totals = studentWeeklyTrend.map((p) => p.value);
  return totals.map((t, w) => {
    if (w === totals.length - 1) return studentWeeklyMinutes.map((p) => p.value);
    const wts = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const r = rand();
      return r < 0.2 ? 0 : r + (d < 5 ? 0.4 : 0);
    });
    const sum = wts.reduce((a, b) => a + b, 0) || 1;
    return wts.map((x) => Math.round((t * x) / sum));
  });
}

/** Month label shown above the first week that starts in that month. */
function monthLabels(): string[] {
  let last = '';
  return studentWeeklyTrend.map((p) => {
    const m = p.label.split(' ')[0];
    if (m === last) return '';
    last = m;
    return m;
  });
}

export function ProgressPage() {
  const enrolled = getEnrolledCourses();
  const quizzes = getStudentQuizzes();
  const grades = getGradeRows().filter((g) => g.percent >= 0);
  const [range, setRange] = useState<'12' | '6'>('12');

  const totalLessons = enrolled.reduce((n, e) => n + lessonCount(e.course), 0);
  const doneLessons = enrolled.reduce((n, e) => n + e.enrollment.completedLessonIds.length, 0);
  const quizTaken = quizzes.filter((q) => q.bestPercent !== undefined);
  const totalMinutes = studentWeeklyTrend.reduce((n, p) => n + p.value, 0);
  const totalHours = Math.round(totalMinutes / 60);

  /* Heat grid */
  const daily = dailyGrid();
  const months = monthLabels();
  const flat = daily.flat();
  const activeDays = flat.filter((m) => m > 0).length;
  const bestDay = Math.max(...flat);

  /* Weekly bars */
  const weeks = range === '12' ? studentWeeklyTrend : studentWeeklyTrend.slice(-6);
  const weekMonths = range === '12' ? months : months.slice(-6);
  const maxWeek = Math.max(...weeks.map((w) => w.value));
  const thisWeek = studentWeeklyTrend[studentWeeklyTrend.length - 1].value;
  const avgWeek = average(weeks.map((w) => w.value));

  /* Achievements, all derived from real demo facts */
  const completedCourses = enrolled.filter((e) => e.state === 'completed').length;
  const quizAvg = average(quizTaken.map((q) => q.bestPercent!));
  const badges = [
    { name: 'Perfect score', icon: Star, on: quizTaken.some((q) => q.bestPercent === 100) },
    { name: 'First finish', icon: Trophy, on: completedCourses >= 1 },
    { name: '50 hours', icon: Timer, on: totalHours >= 50 },
    { name: 'Top task', icon: ClipboardCheck, on: grades.some((g) => g.kind === 'assignment' && g.percent >= 95) },
    { name: 'Quiz ace', icon: Target, on: quizTaken.length > 0 && quizAvg >= 90 },
    { name: 'Three courses', icon: GraduationCap, on: completedCourses >= 3 },
  ];
  const earned = badges.filter((b) => b.on).length;

  return (
    <>
      <ShellTitle
        title="My progress"
        meta={
          <>
            <BookOpen aria-hidden="true" />
            <b>{doneLessons} of {totalLessons} lessons</b>
            <span className="sr-dot" aria-hidden="true" />
            {completedCourses} courses done
          </>
        }
      />

      <section className="sr-grid-3">
        <div className="sr-card sr-span2 sr-col">
          <div className="sr-card__head sr-card__head--flush">
            <h2 className="sr-h2">Study activity</h2>
            <div className="sr-legend" aria-hidden="true">
              Less
              {SHADES.map((c) => <span key={c} style={{ background: c }} />)}
              More
            </div>
          </div>
          <div className="sr-heat-wrap">
            <div className="sr-heat" role="img" aria-label={`Daily study minutes over the last ${daily.length} weeks`}>
              <span />
              {months.map((m, i) => <span key={`m${i}`} className="sr-heat__label">{m}</span>)}
              {WEEKDAYS_SHORT.map((d, di) => (
                <HeatRow key={d} day={d} showLabel={di % 2 === 0 && di < 6} values={daily.map((w) => w[di])} weeks={studentWeeklyTrend.map((p) => p.label)} />
              ))}
            </div>
            <div className="sr-heat-stats">
              <div className="sr-mini">
                <span className="sr-mini__icon"><Calendar aria-hidden="true" /></span>
                <span className="sr-minw"><b>{activeDays}<small>/{flat.length}</small></b><span>Active days</span></span>
              </div>
              <div className="sr-mini">
                <span className="sr-mini__icon"><Flame aria-hidden="true" /></span>
                <span className="sr-minw"><b>{bestDay}<small> min</small></b><span>Best day</span></span>
              </div>
              <div className="sr-mini">
                <span className="sr-mini__icon"><Timer aria-hidden="true" /></span>
                <span className="sr-minw"><b>{totalHours}<small> h</small></b><span>Total</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="sr-card sr-col">
          <div className="sr-card__head sr-card__head--flush">
            <h2 className="sr-h2">Weekly minutes</h2>
            <div className="sr-seg sr-seg--sm" role="group" aria-label="Period">
              <button type="button" aria-pressed={range === '6'} onClick={() => setRange('6')}>6 w</button>
              <button type="button" aria-pressed={range === '12'} onClick={() => setRange('12')}>12 w</button>
            </div>
          </div>
          <div className="sr-week-top">
            <div className="sr-week-big"><b>{thisWeek}</b><span>min this week</span></div>
            <span className="sr-week-avg"><ChartColumn aria-hidden="true" />Avg {avgWeek}</span>
          </div>
          <div className="sr-weekbars" role="img" aria-label={`Minutes per week, last ${weeks.length} weeks: ${weeks.map((w) => w.value).join(', ')}`} style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {weeks.map((w, i) => (
              <div key={w.label} className="sr-weekbars__col" title={`${w.label}: ${w.value} min`}>
                <div className={cx('sr-weekbars__bar', i === weeks.length - 1 && 'is-last')} style={{ height: `${Math.round((w.value / maxWeek) * 100)}%` }} />
                <span>{weekMonths[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sr-grid-3 sr-grid-3--start">
        <div className="sr-card sr-span2">
          <h2 className="sr-h2 sr-mb14">By course</h2>
          <div className="sr-pcourses">
            {enrolled.map((e) => {
              const done = e.enrollment.completedLessonIds.length;
              const st = e.state === 'completed' ? { label: 'Done', icon: Trophy } : e.state === 'not-started' ? { label: 'New', icon: Sparkles } : { label: 'Active', icon: Play };
              const StIcon = st.icon;
              return (
                <Link key={e.course.id} to={`/student/courses/${e.course.id}/learn`} className="sr-pcourse v-lift">
                  <img src={e.course.image} alt="" className={cx(e.progress === 0 && 'is-new')} />
                  <span className="sr-pcourse__main">
                    <span className="sr-ellipsis sr-strong">{e.course.title}</span>
                    <span className="sr-pcourse__meta">
                      <span><BookOpen aria-hidden="true" />{done}/{lessonCount(e.course)}</span>
                      <span><StIcon aria-hidden="true" />{st.label}</span>
                    </span>
                  </span>
                  <Ring value={e.progress} size={56} thickness={7} color={e.progress >= 100 ? 'var(--navy-900)' : 'var(--accent-600)'} track="var(--border)" inner="var(--bg)" label={e.course.title} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sr-card">
          <div className="sr-card__head sr-card__head--flush sr-mb14">
            <h2 className="sr-h2">Achievements</h2>
            <span className="sr-week-avg"><Award aria-hidden="true" />{earned}/{badges.length}</span>
          </div>
          <ul className="sr-badges">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.name} className={cx('sr-badge', !b.on && 'is-locked')}>
                  <span className="sr-badge__circle">
                    <Icon aria-hidden="true" />
                    {!b.on && <span className="sr-badge__lock" aria-label="Locked"><Lock /></span>}
                  </span>
                  <span className="sr-badge__name">{b.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

function HeatRow({ day, showLabel, values, weeks }: { day: string; showLabel: boolean; values: number[]; weeks: string[] }) {
  return (
    <>
      <span className="sr-heat__label">{showLabel ? day : ''}</span>
      {values.map((m, w) => (
        <span key={w} className="sr-heat__cell" title={`${day}, week of ${weeks[w]}: ${m} min`} style={{ background: SHADES[level(m)] }} />
      ))}
    </>
  );
}

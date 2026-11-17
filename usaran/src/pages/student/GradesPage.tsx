import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Award, Check, CircleCheck, CircleX, ClipboardList, Clock, FileQuestionMark, Layers, MessageSquareText, Search } from 'lucide-react';
import { getGradeRows, type GradeRow } from '../../data/studentView';
import { getEnrolledCourses } from '../../data/enrollments';
import { ShellTitle } from '../../components/layout/AppShell';
import { EmptyState } from '../../components/ui/Misc';
import { average, cx, formatShortDate, letterGrade } from '../../lib/format';

type Kind = 'all' | 'assignment' | 'quiz';
type SortKey = 'date' | 'score';

const STATUS: Record<string, { label: string; icon: typeof Check; tone: 'blue' | 'grey' }> = {
  graded: { label: 'Graded', icon: Check, tone: 'blue' },
  passed: { label: 'Passed', icon: CircleCheck, tone: 'blue' },
  failed: { label: 'Not passed', icon: CircleX, tone: 'grey' },
  submitted: { label: 'In review', icon: Clock, tone: 'grey' },
};

export function GradesPage() {
  const rows = getGradeRows();
  const graded = rows.filter((r) => r.percent >= 0);
  const pending = rows.filter((r) => r.status === 'submitted').length;
  const [kind, setKind] = useState<Kind>('all');
  const [course, setCourse] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' });

  const filtered = useMemo(() => {
    const list = rows.filter((r) => (kind === 'all' || r.kind === kind) && (course === 'all' || r.course.id === course) && (!q.trim() || r.title.toLowerCase().includes(q.trim().toLowerCase())));
    const val = (r: GradeRow) => (sort.key === 'date' ? r.date : r.percent);
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const c = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
      return sort.dir === 'asc' ? c : -c;
    });
  }, [rows, kind, course, q, sort]);

  const overall = average(graded.map((r) => r.percent));
  const taskAvg = average(graded.filter((r) => r.kind === 'assignment').map((r) => r.percent));
  const quizAvg = average(graded.filter((r) => r.kind === 'quiz').map((r) => r.percent));

  const courses = getEnrolledCourses().filter((e) => e.state !== 'not-started');
  const byCourse = courses
    .map(({ course: c }) => {
      const cr = graded.filter((r) => r.course.id === c.id);
      return { course: c, n: cr.length, avg: average(cr.map((r) => r.percent)) };
    })
    .filter((c) => c.n > 0)
    .sort((a, b) => b.avg - a.avg);
  const filterCourses = courses.filter((e) => rows.some((r) => r.course.id === e.course.id));

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const sortIcon = (key: SortKey) => (sort.key === key ? sort.dir === 'asc' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" /> : null);
  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none');

  return (
    <>
      <ShellTitle
        title="Grades"
        meta={
          <>
            <Check aria-hidden="true" />
            <b>{graded.length} graded</b>
            <span className="sr-dot" aria-hidden="true" />
            {pending} in review
          </>
        }
      />

      <section className="sr-grades-hero">
        <div className="sr-overall">
          <div className="sr-overall__top">
            <div className="sr-overall__ring" role="img" aria-label={`Overall ${overall}%, grade ${letterGrade(overall)}`} style={{ background: `conic-gradient(var(--surface) 0 ${overall}%, rgba(255,255,255,.16) 0)` }}>
              <div className="sr-overall__ring-inner">
                <Award aria-hidden="true" />
                <b>{letterGrade(overall)}</b>
              </div>
            </div>
            <div className="sr-minw">
              <div className="sr-overall__value"><b>{overall}</b><span>%</span></div>
              <div className="sr-overall__label">Overall average</div>
            </div>
          </div>
          <div className="sr-overall__split">
            <div><ClipboardList aria-hidden="true" /><b>{taskAvg}%</b><span>Tasks</span></div>
            <div><FileQuestionMark aria-hidden="true" /><b>{quizAvg}%</b><span>Quizzes</span></div>
            <div><Clock aria-hidden="true" /><b>{pending}</b><span>In review</span></div>
          </div>
        </div>

        <div className="sr-card sr-span2">
          <h2 className="sr-h2 sr-mb6">By course</h2>
          <div className="sr-bycourse">
            {byCourse.map((c) => (
              <button key={c.course.id} type="button" className={cx('sr-bycourse__row', course === c.course.id && 'is-on')} aria-pressed={course === c.course.id} onClick={() => setCourse(course === c.course.id ? 'all' : c.course.id)}>
                <img src={c.course.image} alt="" />
                <span className="sr-bycourse__main">
                  <span className="sr-bycourse__top">
                    <span className="sr-ellipsis sr-strong">{c.course.title}</span>
                    <span className="sr-bycourse__n" title="Graded items"><Check aria-hidden="true" />{c.n}</span>
                  </span>
                  <span className="sr-bar"><span style={{ width: `${c.avg}%` }} /></span>
                </span>
                <b className="sr-bycourse__avg">{c.avg}<span>%</span></b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sr-card" aria-labelledby="all-title">
        <div className="sr-card__head">
          <h2 id="all-title" className="sr-h2">All grades</h2>
          <div className="sr-filters" role="group" aria-label="Filter by course">
            <button type="button" className="sr-fchip" aria-pressed={course === 'all'} onClick={() => setCourse('all')}>
              <Layers aria-hidden="true" className="sr-fchip__icon" />All<span className="sr-fchip__n">{rows.length}</span>
            </button>
            {filterCourses.map(({ course: c }) => (
              <button key={c.id} type="button" className="sr-fchip" aria-pressed={course === c.id} onClick={() => setCourse(c.id)} title={c.title}>
                <img src={c.image} alt="" />
                <span className="sr-fchip__label">{c.title}</span>
                <span className="sr-fchip__n">{rows.filter((r) => r.course.id === c.id).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sr-toolbar">
          <label className="sr-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
          </label>
          <div className="sr-seg" role="group" aria-label="Type">
            <button type="button" aria-pressed={kind === 'all'} onClick={() => setKind('all')}><Layers aria-hidden="true" />All</button>
            <button type="button" aria-pressed={kind === 'assignment'} onClick={() => setKind('assignment')}><ClipboardList aria-hidden="true" />Tasks</button>
            <button type="button" aria-pressed={kind === 'quiz'} onClick={() => setKind('quiz')}><FileQuestionMark aria-hidden="true" />Quizzes</button>
          </div>
        </div>

        <div className="sr-table-wrap">
          <div role="table" aria-label="Grades" className="sr-table">
            <div role="row" className="sr-trow sr-trow--head">
              <span role="columnheader">Item</span>
              <span role="columnheader">Course</span>
              <span role="columnheader" aria-sort={ariaSort('date')}>
                <button type="button" className="sr-sort" onClick={() => toggleSort('date')}>Date{sortIcon('date')}</button>
              </span>
              <span role="columnheader" aria-sort={ariaSort('score')}>
                <button type="button" className="sr-sort" onClick={() => toggleSort('score')}>Score{sortIcon('score')}</button>
              </span>
              <span role="columnheader">Status</span>
            </div>
            {filtered.length === 0 ? (
              <EmptyState compact icon={<Search size={22} />} title="Nothing found" />
            ) : (
              filtered.map((r) => {
                const st = STATUS[r.status] ?? STATUS.graded;
                const StIcon = st.icon;
                return (
                  <Link key={r.kind + r.id} to={r.to} role="row" className="sr-trow">
                    <span role="cell" className="sr-tcell-item">
                      <span className="sr-ibox" aria-hidden="true">{r.kind === 'quiz' ? <FileQuestionMark /> : <ClipboardList />}</span>
                      <span className="sr-ellipsis sr-strong">{r.title}</span>
                      {r.feedback && (
                        <span className="sr-fb" title={r.feedback}>
                          <MessageSquareText aria-hidden="true" />
                          <span className="sr-only">Feedback: {r.feedback}</span>
                        </span>
                      )}
                    </span>
                    <span role="cell" className="sr-tcell-course">
                      <img src={r.course.image} alt="" />
                      <span className="sr-ellipsis">{r.course.title}</span>
                    </span>
                    <span role="cell" className="sr-tcell-date">{formatShortDate(r.date)}</span>
                    <span role="cell" className="sr-tcell-score">
                      {r.percent < 0 ? (
                        <span className="sr-dash">–</span>
                      ) : (
                        <>
                          <b>{r.score}<span>/{r.max}</span></b>
                          <span className="sr-bar sr-bar--thin"><span style={{ width: `${r.percent}%` }} /></span>
                        </>
                      )}
                    </span>
                    <span role="cell">
                      <span className={cx('sr-chip', 'sr-chip--lg', st.tone === 'blue' && 'sr-chip--blue')}><StIcon aria-hidden="true" />{st.label}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

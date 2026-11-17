import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Atom, ChartLine, ChevronRight, CircleAlert, CircleCheck, Clock, CodeXml, Database, Download, EyeOff, Layers, Search, Target, Users } from 'lucide-react';
import type { StudentRecord } from '../../types';
import { studentRecords } from '../../data/analytics';
import { getCourse } from '../../data/courses';
import { teacherCourses, shortTitle } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { Avatar, EmptyState, Pagination } from '../../components/ui/Misc';
import { StatusBadge } from '../../components/ui/Badge';
import { Meter } from '../../components/ui/Visual';
import { CATEGORY_ICONS } from '../../lib/visual';
import { average, cx, TODAY } from '../../lib/format';

const PAGE = 8;

const COURSE_ICONS: Record<string, typeof Atom> = { react: Atom, js: CodeXml, 'python-data': ChartLine, sql: Database };

/** Course icon: fixed icons for the teacher's courses, category icon otherwise. */
export function CourseIcon({ id }: { id: string }) {
  const course = getCourse(id);
  const I = COURSE_ICONS[id] ?? (course ? CATEGORY_ICONS[course.category] : Layers);
  return <I aria-hidden="true" />;
}

/** Short "2 h" / "3 d" label for the last activity. */
export function shortAgo(v: string): string {
  const min = Math.max(0, Math.round((TODAY.getTime() - new Date(v).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

type SortKey = 'name' | 'progress' | 'avg' | 'last';
type Status = 'all' | StudentRecord['status'];

export function TeacherStudentsPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState<Status>('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);

  const published = teacherCourses.filter((c) => c.status === 'published');

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = studentRecords.filter((r) => {
      const u = getUser(r.userId);
      return (course === 'all' || r.courseIds.includes(course)) && (status === 'all' || r.status === status) && (!term || fullName(u).toLowerCase().includes(term) || (u?.email ?? '').includes(term));
    });
    if (!sort) return list;
    const val = (r: StudentRecord): string | number =>
      sort.key === 'name' ? fullName(getUser(r.userId)) : sort.key === 'progress' ? r.progress : sort.key === 'avg' ? r.avgScore : r.lastActive;
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [q, course, status, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pageCount);
  const reset = () => setPage(1);

  const byStatus = (s: StudentRecord['status']) => studentRecords.filter((r) => r.status === s);
  const tiles: { key: Status; label: string; icon: typeof Users; tone: string; list: StudentRecord[] }[] = [
    { key: 'all', label: 'Students', icon: Users, tone: '', list: studentRecords },
    { key: 'active', label: 'Active', icon: CircleCheck, tone: 'tp-tile__icon--blue', list: byStatus('active') },
    { key: 'at-risk', label: 'At risk', icon: CircleAlert, tone: 'tp-tile__icon--red', list: byStatus('at-risk') },
    { key: 'inactive', label: 'Inactive', icon: EyeOff, tone: '', list: byStatus('inactive') },
  ];

  const toggleSort = (key: SortKey) => setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));
  const sortHead = (key: SortKey, label: string, right?: boolean) => {
    const on = sort?.key === key;
    return (
      <span role="columnheader" aria-sort={on ? (sort!.dir === 1 ? 'ascending' : 'descending') : 'none'} className={cx(right && 'tp-right')}>
        <button type="button" className="tp-sort" onClick={() => toggleSort(key)}>
          {label}
          {on && (sort!.dir === 1 ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />)}
        </button>
      </span>
    );
  };

  return (
    <>
      <ShellTitle
        title="Students"
        meta={
          <>
            <Users aria-hidden="true" />
            <b>{studentRecords.length} students</b>
            <span className="tp-dot" aria-hidden="true" />
            {published.length} courses
          </>
        }
      />

      <section aria-label="Summary" className="tp-tiles">
        {tiles.map((t) => {
          const faces = t.key === 'at-risk' || t.key === 'inactive' ? t.list.slice(0, 3) : [];
          return (
            <button
              key={t.key}
              type="button"
              className={cx('tp-tile', status === t.key && 'tp-tile--on')}
              aria-pressed={status === t.key}
              onClick={() => { setStatus(t.key); reset(); }}
            >
              <span className={cx('tp-tile__icon', t.tone)} aria-hidden="true"><t.icon /></span>
              <span className="tp-tile__main">
                <span className="tp-tile__value">{t.list.length}</span>
                <span className="tp-tile__label">{t.label}</span>
              </span>
              {faces.length > 0 && (
                <span className="tp-faces" aria-hidden="true">
                  {faces.map((r) => {
                    const u = getUser(r.userId);
                    return <span key={r.userId} className={cx('tp-face', t.key === 'at-risk' && 'tp-face--red')}>{(u?.firstName[0] ?? '') + (u?.lastName[0] ?? '')}</span>;
                  })}
                </span>
              )}
            </button>
          );
        })}
      </section>

      <section aria-label="Student list" className="tp-card tp-list">
        <div className="tp-toolbar">
          <label className="tp-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search students</span>
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Name or email" />
          </label>
          <div role="group" aria-label="Course" className="tp-filters">
            {[{ id: 'all', label: 'All' }, ...published.map((c) => ({ id: c.id, label: shortTitle(c.id) }))].map((f) => {
              const on = course === f.id;
              const count = f.id === 'all' ? studentRecords.length : studentRecords.filter((r) => r.courseIds.includes(f.id)).length;
              return (
                <button key={f.id} type="button" aria-pressed={on} className={cx('tp-filter', on && 'tp-filter--on')} onClick={() => { setCourse(f.id); reset(); }}>
                  {f.id === 'all' ? <Layers aria-hidden="true" /> : <CourseIcon id={f.id} />}
                  {f.label}
                  <span className="tp-filter__count">{count}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="tp-btn tp-btn--secondary" onClick={() => toast.info('Export', 'No file is created in the demo.')}>
            <Download aria-hidden="true" />
            Export
          </button>
        </div>

        <div className="tp-scroll">
          <div role="table" aria-label="Students" className="tp-table">
            <div role="row" className="tp-row tp-row--head">
              {sortHead('name', 'Student')}
              <span role="columnheader">Courses</span>
              {sortHead('progress', 'Progress')}
              {sortHead('avg', 'Average', true)}
              {sortHead('last', 'Last active')}
              <span role="columnheader">Status</span>
              <span aria-hidden="true" />
            </div>
            {rows.length === 0 ? (
              <EmptyState icon={<Users size={24} />} title="No students found" text="Try another search." />
            ) : (
              rows.slice((current - 1) * PAGE, current * PAGE).map((r) => {
                const name = fullName(getUser(r.userId));
                return (
                  <Link key={r.userId} role="row" to={`/teacher/students/${r.userId}`} className="tp-row tp-row--link">
                    <span role="cell" className="tp-person">
                      <Avatar name={name} size={40} />
                      <span className="tp-ellipsis">{name}</span>
                    </span>
                    <span role="cell" className="tp-chips">
                      {r.courseIds.map((c) => (
                        <span key={c} className="tp-chip"><CourseIcon id={c} />{shortTitle(c)}</span>
                      ))}
                    </span>
                    <span role="cell" className="tp-progress">
                      <Meter value={r.progress} label={`${name} progress`} />
                      <b>{r.progress}%</b>
                    </span>
                    <span role="cell" className="tp-right tp-avg">{r.avgScore}<small>%</small></span>
                    <span role="cell" className="tp-last"><Clock aria-hidden="true" />{shortAgo(r.lastActive)}</span>
                    <span role="cell">{r.status !== 'active' && <StatusBadge status={r.status} />}</span>
                    <ChevronRight className="tp-chev" aria-hidden="true" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="tp-list__foot">
          <span className="tp-chip tp-chip--lg"><Users aria-hidden="true" />{rows.length} shown</span>
          <span className="tp-chip tp-chip--lg tp-chip--blue"><Target aria-hidden="true" />Average {average(rows.map((r) => r.avgScore))}%</span>
          {pageCount > 1 && (
            <div className="tp-list__pages">
              <Pagination page={current} pageCount={pageCount} onChange={setPage} total={rows.length} pageSize={PAGE} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Check, ChevronRight, CircleAlert, ClipboardCheck, ClipboardList, Clock, FileText, Layers, Send, Sparkles } from 'lucide-react';
import type { AssignmentStatus } from '../../types';
import { getStudentAssignments, type StudentAssignment } from '../../data/studentView';
import { getEnrolledCourses } from '../../data/enrollments';
import { ShellTitle } from '../../components/layout/AppShell';
import { EmptyState, Tabs } from '../../components/ui/Misc';
import { SearchBar } from '../../components/ui/SearchBar';
import { Chip, DateBlock, Ring } from '../../components/ui/Visual';
import { daysUntil, percent, TODAY } from '../../lib/format';
import { CATEGORY_ICONS } from '../../lib/visual';

type Filter = 'all' | 'todo' | 'submitted' | 'graded' | 'overdue';

const MATCH: Record<Filter, AssignmentStatus[]> = {
  all: ['not-started', 'draft', 'submitted', 'graded', 'overdue'],
  todo: ['not-started', 'draft'],
  submitted: ['submitted'],
  graded: ['graded'],
  overdue: ['overdue'],
};

const STATUS: Record<AssignmentStatus, { label: string; icon: typeof Check; tone: 'grey' | 'blue' | 'red' }> = {
  'not-started': { label: 'New', icon: Sparkles, tone: 'grey' },
  draft: { label: 'Draft', icon: FileText, tone: 'grey' },
  submitted: { label: 'Submitted', icon: Send, tone: 'grey' },
  graded: { label: 'Graded', icon: Check, tone: 'blue' },
  overdue: { label: 'Overdue', icon: CircleAlert, tone: 'red' },
};

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Group {
  key: string;
  title: string;
  icon: typeof Check;
  red?: boolean;
  items: StudentAssignment[];
}

function Row({ a }: { a: StudentAssignment }) {
  const s = STATUS[a.status];
  const open = a.status === 'not-started' || a.status === 'draft';
  const left = daysUntil(a.assignment.dueDate);
  const urgent = open && left <= 2;
  const CatIcon = CATEGORY_ICONS[a.course.category];
  const graded = a.status === 'graded' && a.submission?.score !== undefined;
  return (
    <Link to={`/student/assignments/${a.assignment.id}`} className="sl-arow">
      <DateBlock date={a.assignment.dueDate} urgent={urgent || a.status === 'overdue'} />
      <img src={a.course.image} alt="" className="sl-arow__img" loading="lazy" />
      <span className="sl-arow__text">
        <span className="sl-arow__title">{a.assignment.title}</span>
        <span className="sl-arow__course">
          <CatIcon aria-hidden="true" />
          <span>{a.course.title}</span>
        </span>
      </span>
      <Chip tone={s.tone} className="sl-arow__status" icon={<s.icon aria-hidden="true" />}>{s.label}</Chip>
      {open && (
        <Chip tone={urgent ? 'red' : 'grey'} className="sl-arow__left" icon={<Clock aria-hidden="true" />}>
          {left === 0 ? 'Today' : `${left} d`}
        </Chip>
      )}
      {graded && (
        <Ring value={percent(a.submission!.score!, a.assignment.maxScore)} size={52} thickness={6} label={`Score ${a.submission!.score} of ${a.assignment.maxScore}`}>
          {a.submission!.score}
        </Ring>
      )}
      <ChevronRight aria-hidden="true" className="sl-arow__chev" />
    </Link>
  );
}

export function StudentAssignmentsPage() {
  const all = getStudentAssignments();
  const [filter, setFilter] = useState<Filter>('all');
  const [course, setCourse] = useState('all');
  const [q, setQ] = useState('');

  const list = useMemo(
    () =>
      all.filter(
        (a) =>
          MATCH[filter].includes(a.status) &&
          (course === 'all' || a.course.id === course) &&
          (!q.trim() || a.assignment.title.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [all, filter, course, q],
  );

  const count = (f: Filter) => all.filter((a) => MATCH[f].includes(a.status)).length;

  const open = list.filter((a) => a.status === 'not-started' || a.status === 'draft');
  const left: Group[] = [
    { key: 'overdue', title: 'Overdue', icon: CircleAlert, red: true, items: list.filter((a) => a.status === 'overdue') },
    { key: 'week', title: 'This week', icon: Calendar, items: open.filter((a) => daysUntil(a.assignment.dueDate) <= 7) },
    { key: 'later', title: 'Later', icon: Clock, items: open.filter((a) => daysUntil(a.assignment.dueDate) > 7) },
  ].filter((g) => g.items.length > 0);
  const right: Group[] = [
    {
      key: 'done',
      title: 'Handed in',
      icon: Send,
      items: list.filter((a) => a.status === 'submitted' || a.status === 'graded').sort((x, y) => y.assignment.dueDate.localeCompare(x.assignment.dueDate)),
    },
  ].filter((g) => g.items.length > 0);
  const columns = [left, right].filter((c) => c.length > 0);

  return (
    <>
      <ShellTitle
        title="Assignments"
        meta={
          <>
            <Calendar aria-hidden="true" />
            <b>Today</b>
            <span className="sl-dot" aria-hidden="true" />
            {WEEKDAYS_LONG[TODAY.getDay()]}, {TODAY.getDate()} {MONTHS_LONG[TODAY.getMonth()]}
          </>
        }
      />

      <section aria-label="Filter assignments" className="sl-filters">
        <Tabs
          value={filter}
          onChange={setFilter}
          label="Assignment status"
          items={[
            { key: 'all', label: 'All', count: all.length, icon: <Layers /> },
            { key: 'todo', label: 'To do', count: count('todo'), icon: <ClipboardList /> },
            { key: 'submitted', label: 'Submitted', count: count('submitted'), icon: <Send /> },
            { key: 'graded', label: 'Graded', count: count('graded'), icon: <Check /> },
            { key: 'overdue', label: 'Overdue', count: count('overdue'), icon: <CircleAlert /> },
          ]}
        />
        <div className="sl-filters__right">
          <SearchBar value={q} onChange={setQ} placeholder="Search by title" label="Search by title" className="sl-filters__search" />
          <label className="sl-sort">
            <span className="sr-only">Course</span>
            <BookOpen aria-hidden="true" />
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="all">All courses</option>
              {getEnrolledCourses().map((e) => (
                <option key={e.course.id} value={e.course.id}>{e.course.title}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {list.length === 0 ? (
        <div className="sl-card">
          <EmptyState icon={<ClipboardCheck size={24} />} title={filter === 'todo' ? 'All handed in' : 'No assignments'} />
        </div>
      ) : (
        <section className="sl-agroups">
          {columns.map((col, ci) => (
            <div key={ci} className="sl-agroups__col">
              {col.map((g) => (
                <div key={g.key} className="sl-card sl-agroup">
                  <h2>
                    <g.icon aria-hidden="true" className={g.red ? 'is-red' : undefined} />
                    {g.title}
                  </h2>
                  <div className="sl-agroup__list">
                    {g.items.map((a) => (
                      <Row key={a.assignment.id} a={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

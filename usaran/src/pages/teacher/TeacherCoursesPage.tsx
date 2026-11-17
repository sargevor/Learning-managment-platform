import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen, ChevronDown, CircleCheck, Clock, Ellipsis, Eye, EyeOff, FileText, Layers, Pencil, Plus, Search, Send,
  SlidersHorizontal, Star, Trash2, Users,
} from 'lucide-react';
import type { Course, CourseStatus } from '../../types';
import { teacherCourses } from '../../data/teacherView';
import { difficultyLabel, lessonCount } from '../../data/courses';
import { coursePerformance } from '../../data/analytics';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState, Tabs, Thumb } from '../../components/ui/Misc';
import { ConfirmDialog, Dropdown } from '../../components/ui/Overlay';
import { CATEGORY_ICONS } from '../../lib/visual';
import { formatNumber, TODAY } from '../../lib/format';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayMonth = (v: string) => {
  const d = new Date(v);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};

export function TeacherCoursesPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [list, setList] = useState<Course[]>(teacherCourses);
  const [tab, setTab] = useState<'all' | CourseStatus>('all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [level, setLevel] = useState('all');
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const rows = useMemo(
    () =>
      list.filter(
        (c) =>
          (tab === 'all' || c.status === tab) &&
          (level === 'all' || c.difficulty === level) &&
          (!q.trim() || c.title.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [list, tab, level, q],
  );

  const search = (v: string) => {
    setQ(v);
    const next = new URLSearchParams(params);
    if (v.trim()) next.set('q', v);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const toggleStatus = (c: Course) => {
    const next: CourseStatus = c.status === 'published' ? 'draft' : 'published';
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    toast.success(next === 'published' ? 'Course published' : 'Moved to drafts', 'Demo: kept only on this page.');
  };

  const enrolled = list.reduce((n, c) => n + c.enrolled, 0);
  const count = (s: CourseStatus) => list.filter((c) => c.status === s).length;

  return (
    <div className="tc-page">
      <ShellTitle
        title="My courses"
        meta={<><Users aria-hidden="true" /><b>{formatNumber(enrolled)} students</b><span className="tc-dot" aria-hidden="true" />{`${WEEKDAYS[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]}`}</>}
      />

      <section aria-label="Filters" className="tc-toolbar">
        <Tabs
          label="Course status"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'All', count: list.length, icon: <Layers /> },
            { key: 'published', label: 'Published', count: count('published'), icon: <Eye /> },
            { key: 'draft', label: 'Draft', count: count('draft'), icon: <FileText /> },
          ]}
        />
        <span className="tc-grow" />
        <label className="tc-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search courses</span>
          <input type="search" value={q} onChange={(e) => search(e.target.value)} placeholder="Search courses" />
        </label>
        <label className="tc-selectpill">
          <SlidersHorizontal aria-hidden="true" />
          <span className="sr-only">Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">All levels</option>
            {Object.entries(difficultyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="tc-selectpill__chev" />
        </label>
        <ButtonLink to="/teacher/courses/create" icon={<Plus />}>New course</ButtonLink>
      </section>

      {rows.length === 0 ? (
        <div className="tc-card">
          <EmptyState
            icon={<BookOpen size={24} />}
            title={q ? 'No courses found' : 'No courses here'}
            action={<ButtonLink to="/teacher/courses/create" variant="secondary" icon={<Plus />}>New course</ButtonLink>}
          />
        </div>
      ) : (
        <section aria-label="Courses" className="tc-grid">
          {rows.map((c) => {
            const CatIcon = CATEGORY_ICONS[c.category];
            const live = c.status === 'published';
            const done = coursePerformance.find((p) => p.courseId === c.id)?.completionRate;
            return (
              <article key={c.id} className="tc-ccard v-lift">
                <Link to={`/teacher/courses/${c.id}`} tabIndex={-1} aria-hidden="true" className="tc-ccard__media">
                  <Thumb src={c.image} alt="" className="tc-ccard__thumb" />
                  <span className="tc-ccard__scrim" />
                  <span className={live ? 'tc-status tc-status--live' : 'tc-status'}>
                    {live ? <Eye /> : <FileText />}
                    {live ? 'Published' : 'Draft'}
                  </span>
                  <span className="tc-ccard__cat"><CatIcon /></span>
                </Link>
                <div className="tc-ccard__body">
                  <Link to={`/teacher/courses/${c.id}`} className="tc-ccard__title">{c.title}</Link>
                  <div className="tc-facts">
                    <span className="tc-fact" title="Students"><Users aria-hidden="true" />{formatNumber(c.enrolled)}</span>
                    {c.rating > 0 && <span className="tc-fact" title="Rating"><Star aria-hidden="true" />{c.rating}</span>}
                    <span className="tc-fact" title="Lessons"><BookOpen aria-hidden="true" />{lessonCount(c)}</span>
                  </div>
                  {live && done !== undefined && (
                    <div className="tc-done" role="img" aria-label={`Completion ${done}%`}>
                      <CircleCheck aria-hidden="true" />
                      <span className="tc-bar__track tc-bar__track--thin"><span className="tc-bar__fill tc-sw--blue" style={{ width: `${done}%` }} /></span>
                      <b>{done}%</b>
                    </div>
                  )}
                  {!live && (
                    <button type="button" className="tc-dashed-btn" onClick={() => toggleStatus(c)}><Send aria-hidden="true" />Publish</button>
                  )}
                  <div className="tc-ccard__foot">
                    <span className="tc-mini tc-grow"><Clock aria-hidden="true" />{dayMonth(c.updatedAt)}</span>
                    <Link to={`/teacher/courses/${c.id}/edit`} className="tc-iconbtn" aria-label={`Edit ${c.title}`}><Pencil /></Link>
                    <Link to={`/teacher/courses/${c.id}/content`} className="tc-iconbtn" aria-label={`Content of ${c.title}`}><Layers /></Link>
                    <Dropdown
                      trigger={({ toggle, open }) => (
                        <button type="button" className="tc-iconbtn" onClick={toggle} aria-expanded={open} aria-label={`More actions for ${c.title}`}><Ellipsis /></button>
                      )}
                    >
                      {(close) => (
                        <>
                          <Link className="dropdown__item" to={`/teacher/courses/${c.id}`} onClick={close}><Eye />View</Link>
                          <button type="button" className="dropdown__item" onClick={() => { toggleStatus(c); close(); }}>
                            {live ? <EyeOff /> : <Send />}
                            {live ? 'Unpublish' : 'Publish'}
                          </button>
                          <div className="dropdown__sep" />
                          <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setToDelete(c); close(); }}><Trash2 />Delete</button>
                        </>
                      )}
                    </Dropdown>
                  </div>
                </div>
              </article>
            );
          })}
          <Link to="/teacher/courses/create" className="tc-newtile v-lift">
            <span className="tc-newtile__icon"><Plus aria-hidden="true" /></span>
            New course
          </Link>
        </section>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          setList((l) => l.filter((c) => c.id !== toDelete.id));
          toast.success('Course deleted', 'Kept only on this page. Refresh to restore.');
        }}
        title="Delete this course?"
        text={toDelete ? `${toDelete.title}, its ${lessonCount(toDelete)} lessons and the progress of ${formatNumber(toDelete.enrolled)} students will be deleted.` : ''}
        confirmLabel="Delete"
      />
    </div>
  );
}

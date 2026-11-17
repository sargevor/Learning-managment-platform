import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, Clock, Inbox, Layers, Search, SquareCheckBig } from 'lucide-react';
import { teacherAssignments } from '../../data/assignments';
import { teacherCourses, teacherSubmissionRows, type SubmissionRow } from '../../data/teacherView';
import { fullName } from '../../data/users';
import { ageShort, CourseIcon, courseShort, GradingPanel, todayLabel, type GradeOverride } from '../../components/course/GradingPanel';
import { ShellTitle } from '../../components/layout/AppShell';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { cx } from '../../lib/format';

const PAGE = 9;

export function GradingCenterPage() {
  const [params, setParams] = useSearchParams();
  const all = useMemo(() => teacherSubmissionRows(), []);
  const [overrides, setOverrides] = useState<Record<string, GradeOverride>>({});
  const [course, setCourse] = useState('all');
  const [assignment, setAssignment] = useState('all');
  const [q, setQ] = useState('');
  const preselected = all.find((r) => r.submission.id === params.get('submission'));
  const [tab, setTab] = useState<'pending' | 'graded'>(preselected?.submission.status === 'graded' ? 'graded' : 'pending');
  const [selectedId, setSelectedId] = useState<string | undefined>(preselected?.submission.id);
  const [limit, setLimit] = useState(PAGE);

  const statusOf = (r: SubmissionRow) => overrides[r.submission.id]?.status ?? r.submission.status;

  const filtered = all.filter(
    (r) =>
      (course === 'all' || r.course.id === course) &&
      (assignment === 'all' || r.assignment.id === assignment) &&
      (!q.trim() || fullName(r.student).toLowerCase().includes(q.trim().toLowerCase())),
  );
  const queue = filtered.filter((r) => (tab === 'pending' ? statusOf(r) !== 'graded' : statusOf(r) === 'graded'));
  const selected = queue.find((r) => r.submission.id === selectedId) ?? queue[0];
  const selectedIndex = selected ? queue.indexOf(selected) : -1;
  // Keep the open submission visible even when it sits past the "more" cut-off.
  const visible = queue.slice(0, Math.max(limit, selectedIndex + 1));
  const pendingCount = filtered.filter((r) => statusOf(r) !== 'graded').length;
  const assignmentOptions = teacherAssignments.filter((a) => course === 'all' || a.courseId === course);
  const chipCourses = teacherCourses.filter((c) => c.status === 'published');
  const pendingAll = all.filter((r) => statusOf(r) !== 'graded' && r.submission.submittedAt);
  const oldest = pendingAll.reduce<string | undefined>((m, r) => (!m || r.submission.submittedAt! < m ? r.submission.submittedAt : m), undefined);

  const select = (id: string) => {
    setSelectedId(id);
    setParams({ submission: id }, { replace: true });
  };
  const next = () => {
    if (queue.length < 2 || selectedIndex < 0) return;
    select(queue[(selectedIndex + 1) % queue.length].submission.id);
  };
  const resetQueue = () => {
    setSelectedId(undefined);
    setLimit(PAGE);
  };

  return (
    <div className="tw-page">
      <ShellTitle
        title="Grading"
        meta={
          <>
            <Clock aria-hidden="true" />
            <b>{oldest ? `Oldest ${ageShort(oldest)}` : 'All graded'}</b>
            <span className="tw-dot" aria-hidden="true" />
            {todayLabel()}
          </>
        }
      />

      <section className="tw-toolbar" aria-label="Filters">
        <div className="tw-seg" role="tablist" aria-label="Status">
          <button type="button" role="tab" aria-selected={tab === 'pending'} onClick={() => { setTab('pending'); resetQueue(); }}>
            To grade<span className="tw-seg__n tw-seg__n--blue">{pendingCount}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'graded'} onClick={() => { setTab('graded'); resetQueue(); }}>
            <Check aria-hidden="true" />Graded<span className="tw-seg__n">{filtered.length - pendingCount}</span>
          </button>
        </div>
        <label className="tw-search">
          <Search aria-hidden="true" />
          <input type="search" aria-label="Search students" placeholder="Student name" value={q} onChange={(e) => { setQ(e.target.value); resetQueue(); }} />
        </label>
        <div className="tw-chipbar" role="group" aria-label="Course">
          <button type="button" className="tw-fchip tw-fchip--plain" aria-pressed={course === 'all'} onClick={() => { setCourse('all'); setAssignment('all'); resetQueue(); }}>
            <Layers aria-hidden="true" />All
          </button>
          {chipCourses.map((c) => (
            <button key={c.id} type="button" className="tw-fchip tw-fchip--plain" aria-pressed={course === c.id} title={c.title} onClick={() => { setCourse(c.id); setAssignment('all'); resetQueue(); }}>
              <CourseIcon id={c.id} size={16} />{courseShort(c.id)}
            </button>
          ))}
        </div>
        <label className="tw-selectpill">
          <span className="tw-sr">Task</span>
          <select value={assignment} onChange={(e) => { setAssignment(e.target.value); resetQueue(); }}>
            <option value="all">All tasks</option>
            {assignmentOptions.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
      </section>

      <div className="tw-split">
        <section className="tw-card tw-queue" aria-label="Queue">
          {queue.length === 0 ? (
            <EmptyState compact icon={<SquareCheckBig size={22} />} title={tab === 'pending' ? 'Queue is empty' : 'Nothing graded'} />
          ) : (
            <>
              <div role="listbox" aria-label="Submissions" className="tw-queue__list">
                {visible.map((r) => {
                  const active = selected?.submission.id === r.submission.id;
                  const o = overrides[r.submission.id];
                  const name = fullName(r.student);
                  return (
                    <button key={r.submission.id} type="button" role="option" aria-selected={active} className={cx('tw-qitem', active && 'is-active')} onClick={() => select(r.submission.id)}>
                      <Avatar name={name} size={42} />
                      <span className="tw-qitem__text">
                        <span className="tw-qitem__name">{name}</span>
                        <span className="tw-qitem__task"><CourseIcon id={r.course.id} size={13} /><span className="tw-ell">{r.assignment.title}</span></span>
                      </span>
                      <span className="tw-qitem__side">
                        {statusOf(r) === 'graded' ? (
                          <span className="tw-chip tw-chip--blue"><Check aria-hidden="true" />{o?.score ?? r.submission.score}/{r.assignment.maxScore}</span>
                        ) : (
                          <span className="tw-chip tw-chip--soft"><Clock aria-hidden="true" />{r.submission.submittedAt ? ageShort(r.submission.submittedAt) : '—'}</span>
                        )}
                        {r.submission.late && <span className="tw-chip tw-chip--red tw-chip--xs">Late</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {queue.length > visible.length && (
                <button type="button" className="tw-more" onClick={() => setLimit(visible.length + PAGE)}>
                  <ChevronDown aria-hidden="true" />{queue.length - visible.length} more
                </button>
              )}
            </>
          )}
        </section>

        <div className="tw-card tw-split__main">
          {selected ? (
            <GradingPanel row={selected} override={overrides[selected.submission.id]} onSave={(id, g) => setOverrides((o) => ({ ...o, [id]: g }))} onNext={queue.length > 1 ? next : undefined} />
          ) : (
            <EmptyState icon={<Inbox size={24} />} title="Pick a submission" />
          )}
        </div>
      </div>
    </div>
  );
}

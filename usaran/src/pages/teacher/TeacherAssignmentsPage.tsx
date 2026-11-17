import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronRight, ClipboardList, Clock, Ellipsis, FilePlus, Inbox, Layers, Lock, Pencil, Presentation, Search, SquareCheckBig, Trash2, Users } from 'lucide-react';
import type { Assignment } from '../../types';
import { submissionsFor, teacherAssignments } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { studentsInCourse, teacherCourses } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { CourseIcon, courseShort, todayLabel } from '../../components/course/GradingPanel';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '../../components/ui/Field';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { ConfirmDialog, Dropdown, Modal } from '../../components/ui/Overlay';
import { DateBlock } from '../../components/ui/Visual';
import { cx, daysUntil } from '../../lib/format';

const empty = (): Assignment => ({ id: '', courseId: teacherCourses[0].id, title: '', summary: '', instructions: [], requirements: [], dueDate: '2026-10-30T23:59', maxScore: 100, allowFiles: true, createdAt: '2026-10-15' });

/** Hand-in numbers for one assignment, from the class submissions. */
function classStats(a: Assignment) {
  const handed = submissionsFor(a.id).filter((s) => s.status !== 'draft');
  const ids = new Set(handed.map((s) => s.studentId));
  const missing = studentsInCourse(a.courseId).filter((s) => !ids.has(s.userId) && s.userId !== 's1').length;
  return { handed, total: handed.length + missing, toGrade: handed.filter((s) => s.status === 'submitted').length };
}

export function TeacherAssignmentsPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [list, setList] = useState<Assignment[]>(teacherAssignments);
  const [course, setCourse] = useState('all');
  const [state, setState] = useState<'all' | 'open' | 'closed'>('all');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<{ a: Assignment; instructions: string; requirements: string } | null>(() => (params.get('new') ? { a: empty(), instructions: '', requirements: '' } : null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Assignment | null>(null);

  const rows = useMemo(
    () =>
      list.filter((a) => {
        const open = daysUntil(a.dueDate) >= 0;
        return (course === 'all' || a.courseId === course) && (state === 'all' || (state === 'open' ? open : !open)) && (!q.trim() || a.title.toLowerCase().includes(q.trim().toLowerCase()));
      }),
    [list, course, state, q],
  );

  const openForm = (a?: Assignment) => {
    setErrors({});
    setForm(a ? { a, instructions: a.instructions.join('\n'), requirements: a.requirements.join('\n') } : { a: empty(), instructions: '', requirements: '' });
  };
  const closeForm = () => {
    setForm(null);
    if (params.get('new')) setParams({}, { replace: true });
  };
  const setA = (patch: Partial<Assignment>) => setForm((f) => (f ? { ...f, a: { ...f.a, ...patch } } : f));

  const save = () => {
    if (!form) return;
    const n: Record<string, string> = {};
    if (form.a.title.trim().length < 4) n.title = 'Enter a title';
    if (!form.instructions.trim()) n.instructions = 'Add at least one step';
    if (!form.a.dueDate) n.dueDate = 'Select a deadline';
    else if (daysUntil(form.a.dueDate) < 0) n.dueDate = 'Deadline is in the past';
    if (!form.a.maxScore || form.a.maxScore < 1 || form.a.maxScore > 1000) n.maxScore = 'Use 1–1000';
    setErrors(n);
    if (Object.keys(n).length) return;
    const a: Assignment = {
      ...form.a,
      id: form.a.id || `a-new-${Date.now()}`,
      instructions: form.instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    setList((l) => (form.a.id ? l.map((x) => (x.id === a.id ? a : x)) : [a, ...l]));
    toast.success(form.a.id ? 'Task updated' : 'Task created', 'Demo: students are not notified.');
    closeForm();
  };

  const chipCourses = teacherCourses.filter((c) => c.id === course || list.some((a) => a.courseId === c.id));
  const open = rows.filter((a) => daysUntil(a.dueDate) >= 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const closed = rows.filter((a) => daysUntil(a.dueDate) < 0).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const groups = [
    { key: 'open', title: 'Open', icon: <Clock aria-hidden="true" />, rows: open },
    { key: 'closed', title: 'Closed', icon: <Lock aria-hidden="true" />, rows: closed },
  ].filter((g) => g.rows.length > 0);

  return (
    <div className="tw-page">
      <ShellTitle
        title="Tasks"
        meta={
          <>
            <Presentation aria-hidden="true" />
            <b>{teacherCourses.length} courses</b>
            <span className="tw-dot" aria-hidden="true" />
            {todayLabel()}
          </>
        }
      />

      <section className="tw-toolbar" aria-label="Filters">
        <div className="tw-chipbar" role="group" aria-label="Course">
          <button type="button" className="tw-fchip" aria-pressed={course === 'all'} onClick={() => setCourse('all')}>
            <Layers aria-hidden="true" />All<span className="tw-fchip__n">{list.length}</span>
          </button>
          {chipCourses.map((c) => (
            <button key={c.id} type="button" className="tw-fchip" aria-pressed={course === c.id} onClick={() => setCourse(c.id)} title={c.title}>
              <CourseIcon id={c.id} size={17} />
              {courseShort(c.id)}
              <span className="tw-fchip__n">{list.filter((a) => a.courseId === c.id).length}</span>
            </button>
          ))}
        </div>
        <label className="tw-search">
          <Search aria-hidden="true" />
          <input type="search" aria-label="Search tasks" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="tw-seg" role="tablist" aria-label="Status">
          {(['all', 'open', 'closed'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={state === k} onClick={() => setState(k)}>
              {k === 'all' ? 'All' : k === 'open' ? 'Open' : 'Closed'}
            </button>
          ))}
        </div>
        <button type="button" className="tw-btn tw-btn--primary" onClick={() => openForm()}>
          <FilePlus aria-hidden="true" />New task
        </button>
      </section>

      {groups.length === 0 && (
        <div className="tw-card">
          <EmptyState icon={<ClipboardList size={24} />} title="No tasks found" action={<Button variant="secondary" icon={<FilePlus />} onClick={() => openForm()}>New task</Button>} />
        </div>
      )}

      {groups.map((g) => (
        <section key={g.key} className="tw-group" aria-label={`${g.title} tasks`}>
          <h2 className="tw-h2">
            <span className="tw-h2__icon">{g.icon}</span>
            {g.title}
            <span className="tw-h2__n">{g.rows.length}</span>
          </h2>
          <div className="tw-rows">
            {g.rows.map((a) => {
              const isClosed = g.key === 'closed';
              const st = classStats(a);
              const faces = st.handed.slice(0, 3).map((s) => fullName(getUser(s.studentId)));
              const more = st.handed.length - faces.length;
              const pct = st.total ? Math.round((st.handed.length / st.total) * 100) : 0;
              return (
                <div key={a.id} className="tw-arow v-lift">
                  <span className="tw-arow__main">
                    <span className="tw-ibox"><CourseIcon id={a.courseId} size={22} /></span>
                    <span className="tw-arow__text">
                      <Link to={`/teacher/assignments/${a.id}/submissions`} className="tw-arow__title tw-stretch" aria-label={`${a.title}, ${st.handed.length} of ${st.total} submitted`}>
                        {a.title}
                      </Link>
                      <span className="tw-arow__sub">
                        <span className="tw-ell">{getCourse(a.courseId)?.title}</span>
                        <span className="tw-dot" aria-hidden="true" />
                        <span className="tw-nowrap">{a.maxScore} pts</span>
                      </span>
                    </span>
                  </span>
                  <span className={cx('tw-arow__date', isClosed && 'is-closed')}>
                    <DateBlock date={a.dueDate} />
                  </span>
                  <span className="tw-arow__sub-count">
                    <span className="tw-arow__count"><b>{st.handed.length}/{st.total}</b><span>submitted</span></span>
                    <span className="tw-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                  </span>
                  <span className="tw-arow__state">
                    {st.toGrade > 0 && (
                      <span className="tw-pill tw-pill--blue"><SquareCheckBig aria-hidden="true" />{st.toGrade} to grade</span>
                    )}
                    {st.toGrade === 0 && isClosed && st.handed.length > 0 && (
                      <span className="tw-pill tw-pill--soft"><Check aria-hidden="true" />Graded</span>
                    )}
                  </span>
                  <span className="tw-arow__faces">
                    {st.handed.length === 0 ? (
                      <span className="tw-none"><Users aria-hidden="true" />None yet</span>
                    ) : (
                      <span className="tw-faces">
                        {faces.map((n, i) => <Avatar key={`${n}-${i}`} name={n} size={34} />)}
                        {more > 0 && <span className="tw-faces__more">+{more}</span>}
                      </span>
                    )}
                  </span>
                  <span className="tw-arow__end">
                    <Dropdown trigger={({ toggle, open: isOpen }) => <button type="button" className="tw-iconbtn" onClick={toggle} aria-expanded={isOpen} aria-label={`Actions: ${a.title}`}><Ellipsis aria-hidden="true" /></button>}>
                      {(close) => (
                        <>
                          <Link className="dropdown__item" to={`/teacher/assignments/${a.id}/submissions`} onClick={close}><Inbox />Submissions</Link>
                          <button type="button" className="dropdown__item" onClick={() => { openForm(a); close(); }}><Pencil />Edit</button>
                          <div className="dropdown__sep" />
                          <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setToDelete(a); close(); }}><Trash2 />Delete</button>
                        </>
                      )}
                    </Dropdown>
                    <ChevronRight className="tw-chev" aria-hidden="true" />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Modal
        open={!!form}
        onClose={closeForm}
        size="lg"
        title={form?.a.id ? 'Edit task' : 'New task'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button icon={<Check />} onClick={save}>{form?.a.id ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        {form && (
          <div className="stack" style={{ ['--gap' as string]: '16px' }}>
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Select label="Course" value={form.a.courseId} onChange={(e) => setA({ courseId: e.target.value })} options={teacherCourses.map((c) => ({ value: c.id, label: c.title }))} />
              <Input label="Title" required value={form.a.title} onChange={(e) => setA({ title: e.target.value })} error={errors.title} />
            </div>
            <Textarea label="Summary" rows={2} value={form.a.summary} onChange={(e) => setA({ summary: e.target.value })} style={{ minHeight: 64 }} />
            <Textarea label="Steps" required rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} error={errors.instructions} hint="One per line" />
            <Textarea label="Requirements" rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} hint="One per line" style={{ minHeight: 80 }} />
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Input label="Deadline" type="datetime-local" required value={form.a.dueDate} onChange={(e) => setA({ dueDate: e.target.value })} error={errors.dueDate} />
              <Input label="Max score" type="number" min={1} max={1000} required value={form.a.maxScore} onChange={(e) => setA({ maxScore: Number(e.target.value) })} error={errors.maxScore} />
            </div>
            <Checkbox label="Allow files" checked={form.a.allowFiles} onChange={(e) => setA({ allowFiles: e.target.checked })} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          setList((l) => l.filter((a) => a.id !== toDelete.id));
          toast.success('Task deleted', 'Changes are kept only on this page.');
        }}
        title="Delete this task?"
        text={toDelete ? `${toDelete.title} and its ${submissionsFor(toDelete.id).length} submissions will be removed.` : ''}
        confirmLabel="Delete"
      />
    </div>
  );
}

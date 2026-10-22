import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, ClipboardPlus, Inbox, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import type { Assignment } from '../../types';
import { submissionsFor, teacherAssignments } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { teacherCourses } from '../../data/teacherView';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Checkbox, Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState, PageHeader, Segmented } from '../../components/ui/Misc';
import { ConfirmDialog, Dropdown, Modal } from '../../components/ui/Overlay';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { daysUntil, formatDateTime, relativeDue } from '../../lib/format';

const empty = (): Assignment => ({ id: '', courseId: teacherCourses[0].id, title: '', summary: '', instructions: [], requirements: [], dueDate: '2026-10-30T23:59', maxScore: 100, allowFiles: true, createdAt: '2026-10-15' });

export function TeacherAssignmentsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
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
    if (form.a.title.trim().length < 4) n.title = "Enter an assignment title";
    if (!form.instructions.trim()) n.instructions = "Add at least one instruction";
    if (!form.a.dueDate) n.dueDate = "Select a deadline";
    else if (daysUntil(form.a.dueDate) < 0) n.dueDate = "The deadline cannot be in the past";
    if (!form.a.maxScore || form.a.maxScore < 1 || form.a.maxScore > 1000) n.maxScore = "Enter a score between 1 and 1000";
    setErrors(n);
    if (Object.keys(n).length) return;
    const a: Assignment = {
      ...form.a,
      id: form.a.id || `a-new-${Date.now()}`,
      instructions: form.instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    setList((l) => (form.a.id ? l.map((x) => (x.id === a.id ? a : x)) : [a, ...l]));
    toast.success(form.a.id ? "Assignment updated" : "Assignment created", "Demo: students will not receive a notification.");
    closeForm();
  };

  const allSubs = list.flatMap((a) => submissionsFor(a.id));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/teacher/dashboard' }, { label: "Assignments" }]}
        title="Manage Assignments"
        description="Create and edit assignments, track submissions, and review student work."
        actions={<Button icon={<ClipboardPlus />} onClick={() => openForm()}>New Assignment</Button>}
      />

      <div className="grid grid-4 mb-20">
        <StatCard label="Assignments" value={list.length} icon={<ClipboardList />} />
        <StatCard label="Active" value={list.filter((a) => daysUntil(a.dueDate) >= 0).length} icon={<ClipboardList />} tone="success" meta="deadline has not passed" />
        <StatCard label="Total Submissions" value={allSubs.length} icon={<Inbox />} tone="navy" />
        <StatCard label="Awaiting grading" value={allSubs.filter((s) => s.status === 'submitted').length} icon={<Users />} tone="warning" meta={<Link to="/teacher/grading">Grading center</Link>} />
      </div>

      <div className="card">
        <div className="filters-bar" style={{ padding: 16 }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search assignments" />
          <Select aria-label="Course" value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: "All Courses" }, ...teacherCourses.map((c) => ({ value: c.id, label: c.title }))]} />
          <Segmented label="Status" value={state} onChange={setState} items={[{ key: 'all', label: "All" }, { key: 'open', label: "Active" }, { key: 'closed', label: "Closed" }]} />
        </div>
        <DataTable<Assignment>
          caption="Assignments"
          rows={rows}
          rowKey={(a) => a.id}
          onRowClick={(a) => navigate(`/teacher/assignments/${a.id}/submissions`)}
          initialSort={{ key: 'due', dir: 'desc' }}
          empty={<EmptyState icon={<ClipboardList size={24} />} title="No assignments found" text="Change your filters or create a new assignment." action={<Button variant="secondary" onClick={() => openForm()}>New Assignment</Button>} />}
          columns={[
            { key: 'title', header: "Assignment", sortValue: (a) => a.title, render: (a) => <><div className="cell-title">{a.title}</div><div className="cell-sub">{getCourse(a.courseId)?.title}</div></> },
            { key: 'due', header: "Deadline", sortValue: (a) => a.dueDate, render: (a) => <><div className="nowrap">{formatDateTime(a.dueDate)}</div><div className="cell-sub">{relativeDue(a.dueDate)}</div></> },
            { key: 'state', header: "Status", render: (a) => (daysUntil(a.dueDate) >= 0 ? <Badge tone="success" dot>Active</Badge> : <Badge dot>Closed</Badge>) },
            {
              key: 'subs',
              header: "Submitted Assignments",
              sortValue: (a) => submissionsFor(a.id).length,
              render: (a) => {
                const s = submissionsFor(a.id);
                const pending = s.filter((x) => x.status === 'submitted').length;
                return (
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <span className="tabular">{s.length}</span>
                    {pending > 0 && <Badge tone="warning">{pending} ungraded</Badge>}
                  </div>
                );
              },
            },
            { key: 'max', header: "Score", align: 'right', sortValue: (a) => a.maxScore, render: (a) => a.maxScore },
            {
              key: 'act',
              header: '',
              render: (a) => (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Dropdown trigger={({ toggle, open }) => <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={`Actions: ${a.title}`}><MoreHorizontal /></button>}>
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/assignments/${a.id}/submissions`} onClick={close}><Inbox />Submitted Assignments</Link>
                        <button type="button" className="dropdown__item" onClick={() => { openForm(a); close(); }}><Pencil />Edit</button>
                        <div className="dropdown__sep" />
                        <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setToDelete(a); close(); }}><Trash2 />Delete</button>
                      </>
                    )}
                  </Dropdown>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={!!form}
        onClose={closeForm}
        size="lg"
        title={form?.a.id ? "Edit Assignment" : "New Assignment"}
        description="Students will see the instructions, requirements, and deadline."
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button onClick={save}>{form?.a.id ? "Save Changes" : "Create Assignment"}</Button>
          </>
        }
      >
        {form && (
          <div className="stack" style={{ ['--gap' as string]: '16px' }}>
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Select label="Course" value={form.a.courseId} onChange={(e) => setA({ courseId: e.target.value })} options={teacherCourses.map((c) => ({ value: c.id, label: c.title }))} />
              <Input label="Title" required value={form.a.title} onChange={(e) => setA({ title: e.target.value })} error={errors.title} />
            </div>
            <Textarea label="Short Description" rows={2} value={form.a.summary} onChange={(e) => setA({ summary: e.target.value })} style={{ minHeight: 64 }} />
            <Textarea label="Instructions" required rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} error={errors.instructions} hint="Put each step on a new line" />
            <Textarea label="Requirements" rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} hint="Put each requirement on a new line" style={{ minHeight: 80 }} />
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Input label="Deadline" type="datetime-local" required value={form.a.dueDate} onChange={(e) => setA({ dueDate: e.target.value })} error={errors.dueDate} />
              <Input label="Maximum Score" type="number" min={1} max={1000} required value={form.a.maxScore} onChange={(e) => setA({ maxScore: Number(e.target.value) })} error={errors.maxScore} />
            </div>
            <Checkbox label="Allow File Attachments" checked={form.a.allowFiles} onChange={(e) => setA({ allowFiles: e.target.checked })} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          setList((l) => l.filter((a) => a.id !== toDelete.id));
          toast.success("Assignment deleted", "Changes are kept only on this page.");
        }}
        title="Delete this assignment?"
        text={toDelete ? `Delete ${toDelete.title} and its ${submissionsFor(toDelete.id).length} submissions?` : ''}
        confirmLabel="Delete"
      />
    </>
  );
}

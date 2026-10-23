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
import { tr } from '../../i18n';

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
    if (form.a.title.trim().length < 4) n.title = tr("Enter an assignment title", "Նշեք առաջադրանքի անվանումը");
    if (!form.instructions.trim()) n.instructions = tr("Add at least one instruction", "Ավելացրեք առնվազն մեկ հրահանգ");
    if (!form.a.dueDate) n.dueDate = tr("Select a deadline", "Ընտրեք վերջնաժամկետը");
    else if (daysUntil(form.a.dueDate) < 0) n.dueDate = tr("The deadline cannot be in the past", "Վերջնաժամկետը չի կարող լինել անցյալում");
    if (!form.a.maxScore || form.a.maxScore < 1 || form.a.maxScore > 1000) n.maxScore = tr("Enter a score between 1 and 1000", "Նշեք միավորը՝ 1-ից մինչև 1000");
    setErrors(n);
    if (Object.keys(n).length) return;
    const a: Assignment = {
      ...form.a,
      id: form.a.id || `a-new-${Date.now()}`,
      instructions: form.instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    setList((l) => (form.a.id ? l.map((x) => (x.id === a.id ? a : x)) : [a, ...l]));
    toast.success(form.a.id ? tr("Assignment updated", "Առաջադրանքը թարմացվեց") : tr("Assignment created", "Առաջադրանքը ստեղծվեց"), tr("Demo: students will not receive a notification.", "Ցուցադրական ռեժիմ։ Ուսանողները ծանուցում չեն ստանա։"));
    closeForm();
  };

  const allSubs = list.flatMap((a) => submissionsFor(a.id));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Assignments", "Առաջադրանքներ") }]}
        title={tr("Manage Assignments", "Առաջադրանքների կառավարում")}
        description={tr("Create and edit assignments, track submissions, and review student work.", "Ստեղծեք և խմբագրեք առաջադրանքներ, հետևեք հանձնումներին և գնահատեք ուսանողների աշխատանքները։")}
        actions={<Button icon={<ClipboardPlus />} onClick={() => openForm()}>{tr("New Assignment", "Նոր առաջադրանք")}</Button>}
      />

      <div className="grid grid-4 mb-20">
        <StatCard label={tr("Assignments", "Առաջադրանքներ")} value={list.length} icon={<ClipboardList />} />
        <StatCard label={tr("Active", "Ակտիվ")} value={list.filter((a) => daysUntil(a.dueDate) >= 0).length} icon={<ClipboardList />} tone="success" meta={tr("deadline has not passed", "վերջնաժամկետը դեռ չի անցել")} />
        <StatCard label={tr("Total Submissions", "Ընդամենը հանձնումներ")} value={allSubs.length} icon={<Inbox />} tone="navy" />
        <StatCard label={tr("Awaiting grading", "Սպասում է գնահատման")} value={allSubs.filter((s) => s.status === 'submitted').length} icon={<Users />} tone="warning" meta={<Link to="/teacher/grading">{tr("Grading center", "Գնահատման կենտրոն")}</Link>} />
      </div>

      <div className="card">
        <div className="filters-bar" style={{ padding: 16 }}>
          <SearchBar value={q} onChange={setQ} placeholder={tr("Search assignments", "Որոնել առաջադրանք")} />
          <Select aria-label={tr("Course", "Դասընթաց")} value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: tr("All Courses", "Բոլոր դասընթացները") }, ...teacherCourses.map((c) => ({ value: c.id, label: c.title }))]} />
          <Segmented label={tr("Status", "Վիճակ")} value={state} onChange={setState} items={[{ key: 'all', label: tr("All", "Բոլորը") }, { key: 'open', label: tr("Active", "Ակտիվ") }, { key: 'closed', label: tr("Closed", "Փակված") }]} />
        </div>
        <DataTable<Assignment>
          caption={tr("Assignments", "Առաջադրանքներ")}
          rows={rows}
          rowKey={(a) => a.id}
          onRowClick={(a) => navigate(`/teacher/assignments/${a.id}/submissions`)}
          initialSort={{ key: 'due', dir: 'desc' }}
          empty={<EmptyState icon={<ClipboardList size={24} />} title={tr("No assignments found", "Առաջադրանքներ չգտնվեցին")} text={tr("Change your filters or create a new assignment.", "Փոխեք զտիչները կամ ստեղծեք նոր առաջադրանք։")} action={<Button variant="secondary" onClick={() => openForm()}>{tr("New Assignment", "Նոր առաջադրանք")}</Button>} />}
          columns={[
            { key: 'title', header: tr("Assignment", "Առաջադրանք"), sortValue: (a) => a.title, render: (a) => <><div className="cell-title">{a.title}</div><div className="cell-sub">{getCourse(a.courseId)?.title}</div></> },
            { key: 'due', header: tr("Deadline", "Վերջնաժամկետ"), sortValue: (a) => a.dueDate, render: (a) => <><div className="nowrap">{formatDateTime(a.dueDate)}</div><div className="cell-sub">{relativeDue(a.dueDate)}</div></> },
            { key: 'state', header: tr("Status", "Վիճակ"), render: (a) => (daysUntil(a.dueDate) >= 0 ? <Badge tone="success" dot>{tr("Active", "Ակտիվ")}</Badge> : <Badge dot>{tr("Closed", "Փակված")}</Badge>) },
            {
              key: 'subs',
              header: tr("Submitted Assignments", "Հանձնված աշխատանքներ"),
              sortValue: (a) => submissionsFor(a.id).length,
              render: (a) => {
                const s = submissionsFor(a.id);
                const pending = s.filter((x) => x.status === 'submitted').length;
                return (
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <span className="tabular">{s.length}</span>
                    {pending > 0 && <Badge tone="warning">{pending}{tr(" ungraded", " չգնահատված")}</Badge>}
                  </div>
                );
              },
            },
            { key: 'max', header: tr("Score", "Միավոր"), align: 'right', sortValue: (a) => a.maxScore, render: (a) => a.maxScore },
            {
              key: 'act',
              header: '',
              render: (a) => (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Dropdown trigger={({ toggle, open }) => <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={tr(`Actions: ${a.title}`, `Գործողություններ՝ ${a.title}`)}><MoreHorizontal /></button>}>
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/assignments/${a.id}/submissions`} onClick={close}><Inbox />{tr("Submitted Assignments", "Հանձնված աշխատանքներ")}</Link>
                        <button type="button" className="dropdown__item" onClick={() => { openForm(a); close(); }}><Pencil />{tr("Edit", "Խմբագրել")}</button>
                        <div className="dropdown__sep" />
                        <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setToDelete(a); close(); }}><Trash2 />{tr("Delete", "Ջնջել")}</button>
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
        title={form?.a.id ? tr("Edit Assignment", "Խմբագրել առաջադրանքը") : tr("New Assignment", "Նոր առաջադրանք")}
        description={tr("Students will see the instructions, requirements, and deadline.", "Ուսանողները կտեսնեն հրահանգները, պահանջները և վերջնաժամկետը։")}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>{tr("Cancel", "Չեղարկել")}</Button>
            <Button onClick={save}>{form?.a.id ? tr("Save Changes", "Պահել փոփոխությունները") : tr("Create Assignment", "Ստեղծել առաջադրանք")}</Button>
          </>
        }
      >
        {form && (
          <div className="stack" style={{ ['--gap' as string]: '16px' }}>
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Select label={tr("Course", "Դասընթաց")} value={form.a.courseId} onChange={(e) => setA({ courseId: e.target.value })} options={teacherCourses.map((c) => ({ value: c.id, label: c.title }))} />
              <Input label={tr("Title", "Անվանում")} required value={form.a.title} onChange={(e) => setA({ title: e.target.value })} error={errors.title} />
            </div>
            <Textarea label={tr("Short Description", "Կարճ նկարագրություն")} rows={2} value={form.a.summary} onChange={(e) => setA({ summary: e.target.value })} style={{ minHeight: 64 }} />
            <Textarea label={tr("Instructions", "Հրահանգներ")} required rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} error={errors.instructions} hint={tr("Put each step on a new line", "Յուրաքանչյուր քայլ՝ նոր տողում")} />
            <Textarea label={tr("Requirements", "Պահանջներ")} rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} hint={tr("Put each requirement on a new line", "Յուրաքանչյուր պահանջ՝ նոր տողում")} style={{ minHeight: 80 }} />
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <Input label={tr("Deadline", "Վերջնաժամկետ")} type="datetime-local" required value={form.a.dueDate} onChange={(e) => setA({ dueDate: e.target.value })} error={errors.dueDate} />
              <Input label={tr("Maximum Score", "Առավելագույն միավոր")} type="number" min={1} max={1000} required value={form.a.maxScore} onChange={(e) => setA({ maxScore: Number(e.target.value) })} error={errors.maxScore} />
            </div>
            <Checkbox label={tr("Allow File Attachments", "Թույլատրել ֆայլերի կցում")} checked={form.a.allowFiles} onChange={(e) => setA({ allowFiles: e.target.checked })} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          setList((l) => l.filter((a) => a.id !== toDelete.id));
          toast.success(tr("Assignment deleted", "Առաջադրանքը ջնջվեց"), tr("Changes are kept only on this page.", "Փոփոխությունները պահվում են միայն այս էջում։"));
        }}
        title={tr("Delete this assignment?", "Ջնջե՞լ առաջադրանքը")}
        text={toDelete ? tr(`Delete ${toDelete.title} and its ${submissionsFor(toDelete.id).length} submissions?`, `«${toDelete.title}» առաջադրանքը և նրա ${submissionsFor(toDelete.id).length} հանձնումը կջնջվեն։`) : ''}
        confirmLabel={tr("Delete", "Ջնջել")}
      />
    </>
  );
}

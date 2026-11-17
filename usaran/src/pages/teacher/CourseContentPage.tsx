import { useState, type DragEvent, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, CirclePlay, ClipboardList, Clock, Eye, FileQuestionMark, FileText, GripVertical, Layers, Paperclip,
  Pencil, Plus, Save, Trash2, UploadCloud, Video,
} from 'lucide-react';
import type { Lesson, LessonType, Module } from '../../types';
import { getCourse } from '../../data/courses';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea, Checkbox } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Misc';
import { ConfirmDialog, Modal } from '../../components/ui/Overlay';
import { cx, formatMinutes } from '../../lib/format';

type ContentItem = Lesson & { url?: string; body?: string; fileName?: string; refId?: string };
type EditableModule = Omit<Module, 'lessons'> & { lessons: ContentItem[] };
type Drag = { kind: 'module'; index: number } | { kind: 'lesson'; moduleId: string; index: number };

const TYPE: Record<LessonType, { name: string; icon: typeof Video }> = {
  video: { name: 'Video', icon: Video },
  text: { name: 'Reading', icon: FileText },
  assignment: { name: 'Task', icon: ClipboardList },
  quiz: { name: 'Quiz', icon: FileQuestionMark },
  resource: { name: 'Resource', icon: Paperclip },
};
const TYPES: LessonType[] = ['video', 'text', 'assignment', 'quiz', 'resource'];

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const copy = [...list];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

/** Keep keyboard focus on a grip after its row moves. */
const refocus = (key: string) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-grip="${key}"]`)?.focus());

export function CourseContentPage() {
  const { id } = useParams();
  const course = getCourse(id);
  const toast = useToast();
  const [modules, setModules] = useState<EditableModule[]>(() => (course ? course.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l })) })) : []));
  const [editor, setEditor] = useState<{ moduleId: string; item: ContentItem; isNew: boolean } | null>(null);
  const [moduleEditor, setModuleEditor] = useState<{ id?: string; title: string } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; text: string; run: () => void } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState<string | null>(null);

  if (!course || course.teacherId !== DEMO_TEACHER_ID) {
    return <div className="tc-card"><EmptyState title="Course not found" action={<ButtonLink to="/teacher/courses">My courses</ButtonLink>} /></div>;
  }

  const update = (fn: (m: EditableModule[]) => EditableModule[]) => {
    setModules(fn);
    setDirty(true);
  };
  const all = modules.flatMap((m) => m.lessons);
  const totalMin = all.reduce((n, l) => n + l.durationMin, 0);
  const count = (t: LessonType) => all.filter((l) => l.type === t).length;
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id);

  const openNew = (moduleId: string, type: LessonType = 'video') => {
    setErrors({});
    setEditor({ moduleId, isNew: true, item: { id: `new-${Date.now()}`, title: '', type, durationMin: 15 } });
  };
  /** Side panel tiles add to the last module (or ask for a module first). */
  const addOfType = (type: LessonType) => {
    const target = modules[modules.length - 1];
    if (target) openNew(target.id, type);
    else setModuleEditor({ title: '' });
  };

  const moveLesson = (moduleId: string, from: number, to: number) =>
    update((ms) => ms.map((x) => (x.id === moduleId ? { ...x, lessons: move(x.lessons, from, to) } : x)));

  /** Drop a dragged lesson onto (module, index); works across modules. */
  const dropLesson = (toModule: string, toIndex: number) => {
    if (!drag || drag.kind !== 'lesson') return;
    const from = drag;
    update((ms) => {
      const item = ms.find((m) => m.id === from.moduleId)?.lessons[from.index];
      if (!item) return ms;
      const removed = ms.map((m) => (m.id === from.moduleId ? { ...m, lessons: m.lessons.filter((_, i) => i !== from.index) } : m));
      return removed.map((m) => {
        if (m.id !== toModule) return m;
        const lessons = [...m.lessons];
        lessons.splice(Math.min(toIndex, lessons.length), 0, item);
        return { ...m, lessons };
      });
    });
  };

  const endDrag = () => {
    setDrag(null);
    setOver(null);
  };
  const allowDrop = (key: string) => (e: DragEvent) => {
    e.preventDefault();
    if (over !== key) setOver(key);
  };

  const gripKeys = (e: KeyboardEvent, from: number, length: number, run: (to: number) => void, key: string) => {
    const to = e.key === 'ArrowUp' ? from - 1 : e.key === 'ArrowDown' ? from + 1 : null;
    if (to === null) return;
    e.preventDefault();
    if (to < 0 || to >= length) return;
    run(to);
    refocus(key);
  };

  const saveItem = () => {
    if (!editor) return;
    const it = editor.item;
    const n: Record<string, string> = {};
    if (it.title.trim().length < 3) n.title = 'At least 3 characters';
    if (it.type === 'video' && it.url && !/^https?:\/\//.test(it.url)) n.url = 'Must start with http:// or https://';
    if (it.type === 'resource' && !it.url && !it.fileName) n.url = 'Add a link or a file';
    if ((it.type === 'assignment' || it.type === 'quiz') && !it.refId) n.refId = 'Pick one';
    if (!it.durationMin || it.durationMin < 1) n.duration = 'Enter minutes';
    setErrors(n);
    if (Object.keys(n).length) return;
    update((ms) => ms.map((m) => (m.id !== editor.moduleId ? m : { ...m, lessons: editor.isNew ? [...m.lessons, it] : m.lessons.map((l) => (l.id === it.id ? it : l)) })));
    toast.success(editor.isNew ? 'Content added' : 'Changes applied');
    setEditor(null);
  };

  const setItem = (patch: Partial<ContentItem>) => setEditor((e) => (e ? { ...e, item: { ...e.item, ...patch } } : e));

  return (
    <div className="tc-page">
      <ShellTitle
        title="Course content"
        meta={<><Layers aria-hidden="true" /><b>{modules.length} modules, {all.length} lessons</b><span className="tc-dot" aria-hidden="true" /><Clock aria-hidden="true" className="tc-meta-muted" />{formatMinutes(totalMin)}</>}
      />

      <div className="tc-backrow">
        <Link to={`/teacher/courses/${course.id}`} className="tc-back tc-back--course">
          <ArrowLeft aria-hidden="true" />
          <img src={course.image} alt="" />
          <span className="tc-ellipsis">{course.title}</span>
        </Link>
        <span className="tc-grow" />
        {dirty && <span className="tc-tag tc-tag--grey">Unsaved</span>}
        <ButtonLink to={`/courses/${course.id}`} variant="secondary" icon={<Eye />}>Preview</ButtonLink>
        <Button variant="primary" icon={<Save />} disabled={!dirty} onClick={() => { setDirty(false); toast.success('Structure saved', 'Demo: kept only on this page.'); }}>Save</Button>
      </div>

      <section className="tc-split">
        <div className="tc-split__main tc-builder">
          {modules.map((m, mi) => {
            const open = !collapsed[m.id];
            const mKey = `m-${m.id}`;
            return (
              <section
                key={m.id}
                aria-label={`Module ${mi + 1}`}
                className={cx('tc-card tc-module', over === mKey && drag?.kind === 'module' && 'is-over', drag?.kind === 'module' && drag.index === mi && 'is-dragging')}
                onDragOver={drag?.kind === 'module' ? allowDrop(mKey) : drag?.kind === 'lesson' && m.lessons.length === 0 ? allowDrop(mKey) : undefined}
                onDrop={(e) => {
                  e.preventDefault();
                  if (drag?.kind === 'module') update((ms) => move(ms, drag.index, mi));
                  else if (drag?.kind === 'lesson' && m.lessons.length === 0) dropLesson(m.id, 0);
                  endDrag();
                }}
              >
                <div className="tc-module__head">
                  <button
                    type="button"
                    className="tc-grip"
                    data-grip={mKey}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDrag({ kind: 'module', index: mi }); }}
                    onDragEnd={endDrag}
                    onKeyDown={(e) => gripKeys(e, mi, modules.length, (to) => update((ms) => move(ms, mi, to)), mKey)}
                    aria-label={`Move module ${mi + 1}: drag or use arrow keys`}
                    title="Drag or use arrow keys"
                  >
                    <GripVertical />
                  </button>
                  <span className="tc-module__n">{mi + 1}</span>
                  <h2 className="tc-module__title">{m.title}</h2>
                  <span className="tc-fact"><Layers aria-hidden="true" />{m.lessons.length}</span>
                  <span className="tc-fact"><Clock aria-hidden="true" />{formatMinutes(m.lessons.reduce((n, l) => n + l.durationMin, 0))}</span>
                  <span className="tc-module__tools">
                    <button type="button" className="tc-iconbtn" aria-label={`Rename ${m.title}`} onClick={() => setModuleEditor({ id: m.id, title: m.title })}><Pencil /></button>
                    <button
                      type="button"
                      className="tc-iconbtn"
                      aria-label={`Delete ${m.title}`}
                      onClick={() => setConfirm({ title: 'Delete this module?', text: `${m.title} and its ${m.lessons.length} items will be removed.`, run: () => update((ms) => ms.filter((x) => x.id !== m.id)) })}
                    >
                      <Trash2 />
                    </button>
                    <button type="button" className={cx('tc-iconbtn', !open && 'is-closed')} aria-label={`${open ? 'Collapse' : 'Expand'} ${m.title}`} aria-expanded={open} onClick={() => setCollapsed((c) => ({ ...c, [m.id]: open }))}><ChevronDown /></button>
                  </span>
                </div>

                {open && (
                  <div className="tc-lessons">
                    {m.lessons.map((l, li) => {
                      const T = TYPE[l.type];
                      const lKey = `l-${l.id}`;
                      return (
                        <div
                          key={l.id}
                          className={cx('tc-lesson', over === lKey && drag?.kind === 'lesson' && 'is-over', drag?.kind === 'lesson' && drag.moduleId === m.id && drag.index === li && 'is-dragging')}
                          onDragOver={drag?.kind === 'lesson' ? allowDrop(lKey) : undefined}
                          onDrop={(e) => {
                            if (drag?.kind !== 'lesson') return;
                            e.preventDefault();
                            e.stopPropagation();
                            dropLesson(m.id, li);
                            endDrag();
                          }}
                        >
                          <button
                            type="button"
                            className="tc-grip tc-grip--sm"
                            data-grip={lKey}
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; setDrag({ kind: 'lesson', moduleId: m.id, index: li }); }}
                            onDragEnd={endDrag}
                            onKeyDown={(e) => gripKeys(e, li, m.lessons.length, (to) => moveLesson(m.id, li, to), lKey)}
                            aria-label={`Move ${l.title}: drag or use arrow keys`}
                            title="Drag or use arrow keys"
                          >
                            <GripVertical />
                          </button>
                          <span className="tc-lesson__icon" title={T.name}><T.icon aria-hidden="true" /></span>
                          <span className="tc-lesson__title">
                            <span className="tc-ellipsis">{l.title}</span>
                            {l.preview && <span className="tc-tag tc-tag--blue tc-tag--sm"><CirclePlay aria-hidden="true" />Preview</span>}
                          </span>
                          <span className="tc-tag tc-tag--white"><Clock aria-hidden="true" />{formatMinutes(l.durationMin)}</span>
                          <span className="tc-lesson__tools">
                            <button
                              type="button"
                              className={cx('tc-iconbtn', l.preview && 'is-on')}
                              aria-label={`Free preview: ${l.title}`}
                              aria-pressed={!!l.preview}
                              onClick={() => update((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: x.lessons.map((y) => (y.id === l.id ? { ...y, preview: !y.preview } : y)) } : x)))}
                            >
                              <Eye />
                            </button>
                            <button type="button" className="tc-iconbtn" aria-label={`Edit ${l.title}`} onClick={() => { setErrors({}); setEditor({ moduleId: m.id, item: l, isNew: false }); }}><Pencil /></button>
                            <button
                              type="button"
                              className="tc-iconbtn"
                              aria-label={`Delete ${l.title}`}
                              onClick={() => setConfirm({ title: 'Delete this item?', text: `${l.title} will be removed from the module.`, run: () => update((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) } : x))) })}
                            >
                              <Trash2 />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                    <button type="button" className="tc-dashed-btn tc-dashed-btn--tall" onClick={() => openNew(m.id)}><Plus aria-hidden="true" />Add lesson</button>
                  </div>
                )}
              </section>
            );
          })}
          <button type="button" className="tc-addmodule" onClick={() => setModuleEditor({ title: '' })}>
            <span className="tc-newtile__icon tc-newtile__icon--sq"><Plus aria-hidden="true" /></span>
            Add module
          </button>
        </div>

        <aside aria-labelledby="add-title" className="tc-card tc-addpanel">
          <h2 id="add-title">Add content</h2>
          <div className="tc-addgrid">
            {(['video', 'text', 'assignment', 'quiz'] as LessonType[]).map((t) => {
              const T = TYPE[t];
              return (
                <button key={t} type="button" className="tc-addtile v-lift" aria-label={`Add ${T.name.toLowerCase()}, ${count(t)} in course`} onClick={() => addOfType(t)}>
                  <span className="tc-addtile__icon"><T.icon aria-hidden="true" /></span>
                  <span className="tc-addtile__name">{T.name}</span>
                  <span className="tc-addtile__n">{count(t)}</span>
                </button>
              );
            })}
          </div>
          <div className="tc-resrow">
            <span className="tc-resrow__icon"><Paperclip aria-hidden="true" /></span>
            <b className="tc-grow">Resource</b>
            <span className="tc-addtile__n tc-addtile__n--static">{count('resource')}</span>
            <button type="button" className="tc-iconbtn" aria-label="Add resource" onClick={() => addOfType('resource')}><Plus /></button>
          </div>
          {all.length > 0 && (
            <div className="tc-mix" aria-label="Lesson mix">
              <div className="tc-mix__bar" role="img" aria-label={TYPES.map((t) => `${TYPE[t].name} ${count(t)}`).join(', ')}>
                {TYPES.filter((t) => count(t) > 0).map((t) => <span key={t} className={`tc-mix--${t}`} style={{ flexGrow: count(t) }} />)}
              </div>
              <div className="tc-mix__legend">
                {TYPES.map((t) => <span key={t}><i className={`tc-sw tc-mix--${t}`} />{TYPE[t].name}</span>)}
              </div>
            </div>
          )}
        </aside>
      </section>

      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        size="lg"
        title={editor?.isNew ? 'New content' : 'Edit content'}
        description={modules.find((m) => m.id === editor?.moduleId)?.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)}>Cancel</Button>
            <Button icon={editor?.isNew ? <Plus /> : <Save />} onClick={saveItem}>{editor?.isNew ? 'Add' : 'Save'}</Button>
          </>
        }
      >
        {editor && (
          <div className="tc-modal-stack">
            <fieldset className="tc-fieldset">
              <legend className="field__label">Type</legend>
              <div className="tc-typepicker">
                {TYPES.map((t) => {
                  const T = TYPE[t];
                  const on = editor.item.type === t;
                  return (
                    <label key={t} className={cx('tc-typeopt', on && 'is-on')}>
                      <input type="radio" className="sr-only" name="ctype" checked={on} onChange={() => { setItem({ type: t }); setErrors({}); }} />
                      <T.icon aria-hidden="true" />
                      {T.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="tc-modal-row">
              <Input label="Title" required value={editor.item.title} onChange={(e) => setItem({ title: e.target.value })} error={errors.title} />
              <Input label="Minutes" type="number" min={1} value={editor.item.durationMin} onChange={(e) => setItem({ durationMin: Number(e.target.value) })} error={errors.duration} />
            </div>

            {editor.item.type === 'video' && <Input label="Video link" placeholder="https://video.example.am/lesson-1" value={editor.item.url ?? ''} onChange={(e) => setItem({ url: e.target.value })} error={errors.url} />}
            {editor.item.type === 'text' && <Textarea label="Text" rows={7} value={editor.item.body ?? ''} onChange={(e) => setItem({ body: e.target.value })} hint="Markdown" />}
            {editor.item.type === 'resource' && (
              <>
                <Input label="Link" placeholder="https://" value={editor.item.url ?? ''} onChange={(e) => setItem({ url: e.target.value })} error={errors.url} />
                <label className="tc-filedrop">
                  <UploadCloud aria-hidden="true" />
                  <b>{editor.item.fileName ?? 'Attach a file'}</b>
                  <input type="file" className="sr-only" onChange={(e) => setItem({ fileName: e.target.files?.[0]?.name })} />
                </label>
              </>
            )}
            {editor.item.type === 'assignment' && (
              <Select label="Linked task" value={editor.item.refId ?? ''} onChange={(e) => setItem({ refId: e.target.value })} error={errors.refId} options={[{ value: '', label: 'Select a task' }, ...courseAssignments.map((a) => ({ value: a.id, label: a.title }))]} hint={courseAssignments.length ? undefined : 'No tasks in this course yet'} />
            )}
            {editor.item.type === 'quiz' && (
              <Select label="Linked quiz" value={editor.item.refId ?? ''} onChange={(e) => setItem({ refId: e.target.value })} error={errors.refId} options={[{ value: '', label: 'Select a quiz' }, ...courseQuizzes.map((q) => ({ value: q.id, label: q.title }))]} hint={courseQuizzes.length ? undefined : 'Create a quiz first'} />
            )}
            <Checkbox label="Free preview" checked={!!editor.item.preview} onChange={(e) => setItem({ preview: e.target.checked })} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!moduleEditor}
        onClose={() => setModuleEditor(null)}
        title={moduleEditor?.id ? 'Rename module' : 'New module'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModuleEditor(null)}>Cancel</Button>
            <Button
              icon={<Save />}
              disabled={!moduleEditor?.title.trim()}
              onClick={() => {
                if (!moduleEditor) return;
                if (moduleEditor.id) update((ms) => ms.map((m) => (m.id === moduleEditor.id ? { ...m, title: moduleEditor.title } : m)));
                else update((ms) => [...ms, { id: `m-${Date.now()}`, title: moduleEditor.title, lessons: [] }]);
                setModuleEditor(null);
              }}
            >Save</Button>
          </>
        }
      >
        <Input label="Module title" value={moduleEditor?.title ?? ''} onChange={(e) => setModuleEditor((m) => (m ? { ...m, title: e.target.value } : m))} placeholder="e.g. Introduction" />
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm?.run()} title={confirm?.title ?? ''} text={confirm?.text ?? ''} confirmLabel="Delete" />
    </div>
  );
}

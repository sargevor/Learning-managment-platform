import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, FolderPlus, GripVertical, Layers, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react';
import type { Lesson, LessonType, Module } from '../../types';
import { getCourse } from '../../data/courses';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { LESSON_ICONS, LESSON_TYPE_LABEL } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea, Checkbox } from '../../components/ui/Field';
import { Card, EmptyState, Notice, PageHeader } from '../../components/ui/Misc';
import { ConfirmDialog, Modal } from '../../components/ui/Overlay';
import { Badge, type Tone } from '../../components/ui/Badge';
import { cx } from '../../lib/format';

type ContentItem = Lesson & { url?: string; body?: string; fileName?: string; refId?: string };
type EditableModule = Omit<Module, 'lessons'> & { lessons: ContentItem[] };

const TYPE_TONE: Record<LessonType, Tone> = { video: 'accent', text: 'info', resource: 'neutral', assignment: 'warning', quiz: 'success' };
const TYPES: LessonType[] = ['video', 'text', 'resource', 'assignment', 'quiz'];

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

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

  if (!course || course.teacherId !== DEMO_TEACHER_ID) {
    return <div className="card"><EmptyState title="Դասընթացը չի գտնվել" action={<ButtonLink to="/teacher/courses">Իմ դասընթացները</ButtonLink>} /></div>;
  }

  const update = (fn: (m: EditableModule[]) => EditableModule[]) => {
    setModules(fn);
    setDirty(true);
  };
  const all = modules.flatMap((m) => m.lessons);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id);

  const openNew = (moduleId: string) => setEditor({ moduleId, isNew: true, item: { id: `new-${Date.now()}`, title: '', type: 'video', durationMin: 15 } });

  const saveItem = () => {
    if (!editor) return;
    const it = editor.item;
    const n: Record<string, string> = {};
    if (it.title.trim().length < 3) n.title = 'Անվանումը պետք է լինի առնվազն 3 նիշ';
    if (it.type === 'video' && it.url && !/^https?:\/\//.test(it.url)) n.url = 'Հղումը պետք է սկսվի http:// կամ https://';
    if (it.type === 'resource' && !it.url && !it.fileName) n.url = 'Նշեք հղում կամ կցեք ֆայլ';
    if ((it.type === 'assignment' || it.type === 'quiz') && !it.refId) n.refId = 'Ընտրեք կապակցված տարրը';
    if (!it.durationMin || it.durationMin < 1) n.duration = 'Նշեք տևողությունը';
    setErrors(n);
    if (Object.keys(n).length) return;
    update((ms) =>
      ms.map((m) =>
        m.id !== editor.moduleId ? m : { ...m, lessons: editor.isNew ? [...m.lessons, it] : m.lessons.map((l) => (l.id === it.id ? it : l)) },
      ),
    );
    toast.success(editor.isNew ? 'Բովանդակությունը ավելացվեց' : 'Փոփոխությունները կիրառվեցին');
    setEditor(null);
  };

  const setItem = (patch: Partial<ContentItem>) => setEditor((e) => (e ? { ...e, item: { ...e.item, ...patch } } : e));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Դասընթացներ', to: '/teacher/courses' }, { label: course.title, to: `/teacher/courses/${course.id}` }, { label: 'Բովանդակություն' }]}
        title="Դասընթացի բովանդակություն"
        description="Կազմակերպեք մոդուլները և դասերը, ավելացրեք տեսադասեր, նյութեր, ռեսուրսներ, առաջադրանքներ և թեստեր։"
        actions={
          <>
            <ButtonLink to={`/courses/${course.id}`} variant="secondary" icon={<Eye />}>Նախադիտում</ButtonLink>
            <Button variant="primary" disabled={!dirty} onClick={() => { setDirty(false); toast.success('Կառուցվածքը պահվեց', 'Դեմո ռեժիմ. փոփոխությունները պահվում են միայն այս էջում։'); }}>
              Պահել փոփոխությունները
            </Button>
          </>
        }
      />

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '16px', minWidth: 0 }}>
          {dirty && <Notice tone="warning">Կան չպահված փոփոխություններ։</Notice>}
          {modules.length === 0 && (
            <div className="card">
              <EmptyState icon={<Layers size={24} />} title="Դասընթացը դեռ մոդուլներ չունի" text="Սկսեք առաջին մոդուլից, ապա ավելացրեք դասեր և առաջադրանքներ։" action={<Button icon={<FolderPlus />} onClick={() => setModuleEditor({ title: '' })}>Ավելացնել մոդուլ</Button>} />
            </div>
          )}
          {modules.map((m, mi) => (
            <section key={m.id} className="module-block" aria-label={`Մոդուլ ${mi + 1}`}>
              <div className="module-block__head">
                <div className="order-btns">
                  <button type="button" aria-label="Տեղափոխել վերև" disabled={mi === 0} onClick={() => update((ms) => move(ms, mi, mi - 1))}><ChevronUp /></button>
                  <button type="button" aria-label="Տեղափոխել ներքև" disabled={mi === modules.length - 1} onClick={() => update((ms) => move(ms, mi, mi + 1))}><ChevronDown /></button>
                </div>
                <div className="grow">
                  <div className="xs muted">Մոդուլ {mi + 1}, {m.lessons.length} տարր</div>
                  <div className="strong" style={{ color: 'var(--navy-900)' }}>{m.title}</div>
                </div>
                <Button variant="ghost" size="sm" iconOnly icon={<Pencil />} aria-label="Վերանվանել մոդուլը" onClick={() => setModuleEditor({ id: m.id, title: m.title })} />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  icon={<Trash2 />}
                  aria-label="Ջնջել մոդուլը"
                  onClick={() => setConfirm({ title: 'Ջնջե՞լ մոդուլը', text: `«${m.title}» մոդուլը և նրա ${m.lessons.length} տարրը կջնջվեն։`, run: () => update((ms) => ms.filter((x) => x.id !== m.id)) })}
                />
              </div>
              {m.lessons.length === 0 ? (
                <EmptyState compact title="Մոդուլը դատարկ է" text="Ավելացրեք առաջին դասը կամ նյութը։" />
              ) : (
                m.lessons.map((l, li) => {
                  const Icon = LESSON_ICONS[l.type];
                  return (
                    <div key={l.id} className="content-row">
                      <GripVertical size={16} className="muted" aria-hidden="true" />
                      <div className="order-btns">
                        <button type="button" aria-label="Տեղափոխել վերև" disabled={li === 0} onClick={() => update((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: move(x.lessons, li, li - 1) } : x)))}><ChevronUp /></button>
                        <button type="button" aria-label="Տեղափոխել ներքև" disabled={li === m.lessons.length - 1} onClick={() => update((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: move(x.lessons, li, li + 1) } : x)))}><ChevronDown /></button>
                      </div>
                      <span className="lesson-item__icon"><Icon /></span>
                      <div className="grow" style={{ minWidth: 0 }}>
                        <div className="strong" style={{ color: 'var(--navy-900)' }}>{l.title}</div>
                        <div className="xs muted">{l.durationMin} րոպե{l.preview ? ', հասանելի է նախադիտման' : ''}</div>
                      </div>
                      <Badge tone={TYPE_TONE[l.type]}>{LESSON_TYPE_LABEL[l.type]}</Badge>
                      <Button variant="ghost" size="sm" iconOnly icon={<Pencil />} aria-label={`Խմբագրել ${l.title}`} onClick={() => { setErrors({}); setEditor({ moduleId: m.id, item: l, isNew: false }); }} />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={<Trash2 />}
                        aria-label={`Ջնջել ${l.title}`}
                        onClick={() => setConfirm({ title: 'Ջնջե՞լ տարրը', text: `«${l.title}» տարրը կհեռացվի մոդուլից։`, run: () => update((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) } : x))) })}
                      />
                    </div>
                  );
                })
              )}
              <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
                <Button variant="ghost" size="sm" icon={<Plus />} onClick={() => { setErrors({}); openNew(m.id); }}>Ավելացնել բովանդակություն</Button>
              </div>
            </section>
          ))}
          {modules.length > 0 && (
            <Button variant="secondary" icon={<FolderPlus />} onClick={() => setModuleEditor({ title: '' })} style={{ alignSelf: 'flex-start' }}>Ավելացնել մոդուլ</Button>
          )}
        </div>

        <aside className="stack" style={{ ['--gap' as string]: '20px', position: 'sticky', top: 88 }}>
          <Card title="Ամփոփում">
            <dl className="kv">
              <dt>Մոդուլներ</dt>
              <dd>{modules.length}</dd>
              {TYPES.map((t) => (
                <div key={t} style={{ display: 'contents' }}>
                  <dt>{LESSON_TYPE_LABEL[t]}</dt>
                  <dd>{all.filter((l) => l.type === t).length}</dd>
                </div>
              ))}
              <dt>Ընդհանուր տևողություն</dt>
              <dd>{Math.round(all.reduce((n, l) => n + l.durationMin, 0) / 60)} ժամ</dd>
            </dl>
          </Card>
          <Card title="Բովանդակության տեսակներ">
            <div className="stack" style={{ ['--gap' as string]: '10px' }}>
              {TYPES.map((t) => {
                const Icon = LESSON_ICONS[t];
                return (
                  <div key={t} className="row small">
                    <span className="lesson-item__icon"><Icon /></span>
                    <span className="grow">{LESSON_TYPE_LABEL[t]}</span>
                    <Badge tone={TYPE_TONE[t]}>{all.filter((l) => l.type === t).length}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        size="lg"
        title={editor?.isNew ? 'Նոր բովանդակություն' : 'Խմբագրել բովանդակությունը'}
        description={modules.find((m) => m.id === editor?.moduleId)?.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)}>Չեղարկել</Button>
            <Button onClick={saveItem}>{editor?.isNew ? 'Ավելացնել' : 'Պահել'}</Button>
          </>
        }
      >
        {editor && (
          <div className="stack" style={{ ['--gap' as string]: '16px' }}>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field__label" style={{ marginBottom: 8 }}>Տեսակ</legend>
              <div className="type-picker">
                {TYPES.map((t) => {
                  const Icon = LESSON_ICONS[t];
                  return (
                    <label key={t} className={cx(editor.item.type === t && 'is-selected')}>
                      <input type="radio" className="sr-only" name="ctype" checked={editor.item.type === t} onChange={() => { setItem({ type: t }); setErrors({}); }} />
                      <Icon size={20} aria-hidden="true" />
                      {LESSON_TYPE_LABEL[t]}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="grid grid-main-aside" style={{ gridTemplateColumns: 'minmax(0,1fr) 160px', ['--gap' as string]: '14px' }}>
              <Input label="Անվանում" required value={editor.item.title} onChange={(e) => setItem({ title: e.target.value })} error={errors.title} />
              <Input label="Տևողություն (ր)" type="number" min={1} value={editor.item.durationMin} onChange={(e) => setItem({ durationMin: Number(e.target.value) })} error={errors.duration} />
            </div>

            {editor.item.type === 'video' && <Input label="Տեսանյութի հղում" placeholder="https://video.example.am/lesson-1" value={editor.item.url ?? ''} onChange={(e) => setItem({ url: e.target.value })} error={errors.url} hint="Տեսանյութերը չեն հոսթավորվում հարթակում. նշեք արտաքին հղում" />}
            {editor.item.type === 'text' && <Textarea label="Նյութի տեքստ" rows={7} value={editor.item.body ?? ''} onChange={(e) => setItem({ body: e.target.value })} hint="Աջակցվում է Markdown ձևաչափը" />}
            {editor.item.type === 'resource' && (
              <>
                <Input label="Արտաքին ռեսուրսի հղում" placeholder="https://" value={editor.item.url ?? ''} onChange={(e) => setItem({ url: e.target.value })} error={errors.url} />
                <div className="field">
                  <span className="field__label">Կամ կցեք ֆայլ</span>
                  <label className="dropzone">
                    <UploadCloud size={24} aria-hidden="true" />
                    <span>{editor.item.fileName ? <strong>{editor.item.fileName}</strong> : <><strong>Ընտրեք ֆայլ</strong> ձեր համակարգչից</>}</span>
                    <span className="xs muted">Ֆայլը չի վերբեռնվում, պահվում է միայն անունը</span>
                    <input type="file" hidden onChange={(e) => setItem({ fileName: e.target.files?.[0]?.name })} />
                  </label>
                </div>
              </>
            )}
            {editor.item.type === 'assignment' && (
              <Select label="Կապակցված առաջադրանք" value={editor.item.refId ?? ''} onChange={(e) => setItem({ refId: e.target.value })} error={errors.refId} options={[{ value: '', label: 'Ընտրեք առաջադրանքը' }, ...courseAssignments.map((a) => ({ value: a.id, label: a.title }))]} hint={courseAssignments.length ? undefined : 'Այս դասընթացում առաջադրանքներ դեռ չկան'} />
            )}
            {editor.item.type === 'quiz' && (
              <Select label="Կապակցված թեստ" value={editor.item.refId ?? ''} onChange={(e) => setItem({ refId: e.target.value })} error={errors.refId} options={[{ value: '', label: 'Ընտրեք թեստը' }, ...courseQuizzes.map((q) => ({ value: q.id, label: q.title }))]} hint={courseQuizzes.length ? undefined : 'Նախ ստեղծեք թեստ «Թեստեր» բաժնում'} />
            )}
            <Checkbox label="Հասանելի է նախադիտման համար առանց գրանցման" checked={!!editor.item.preview} onChange={(e) => setItem({ preview: e.target.checked })} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!moduleEditor}
        onClose={() => setModuleEditor(null)}
        title={moduleEditor?.id ? 'Վերանվանել մոդուլը' : 'Նոր մոդուլ'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModuleEditor(null)}>Չեղարկել</Button>
            <Button
              disabled={!moduleEditor?.title.trim()}
              onClick={() => {
                if (!moduleEditor) return;
                if (moduleEditor.id) update((ms) => ms.map((m) => (m.id === moduleEditor.id ? { ...m, title: moduleEditor.title } : m)));
                else update((ms) => [...ms, { id: `m-${Date.now()}`, title: moduleEditor.title, lessons: [] }]);
                setModuleEditor(null);
              }}
            >
              Պահել
            </Button>
          </>
        }
      >
        <Input label="Մոդուլի անվանում" value={moduleEditor?.title ?? ''} onChange={(e) => setModuleEditor((m) => (m ? { ...m, title: e.target.value } : m))} placeholder="Օր.՝ Ներածություն" />
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm?.run()} title={confirm?.title ?? ''} text={confirm?.text ?? ''} confirmLabel="Ջնջել" />
    </>
  );
}

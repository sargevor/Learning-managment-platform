import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Globe, Link2, Lock, Plus, Save, Send, Trash2 } from 'lucide-react';
import type { CategoryId, Course, Difficulty } from '../../types';
import { categories, difficultyLabel, getCourse } from '../../data/courses';
import { DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { CourseCard } from '../../components/course/CourseBits';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea, Toggle } from '../../components/ui/Field';
import { Card, EmptyState, Notice, PageHeader } from '../../components/ui/Misc';
import { cx } from '../../lib/format';
import { tr } from '../../i18n';

const IMAGE_CHOICES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70',
];

type Visibility = 'public' | 'link' | 'private';

export function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const existing = id ? getCourse(id) : undefined;
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    shortDescription: existing?.shortDescription ?? '',
    description: existing?.description ?? '',
    category: (existing?.category ?? 'programming') as CategoryId,
    difficulty: (existing?.difficulty ?? 'beginner') as Difficulty,
    durationHours: String(existing?.durationHours ?? ''),
    language: existing?.language ?? tr("Armenian", "Հայերեն"),
    image: existing?.image ?? IMAGE_CHOICES[0],
    startDate: '2026-11-02',
  });
  const [objectives, setObjectives] = useState<string[]>(existing?.objectives ?? ['']);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [openEnroll, setOpenEnroll] = useState(true);
  const [certificate, setCertificate] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (isEdit && (!existing || existing.teacherId !== DEMO_TEACHER_ID)) {
    return <div className="card"><EmptyState title={tr("Course not found", "Դասընթացը չի գտնվել")} text={tr("You can only edit your own courses.", "Դուք կարող եք խմբագրել միայն ձեր դասընթացները։")} /></div>;
  }

  const validate = () => {
    const n: Record<string, string> = {};
    if (form.title.trim().length < 5) n.title = tr("The title must contain at least 5 characters", "Անվանումը պետք է պարունակի առնվազն 5 նիշ");
    if (form.shortDescription.trim().length < 20) n.shortDescription = tr("The short description must contain at least 20 characters", "Կարճ նկարագրությունը պետք է պարունակի առնվազն 20 նիշ");
    const h = Number(form.durationHours);
    if (!h || h < 1 || h > 200) n.durationHours = tr("Enter a duration between 1 and 200 hours", "Նշեք տևողությունը՝ 1-ից մինչև 200 ժամ");
    if (objectives.filter((o) => o.trim()).length === 0) n.objectives = tr("Add at least one learning objective", "Ավելացրեք առնվազն մեկ ուսումնական նպատակ");
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const save = (publish: boolean) => (e?: FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.warning(tr("Check the form", "Ստուգեք ձևաթուղթը"), tr("Some fields have not been filled in correctly.", "Որոշ դաշտեր ճիշտ լրացված չեն։"));
      return;
    }
    toast.success(publish ? tr("Course published", "Դասընթացը հրապարակվեց") : tr("Draft saved", "Սևագիրը պահվեց"), tr("Demo: no data is saved to a server.", "Ցուցադրական ռեժիմ։ Տվյալները չեն պահպանվում սերվերում։"));
    navigate(isEdit ? `/teacher/courses/${id}` : '/teacher/courses');
  };

  const preview: Course = {
    ...(existing ?? ({} as Course)),
    id: existing?.id ?? 'preview',
    title: form.title || tr("Course Title", "Դասընթացի անվանումը"),
    shortDescription: form.shortDescription || tr("Your short description will appear here.", "Կարճ նկարագրությունը կհայտնվի այստեղ։"),
    description: form.description,
    category: form.category,
    difficulty: form.difficulty,
    durationHours: Number(form.durationHours) || 0,
    enrolled: existing?.enrolled ?? 0,
    rating: existing?.rating ?? 0,
    teacherId: DEMO_TEACHER_ID,
    image: form.image,
    status: 'draft',
    objectives,
    modules: existing?.modules ?? [],
    updatedAt: '2026-10-15',
    language: form.language,
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Courses", "Դասընթացներ"), to: '/teacher/courses' }, ...(existing ? [{ label: existing.title, to: `/teacher/courses/${existing.id}` }] : []), { label: isEdit ? tr("Editing", "Խմբագրում") : tr("New Course", "Նոր դասընթաց") }]}
        title={isEdit ? tr("Edit Course", "Խմբագրել դասընթացը") : tr("New Course", "Նոր դասընթաց")}
        description={isEdit ? tr("Update your course details and publishing settings.", "Թարմացրեք դասընթացի հիմնական տվյալները և հրապարակման կարգավորումները։") : tr("Fill in the main details. You can add modules and lessons in the next step.", "Լրացրեք հիմնական տվյալները։ Մոդուլներն ու դասերը կավելացնեք հաջորդ քայլում։")}
      />

      <form className="grid grid-main-aside" onSubmit={save(false)} noValidate>
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <Card title={tr("Basic Details", "Հիմնական տվյալներ")}>
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              <Input label={tr("Title", "Անվանում")} required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder={tr("e.g., Web Development Fundamentals", "Օր.՝ Վեբ մշակման հիմունքներ")} maxLength={90} hint={`${form.title.length}/90`} />
              <Textarea label={tr("Short Description", "Կարճ նկարագրություն")} required rows={2} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} error={errors.shortDescription} hint={tr("Shown on the course card", "Ցուցադրվում է դասընթացի քարտում")} maxLength={160} style={{ minHeight: 70 }} />
              <Textarea label={tr("Full Description", "Մանրամասն նկարագրություն")} rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={tr("Describe who this course is for, any prerequisites, and how it is organized…", "Նկարագրեք, թե ում համար է դասընթացը, ինչ նախնական գիտելիքներ են պետք և ինչպես է այն կառուցված…")} />
              <div className="grid grid-3" style={{ ['--gap' as string]: '16px' }}>
                <Select label={tr("Category", "Ուղղություն")} value={form.category} onChange={(e) => set('category', e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
                <Select label={tr("Level", "Մակարդակ")} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} options={Object.entries(difficultyLabel).map(([value, label]) => ({ value, label }))} />
                <Input label={tr("Duration (hours)", "Տևողություն (ժամ)")} type="number" min={1} max={200} required value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} error={errors.durationHours} />
                <Select label={tr("Language", "Լեզու")} value={form.language} onChange={(e) => set('language', e.target.value)} options={[{ value: tr("Armenian", "Հայերեն"), label: tr("Armenian", "Հայերեն") }]} />
                <Input label={tr("Start Date", "Մեկնարկի ամսաթիվ")} type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title={tr("Learning Objectives", "Ուսումնական նպատակներ")} subtitle={tr("What will students be able to do after this course?", "Ի՞նչ կկարողանա անել ուսանողը դասընթացից հետո")}>
            <div className="stack" style={{ ['--gap' as string]: '10px' }}>
              {objectives.map((o, i) => (
                <div key={i} className="row">
                  <span className="xs muted" style={{ width: 18 }}>{i + 1}.</span>
                  <input className="input grow" value={o} aria-label={tr(`Objective ${i + 1}`, `Նպատակ ${i + 1}`)} placeholder={tr("e.g., Build an interactive web page", "Օր.՝ Կառուցել ինտերակտիվ վեբ էջ")} onChange={(e) => setObjectives((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
                  <Button variant="ghost" iconOnly icon={<Trash2 />} aria-label={tr(`Remove objective ${i + 1}`, `Հեռացնել նպատակ ${i + 1}`)} disabled={objectives.length === 1} onClick={() => setObjectives((l) => l.filter((_, j) => j !== i))} />
                </div>
              ))}
              {errors.objectives && <span className="field__error">{errors.objectives}</span>}
              <div>
                <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setObjectives((l) => [...l, ''])} disabled={objectives.length >= 8}>{tr("Add Objective", "Ավելացնել նպատակ")}</Button>
              </div>
            </div>
          </Card>

          <Card title={tr("Cover Image", "Շապիկի նկար")}>
            <div className="image-choices">
              {IMAGE_CHOICES.concat(existing && !IMAGE_CHOICES.includes(existing.image) ? [existing.image] : []).map((src) => (
                <button key={src} type="button" className={cx('image-choice', form.image === src && 'is-selected')} onClick={() => set('image', src)} aria-pressed={form.image === src} aria-label={tr("Choose Image", "Ընտրել նկարը")}>
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <Input label={tr("Or enter an image URL", "Կամ նշեք նկարի հղումը")} value={form.image} onChange={(e) => set('image', e.target.value)} fieldClassName="mt-20" hint={tr("Files are not uploaded in this demo", "Ցուցադրական տարբերակում ֆայլեր չեն վերբեռնվում")} />
          </Card>

          <Card title={tr("Visibility and Enrollment", "Տեսանելիություն և գրանցում")}>
            <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, ['--gap' as string]: '10px' }}>
              <legend className="field__label" style={{ marginBottom: 8 }}>{tr("Who can see this course?", "Ո՞վ կարող է տեսնել դասընթացը")}</legend>
              {([
                ['public', Globe, tr("Public", "Հանրային"), tr("Visible to everyone", "Տեսանելի է բոլորին կատալոգում")],
                ['link', Link2, tr("Unlisted", "Հղումով"), tr("Only people with the link", "Միայն նրանք, ովքեր ունեն հղումը")],
                ['private', Lock, tr("Locked", "Փակ"), tr("Only students you invite", "Միայն ձեր կողմից հրավիրված ուսանողները")],
              ] as const).map(([v, Icon, l, d]) => (
                <label key={v} className={cx('role-option', visibility === v && 'is-selected')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <input type="radio" name="visibility" className="sr-only" checked={visibility === v} onChange={() => setVisibility(v)} />
                  <Icon aria-hidden="true" style={{ margin: 0 }} />
                  <span>
                    <span className="strong small" style={{ display: 'block' }}>{l}</span>
                    <span className="xs muted">{d}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="settings-list mt-20">
              <Toggle label={tr("Open Enrollment", "Բաց գրանցում")} description={tr("Students can enroll on their own", "Ուսանողները կարող են ինքնուրույն գրանցվել")} checked={openEnroll} onChange={setOpenEnroll} />
              <Toggle label={tr("Certificate of Completion", "Ավարտական վկայական")} description={tr("Awarded after all assignments are submitted", "Տրամադրվում է բոլոր առաջադրանքները հանձնելուց հետո")} checked={certificate} onChange={setCertificate} />
            </div>
          </Card>
        </div>

        <aside className="stack" style={{ ['--gap' as string]: '16px', position: 'sticky', top: 88 }}>
          <div className="small strong" style={{ color: 'var(--navy-900)' }}>{tr("Course Card Preview", "Դասընթացի քարտի նախադիտում")}</div>
          <div style={{ pointerEvents: 'none' }}>
            <CourseCard course={preview} />
          </div>
          <Notice tone="neutral">{tr("Saving is simulated. No course will be created on a server.", "Պահպանումը ցուցադրական է․ դասընթացը չի ստեղծվի սերվերում։")}</Notice>
          <Button type="submit" variant="secondary" block icon={<Save />}>{tr("Save as Draft", "Պահել որպես սևագիր")}</Button>
          <Button variant="primary" block icon={<Send />} onClick={() => save(true)()}>{isEdit ? tr("Save and Publish", "Պահել և հրապարակել") : tr("Create and Publish", "Ստեղծել և հրապարակել")}</Button>
          <Button variant="ghost" block onClick={() => navigate(-1)}>{tr("Cancel", "Չեղարկել")}</Button>
        </aside>
      </form>
    </>
  );
}

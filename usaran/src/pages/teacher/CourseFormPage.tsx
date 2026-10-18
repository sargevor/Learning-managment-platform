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
    language: existing?.language ?? 'Հայերեն',
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
    return <div className="card"><EmptyState title="Դասընթացը չի գտնվել" text="Դուք կարող եք խմբագրել միայն ձեր դասընթացները։" /></div>;
  }

  const validate = () => {
    const n: Record<string, string> = {};
    if (form.title.trim().length < 5) n.title = 'Անվանումը պետք է լինի առնվազն 5 նիշ';
    if (form.shortDescription.trim().length < 20) n.shortDescription = 'Կարճ նկարագրությունը պետք է լինի առնվազն 20 նիշ';
    const h = Number(form.durationHours);
    if (!h || h < 1 || h > 200) n.durationHours = 'Նշեք 1-ից 200 ժամ';
    if (objectives.filter((o) => o.trim()).length === 0) n.objectives = 'Ավելացրեք առնվազն մեկ ուսումնական նպատակ';
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const save = (publish: boolean) => (e?: FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.warning('Ստուգեք ձևաթուղթը', 'Որոշ դաշտեր լրացված չեն պատշաճ։');
      return;
    }
    toast.success(publish ? 'Դասընթացը հրապարակվեց' : 'Սևագիրը պահվեց', 'Դեմո ռեժիմ. տվյալները չեն պահպանվում սերվերում։');
    navigate(isEdit ? `/teacher/courses/${id}` : '/teacher/courses');
  };

  const preview: Course = {
    ...(existing ?? ({} as Course)),
    id: existing?.id ?? 'preview',
    title: form.title || 'Դասընթացի անվանումը',
    shortDescription: form.shortDescription || 'Կարճ նկարագրությունը կհայտնվի այստեղ։',
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
        breadcrumbs={[{ label: 'Դասընթացներ', to: '/teacher/courses' }, ...(existing ? [{ label: existing.title, to: `/teacher/courses/${existing.id}` }] : []), { label: isEdit ? 'Խմբագրում' : 'Նոր դասընթաց' }]}
        title={isEdit ? 'Խմբագրել դասընթացը' : 'Նոր դասընթաց'}
        description={isEdit ? 'Թարմացրեք դասընթացի հիմնական տվյալները և հրապարակման կարգավորումները։' : 'Լրացրեք հիմնական տվյալները։ Մոդուլներն ու դասերը կավելացնեք հաջորդ քայլում։'}
      />

      <form className="grid grid-main-aside" onSubmit={save(false)} noValidate>
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          <Card title="Հիմնական տվյալներ">
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              <Input label="Անվանում" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="Օր.՝ Վեբ մշակման հիմունքներ" maxLength={90} hint={`${form.title.length}/90`} />
              <Textarea label="Կարճ նկարագրություն" required rows={2} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} error={errors.shortDescription} hint="Ցուցադրվում է կատալոգի քարտում" maxLength={160} style={{ minHeight: 70 }} />
              <Textarea label="Մանրամասն նկարագրություն" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ում համար է դասընթացը, ինչ նախնական գիտելիքներ են պետք, ինչպես է կառուցված…" />
              <div className="grid grid-3" style={{ ['--gap' as string]: '16px' }}>
                <Select label="Ուղղություն" value={form.category} onChange={(e) => set('category', e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
                <Select label="Մակարդակ" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} options={Object.entries(difficultyLabel).map(([value, label]) => ({ value, label }))} />
                <Input label="Տևողություն (ժամ)" type="number" min={1} max={200} required value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} error={errors.durationHours} />
                <Select label="Լեզու" value={form.language} onChange={(e) => set('language', e.target.value)} options={[{ value: 'Հայերեն', label: 'Հայերեն' }, { value: 'Հայերեն / անգլերեն', label: 'Հայերեն / անգլերեն' }, { value: 'Անգլերեն', label: 'Անգլերեն' }]} />
                <Input label="Մեկնարկի ամսաթիվ" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Ուսումնական նպատակներ" subtitle="Ինչ կկարողանա անել ուսանողը դասընթացից հետո">
            <div className="stack" style={{ ['--gap' as string]: '10px' }}>
              {objectives.map((o, i) => (
                <div key={i} className="row">
                  <span className="xs muted" style={{ width: 18 }}>{i + 1}.</span>
                  <input className="input grow" value={o} aria-label={`Նպատակ ${i + 1}`} placeholder="Օր.՝ Կառուցել ինտերակտիվ վեբ էջ" onChange={(e) => setObjectives((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
                  <Button variant="ghost" iconOnly icon={<Trash2 />} aria-label={`Հեռացնել նպատակ ${i + 1}`} disabled={objectives.length === 1} onClick={() => setObjectives((l) => l.filter((_, j) => j !== i))} />
                </div>
              ))}
              {errors.objectives && <span className="field__error">{errors.objectives}</span>}
              <div>
                <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setObjectives((l) => [...l, ''])} disabled={objectives.length >= 8}>Ավելացնել նպատակ</Button>
              </div>
            </div>
          </Card>

          <Card title="Շապիկի նկար">
            <div className="image-choices">
              {IMAGE_CHOICES.concat(existing && !IMAGE_CHOICES.includes(existing.image) ? [existing.image] : []).map((src) => (
                <button key={src} type="button" className={cx('image-choice', form.image === src && 'is-selected')} onClick={() => set('image', src)} aria-pressed={form.image === src} aria-label="Ընտրել նկարը">
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <Input label="Կամ նշեք նկարի հղումը" value={form.image} onChange={(e) => set('image', e.target.value)} fieldClassName="mt-20" hint="Ցուցադրական տարբերակում ֆայլեր չեն վերբեռնվում" />
          </Card>

          <Card title="Տեսանելիություն և գրանցում">
            <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, ['--gap' as string]: '10px' }}>
              <legend className="field__label" style={{ marginBottom: 8 }}>Ով կարող է տեսնել դասընթացը</legend>
              {([
                ['public', Globe, 'Հանրային', 'Դասընթացը երևում է կատալոգում բոլորին'],
                ['link', Link2, 'Հղումով', 'Միայն նրանք, ովքեր ունեն հղումը'],
                ['private', Lock, 'Փակ', 'Միայն ձեր կողմից հրավիրված ուսանողները'],
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
              <Toggle label="Բաց գրանցում" description="Ուսանողները կարող են ինքնուրույն գրանցվել" checked={openEnroll} onChange={setOpenEnroll} />
              <Toggle label="Ավարտական վկայական" description="Տրամադրվում է բոլոր առաջադրանքները հանձնելուց հետո" checked={certificate} onChange={setCertificate} />
            </div>
          </Card>
        </div>

        <aside className="stack" style={{ ['--gap' as string]: '16px', position: 'sticky', top: 88 }}>
          <div className="small strong" style={{ color: 'var(--navy-900)' }}>Կատալոգի քարտի նախադիտում</div>
          <div style={{ pointerEvents: 'none' }}>
            <CourseCard course={preview} />
          </div>
          <Notice tone="neutral">Պահպանումը ցուցադրական է. դասընթացը չի ստեղծվի սերվերում։</Notice>
          <Button type="submit" variant="secondary" block icon={<Save />}>Պահել որպես սևագիր</Button>
          <Button variant="primary" block icon={<Send />} onClick={() => save(true)()}>{isEdit ? 'Պահել և հրապարակել' : 'Ստեղծել և հրապարակել'}</Button>
          <Button variant="ghost" block onClick={() => navigate(-1)}>Չեղարկել</Button>
        </aside>
      </form>
    </>
  );
}

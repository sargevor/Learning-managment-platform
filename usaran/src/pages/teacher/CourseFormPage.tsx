import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, Calendar, Check, ChevronDown, CircleCheck, Clock, CloudUpload, Eye, FileText, Globe, Image, Languages,
  LibraryBig, Link as LinkIcon, Lock, Plus, Save, Send, SlidersHorizontal, Target, Trash2, Upload, UserPlus, X,
} from 'lucide-react';
import type { CategoryId, Difficulty } from '../../types';
import { categories, difficultyLabel, getCourse } from '../../data/courses';
import { DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState, Thumb } from '../../components/ui/Misc';
import { IconBox } from '../../components/ui/Visual';
import { CATEGORY_ICONS, categoryImage, SCENES } from '../../lib/visual';
import { cx } from '../../lib/format';

/** Suggested covers: local category photos and a study scene. */
const COVERS: { src: string; label: string }[] = [
  { src: categoryImage('programming'), label: 'Code on a laptop' },
  { src: categoryImage('math'), label: 'Mathematics' },
  { src: categoryImage('design'), label: 'Design sketches' },
  { src: categoryImage('science'), label: 'Science lab' },
  { src: SCENES.study, label: 'Students at a laptop' },
];

const SHORT_CAT: Record<CategoryId, string> = {
  programming: 'Programming', design: 'Design', math: 'Mathematics', ai: 'AI',
  data: 'Data analysis', languages: 'Languages', science: 'Sciences', business: 'Business',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type Visibility = 'public' | 'link' | 'private';

const VISIBILITY: { key: Visibility; name: string; icon: typeof Globe; hint: string; hintIcon: typeof Globe }[] = [
  { key: 'public', name: 'Public', icon: Globe, hint: 'Catalog', hintIcon: LibraryBig },
  { key: 'link', name: 'Unlisted', icon: LinkIcon, hint: 'Link only', hintIcon: LinkIcon },
  { key: 'private', name: 'Locked', icon: Lock, hint: 'Invite only', hintIcon: UserPlus },
];

/** Accessible on/off switch (44px target). */
function Switch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="tc-switch" onClick={() => onChange(!checked)}>
      <span className="tc-switch__track"><span className="tc-switch__knob" /></span>
    </button>
  );
}

function SectionTitle({ id, icon, children }: { id: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="tc-sec-title">
      <IconBox icon={icon} size="md" />
      <h2 id={id}>{children}</h2>
    </div>
  );
}

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
    language: existing?.language ?? 'English',
    image: existing?.image ?? COVERS[0].src,
    startDate: '2026-11-02',
  });
  const [objectives, setObjectives] = useState<string[]>(existing?.objectives ?? ['']);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [openEnroll, setOpenEnroll] = useState(true);
  const [certificate, setCertificate] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const objectUrl = useRef<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  if (isEdit && (!existing || existing.teacherId !== DEMO_TEACHER_ID)) {
    return <div className="tc-card"><EmptyState title="Course not found" action={<ButtonLink to="/teacher/courses">My courses</ButtonLink>} /></div>;
  }

  /** Local preview only: the file is not uploaded in this demo. */
  const pickFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    set('image', objectUrl.current);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const validate = () => {
    const n: Record<string, string> = {};
    if (form.title.trim().length < 5) n.title = 'At least 5 characters';
    if (form.shortDescription.trim().length < 20) n.shortDescription = 'At least 20 characters';
    const h = Number(form.durationHours);
    if (!h || h < 1 || h > 200) n.durationHours = '1 to 200 hours';
    if (objectives.filter((o) => o.trim()).length === 0) n.objectives = 'Add at least one goal';
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const save = (publish: boolean) => (e?: FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.warning('Check the form', 'Some fields need attention.');
      return;
    }
    toast.success(publish ? 'Course published' : 'Draft saved', 'Demo: nothing is saved to a server.');
    navigate(isEdit ? `/teacher/courses/${id}` : '/teacher/courses');
  };

  const CatIcon = CATEGORY_ICONS[form.category];
  const covers = existing && !COVERS.some((c) => c.src === existing.image) ? [{ src: existing.image, label: 'Current cover' }, ...COVERS] : COVERS;
  const updated = existing ? new Date(existing.updatedAt) : null;
  const live = existing?.status === 'published';

  return (
    <div className="tc-page">
      <ShellTitle
        title={isEdit ? 'Edit course' : 'New course'}
        meta={
          existing ? (
            <><CatIcon aria-hidden="true" /><b>{existing.title}</b><span className="tc-dot" aria-hidden="true" />Updated {updated!.getDate()} {MONTHS[updated!.getMonth()]}</>
          ) : (
            <><FileText aria-hidden="true" /><b>Draft</b></>
          )
        }
      />

      <form aria-label="Course form" className="tc-form" onSubmit={save(false)} noValidate>
        <Link to={existing ? `/teacher/courses/${existing.id}` : '/teacher/courses'} className="tc-back"><ArrowLeft aria-hidden="true" />{existing ? 'Course' : 'Courses'}</Link>

        <section aria-labelledby="s-basics" className="tc-card tc-form__sec">
          <SectionTitle id="s-basics" icon={<FileText />}>Basics</SectionTitle>
          <label className="tc-field">
            <span className="tc-field__label">Title<span className="tc-count">{form.title.length}/90</span></span>
            <input className="input tc-input" type="text" value={form.title} maxLength={90} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title} placeholder="e.g. Web Development Fundamentals" />
            {errors.title && <span className="field__error">{errors.title}</span>}
          </label>
          <label className="tc-field">
            <span className="tc-field__label">Short description<span className="tc-count">{form.shortDescription.length}/160</span></span>
            <textarea className="textarea tc-textarea" rows={2} maxLength={160} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} aria-invalid={!!errors.shortDescription} />
            {errors.shortDescription && <span className="field__error">{errors.shortDescription}</span>}
          </label>
          <label className="tc-field">
            <span className="tc-field__label">Full description</span>
            <textarea className="textarea tc-textarea" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </label>
          <div role="group" aria-labelledby="l-cat" className="tc-field">
            <span id="l-cat" className="tc-field__label">Category</span>
            <div className="tc-picks">
              {categories.map((c) => {
                const Icon = CATEGORY_ICONS[c.id];
                const on = form.category === c.id;
                return (
                  <button key={c.id} type="button" className={cx('tc-pick', on && 'is-on')} aria-pressed={on} onClick={() => set('category', c.id)} title={c.name}>
                    <span className="tc-pick__icon"><Icon aria-hidden="true" /></span>
                    <span className="tc-grow tc-pick__name">{SHORT_CAT[c.id]}</span>
                    {on && <CircleCheck aria-hidden="true" className="tc-pick__check" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div role="group" aria-labelledby="l-level" className="tc-field">
            <span id="l-level" className="tc-field__label">Level</span>
            <div className="tc-seg tc-seg--3">
              {(Object.entries(difficultyLabel) as [Difficulty, string][]).map(([key, name], i) => {
                const on = form.difficulty === key;
                return (
                  <button key={key} type="button" aria-pressed={on} className={cx('tc-seg__btn', on && 'is-on')} onClick={() => set('difficulty', key)}>
                    <span className="tc-lvl" aria-hidden="true">
                      {[6, 11, 16].map((h, j) => <span key={h} className={cx(j <= i && 'is-fill')} style={{ height: h }} />)}
                    </span>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="s-goals" className="tc-card tc-form__sec">
          <SectionTitle id="s-goals" icon={<Target />}>Goals</SectionTitle>
          <div className="tc-goals">
            {objectives.map((o, i) => (
              <div key={i} className="tc-goal">
                <span className="tc-goal__n" aria-hidden="true">{i + 1}</span>
                <input className="input tc-input tc-grow" value={o} aria-label={`Goal ${i + 1}`} placeholder="e.g. Build an interactive page" onChange={(e) => setObjectives((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="tc-iconbtn" aria-label={`Remove goal ${i + 1}`} disabled={objectives.length === 1} onClick={() => setObjectives((l) => l.filter((_, j) => j !== i))}><Trash2 /></button>
              </div>
            ))}
            {errors.objectives && <span className="field__error">{errors.objectives}</span>}
            <button type="button" className="tc-dashed-btn tc-dashed-btn--tall" onClick={() => setObjectives((l) => [...l, ''])} disabled={objectives.length >= 8}><Plus aria-hidden="true" />Add goal</button>
          </div>
        </section>

        <section aria-labelledby="s-cover" className="tc-card tc-form__sec">
          <SectionTitle id="s-cover" icon={<Image />}>Cover image</SectionTitle>
          <div
            className={cx('tc-drop', dragOver && 'is-over')}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="tc-drop__img">
              <Thumb src={form.image} alt="Current cover" className="tc-fill" />
              <span className="tc-drop__scrim" />
              <div className="tc-drop__bar">
                <span className="tc-drop__hint"><CloudUpload aria-hidden="true" />Drop a photo here</span>
                <span className="tc-grow" />
                <span className="tc-glass-chip">16:9</span>
                <label className="tc-pill tc-pill--white">
                  <Upload aria-hidden="true" />Change
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
          <div role="group" aria-label="Suggested covers" className="tc-covers">
            {covers.map((p) => {
              const on = form.image === p.src;
              return (
                <button key={p.src} type="button" aria-pressed={on} aria-label={p.label} className={cx('tc-cover', on && 'is-on')} onClick={() => set('image', p.src)}>
                  <img src={p.src} alt="" loading="lazy" />
                  {on && <span className="tc-cover__check"><Check aria-hidden="true" /></span>}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="s-details" className="tc-card tc-form__sec">
          <SectionTitle id="s-details" icon={<SlidersHorizontal />}>Details</SectionTitle>
          <div className="tc-cols">
            <label className="tc-field">
              <span className="tc-field__label">Hours</span>
              <span className="tc-iconfield">
                <Clock aria-hidden="true" />
                <input className="input tc-input" type="number" min={1} max={200} value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} aria-invalid={!!errors.durationHours} />
              </span>
              {errors.durationHours && <span className="field__error">{errors.durationHours}</span>}
            </label>
            <label className="tc-field">
              <span className="tc-field__label">Language</span>
              <span className="tc-iconfield">
                <Languages aria-hidden="true" />
                <select className="input tc-input tc-nativeselect" value={form.language} onChange={(e) => set('language', e.target.value)}>
                  <option value="English">English</option>
                </select>
                <ChevronDown aria-hidden="true" className="tc-iconfield__chev" />
              </span>
            </label>
            <label className="tc-field">
              <span className="tc-field__label">Start date</span>
              <span className="tc-iconfield">
                <Calendar aria-hidden="true" />
                <input className="input tc-input" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </span>
            </label>
          </div>
        </section>

        <section aria-labelledby="s-publish" className="tc-card tc-form__sec">
          <SectionTitle id="s-publish" icon={<Send />}>Publish</SectionTitle>
          <div role="group" aria-label="Visibility" className="tc-vis">
            {VISIBILITY.map((v) => {
              const on = visibility === v.key;
              return (
                <button key={v.key} type="button" aria-pressed={on} className={cx('tc-pick tc-pick--tall', on && 'is-on')} onClick={() => setVisibility(v.key)}>
                  <span className="tc-pick__icon tc-pick__icon--lg"><v.icon aria-hidden="true" /></span>
                  <b>{v.name}</b>
                  <span className="tc-pick__hint"><v.hintIcon aria-hidden="true" />{v.hint}</span>
                </button>
              );
            })}
          </div>
          <div className="tc-switches">
            <div className="tc-switchrow">
              <IconBox icon={<UserPlus />} size="sm" />
              <span id="sw-enrol" className="tc-grow">Open enrolment</span>
              <Switch id="sw-enrol" checked={openEnroll} onChange={setOpenEnroll} />
            </div>
            <div className="tc-switchrow">
              <IconBox icon={<Award />} size="sm" />
              <span id="sw-cert" className="tc-grow">Certificate</span>
              <Switch id="sw-cert" checked={certificate} onChange={setCertificate} />
            </div>
          </div>
        </section>

        <div className="tc-actionbar">
          <img src={form.image} alt="" className="tc-actionbar__thumb" />
          <span className={live ? 'tc-status tc-status--live tc-status--static' : 'tc-status tc-status--static'}>
            {live ? <Eye aria-hidden="true" /> : <FileText aria-hidden="true" />}
            {live ? 'Published' : 'Draft'}
          </span>
          <span className="tc-grow" />
          <button type="button" className="tc-textbtn" onClick={() => navigate(-1)}><X aria-hidden="true" />Cancel</button>
          <button type="submit" className="btn btn--secondary"><Save aria-hidden="true" />Save draft</button>
          <button type="button" className="btn btn--primary" onClick={() => save(true)()}><Send aria-hidden="true" />Publish</button>
        </div>
      </form>
    </div>
  );
}

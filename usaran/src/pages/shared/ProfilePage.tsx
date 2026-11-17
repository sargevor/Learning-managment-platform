import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Briefcase, Calendar, Check, ChevronRight, Eye, FileText, GraduationCap, Image, LibraryBig, Mail, MapPin, Pencil, Phone, Save, Settings, Star, Target, Trophy, User as UserIcon, Users, X } from 'lucide-react';
import type { Role, User } from '../../types';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { getEnrolledCourses } from '../../data/enrollments';
import { courses } from '../../data/courses';
import { studentRecords } from '../../data/analytics';
import { getGradeRows } from '../../data/studentView';
import { ShellTitle } from '../../components/layout/AppShell';
import { Avatar } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { SCENES } from '../../lib/visual';
import { average, cx } from '../../lib/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type FieldKey = 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'institution' | 'program' | 'year' | 'title';

export function ProfilePage({ role }: { role: Role }) {
  const session = useDemoSession();
  const toast = useToast();
  const user = role === 'student' ? session.student : session.teacher;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<User>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const name = `${user.firstName} ${user.lastName}`;
  const set = (k: keyof User, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const shown = editing ? draft : user;

  const startEdit = () => {
    setDraft(user);
    setEditing(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      formRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    });
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!draft.firstName.trim()) n.firstName = 'First name is required';
    if (!draft.lastName.trim()) n.lastName = 'Last name is required';
    if (!EMAIL_RE.test(draft.email)) n.email = 'Invalid email';
    if (draft.phone && !/^[+\d\s()-]{6,}$/.test(draft.phone)) n.phone = 'Invalid phone number';
    setErrors(n);
    if (Object.keys(n).length) return;
    session.updateUser(role, draft);
    setEditing(false);
    toast.success('Profile updated', 'Saved on this page only.');
  };

  const enrolled = role === 'student' ? getEnrolledCourses() : [];
  const own = courses.filter((c) => c.teacherId === user.id);
  const rated = own.filter((c) => c.rating > 0);
  const gradeRows = role === 'student' ? getGradeRows().filter((r) => r.percent >= 0) : [];

  const stats: { label: string; value: ReactNode; unit?: string; icon: ReactNode; to: string }[] =
    role === 'student'
      ? [
          { label: 'Courses', value: enrolled.length, icon: <BookOpen />, to: '/student/courses' },
          { label: 'Completed', value: enrolled.filter((e) => e.state === 'completed').length, icon: <Trophy />, to: '/student/courses' },
          { label: 'Average result', value: average(gradeRows.map((r) => r.percent)), unit: '%', icon: <Target />, to: '/student/grades' },
        ]
      : [
          { label: 'Courses', value: own.length, icon: <BookOpen />, to: '/teacher/courses' },
          { label: 'Students', value: studentRecords.length, icon: <Users />, to: '/teacher/students' },
          { label: 'Rating', value: rated.length ? (rated.reduce((a, c) => a + c.rating, 0) / rated.length).toFixed(1) : '—', icon: <Star />, to: '/teacher/courses' },
        ];

  const fields: { key: FieldKey; label: string; icon: ReactNode; type?: string; auto?: string; required?: boolean; placeholder?: string; wide?: boolean }[] = [
    { key: 'firstName', label: 'First name', icon: <UserIcon />, auto: 'given-name', required: true },
    { key: 'lastName', label: 'Last name', icon: <UserIcon />, auto: 'family-name', required: true },
    { key: 'email', label: 'Email', icon: <Mail />, type: 'email', auto: 'email', required: true },
    { key: 'phone', label: 'Phone', icon: <Phone />, type: 'tel', auto: 'tel', placeholder: '+374 XX XXX XXX' },
    { key: 'city', label: 'City', icon: <MapPin />, auto: 'address-level2' },
    { key: 'institution', label: role === 'student' ? 'Institution' : 'Organisation', icon: <LibraryBig />, auto: 'organization' },
    ...(role === 'student'
      ? [
          { key: 'program' as const, label: 'Programme', icon: <GraduationCap /> },
          { key: 'year' as const, label: 'Year', icon: <Calendar /> },
        ]
      : [{ key: 'title' as const, label: 'Title', icon: <Briefcase />, wide: true }]),
  ];

  const joined = new Date(user.joinedAt);
  const sub = role === 'student' ? [user.program, user.year && user.year !== '—' ? user.year : ''].filter(Boolean).join(', ') : user.title;

  return (
    <>
      <ShellTitle
        title="My profile"
        meta={
          <>
            {role === 'student' ? <GraduationCap aria-hidden="true" /> : <Briefcase aria-hidden="true" />}
            {sub && <b>{sub}</b>}
            {sub && user.institution && <span className="tp-dot" aria-hidden="true" />}
            {user.institution}
          </>
        }
      />

      <section aria-label={name} className="tp-cover">
        <div className="tp-cover__banner">
          <img src={(role === 'student' ? enrolled[0]?.course.image : own[0]?.image) ?? SCENES.study} alt="" />
        </div>
        <div className="tp-cover__body">
          <span className="tp-cover__photo">
            {avatar ? <img src={avatar} alt={name} className="tp-cover__img" /> : <Avatar name={name} size={152} />}
            <button type="button" className="tp-cover__cam" onClick={() => fileRef.current?.click()} aria-label="Change photo">
              <Image aria-hidden="true" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setAvatar(URL.createObjectURL(f));
                  toast.info('Photo updated', 'Shown in this browser only, not uploaded.');
                }
              }}
            />
          </span>
          <div className="tp-cover__text">
            <h2 className="tp-hero__name">{name}</h2>
            <div className="tp-chips">
              <span className="tp-chip tp-chip--lg tp-chip--blue">{role === 'student' ? <GraduationCap aria-hidden="true" /> : <Briefcase aria-hidden="true" />}{role === 'student' ? 'Student' : 'Teacher'}</span>
              {user.city && <span className="tp-chip tp-chip--lg tp-chip--plain"><MapPin aria-hidden="true" />{user.city}</span>}
              <span className="tp-chip tp-chip--lg tp-chip--plain"><Calendar aria-hidden="true" />Since {MONTHS[joined.getMonth()]} {joined.getFullYear()}</span>
            </div>
          </div>
          <div className="tp-actions">
            {!editing && (
              <button type="button" className="tp-btn tp-btn--primary" onClick={startEdit}>
                <Pencil aria-hidden="true" />Edit profile
              </button>
            )}
            <Link to={`/${role}/settings`} className="tp-iconbtn" aria-label="Settings">
              <Settings aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Summary" className="tp-tiles">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} icon={s.icon} to={s.to} />
        ))}
      </section>

      <section className="tp-split">
        <form ref={formRef} onSubmit={save} noValidate aria-label="Personal details" className={cx('tp-card tp-span2 tp-form', !editing && 'tp-form--view')}>
          <div className="tp-head">
            <h2 className="tp-h2">Personal details</h2>
            <span className="tp-count"><Eye aria-hidden="true" />{role === 'student' ? 'Teachers and classmates' : 'Students'}</span>
          </div>
          <div className="tp-fields">
            {fields.map((f) => {
              const id = `pf-${f.key}`;
              const err = errors[f.key];
              return (
                <div key={f.key} className={cx('tp-field', f.wide && 'tp-field--wide')}>
                  <label htmlFor={id}>{f.label}{f.required && editing && <span className="tp-req" aria-hidden="true"> *</span>}</label>
                  <span className={cx('tp-input', err && 'tp-input--error')}>
                    {f.icon}
                    <input
                      id={id}
                      type={f.type ?? 'text'}
                      autoComplete={f.auto}
                      required={f.required}
                      placeholder={editing ? f.placeholder : undefined}
                      value={(shown[f.key] as string | undefined) ?? ''}
                      disabled={!editing}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={err ? `${id}-err` : undefined}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  </span>
                  {err && <span id={`${id}-err`} className="tp-error" role="alert">{err}</span>}
                </div>
              );
            })}
          </div>
          <div className="tp-field">
            <div className="tp-field__row">
              <label htmlFor="pf-bio">About me</label>
              {editing && <span className="tp-count">{(draft.bio ?? '').length}/400</span>}
            </div>
            <span className="tp-input tp-input--area">
              <FileText />
              <textarea id="pf-bio" rows={3} maxLength={400} value={shown.bio ?? ''} disabled={!editing} onChange={(e) => set('bio', e.target.value)} />
            </span>
          </div>
          {editing && (
            <div className="tp-form__foot">
              <button type="button" className="tp-btn tp-btn--secondary" onClick={() => { setEditing(false); setErrors({}); }}>
                <X aria-hidden="true" />Cancel
              </button>
              <button type="submit" className="tp-btn tp-btn--primary">
                <Save aria-hidden="true" />Save
              </button>
            </div>
          )}
        </form>

        <div className="tp-card">
          <div className="tp-head">
            <h2 className="tp-h2">My courses</h2>
            <Link to={`/${role}/courses`} className="tp-more">All<ChevronRight aria-hidden="true" /></Link>
          </div>
          <div className="tp-pills">
            {role === 'student'
              ? enrolled.map((e) => (
                  <Link key={e.course.id} to={e.state === 'not-started' ? '/student/courses' : `/student/courses/${e.course.id}/learn`} className="tp-pill" title={e.course.title}>
                    <img src={e.course.image} alt="" />
                    <span className="tp-ellipsis">{shortCourse(e.course.title)}</span>
                    <span className={cx('tp-pill__tag', e.state === 'completed' && 'tp-pill__tag--done')}>
                      {e.state === 'completed' ? <><Check aria-hidden="true" />Done</> : e.state === 'not-started' ? 'New' : `${e.progress}%`}
                    </span>
                  </Link>
                ))
              : own.map((c) => (
                  <Link key={c.id} to={`/teacher/courses/${c.id}`} className="tp-pill" title={c.title}>
                    <img src={c.image} alt="" />
                    <span className="tp-ellipsis">{shortCourse(c.title)}</span>
                    <span className={cx('tp-pill__tag', c.status === 'published' && 'tp-pill__tag--done')}>
                      {c.status === 'published' ? <><Check aria-hidden="true" />Live</> : c.status === 'draft' ? 'Draft' : 'Archived'}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** "React: Building Modern Interfaces" -> "React". */
function shortCourse(title: string): string {
  const head = title.split(/[:,(]/)[0].trim();
  return head.length > 26 ? `${head.slice(0, 24)}…` : head;
}

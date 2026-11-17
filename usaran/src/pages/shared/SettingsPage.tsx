import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChartColumn, Check, ChevronDown, ChevronRight, CircleAlert, Clock, Eye, EyeOff, FileQuestionMark, Globe, GraduationCap, Info, Languages, LayoutDashboard, Lock, LogOut, Mail, MessageSquare, Monitor, Save, Send, ShieldCheck, Smartphone, Trash2, User, UserPlus, Video } from 'lucide-react';
import type { Role } from '../../types';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { cx } from '../../lib/format';

type Section = 'account' | 'notifications' | 'privacy' | 'language';

const SECTIONS: { key: Section; label: string; icon: typeof User }[] = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { key: 'language', label: 'Language', icon: Languages },
];

type Pref = { key: string; label: string; icon: typeof Bell; when?: string };

const STUDENT_PREFS: Pref[] = [
  { key: 'deadlines', label: 'Deadlines', icon: Clock, when: '48 h' },
  { key: 'grades', label: 'New grades', icon: GraduationCap },
  { key: 'content', label: 'New lessons', icon: Video },
  { key: 'quizzes', label: 'New quizzes', icon: FileQuestionMark },
  { key: 'digest', label: 'Weekly digest', icon: Calendar, when: 'Mon' },
];
const TEACHER_PREFS: Pref[] = [
  { key: 'submissions', label: 'New submissions', icon: Send },
  { key: 'questions', label: 'Student questions', icon: MessageSquare },
  { key: 'risk', label: 'At-risk students', icon: CircleAlert, when: '10 d' },
  { key: 'enroll', label: 'New enrolments', icon: UserPlus },
  { key: 'digest', label: 'Weekly report', icon: Calendar, when: 'Mon' },
];

const LANGS = [
  { value: 'en', short: 'En', name: 'English', note: 'Active', enabled: true },
  { value: 'hy', short: 'Hy', name: 'Armenian', note: 'Soon', enabled: false },
  { value: 'ru', short: 'Ru', name: 'Russian', note: 'Soon', enabled: false },
];

/** Accessible on/off switch: a real checkbox with role="switch" over a drawn track. */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="tp-switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="tp-switch__track" aria-hidden="true"><span /></span>
    </label>
  );
}

function PwField({ id, label, auto, value, onChange, error }: { id: string; label: string; auto: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="tp-field">
      <label htmlFor={id}>{label}</label>
      <span className={cx('tp-input tp-input--pw', error && 'tp-input--error')}>
        <Lock />
        <input id={id} type={show ? 'text' : 'password'} autoComplete={auto} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} />
        <button type="button" className="tp-input__eye" aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={show} onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </span>
      {error && <span id={`${id}-err`} className="tp-error" role="alert">{error}</span>}
    </div>
  );
}

export function SettingsPage({ role }: { role: Role }) {
  const toast = useToast();
  const navigate = useNavigate();
  const session = useDemoSession();
  const user = role === 'student' ? session.student : session.teacher;
  const [active, setActive] = useState<Section>('account');

  const prefs = role === 'student' ? STUDENT_PREFS : TEACHER_PREFS;
  const [email, setEmail] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map((p, i) => [p.key, i !== 4])));
  const [push, setPush] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map((p, i) => [p.key, i < 2])));

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [twoFa, setTwoFa] = useState(false);
  const [lang, setLang] = useState('en');
  const [tz, setTz] = useState('Asia/Yerevan');
  const [visible, setVisible] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!pw.current) n.current = 'Enter your current password';
    if (pw.next.length < 8) n.next = 'At least 8 characters';
    else if (pw.next === pw.current) n.next = 'Must differ from the current one';
    if (pw.confirm !== pw.next) n.confirm = 'Passwords do not match';
    setPwErr(n);
    if (Object.keys(n).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast.info('Password not changed', 'Demo form: there is no real account.');
  };

  const go = (s: Section) => {
    setActive(s);
    document.getElementById(`set-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sectionHead = (s: Section, extra?: ReactNode) => {
    const meta = SECTIONS.find((x) => x.key === s)!;
    return (
      <h2 id={`set-${s}-h`} className="tp-h2">
        <meta.icon aria-hidden="true" />
        {meta.label}
        {extra}
      </h2>
    );
  };

  return (
    <>
      <ShellTitle
        title="Settings"
        meta={
          <>
            <User aria-hidden="true" />
            <b>{user.firstName} {user.lastName}</b>
            <span className="tp-dot" aria-hidden="true" />
            {role === 'student' ? 'Student account' : 'Teacher account'}
          </>
        }
      />

      <div className="tp-settings">
        <nav aria-label="Settings sections" className="tp-subnav">
          {SECTIONS.map((s) => (
            <button key={s.key} type="button" className={cx('tp-subnav__link', active === s.key && 'tp-subnav__link--on')} aria-current={active === s.key ? 'true' : undefined} onClick={() => go(s.key)}>
              <span className="tp-subnav__box"><s.icon aria-hidden="true" /></span>
              <span className="tp-ellipsis">{s.label}</span>
              <ChevronRight aria-hidden="true" className="tp-subnav__chev" />
            </button>
          ))}
        </nav>

        <div className="tp-panels">
          {/* Account */}
          <section id="set-account" aria-labelledby="h-password" className="tp-card tp-panel tp-panel--account">
            <form onSubmit={changePassword} noValidate className="tp-panel__col">
              <h2 id="h-password" className="tp-h2"><Lock aria-hidden="true" />Password</h2>
              <PwField id="s-pw-current" label="Current password" auto="current-password" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} error={pwErr.current} />
              <PwField id="s-pw-new" label="New password" auto="new-password" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} error={pwErr.next} />
              <PwField id="s-pw-confirm" label="Repeat new password" auto="new-password" value={pw.confirm} onChange={(v) => setPw({ ...pw, confirm: v })} error={pwErr.confirm} />
              <div className="tp-form__foot tp-form__foot--split">
                <span className="tp-chip tp-chip--lg tp-chip--soft"><Info aria-hidden="true" />8+ characters</span>
                <button type="submit" className="tp-btn tp-btn--primary"><ShieldCheck aria-hidden="true" />Update</button>
              </div>
            </form>

            <div className="tp-panel__col">
              <h2 className="tp-h2"><ShieldCheck aria-hidden="true" />Security</h2>
              <div className="tp-setrow tp-setrow--boxed">
                <span className="tp-box tp-box--white" aria-hidden="true"><Lock /></span>
                <span className="tp-setrow__label">Two-step login</span>
                <Switch
                  checked={twoFa}
                  label="Two-step login"
                  onChange={(v) => {
                    setTwoFa(v);
                    toast.info(v ? 'Two-step login on' : 'Two-step login off', 'Demo setting only.');
                  }}
                />
              </div>
              <div className="tp-sublabel">Devices</div>
              {[
                { icon: Monitor, name: 'Chrome, Windows', when: 'Now', current: true },
                { icon: Smartphone, name: 'Safari, iPhone', when: '2 d', current: false },
              ].map((d) => (
                <div key={d.name} className="tp-setrow">
                  <span className="tp-box" aria-hidden="true"><d.icon /></span>
                  <span className="tp-setrow__label">
                    <span className="tp-ellipsis">{d.name}</span>
                    <span className="tp-setrow__sub"><Clock aria-hidden="true" />{d.when}</span>
                  </span>
                  {d.current ? (
                    <span className="tp-chip tp-chip--blue"><Check aria-hidden="true" />This device</span>
                  ) : (
                    <button type="button" className="tp-iconbtn" aria-label={`Log out ${d.name}`} onClick={() => toast.info('Session closed', 'Demo mode.')}>
                      <LogOut aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section id="set-notifications" aria-labelledby="set-notifications-h" className="tp-card tp-panel">
            <div className="tp-notif tp-notif--head">
              {sectionHead('notifications')}
              <span className="tp-notif__col"><Mail aria-hidden="true" />Email</span>
              <span className="tp-notif__col"><LayoutDashboard aria-hidden="true" />In app</span>
            </div>
            {prefs.map((p) => (
              <div key={p.key} className="tp-notif">
                <span className="tp-notif__name">
                  <span className="tp-box" aria-hidden="true"><p.icon /></span>
                  <span className="tp-ellipsis">{p.label}</span>
                  {p.when && <span className="tp-chip tp-chip--soft"><Clock aria-hidden="true" />{p.when}</span>}
                </span>
                <Switch checked={email[p.key]} label={`${p.label} by email`} onChange={(v) => setEmail((s) => ({ ...s, [p.key]: v }))} />
                <Switch checked={push[p.key]} label={`${p.label} in app`} onChange={(v) => setPush((s) => ({ ...s, [p.key]: v }))} />
              </div>
            ))}
            <div className="tp-form__foot">
              <button type="button" className="tp-btn tp-btn--primary" onClick={() => toast.success('Preferences saved', 'This page only, demo mode.')}>
                <Save aria-hidden="true" />Save
              </button>
            </div>
          </section>

          {/* Privacy */}
          <section id="set-privacy" aria-labelledby="set-privacy-h" className="tp-card tp-panel">
            {sectionHead('privacy')}
            {[
              { label: role === 'student' ? 'Visible to classmates' : 'Visible to students', icon: Eye, value: visible, set: setVisible },
              { label: 'Anonymous analytics', icon: ChartColumn, value: analytics, set: setAnalytics },
            ].map((p) => (
              <div key={p.label} className="tp-setrow tp-setrow--line">
                <span className="tp-box" aria-hidden="true"><p.icon /></span>
                <span className="tp-setrow__label">{p.label}</span>
                <Switch checked={p.value} label={p.label} onChange={p.set} />
              </div>
            ))}
          </section>

          {/* Language */}
          <section id="set-language" aria-labelledby="set-language-h" className="tp-card tp-panel">
            {sectionHead('language')}
            <div className="tp-lang">
              <div role="radiogroup" aria-label="Interface language" className="tp-lang__tiles">
                {LANGS.map((l) => {
                  const on = lang === l.value;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-disabled={!l.enabled}
                      className={cx('tp-lang__tile', on && 'tp-lang__tile--on', !l.enabled && 'tp-lang__tile--off')}
                      onClick={() => (l.enabled ? setLang(l.value) : toast.info(`${l.name}: soon`, 'Not available in the demo.'))}
                    >
                      <span className="tp-lang__code">{l.short}</span>
                      <span className="tp-lang__text">
                        <b>{l.name}</b>
                        <span>{l.note}</span>
                      </span>
                      {on && <span className="tp-lang__check"><Check aria-hidden="true" /></span>}
                    </button>
                  );
                })}
              </div>
              <div className="tp-field tp-lang__tz">
                <label htmlFor="s-tz">Time zone</label>
                <span className="tp-input">
                  <Globe />
                  <select id="s-tz" value={tz} onChange={(e) => setTz(e.target.value)}>
                    <option value="Asia/Yerevan">Yerevan (UTC+4)</option>
                    <option value="Europe/Moscow">Moscow (UTC+3)</option>
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="America/Los_Angeles">Los Angeles (UTC−8)</option>
                  </select>
                  <ChevronDown className="tp-input__caret" />
                </span>
              </div>
            </div>
            <div className="tp-form__foot">
              <button type="button" className="tp-btn tp-btn--primary" onClick={() => toast.success('Settings saved', 'This page only.')}>
                <Save aria-hidden="true" />Save
              </button>
            </div>
          </section>

          {/* Danger */}
          <section aria-label="Delete account" className="tp-card tp-danger">
            <span className="tp-box tp-box--lg tp-box--red" aria-hidden="true"><Trash2 /></span>
            <span className="tp-danger__text">
              <b>Delete account</b>
              <span className="tp-chip tp-chip--red"><CircleAlert aria-hidden="true" />Cannot be undone</span>
            </span>
            <button type="button" className="tp-btn tp-btn--danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" />Delete
            </button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.warning('Account not deleted', 'Demo mode: back to the home page.');
          navigate('/');
        }}
        title="Delete account?"
        text="On a real platform this would be final. Nothing is deleted in the demo."
        confirmLabel="Delete"
      />
    </>
  );
}

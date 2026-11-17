import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, CircleCheck, Eye, EyeOff, GraduationCap, Lock, Mail, Minus, Play, Presentation, Sparkles, User, UserPlus } from 'lucide-react';
import type { Role } from '../../types';
import { Brand } from '../../components/layout/Brand';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../lib/format';
import { SCENES } from '../../lib/visual';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Pieces ---------- */

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <fieldset className="cat-roles">
      <legend className="cat-label">I am a</legend>
      <div className="cat-roles__grid">
        {([
          ['student', 'Student', GraduationCap],
          ['teacher', 'Teacher', Presentation],
        ] as const).map(([r, label, Icon]) => (
          <label key={r} className={cx('cat-role', value === r && 'is-on')}>
            <input type="radio" name="role" value={r} checked={value === r} onChange={() => onChange(r)} className="sr-only" />
            <span className="cat-role__icon" aria-hidden="true"><Icon /></span>
            <span className="cat-role__label">{label}</span>
            {value === r && <span className="cat-role__tick" aria-hidden="true"><Check /></span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Label + icon input box + error line. */
function AuthField({ id, label, icon, error, labelAside, after, children }: { id: string; label: string; icon: ReactNode; error?: string; labelAside?: ReactNode; after?: ReactNode; children: ReactNode }) {
  return (
    <div className="cat-fieldwrap">
      <div className="cat-fieldwrap__top">
        <label htmlFor={id} className="cat-label">{label}</label>
        {labelAside}
      </div>
      <div className={cx('cat-input', error && 'is-error', after ? 'has-after' : undefined)}>
        <span className="cat-input__icon" aria-hidden="true">{icon}</span>
        {children}
        {after}
      </div>
      {error && <span id={`${id}-err`} className="cat-error" role="alert">{error}</span>}
    </div>
  );
}

function EyeButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="cat-input__eye" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
    </button>
  );
}

function AuthShell({ photo, tagline, children }: { photo: string; tagline: ReactNode; children: ReactNode }) {
  return (
    <div className="cat-auth">
      <aside className="cat-auth__aside" aria-hidden="true">
        <div className="cat-auth__arch">
          <span className="cat-auth__ring cat-auth__ring--1" />
          <span className="cat-auth__ring cat-auth__ring--2" />
          <div className="cat-auth__photo"><img src={photo} alt="" /></div>
          {/* Illustrative sample cards */}
          <div className="cat-auth__float cat-auth__float--a">
            <span className="cat-auth__ficon"><Play /></span>
            <span><small>React</small><b>Module 2</b></span>
          </div>
          <div className="cat-auth__float cat-auth__float--b">
            <span className="cat-auth__ficon cat-auth__ficon--blue"><CircleCheck /></span>
            <span><small>New grade</small><b className="tabular">92 / 100</b></span>
          </div>
        </div>
        <div className="cat-auth__tagline">{tagline}</div>
      </aside>
      <div className="cat-auth__main">{children}</div>
    </div>
  );
}

/* ---------- Sign in ---------- */

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const fillDemo = () => {
    setEmail(role === 'student' ? 'ani.hakobyan@learnspace.example' : 'armen.sargsyan@learnspace.example');
    setPassword('demo-password');
    setErrors({});
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = 'Enter your email';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Enter your password';
    else if (password.length < 6) next.password = 'At least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success('Welcome', 'Demo sign-in: nothing is checked or saved.');
    navigate(`/${role}/dashboard`);
  };

  return (
    <AuthShell photo={SCENES.study} tagline={<>Learn. Practice. <span>Grow.</span></>}>
      <form className="cat-auth__form" onSubmit={submit} noValidate>
        <Brand />
        <h1 className="cat-auth__h1">Welcome back</h1>
        <RolePicker value={role} onChange={setRole} />
        <AuthField id="login-email" label="Email" icon={<Mail />} error={errors.email}>
          <input id="login-email" type="email" autoComplete="email" placeholder="name@example.am" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'login-email-err' : undefined} required />
        </AuthField>
        <AuthField
          id="login-password"
          label="Password"
          icon={<Lock />}
          error={errors.password}
          labelAside={<button type="button" className="cat-textbtn" onClick={() => toast.info('Password reset', 'No email is sent in this demo.')}>Forgot?</button>}
          after={<EyeButton show={show} onToggle={() => setShow((s) => !s)} />}
        >
          <input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby={errors.password ? 'login-password-err' : undefined} required />
        </AuthField>
        <label className="cat-check">
          <input type="checkbox" />
          Remember me
        </label>
        <div className="cat-auth__actions">
          <button type="submit" className="cat-auth__submit">Sign in<ArrowRight aria-hidden="true" /></button>
          <button type="button" className="cat-auth__ghost" onClick={fillDemo}><Sparkles aria-hidden="true" />Fill demo data</button>
        </div>
        <div className="cat-auth__switch">
          New here?<Link to="/register">Create account<ChevronRight aria-hidden="true" /></Link>
        </div>
      </form>
    </AuthShell>
  );
}

/* ---------- Sign up ---------- */

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', agree: false });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!form.firstName.trim()) n.firstName = 'Enter your first name';
    if (!form.lastName.trim()) n.lastName = 'Enter your last name';
    if (!EMAIL_RE.test(form.email)) n.email = 'Enter a valid email';
    if (form.password.length < 8) n.password = 'At least 8 characters';
    else if (!/\d/.test(form.password)) n.password = 'Add at least one number';
    if (!form.agree) n.agree = 'Please confirm';
    setErrors(n);
    if (Object.keys(n).length) {
      toast.warning('Check the form', 'Some fields need attention.');
      return;
    }
    toast.success('Account ready', 'Demo only: nothing is saved.');
    navigate(`/${role}/dashboard`);
  };

  const pw = form.password;
  const strength = Math.min(4, [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw), /[^\w\s]/.test(pw)].filter(Boolean).length);
  const rules = [
    { label: '8+ characters', ok: pw.length >= 8 },
    { label: '1 number', ok: /\d/.test(pw) },
    { label: '1 symbol', ok: /[^\w\s]/.test(pw) },
  ];

  return (
    <AuthShell photo={SCENES.cta} tagline={<>Start learning <span>today.</span></>}>
      <form className="cat-auth__form" onSubmit={submit} noValidate>
        <Brand />
        <h1 className="cat-auth__h1">Join LearnSpace</h1>
        <RolePicker value={role} onChange={setRole} />
        <div className="cat-auth__pair">
          <AuthField id="reg-first" label="First name" icon={<User />} error={errors.firstName}>
            <input id="reg-first" type="text" autoComplete="given-name" placeholder="Ani" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} aria-invalid={errors.firstName ? true : undefined} aria-describedby={errors.firstName ? 'reg-first-err' : undefined} required />
          </AuthField>
          <AuthField id="reg-last" label="Last name" icon={<User />} error={errors.lastName}>
            <input id="reg-last" type="text" autoComplete="family-name" placeholder="Hakobyan" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} aria-invalid={errors.lastName ? true : undefined} aria-describedby={errors.lastName ? 'reg-last-err' : undefined} required />
          </AuthField>
        </div>
        <AuthField id="reg-email" label="Email" icon={<Mail />} error={errors.email}>
          <input id="reg-email" type="email" autoComplete="email" placeholder="name@example.am" value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'reg-email-err' : undefined} required />
        </AuthField>
        <div className="cat-fieldwrap">
          <AuthField id="reg-password" label="Password" icon={<Lock />} error={errors.password} after={<EyeButton show={show} onToggle={() => setShow((s) => !s)} />}>
            <input id="reg-password" type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => set('password', e.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby={errors.password ? 'reg-password-err reg-strength' : 'reg-strength'} required />
          </AuthField>
          <div id="reg-strength" className="cat-strength">
            <div className="cat-strength__bars" role="img" aria-label={`Password strength: ${strength} of 4`}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={cx(i < strength && 'is-on')} />
              ))}
            </div>
            <span className="cat-strength__label">{pw ? STRENGTH_LABEL[strength] : ''}</span>
          </div>
          <div className="cat-rules">
            {rules.map((r) => (
              <span key={r.label} className={cx('cat-rule', r.ok && 'is-ok')}>
                {r.ok ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                {r.label}
              </span>
            ))}
          </div>
        </div>
        <div className="cat-fieldwrap">
          <label className="cat-check">
            <input type="checkbox" checked={form.agree} onChange={(e) => set('agree', e.target.checked)} aria-invalid={errors.agree ? true : undefined} />
            <span>I've read the <Link to="/about#faq">demo terms</Link></span>
          </label>
          {errors.agree && <span className="cat-error" role="alert">{errors.agree}</span>}
        </div>
        <button type="submit" className="cat-auth__submit"><UserPlus aria-hidden="true" />Create account</button>
        <div className="cat-auth__switch">
          Have an account?<Link to="/login">Sign in<ChevronRight aria-hidden="true" /></Link>
        </div>
      </form>
    </AuthShell>
  );
}

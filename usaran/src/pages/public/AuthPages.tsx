import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Eye, EyeOff, GraduationCap, Presentation, CheckCircle2 } from 'lucide-react';
import type { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input } from '../../components/ui/Field';
import { Notice } from '../../components/ui/Misc';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../lib/format';
import { SCENES } from '../../lib/visual';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <fieldset className="role-picker">
      <legend className="field__label" style={{ marginBottom: 8 }}>How would you like to use LearnSpace?</legend>
      <div className="grid grid-2" style={{ ['--gap' as string]: '10px' }}>
        {([
          ['student', "Student", "Courses, assignments, and results", GraduationCap],
          ['teacher', "Teacher", "Course management, grading, and analytics", Presentation],
        ] as const).map(([r, label, desc, Icon]) => (
          <label key={r} className={cx('role-option', value === r && 'is-selected', r === 'student' ? 't-sky' : 't-lilac')}>
            <input type="radio" name="role" value={r} checked={value === r} onChange={() => onChange(r)} className="sr-only" />
            <span className="tint-box"><Icon aria-hidden="true" /></span>
            <span className="strong small">{label}</span>
            <span className="xs muted">{desc}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AuthAside() {
  return (
    <aside className="auth__aside" aria-hidden="true">
      <div className="auth__copy">
        <span className="kicker">LearnSpace</span>
        <b>Learn at your own pace with video lessons, quizzes, and personal feedback.</b>
      </div>
      <div className="auth__arch"><img src={SCENES.hero} alt="" /></div>
      <div className="auth__float auth__float--course">
        <span className="tint-box t-sky"><BookOpenCheck /></span>
        <div>
          <small>Continue Learning</small>
          <b>React · Module 2</b>
        </div>
      </div>
      <div className="auth__float auth__float--grade">
        <span className="tint-box t-mint"><CheckCircle2 /></span>
        <div>
          <small>New grade</small>
          <b className="tabular">92 / 100</b>
        </div>
      </div>
    </aside>
  );
}

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
    if (!email) next.email = "Enter your email address";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Enter your password";
    else if (password.length < 6) next.password = "Your password must contain at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success("Welcome to the demo", "Your sign-in details have not been verified or saved.");
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>Welcome <span className="hl">back</span></h1>
            <p className="secondary small" style={{ marginTop: 6 }}>Choose Student or Instructor, then fill in your sign-in details.</p>
          </div>
          <Notice tone="neutral">This is a demo sign-in. No authentication takes place, and no information is sent to a server.</Notice>
          <RolePicker value={role} onChange={setRole} />
          <Input label="Email" type="email" autoComplete="email" placeholder="name@example.am" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
          <div className="field">
            <div className="row row--between">
              <label className="field__label" htmlFor="login-password">Password<span className="req">*</span></label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => toast.info("Password Reset", "No email is sent in this demo.")}>Forgot your password?</button>
            </div>
            <div className="input-group">
              <input id="login-password" className="input" style={{ paddingLeft: 16, paddingRight: 52 }} type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby="login-password-err" />
              <button type="button" className="icon-btn input-group__action" style={{ width: 36, height: 36, border: 0 }} onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <span id="login-password-err" className="field__error" role="alert">{errors.password}</span>}
          </div>
          <Checkbox label="Remember me on this device" />
          <Button type="submit" variant="accent" size="lg" block>Sign In</Button>
          <Button variant="secondary" block onClick={fillDemo}>Fill in Sample Details</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>Don't have an account? <Link to="/register" className="strong">Sign Up</Link>
          </p>
        </form>
      </div>
      <AuthAside />
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', agree: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!form.firstName.trim()) n.firstName = "Enter your first name";
    if (!form.lastName.trim()) n.lastName = "Enter your last name";
    if (!EMAIL_RE.test(form.email)) n.email = "Enter a valid email address";
    if (form.password.length < 8) n.password = "At least 8 characters";
    else if (!/\d/.test(form.password)) n.password = "Your password must contain at least one number";
    if (form.confirm !== form.password) n.confirm = "Passwords do not match";
    if (!form.agree) n.agree = "Confirm that you have read the demo limitations";
    setErrors(n);
    if (Object.keys(n).length) {
      toast.warning("Check the form", "Some fields are missing or invalid.");
      return;
    }
    toast.success("You are ready to explore", "No real account has been created. Your information is not saved.");
    navigate(`/${role}/dashboard`);
  };

  const strength = Math.min(4, [form.password.length >= 8, /\d/.test(form.password), /[A-Z]/.test(form.password), /[^\w\s]/.test(form.password)].filter(Boolean).length);

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>Join <span className="hl">LearnSpace</span></h1>
            <p className="secondary small" style={{ marginTop: 6 }}>Fill in the form to explore the platform. This is a demo, so no real account will be created.</p>
          </div>
          <RolePicker value={role} onChange={setRole} />
          <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
            <Input label="First Name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} required autoComplete="given-name" />
            <Input label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} required autoComplete="family-name" />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required autoComplete="email" placeholder="name@example.am" />
          <div className="stack" style={{ ['--gap' as string]: '6px' }}>
            <Input label="Password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} hint="At least 8 characters and one number" required autoComplete="new-password" />
            {form.password && (
              <div className="pw-strength" aria-label={`Password strength: ${strength} out of 4`}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cx(i < strength && `on-${strength}`)} />
                ))}
              </div>
            )}
          </div>
          <Input label="Confirm Password" type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} required autoComplete="new-password" />
          <div className="field">
            <Checkbox label={<>I have read the <Link to="/about#faq">demo limitations</Link></>} checked={form.agree} onChange={(e) => set('agree', e.target.checked)} />
            {errors.agree && <span className="field__error" role="alert">{errors.agree}</span>}
          </div>
          <Button type="submit" variant="accent" size="lg" block>Create Account</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>Already have an account? <Link to="/login" className="strong">Sign In</Link>
          </p>
        </form>
      </div>
      <AuthAside />
    </div>
  );
}

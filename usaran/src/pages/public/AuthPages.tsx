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
import { tr } from '../../i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <fieldset className="role-picker">
      <legend className="field__label" style={{ marginBottom: 8 }}>{tr("How would you like to use LearnSpace?", "Ինչպե՞ս եք ցանկանում օգտագործել LearnSpace-ը")}</legend>
      <div className="grid grid-2" style={{ ['--gap' as string]: '10px' }}>
        {([
          ['student', tr("Student", "Ուսանող"), tr("Courses, assignments, and results", "Դասընթացներ, առաջադրանքներ և արդյունքներ"), GraduationCap],
          ['teacher', tr("Teacher", "Դասավանդող"), tr("Course management, grading, and analytics", "Դասընթացների կառավարում, գնահատում և վերլուծություն"), Presentation],
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
        <span className="kicker">{tr("LearnSpace", "LearnSpace")}</span>
        <b>{tr("Learn at your own pace with video lessons, quizzes, and personal feedback.", "Սովորեք ձեր տեմպով՝ տեսադասերով, թեստերով և անհատական հետադարձ կապով։")}</b>
      </div>
      <div className="auth__arch"><img src={SCENES.hero} alt="" /></div>
      <div className="auth__float auth__float--course">
        <span className="tint-box t-sky"><BookOpenCheck /></span>
        <div>
          <small>{tr("Continue Learning", "Շարունակել ուսումը")}</small>
          <b>{tr("React · Module 2", "React · Մոդուլ 2")}</b>
        </div>
      </div>
      <div className="auth__float auth__float--grade">
        <span className="tint-box t-mint"><CheckCircle2 /></span>
        <div>
          <small>{tr("New grade", "Նոր գնահատական")}</small>
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
    if (!email) next.email = tr("Enter your email address", "Մուտքագրեք էլ. հասցեն");
    else if (!EMAIL_RE.test(email)) next.email = tr("Enter a valid email address", "Էլ. հասցեի ձևաչափը սխալ է");
    if (!password) next.password = tr("Enter your password", "Մուտքագրեք գաղտնաբառը");
    else if (password.length < 6) next.password = tr("Your password must contain at least 6 characters", "Գաղտնաբառը պետք է պարունակի առնվազն 6 նիշ");
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success(tr("Welcome to the demo", "Բարի գալուստ ցուցադրական միջավայր"), tr("Your sign-in details have not been verified or saved.", "Մուտքի տվյալները չեն ստուգվել և չեն պահպանվել։"));
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>{tr("Welcome ", "Բարի ")}<span className="hl">{tr("back", "վերադարձ")}</span></h1>
            <p className="secondary small" style={{ marginTop: 6 }}>{tr("Choose Student or Teacher, then fill in your sign-in details.", "Ընտրեք դերը՝ «Ուսանող» կամ «Դասավանդող», ապա լրացրեք մուտքի տվյալները։")}</p>
          </div>
          <Notice tone="neutral">{tr("This is a demo sign-in. No authentication takes place, and no information is sent to a server.", "Սա ցուցադրական մուտք է։ Իրական նույնականացում չկա, տվյալները չեն ուղարկվում սերվեր։")}</Notice>
          <RolePicker value={role} onChange={setRole} />
          <Input label={tr("Email", "Էլ. հասցե")} type="email" autoComplete="email" placeholder="name@example.am" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
          <div className="field">
            <div className="row row--between">
              <label className="field__label" htmlFor="login-password">{tr("Password", "Գաղտնաբառ")}<span className="req">*</span></label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => toast.info(tr("Password Reset", "Գաղտնաբառի վերականգնում"), tr("No email is sent in this demo.", "Ցուցադրական տարբերակում նամակ չի ուղարկվում։"))}>{tr("Forgot your password?", "Մոռացե՞լ եք գաղտնաբառը")}</button>
            </div>
            <div className="input-group">
              <input id="login-password" className="input" style={{ paddingLeft: 16, paddingRight: 52 }} type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby="login-password-err" />
              <button type="button" className="icon-btn input-group__action" style={{ width: 36, height: 36, border: 0 }} onClick={() => setShow((s) => !s)} aria-label={show ? tr("Hide password", "Թաքցնել գաղտնաբառը") : tr("Show password", "Ցույց տալ գաղտնաբառը")}>
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <span id="login-password-err" className="field__error" role="alert">{errors.password}</span>}
          </div>
          <Checkbox label={tr("Remember me on this device", "Հիշել ինձ այս սարքում")} />
          <Button type="submit" variant="accent" size="lg" block>{tr("Sign In", "Մուտք գործել")}</Button>
          <Button variant="secondary" block onClick={fillDemo}>{tr("Fill in Sample Details", "Լրացնել նմուշային տվյալներով")}</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>{tr("Don't have an account? ", "Չունե՞ք հաշիվ։ ")}<Link to="/register" className="strong">{tr("Sign Up", "Գրանցվել")}</Link>
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
    if (!form.firstName.trim()) n.firstName = tr("Enter your first name", "Մուտքագրեք անունը");
    if (!form.lastName.trim()) n.lastName = tr("Enter your last name", "Մուտքագրեք ազգանունը");
    if (!EMAIL_RE.test(form.email)) n.email = tr("Enter a valid email address", "Մուտքագրեք վավեր էլ. հասցե");
    if (form.password.length < 8) n.password = tr("At least 8 characters", "Առնվազն 8 նիշ");
    else if (!/\d/.test(form.password)) n.password = tr("Your password must contain at least one number", "Գաղտնաբառը պետք է պարունակի առնվազն մեկ թիվ");
    if (form.confirm !== form.password) n.confirm = tr("Passwords do not match", "Գաղտնաբառերը չեն համընկնում");
    if (!form.agree) n.agree = tr("Confirm that you have read the demo limitations", "Հաստատեք, որ ծանոթացել եք ցուցադրական տարբերակի սահմանափակումներին");
    setErrors(n);
    if (Object.keys(n).length) {
      toast.warning(tr("Check the form", "Ստուգեք ձևաթուղթը"), tr("Some fields are missing or invalid.", "Որոշ դաշտեր լրացված չեն կամ սխալ են։"));
      return;
    }
    toast.success(tr("You are ready to explore", "Կարող եք սկսել"), tr("No real account has been created. Your information is not saved.", "Իրական հաշիվ չի ստեղծվել, և ձեր տվյալները չեն պահպանվում։"));
    navigate(`/${role}/dashboard`);
  };

  const strength = Math.min(4, [form.password.length >= 8, /\d/.test(form.password), /[A-Z]/.test(form.password), /[^\w\s]/.test(form.password)].filter(Boolean).length);

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>{tr("Join ", "Միացեք ")}<span className="hl">{tr("LearnSpace", "LearnSpace-ին")}</span></h1>
            <p className="secondary small" style={{ marginTop: 6 }}>{tr("Fill in the form to explore the platform. This is a demo, so no real account will be created.", "Լրացրեք ձևաթուղթը՝ հարթակին ծանոթանալու համար։ Սա ցուցադրական տարբերակ է, ուստի իրական հաշիվ չի ստեղծվի։")}</p>
          </div>
          <RolePicker value={role} onChange={setRole} />
          <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
            <Input label={tr("First Name", "Անուն")} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} required autoComplete="given-name" />
            <Input label={tr("Last Name", "Ազգանուն")} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} required autoComplete="family-name" />
          </div>
          <Input label={tr("Email", "Էլ. հասցե")} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required autoComplete="email" placeholder="name@example.am" />
          <div className="stack" style={{ ['--gap' as string]: '6px' }}>
            <Input label={tr("Password", "Գաղտնաբառ")} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} hint={tr("At least 8 characters and one number", "Առնվազն 8 նիշ և մեկ թիվ")} required autoComplete="new-password" />
            {form.password && (
              <div className="pw-strength" aria-label={tr(`Password strength: ${strength} out of 4`, `Գաղտնաբառի հուսալիությունը՝ ${strength}/4`)}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cx(i < strength && `on-${strength}`)} />
                ))}
              </div>
            )}
          </div>
          <Input label={tr("Confirm Password", "Կրկնեք գաղտնաբառը")} type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} required autoComplete="new-password" />
          <div className="field">
            <Checkbox label={<>{tr("I have read the ", "Ծանոթացել եմ ")}<Link to="/about#faq">{tr("demo limitations", "ցուցադրական տարբերակի սահմանափակումներին")}</Link></>} checked={form.agree} onChange={(e) => set('agree', e.target.checked)} />
            {errors.agree && <span className="field__error" role="alert">{errors.agree}</span>}
          </div>
          <Button type="submit" variant="accent" size="lg" block>{tr("Create Account", "Ստեղծել հաշիվ")}</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>{tr("Already have an account? ", "Արդեն ունե՞ք հաշիվ։ ")}<Link to="/login" className="strong">{tr("Sign In", "Մուտք գործել")}</Link>
          </p>
        </form>
      </div>
      <AuthAside />
    </div>
  );
}

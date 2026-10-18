import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Presentation, CheckCircle2 } from 'lucide-react';
import type { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input } from '../../components/ui/Field';
import { Notice } from '../../components/ui/Misc';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../lib/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <fieldset className="role-picker">
      <legend className="field__label" style={{ marginBottom: 8 }}>Դեմո դեր</legend>
      <div className="grid grid-2" style={{ ['--gap' as string]: '10px' }}>
        {([
          ['student', 'Ուսանող', 'Դասընթացներ, առաջադրանքներ, արդյունքներ', GraduationCap],
          ['teacher', 'Դասավանդող', 'Կառավարում, գնահատում, վերլուծություն', Presentation],
        ] as const).map(([r, label, desc, Icon]) => (
          <label key={r} className={cx('role-option', value === r && 'is-selected')}>
            <input type="radio" name="role" value={r} checked={value === r} onChange={() => onChange(r)} className="sr-only" />
            <Icon aria-hidden="true" />
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
    <aside className="auth__aside">
      <div className="stack" style={{ ['--gap' as string]: '18px', maxWidth: 380 }}>
        <h2 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-xl)' }}>Ուսումնական միջավայր, որտեղ ամեն ինչ իր տեղում է</h2>
        <ul className="check-list check-list--light">
          <li><CheckCircle2 aria-hidden="true" />Մոտակա վերջնաժամկետները մեկ հայացքով</li>
          <li><CheckCircle2 aria-hidden="true" />Դասավանդողի մեկնաբանություններ յուրաքանչյուր աշխատանքին</li>
          <li><CheckCircle2 aria-hidden="true" />Առաջընթացի և գնահատականների պարզ պատկեր</li>
        </ul>
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
    setEmail(role === 'student' ? 'ani.hakobyan@example.am' : 'armen.sargsyan@usaran.am');
    setPassword('demo-password');
    setErrors({});
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = 'Մուտքագրեք էլ. հասցեն';
    else if (!EMAIL_RE.test(email)) next.email = 'Էլ. հասցեի ձևաչափը սխալ է';
    if (!password) next.password = 'Մուտքագրեք գաղտնաբառը';
    else if (password.length < 6) next.password = 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ';
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success('Բարի գալուստ դեմո միջավայր', 'Մուտքի տվյալները չեն ստուգվել և չեն պահպանվել։');
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>Մուտք</h1>
            <p className="secondary small" style={{ marginTop: 6 }}>Ընտրեք դեմո դերը և մուտք գործեք ցանկացած վավեր ձևաչափով տվյալներով։</p>
          </div>
          <Notice tone="neutral">Սա ցուցադրական մուտք է։ Իրական նույնականացում չկա, տվյալները չեն ուղարկվում սերվեր։</Notice>
          <RolePicker value={role} onChange={setRole} />
          <Input label="Էլ. հասցե" type="email" autoComplete="email" placeholder="name@example.am" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
          <div className="field">
            <div className="row row--between">
              <label className="field__label" htmlFor="login-password">Գաղտնաբառ<span className="req">*</span></label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => toast.info('Գաղտնաբառի վերականգնում', 'Դեմո տարբերակում նամակ չի ուղարկվում։')}>Մոռացե՞լ եք գաղտնաբառը</button>
            </div>
            <div className="input-group">
              <input id="login-password" className="input" style={{ paddingLeft: 12, paddingRight: 44 }} type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} aria-describedby="login-password-err" />
              <button type="button" className="icon-btn input-group__action" style={{ width: 32, height: 32 }} onClick={() => setShow((s) => !s)} aria-label={show ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'}>
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <span id="login-password-err" className="field__error" role="alert">{errors.password}</span>}
          </div>
          <Checkbox label="Հիշել ինձ այս սարքում" />
          <Button type="submit" variant="primary" size="lg" block>Մուտք գործել</Button>
          <Button variant="secondary" block onClick={fillDemo}>Լրացնել դեմո տվյալներով</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>
            Չունե՞ք հաշիվ։ <Link to="/register" className="strong">Գրանցվել</Link>
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
    if (!form.firstName.trim()) n.firstName = 'Մուտքագրեք անունը';
    if (!form.lastName.trim()) n.lastName = 'Մուտքագրեք ազգանունը';
    if (!EMAIL_RE.test(form.email)) n.email = 'Մուտքագրեք վավեր էլ. հասցե';
    if (form.password.length < 8) n.password = 'Առնվազն 8 նիշ';
    else if (!/\d/.test(form.password)) n.password = 'Գաղտնաբառը պետք է պարունակի առնվազն մեկ թիվ';
    if (form.confirm !== form.password) n.confirm = 'Գաղտնաբառերը չեն համընկնում';
    if (!form.agree) n.agree = 'Անհրաժեշտ է համաձայնել պայմաններին';
    setErrors(n);
    if (Object.keys(n).length) {
      toast.warning('Ստուգեք ձևաթուղթը', 'Որոշ դաշտեր լրացված չեն կամ սխալ են։');
      return;
    }
    toast.success('Դեմո հաշիվը պատրաստ է', 'Հաշիվն իրականում չի ստեղծվել. տվյալները չեն պահպանվում։');
    navigate(`/${role}/dashboard`);
  };

  const strength = Math.min(4, [form.password.length >= 8, /\d/.test(form.password), /[A-ZԱ-Ֆ]/.test(form.password), /[^\w\s]/.test(form.password)].filter(Boolean).length);

  return (
    <div className="auth">
      <div className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <h1>Գրանցում</h1>
            <p className="secondary small" style={{ marginTop: 6 }}>Ստեղծեք դեմո հաշիվ՝ հարթակի հնարավորություններին ծանոթանալու համար։</p>
          </div>
          <RolePicker value={role} onChange={setRole} />
          <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
            <Input label="Անուն" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} required autoComplete="given-name" />
            <Input label="Ազգանուն" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} required autoComplete="family-name" />
          </div>
          <Input label="Էլ. հասցե" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required autoComplete="email" placeholder="name@example.am" />
          <div className="stack" style={{ ['--gap' as string]: '6px' }}>
            <Input label="Գաղտնաբառ" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} hint="Առնվազն 8 նիշ և մեկ թիվ" required autoComplete="new-password" />
            {form.password && (
              <div className="pw-strength" aria-label={`Գաղտնաբառի ուժը՝ ${strength} 4-ից`}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cx(i < strength && `on-${strength}`)} />
                ))}
              </div>
            )}
          </div>
          <Input label="Կրկնել գաղտնաբառը" type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} required autoComplete="new-password" />
          <div className="field">
            <Checkbox label={<>Համաձայն եմ <Link to="/about#faq">օգտագործման պայմաններին</Link></>} checked={form.agree} onChange={(e) => set('agree', e.target.checked)} />
            {errors.agree && <span className="field__error" role="alert">{errors.agree}</span>}
          </div>
          <Button type="submit" variant="primary" size="lg" block>Ստեղծել հաշիվ</Button>
          <p className="small secondary" style={{ textAlign: 'center' }}>
            Արդեն ունե՞ք հաշիվ։ <Link to="/login" className="strong">Մուտք գործել</Link>
          </p>
        </form>
      </div>
      <AuthAside />
    </div>
  );
}

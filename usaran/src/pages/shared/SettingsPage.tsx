import { useState, type FormEvent } from 'react';
import { KeyRound, LogOut, Monitor, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Toggle } from '../../components/ui/Field';
import { Card, Notice, PageHeader, Tabs } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { Badge } from '../../components/ui/Badge';

type Tab = 'notifications' | 'security' | 'account';

export function SettingsPage({ role }: { role: Role }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('notifications');

  const studentPrefs = [
    ['deadlines', 'Մոտեցող վերջնաժամկետներ', 'Հիշեցում 48 և 24 ժամ առաջ'],
    ['grades', 'Նոր գնահատականներ', 'Երբ դասավանդողը գնահատում է աշխատանքը'],
    ['content', 'Նոր դասեր և նյութեր', 'Երբ դասընթացում ավելանում է նոր բովանդակություն'],
    ['quizzes', 'Նոր թեստեր', 'Երբ թեստը դառնում է հասանելի'],
    ['digest', 'Շաբաթական ամփոփում', 'Ակտիվության և առաջընթացի կարճ ամփոփում ամեն երկուշաբթի'],
  ];
  const teacherPrefs = [
    ['submissions', 'Նոր հանձնումներ', 'Երբ ուսանողը հանձնում է աշխատանք'],
    ['questions', 'Ուսանողների հարցեր', 'Երբ ուսանողը հարց է ուղարկում'],
    ['risk', 'Ռիսկային ուսանողներ', 'Երբ ուսանողը 10 օրից ավելի ակտիվ չէ'],
    ['enroll', 'Նոր գրանցումներ', 'Դասընթացին նոր ուսանողների գրանցման մասին'],
    ['digest', 'Շաբաթական հաշվետվություն', 'Դասընթացների ցուցանիշների ամփոփում'],
  ];
  const prefs = role === 'student' ? studentPrefs : teacherPrefs;
  const [email, setEmail] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i !== 4])));
  const [push, setPush] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i < 2])));

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [twoFa, setTwoFa] = useState(false);
  const [lang, setLang] = useState('hy');
  const [tz, setTz] = useState('Asia/Yerevan');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!pw.current) n.current = 'Մուտքագրեք ընթացիկ գաղտնաբառը';
    if (pw.next.length < 8) n.next = 'Նոր գաղտնաբառը պետք է լինի առնվազն 8 նիշ';
    else if (pw.next === pw.current) n.next = 'Նոր գաղտնաբառը պետք է տարբերվի ընթացիկից';
    if (pw.confirm !== pw.next) n.confirm = 'Գաղտնաբառերը չեն համընկնում';
    setPwErr(n);
    if (Object.keys(n).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast.info('Գաղտնաբառը չի փոխվել', 'Սա ցուցադրական ձևաթուղթ է. իրական հաշիվ և գաղտնաբառ գոյություն չունեն։');
  };

  return (
    <>
      <PageHeader breadcrumbs={[{ label: 'Վահանակ', to: `/${role}/dashboard` }, { label: 'Կարգավորումներ' }]} title="Կարգավորումներ" description="Ծանուցումներ, անվտանգություն և հաշվի պարամետրեր։" />
      <div className="stack" style={{ ['--gap' as string]: '20px', maxWidth: 880 }}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'notifications', label: 'Ծանուցումներ' },
            { key: 'security', label: 'Անվտանգություն' },
            { key: 'account', label: 'Հաշիվ' },
          ]}
        />

        {tab === 'notifications' && (
          <Card
            title="Ծանուցումների նախընտրություններ"
            subtitle="Ընտրեք, թե ինչի մասին և ինչ ձևով տեղեկանալ"
            footer={<Button variant="primary" onClick={() => toast.success('Նախընտրությունները պահվեցին', 'Միայն այս էջում, դեմո ռեժիմ։')}>Պահել</Button>}
            padded={false}
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Իրադարձություն</th>
                    <th style={{ textAlign: 'center', width: 110 }}>Էլ. փոստ</th>
                    <th style={{ textAlign: 'center', width: 110 }}>Հարթակում</th>
                  </tr>
                </thead>
                <tbody>
                  {prefs.map(([k, l, d]) => (
                    <tr key={k}>
                      <td>
                        <div className="cell-title">{l}</div>
                        <div className="cell-sub">{d}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="toggle" style={{ justifyContent: 'center' }}>
                          <span className="sr-only">{l}՝ էլ. փոստով</span>
                          <input type="checkbox" role="switch" checked={email[k]} onChange={(e) => setEmail((s) => ({ ...s, [k]: e.target.checked }))} />
                          <span className="toggle__track" aria-hidden="true" />
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="toggle" style={{ justifyContent: 'center' }}>
                          <span className="sr-only">{l}՝ հարթակում</span>
                          <input type="checkbox" role="switch" checked={push[k]} onChange={(e) => setPush((s) => ({ ...s, [k]: e.target.checked }))} />
                          <span className="toggle__track" aria-hidden="true" />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'security' && (
          <>
            <form onSubmit={changePassword} noValidate>
              <Card title="Գաղտնաբառի փոփոխություն" subtitle="Ցուցադրական ձևաթուղթ. իրական գաղտնաբառ չի փոխվում" footer={<Button type="submit" variant="primary" icon={<KeyRound />}>Փոխել գաղտնաբառը</Button>}>
                <div className="stack" style={{ ['--gap' as string]: '16px', maxWidth: 420 }}>
                  <Input label="Ընթացիկ գաղտնաբառ" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwErr.current} />
                  <Input label="Նոր գաղտնաբառ" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErr.next} hint="Առնվազն 8 նիշ, խորհուրդ է տրվում ներառել թիվ և նշան" />
                  <Input label="Կրկնել նոր գաղտնաբառը" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErr.confirm} />
                </div>
              </Card>
            </form>
            <Card title="Երկքայլ նույնականացում">
              <Toggle
                label="Միացնել երկքայլ նույնականացումը"
                description="Մուտքի ժամանակ կպահանջվի հաստատման կոդ հեռախոսից"
                checked={twoFa}
                onChange={(v) => {
                  setTwoFa(v);
                  toast.info(v ? 'Երկքայլ նույնականացումը միացված է' : 'Երկքայլ նույնականացումն անջատված է', 'Միայն ցուցադրական կարգավորում։');
                }}
              />
            </Card>
            <Card title="Ակտիվ նստաշրջաններ" padded={false}>
              <div className="list">
                {[
                  [Monitor, 'Chrome, Windows', 'Երևան, ընթացիկ նստաշրջան', true],
                  [Smartphone, 'Safari, iPhone', 'Երևան, 2 օր առաջ', false],
                ].map(([Icon, t, s, current]) => {
                  const I = Icon as typeof Monitor;
                  return (
                    <div key={t as string} className="list-row">
                      <span className="list-row__icon"><I /></span>
                      <div className="grow">
                        <div className="list-row__title">{t as string}</div>
                        <div className="list-row__sub">{s as string}</div>
                      </div>
                      {current ? <Badge tone="success">Այս սարքը</Badge> : <Button variant="ghost" size="sm" icon={<LogOut />} onClick={() => toast.info('Նստաշրջանը փակվեց', 'Դեմո ռեժիմ։')}>Դուրս գալ</Button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {tab === 'account' && (
          <>
            <Card title="Լեզու և տարածաշրջան" footer={<Button variant="primary" onClick={() => toast.success('Կարգավորումները պահվեցին', 'Միայն այս էջում։')}>Պահել</Button>}>
              <div className="grid grid-2" style={{ ['--gap' as string]: '16px' }}>
                <Select label="Ինտերֆեյսի լեզու" value={lang} onChange={(e) => setLang(e.target.value)} options={[{ value: 'hy', label: 'Հայերեն' }, { value: 'en', label: 'English (շուտով)' }, { value: 'ru', label: 'Русский (շուտով)' }]} hint="Այլ լեզուները հասանելի չեն ցուցադրական տարբերակում" />
                <Select label="Ժամային գոտի" value={tz} onChange={(e) => setTz(e.target.value)} options={[{ value: 'Asia/Yerevan', label: 'Երևան (UTC+4)' }, { value: 'Europe/Moscow', label: 'Մոսկվա (UTC+3)' }, { value: 'Europe/Paris', label: 'Փարիզ (UTC+1)' }, { value: 'America/Los_Angeles', label: 'Լոս Անջելես (UTC−8)' }]} />
              </div>
            </Card>
            <Card title="Գաղտնիություն">
              <div className="settings-list">
                <PrivacyToggle label="Ցուցադրել պրոֆիլը խմբի այլ անդամներին" description="Անունը և նկարը կերևան դասընթացի մասնակիցների ցուցակում" initial />
                <PrivacyToggle label="Թույլատրել անանուն վերլուծությունը" description="Օգնում է բարելավել դասընթացների որակը" initial />
              </div>
            </Card>
            <Card title="Վտանգավոր գործողություններ">
              <Notice tone="danger" className="mb-20">Հաշվի ջնջումից հետո բոլոր դասընթացները, հանձնումները և գնահատականները կկորչեն։ Այս գործողությունը հնարավոր չէ հետարկել։</Notice>
              <div className="row row--wrap" style={{ ['--gap' as string]: '10px' }}>
                <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>Ջնջել հաշիվը</Button>
                <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><ShieldCheck size={14} />Դեմո ռեժիմում իրական ջնջում տեղի չի ունենում</span>
              </div>
            </Card>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.warning('Հաշիվը չի ջնջվել', 'Դեմո ռեժիմ. դուք վերադարձվեցիք գլխավոր էջ։');
          navigate('/');
        }}
        title="Ջնջե՞լ հաշիվը"
        text="Իրական հարթակում այս գործողությունը վերջնական կլիներ։ Ցուցադրական տարբերակում ոչինչ չի ջնջվի։"
        confirmLabel="Այո, ջնջել"
      />
    </>
  );
}

function PrivacyToggle({ label, description, initial }: { label: string; description: string; initial: boolean }) {
  const [v, setV] = useState(initial);
  return <Toggle label={label} description={description} checked={v} onChange={setV} />;
}

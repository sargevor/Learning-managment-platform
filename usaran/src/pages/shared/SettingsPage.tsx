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
import { LANGS, lang, setLang, tr, type Lang } from '../../i18n';

type Tab = 'notifications' | 'security' | 'account';

export function SettingsPage({ role }: { role: Role }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('notifications');

  const studentPrefs = [
    ['deadlines', tr("Upcoming Deadlines", "Մոտեցող վերջնաժամկետներ"), tr("Reminders 48 and 24 hours before the deadline", "Հիշեցում վերջնաժամկետից 48 և 24 ժամ առաջ")],
    ['grades', tr("New Grades", "Նոր գնահատականներ"), tr("When an instructor grades your work", "Երբ դասավանդողը գնահատում է ձեր աշխատանքը")],
    ['content', tr("New Lessons and Materials", "Նոր դասեր և նյութեր"), tr("When new content is added to a course", "Երբ դասընթացում ավելանում է նոր բովանդակություն")],
    ['quizzes', tr("New Quizzes", "Նոր թեստեր"), tr("When a quiz becomes available", "Երբ թեստը դառնում է հասանելի")],
    ['digest', tr("Weekly Summary", "Շաբաթական ամփոփում"), tr("A brief summary of your activity and progress every Monday", "Ակտիվության և առաջընթացի կարճ ամփոփում ամեն երկուշաբթի")],
  ];
  const teacherPrefs = [
    ['submissions', tr("New Submissions", "Նոր հանձնումներ"), tr("When a student submits an assignment", "Երբ ուսանողը հանձնում է աշխատանք")],
    ['questions', tr("Student Questions", "Ուսանողների հարցեր"), tr("When a student sends a question", "Երբ ուսանողը հարց է ուղարկում")],
    ['risk', tr("Students Needing Support", "Աջակցության կարիք ունեցող ուսանողներ"), tr("When a student has been inactive for more than 10 days", "Երբ ուսանողը 10 օրից ավելի ակտիվություն չի ցուցաբերում")],
    ['enroll', tr("New Enrollments", "Նոր գրանցումներ"), tr("When new students enroll in a course", "Երբ նոր ուսանողներ են գրանցվում դասընթացին")],
    ['digest', tr("Weekly Report", "Շաբաթական հաշվետվություն"), tr("A summary of course performance", "Դասընթացների ցուցանիշների ամփոփում")],
  ];
  const prefs = role === 'student' ? studentPrefs : teacherPrefs;
  const [email, setEmail] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i !== 4])));
  const [push, setPush] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i < 2])));

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [twoFa, setTwoFa] = useState(false);
  const [uiLang, setUiLang] = useState<Lang>(lang);
  const [tz, setTz] = useState('Asia/Yerevan');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!pw.current) n.current = tr("Enter your current password", "Մուտքագրեք ընթացիկ գաղտնաբառը");
    if (pw.next.length < 8) n.next = tr("Your new password must contain at least 8 characters", "Նոր գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ");
    else if (pw.next === pw.current) n.next = tr("Your new password must differ from your current password", "Նոր գաղտնաբառը պետք է տարբերվի ընթացիկից");
    if (pw.confirm !== pw.next) n.confirm = tr("Passwords do not match", "Գաղտնաբառերը չեն համընկնում");
    setPwErr(n);
    if (Object.keys(n).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast.info(tr("Password not changed", "Գաղտնաբառը չի փոխվել"), tr("This is a demo form. There is no real account or password.", "Սա ցուցադրական ձևաթուղթ է։ Իրական հաշիվ և գաղտնաբառ գոյություն չունեն։"));
  };

  return (
    <>
      <PageHeader breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: `/${role}/dashboard` }, { label: tr("Settings", "Կարգավորումներ") }]} title={tr("Settings", "Կարգավորումներ")} description={tr("Manage notifications, security, and account preferences.", "Կառավարեք ծանուցումները, անվտանգությունը և հաշվի կարգավորումները։")} />
      <div className="stack" style={{ ['--gap' as string]: '20px', maxWidth: 880 }}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'notifications', label: tr("Notifications", "Ծանուցումներ") },
            { key: 'security', label: tr("Security", "Անվտանգություն") },
            { key: 'account', label: tr("Account", "Հաշիվ") },
          ]}
        />

        {tab === 'notifications' && (
          <Card
            title={tr("Notification Preferences", "Ծանուցումների նախընտրություններ")}
            subtitle={tr("Choose what you hear about and how", "Ընտրեք, թե ինչի մասին և ինչպես ծանուցվել")}
            footer={<Button variant="primary" onClick={() => toast.success(tr("Preferences saved", "Նախընտրությունները պահվեցին"), tr("Demo: changes are kept only on this page.", "Ցուցադրական ռեժիմ։ Փոփոխությունները պահվում են միայն այս էջում։"))}>{tr("Save", "Պահել")}</Button>}
            padded={false}
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tr("Event", "Իրադարձություն")}</th>
                    <th style={{ textAlign: 'center', width: 110 }}>{tr("Email", "Էլ. փոստ")}</th>
                    <th style={{ textAlign: 'center', width: 110 }}>{tr("In-App", "Հարթակում")}</th>
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
                          <span className="sr-only">{l}{tr(" by email", "՝ էլ. փոստով")}</span>
                          <input type="checkbox" role="switch" checked={email[k]} onChange={(e) => setEmail((s) => ({ ...s, [k]: e.target.checked }))} />
                          <span className="toggle__track" aria-hidden="true" />
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="toggle" style={{ justifyContent: 'center' }}>
                          <span className="sr-only">{l}{tr(" in the app", "՝ հարթակում")}</span>
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
              <Card title={tr("Change Password", "Գաղտնաբառի փոփոխություն")} subtitle={tr("Demo form: your real password will not change", "Ցուցադրական ձևաթուղթ․ իրական գաղտնաբառը չի փոխվի")} footer={<Button type="submit" variant="primary" icon={<KeyRound />}>{tr("Change Password", "Փոխել գաղտնաբառը")}</Button>}>
                <div className="stack" style={{ ['--gap' as string]: '16px', maxWidth: 420 }}>
                  <Input label={tr("Current Password", "Ընթացիկ գաղտնաբառ")} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwErr.current} />
                  <Input label={tr("New Password", "Նոր գաղտնաբառ")} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErr.next} hint={tr("At least 8 characters. We recommend including a number and a special character.", "Առնվազն 8 նիշ։ Խորհուրդ է տրվում ներառել թիվ և հատուկ նշան։")} />
                  <Input label={tr("Confirm New Password", "Կրկնեք նոր գաղտնաբառը")} type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErr.confirm} />
                </div>
              </Card>
            </form>
            <Card title={tr("Two-Factor Authentication", "Երկքայլ նույնականացում")}>
              <Toggle
                label={tr("Enable Two-Factor Authentication", "Միացնել երկքայլ նույնականացումը")}
                description={tr("Require a verification code from your phone when signing in", "Մուտքի ժամանակ կպահանջվի հաստատման կոդ հեռախոսից")}
                checked={twoFa}
                onChange={(v) => {
                  setTwoFa(v);
                  toast.info(v ? tr("Two-factor authentication enabled", "Երկքայլ նույնականացումը միացված է") : tr("Two-factor authentication disabled", "Երկքայլ նույնականացումն անջատված է"), tr("This setting is for demonstration only.", "Կարգավորումը միայն ցուցադրական է։"));
                }}
              />
            </Card>
            <Card title={tr("Active Sessions", "Ակտիվ նստաշրջաններ")} padded={false}>
              <div className="list">
                {[
                  [Monitor, 'Chrome, Windows', tr("Yerevan, current session", "Երևան, ընթացիկ նստաշրջան"), true],
                  [Smartphone, 'Safari, iPhone', tr("Yerevan, 2 days ago", "Երևան, 2 օր առաջ"), false],
                ].map(([Icon, t, s, current]) => {
                  const I = Icon as typeof Monitor;
                  return (
                    <div key={t as string} className="list-row">
                      <span className="list-row__icon"><I /></span>
                      <div className="grow">
                        <div className="list-row__title">{t as string}</div>
                        <div className="list-row__sub">{s as string}</div>
                      </div>
                      {current ? <Badge tone="success">{tr("This Device", "Այս սարքը")}</Badge> : <Button variant="ghost" size="sm" icon={<LogOut />} onClick={() => toast.info(tr("Session ended", "Նստաշրջանը փակվեց"), tr("Demo only.", "Ցուցադրական ռեժիմ։"))}>{tr("Sign Out", "Դուրս գալ")}</Button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {tab === 'account' && (
          <>
            <Card title={tr("Language and Region", "Լեզու և տարածաշրջան")} footer={<Button variant="primary" onClick={() => (uiLang !== lang ? setLang(uiLang) : toast.success(tr("Settings saved", "Կարգավորումները պահվեցին"), tr("Changes are kept only on this page.", "Փոփոխությունները պահվում են միայն այս էջում։")))}>{tr("Save", "Պահել")}</Button>}>
              <div className="grid grid-2" style={{ ['--gap' as string]: '16px' }}>
                <Select label={tr("Interface Language", "Միջերեսի լեզու")} value={uiLang} onChange={(e) => setUiLang(e.target.value as Lang)} options={LANGS.map((l) => ({ value: l.code, label: l.label }))} hint={tr("The page reloads in the chosen language after you save.", "Պահելուց հետո էջը կվերաբեռնվի ընտրված լեզվով։")} />
                <Select label={tr("Time Zone", "Ժամային գոտի")} value={tz} onChange={(e) => setTz(e.target.value)} options={[{ value: 'Asia/Yerevan', label: tr("Yerevan (UTC+4)", "Երևան (UTC+4)") }, { value: 'Europe/Moscow', label: tr("Moscow (UTC+3)", "Մոսկվա (UTC+3)") }, { value: 'Europe/Paris', label: tr("Paris (UTC+1 / UTC+2)", "Փարիզ (UTC+1 / UTC+2)") }, { value: 'America/Los_Angeles', label: tr("Los Angeles (UTC−8 / UTC−7)", "Լոս Անջելես (UTC−8 / UTC−7)") }]} />
              </div>
            </Card>
            <Card title={tr("Privacy", "Գաղտնիություն")}>
              <div className="settings-list">
                <PrivacyToggle label={tr("Show My Profile to Classmates", "Ցուցադրել իմ էջը խմբի մյուս անդամներին")} description={tr("Your name and photo will appear in the course participant list", "Ձեր անունն ու լուսանկարը կերևան դասընթացի մասնակիցների ցուցակում")} initial />
                <PrivacyToggle label={tr("Allow Anonymous Analytics", "Թույլատրել անանուն վերլուծությունը")} description={tr("Help improve the quality of courses", "Օգնում է բարելավել դասընթացների որակը")} initial />
              </div>
            </Card>
            <Card title={tr("Delete Account", "Հաշվի ջնջում")}>
              <Notice tone="danger" className="mb-20">{tr("Deleting your account permanently removes your courses, submissions, and grades. This action cannot be undone.", "Հաշիվը ջնջելով՝ ընդմիշտ կհեռացնեք ձեր դասընթացները, հանձնումները և գնահատականները։ Այս գործողությունը հնարավոր չէ չեղարկել։")}</Notice>
              <div className="row row--wrap" style={{ ['--gap' as string]: '10px' }}>
                <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>{tr("Delete Account", "Ջնջել հաշիվը")}</Button>
                <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><ShieldCheck size={14} />{tr("No real account is deleted in this demo", "Ցուցադրական տարբերակում իրական հաշիվ չի ջնջվում")}</span>
              </div>
            </Card>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.warning(tr("Account not deleted", "Հաշիվը չի ջնջվել"), tr("Demo: you have been returned to the home page.", "Ցուցադրական ռեժիմ։ Դուք վերադարձվեցիք գլխավոր էջ։"));
          navigate('/');
        }}
        title={tr("Delete your account?", "Ջնջե՞լ հաշիվը")}
        text={tr("On a live platform, this action would be permanent. Nothing will be deleted in this demo.", "Իրական հարթակում այս գործողությունը վերջնական կլիներ։ Ցուցադրական տարբերակում ոչինչ չի ջնջվի։")}
        confirmLabel={tr("Yes, Delete", "Այո, ջնջել")}
      />
    </>
  );
}

function PrivacyToggle({ label, description, initial }: { label: string; description: string; initial: boolean }) {
  const [v, setV] = useState(initial);
  return <Toggle label={label} description={description} checked={v} onChange={setV} />;
}

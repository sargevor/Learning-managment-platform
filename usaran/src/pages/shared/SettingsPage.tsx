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
    ['deadlines', "Upcoming Deadlines", "Reminders 48 and 24 hours before the deadline"],
    ['grades', "New Grades", "When an instructor grades your work"],
    ['content', "New Lessons and Materials", "When new content is added to a course"],
    ['quizzes', "New Quizzes", "When a quiz becomes available"],
    ['digest', "Weekly Summary", "A brief summary of your activity and progress every Monday"],
  ];
  const teacherPrefs = [
    ['submissions', "New Submissions", "When a student submits an assignment"],
    ['questions', "Student Questions", "When a student sends a question"],
    ['risk', "Students Needing Support", "When a student has been inactive for more than 10 days"],
    ['enroll', "New Enrollments", "When new students enroll in a course"],
    ['digest', "Weekly Report", "A summary of course performance"],
  ];
  const prefs = role === 'student' ? studentPrefs : teacherPrefs;
  const [email, setEmail] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i !== 4])));
  const [push, setPush] = useState<Record<string, boolean>>(() => Object.fromEntries(prefs.map(([k], i) => [k, i < 2])));

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [twoFa, setTwoFa] = useState(false);
  const [lang, setLang] = useState('en');
  const [tz, setTz] = useState('Asia/Yerevan');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!pw.current) n.current = "Enter your current password";
    if (pw.next.length < 8) n.next = "Your new password must contain at least 8 characters";
    else if (pw.next === pw.current) n.next = "Your new password must differ from your current password";
    if (pw.confirm !== pw.next) n.confirm = "Passwords do not match";
    setPwErr(n);
    if (Object.keys(n).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast.info("Password not changed", "This is a demo form. There is no real account or password.");
  };

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Dashboard", to: `/${role}/dashboard` }, { label: "Settings" }]} title="Settings" description="Manage notifications, security, and account preferences." />
      <div className="stack" style={{ ['--gap' as string]: '20px', maxWidth: 880 }}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'notifications', label: "Notifications" },
            { key: 'security', label: "Security" },
            { key: 'account', label: "Account" },
          ]}
        />

        {tab === 'notifications' && (
          <Card
            title="Notification Preferences"
            subtitle="Choose what you hear about and how"
            footer={<Button variant="primary" onClick={() => toast.success("Preferences saved", "Demo: changes are kept only on this page.")}>Save</Button>}
            padded={false}
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th style={{ textAlign: 'center', width: 110 }}>Email</th>
                    <th style={{ textAlign: 'center', width: 110 }}>In-App</th>
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
                          <span className="sr-only">{l} by email</span>
                          <input type="checkbox" role="switch" checked={email[k]} onChange={(e) => setEmail((s) => ({ ...s, [k]: e.target.checked }))} />
                          <span className="toggle__track" aria-hidden="true" />
                        </label>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="toggle" style={{ justifyContent: 'center' }}>
                          <span className="sr-only">{l} in the app</span>
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
              <Card title="Change Password" subtitle="Demo form: your real password will not change" footer={<Button type="submit" variant="primary" icon={<KeyRound />}>Change Password</Button>}>
                <div className="stack" style={{ ['--gap' as string]: '16px', maxWidth: 420 }}>
                  <Input label="Current Password" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwErr.current} />
                  <Input label="New Password" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErr.next} hint="At least 8 characters. We recommend including a number and a special character." />
                  <Input label="Confirm New Password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErr.confirm} />
                </div>
              </Card>
            </form>
            <Card title="Two-Factor Authentication">
              <Toggle
                label="Enable Two-Factor Authentication"
                description="Require a verification code from your phone when signing in"
                checked={twoFa}
                onChange={(v) => {
                  setTwoFa(v);
                  toast.info(v ? "Two-factor authentication enabled" : "Two-factor authentication disabled", "This setting is for demonstration only.");
                }}
              />
            </Card>
            <Card title="Active Sessions" padded={false}>
              <div className="list">
                {[
                  [Monitor, 'Chrome, Windows', "Yerevan, current session", true],
                  [Smartphone, 'Safari, iPhone', "Yerevan, 2 days ago", false],
                ].map(([Icon, t, s, current]) => {
                  const I = Icon as typeof Monitor;
                  return (
                    <div key={t as string} className="list-row">
                      <span className="list-row__icon"><I /></span>
                      <div className="grow">
                        <div className="list-row__title">{t as string}</div>
                        <div className="list-row__sub">{s as string}</div>
                      </div>
                      {current ? <Badge tone="success">This Device</Badge> : <Button variant="ghost" size="sm" icon={<LogOut />} onClick={() => toast.info("Session ended", "Demo only.")}>Sign Out</Button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {tab === 'account' && (
          <>
            <Card title="Language and Region" footer={<Button variant="primary" onClick={() => toast.success("Settings saved", "Changes are kept only on this page.")}>Save</Button>}>
              <div className="grid grid-2" style={{ ['--gap' as string]: '16px' }}>
                <Select label="Interface Language" value={lang} onChange={(e) => setLang(e.target.value)} options={[{ value: 'en', label: "English" }]} hint="English is the available language in this demo" />
                <Select label="Time Zone" value={tz} onChange={(e) => setTz(e.target.value)} options={[{ value: 'Asia/Yerevan', label: "Yerevan (UTC+4)" }, { value: 'Europe/Moscow', label: "Moscow (UTC+3)" }, { value: 'Europe/Paris', label: "Paris (UTC+1)" }, { value: 'America/Los_Angeles', label: "Los Angeles (UTC−8)" }]} />
              </div>
            </Card>
            <Card title="Privacy">
              <div className="settings-list">
                <PrivacyToggle label="Show My Profile to Classmates" description="Your name and photo will appear in the course participant list" initial />
                <PrivacyToggle label="Allow Anonymous Analytics" description="Help improve the quality of courses" initial />
              </div>
            </Card>
            <Card title="Delete Account">
              <Notice tone="danger" className="mb-20">Deleting your account permanently removes your courses, submissions, and grades. This action cannot be undone.</Notice>
              <div className="row row--wrap" style={{ ['--gap' as string]: '10px' }}>
                <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>Delete Account</Button>
                <span className="xs muted row" style={{ ['--gap' as string]: '6px' }}><ShieldCheck size={14} />No real account is deleted in this demo</span>
              </div>
            </Card>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.warning("Account not deleted", "Demo: you have been returned to the home page.");
          navigate('/');
        }}
        title="Delete your account?"
        text="On a live platform, this action would be permanent. Nothing will be deleted in this demo."
        confirmLabel="Yes, Delete"
      />
    </>
  );
}

function PrivacyToggle({ label, description, initial }: { label: string; description: string; initial: boolean }) {
  const [v, setV] = useState(initial);
  return <Toggle label={label} description={description} checked={v} onChange={setV} />;
}

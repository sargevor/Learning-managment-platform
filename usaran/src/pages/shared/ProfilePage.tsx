import { useRef, useState, type FormEvent } from 'react';
import { BookOpen, Calendar, Camera, Mail, MapPin, Pencil, Phone, X } from 'lucide-react';
import type { Role, User } from '../../types';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { getEnrolledCourses } from '../../data/enrollments';
import { courses } from '../../data/courses';
import { studentRecords } from '../../data/analytics';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { Avatar, Card, PageHeader } from '../../components/ui/Misc';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfilePage({ role }: { role: Role }) {
  const session = useDemoSession();
  const toast = useToast();
  const user = role === 'student' ? session.student : session.teacher;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<User>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const name = `${user.firstName} ${user.lastName}`;
  const set = (k: keyof User, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const save = (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!draft.firstName.trim()) n.firstName = 'Անունը պարտադիր է';
    if (!draft.lastName.trim()) n.lastName = 'Ազգանունը պարտադիր է';
    if (!EMAIL_RE.test(draft.email)) n.email = 'Էլ. հասցեի ձևաչափը սխալ է';
    if (draft.phone && !/^[+\d\s()-]{6,}$/.test(draft.phone)) n.phone = 'Հեռախոսահամարը սխալ է';
    setErrors(n);
    if (Object.keys(n).length) return;
    session.updateUser(role, draft);
    setEditing(false);
    toast.success('Պրոֆիլը թարմացվեց', 'Փոփոխությունները պահվել են միայն այս էջում և չեն ուղարկվել սերվեր։');
  };

  const stats =
    role === 'student'
      ? [
          ['Դասընթացներ', getEnrolledCourses().length],
          ['Ավարտված', getEnrolledCourses().filter((e) => e.state === 'completed').length],
          ['Միջին արդյունք', '89%'],
        ]
      : [
          ['Դասընթացներ', courses.filter((c) => c.teacherId === user.id).length],
          ['Ուսանողներ', studentRecords.length],
          ['Վարկանիշ', '4.8'],
        ];

  return (
    <>
      <PageHeader breadcrumbs={[{ label: 'Վահանակ', to: `/${role}/dashboard` }, { label: 'Պրոֆիլ' }]} title="Իմ պրոֆիլը" description="Անձնական և ուսումնական տվյալներ, որոնք տեսանելի են դասավանդողներին և խմբի անդամներին։" actions={<ButtonLink to={`/${role}/settings`} variant="secondary">Կարգավորումներ</ButtonLink>} />

      <div className="grid grid-aside-main">
        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card>
            <div className="stack" style={{ alignItems: 'center', textAlign: 'center', ['--gap' as string]: '12px' }}>
              <div style={{ position: 'relative' }}>
                {avatar ? <img src={avatar} alt="Պրոֆիլի նկար" style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover' }} /> : <Avatar name={name} size={104} />}
                <button type="button" className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Փոխել նկարը" style={{ position: 'absolute', right: -2, bottom: -2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34 }}>
                  <Camera size={16} />
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
                      toast.info('Նկարը թարմացվեց', 'Նկարը ցուցադրվում է միայն այս բրաուզերում և չի վերբեռնվում։');
                    }
                  }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--fs-lg)' }}>{name}</h2>
                <div className="small muted">{role === 'student' ? user.program : user.title}</div>
              </div>
              <Badge tone="accent">{role === 'student' ? 'Ուսանող' : 'Դասավանդող'}</Badge>
            </div>
            <div className="grid grid-3" style={{ ['--gap' as string]: '8px', marginTop: 20, textAlign: 'center' }}>
              {stats.map(([l, v]) => (
                <div key={l as string} style={{ padding: '10px 4px', background: 'var(--surface-muted)', borderRadius: 'var(--r-md)' }}>
                  <div className="strong" style={{ color: 'var(--navy-900)' }}>{v}</div>
                  <div className="xs muted">{l}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Կոնտակտներ">
            <ul className="check-list">
              <li><Mail aria-hidden="true" />{user.email}</li>
              <li><Phone aria-hidden="true" />{user.phone || 'Նշված չէ'}</li>
              <li><MapPin aria-hidden="true" />{user.city || 'Նշված չէ'}</li>
              <li><BookOpen aria-hidden="true" />{user.institution || 'Նշված չէ'}</li>
              <li><Calendar aria-hidden="true" />Հարթակում է {formatDate(user.joinedAt)}-ից</li>
            </ul>
          </Card>
        </div>

        <form onSubmit={save} noValidate>
          <Card
            title="Անձնական տվյալներ"
            subtitle={editing ? 'Խմբագրման ռեժիմ' : 'Տվյալները խմբագրելու համար սեղմեք «Խմբագրել»'}
            actions={
              !editing && (
                <Button variant="secondary" size="sm" icon={<Pencil />} onClick={() => { setDraft(user); setEditing(true); }}>
                  Խմբագրել
                </Button>
              )
            }
            footer={
              editing && (
                <>
                  <Button variant="secondary" icon={<X />} onClick={() => { setEditing(false); setErrors({}); }}>Չեղարկել</Button>
                  <Button type="submit" variant="primary">Պահել փոփոխությունները</Button>
                </>
              )
            }
          >
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              <div className="grid grid-2" style={{ ['--gap' as string]: '16px' }}>
                <Input label="Անուն" required value={editing ? draft.firstName : user.firstName} disabled={!editing} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
                <Input label="Ազգանուն" required value={editing ? draft.lastName : user.lastName} disabled={!editing} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
                <Input label="Էլ. հասցե" type="email" required value={editing ? draft.email : user.email} disabled={!editing} onChange={(e) => set('email', e.target.value)} error={errors.email} />
                <Input label="Հեռախոս" value={(editing ? draft.phone : user.phone) ?? ''} disabled={!editing} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="+374 XX XXX XXX" />
                <Input label="Քաղաք" value={(editing ? draft.city : user.city) ?? ''} disabled={!editing} onChange={(e) => set('city', e.target.value)} />
                <Input label={role === 'student' ? 'Ուսումնական հաստատություն' : 'Կազմակերպություն'} value={(editing ? draft.institution : user.institution) ?? ''} disabled={!editing} onChange={(e) => set('institution', e.target.value)} />
                {role === 'student' ? (
                  <>
                    <Input label="Մասնագիտություն" value={(editing ? draft.program : user.program) ?? ''} disabled={!editing} onChange={(e) => set('program', e.target.value)} />
                    <Input label="Կուրս" value={(editing ? draft.year : user.year) ?? ''} disabled={!editing} onChange={(e) => set('year', e.target.value)} />
                  </>
                ) : (
                  <Input label="Պաշտոն / կոչում" value={(editing ? draft.title : user.title) ?? ''} disabled={!editing} onChange={(e) => set('title', e.target.value)} fieldClassName="span-2" />
                )}
              </div>
              <Textarea label="Իմ մասին" value={(editing ? draft.bio : user.bio) ?? ''} disabled={!editing} onChange={(e) => set('bio', e.target.value)} rows={4} hint={editing ? `${(draft.bio ?? '').length}/400 նիշ` : undefined} maxLength={400} />
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}

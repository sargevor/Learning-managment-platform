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
    if (!draft.firstName.trim()) n.firstName = "First name is required";
    if (!draft.lastName.trim()) n.lastName = "Last name is required";
    if (!EMAIL_RE.test(draft.email)) n.email = "Enter a valid email address";
    if (draft.phone && !/^[+\d\s()-]{6,}$/.test(draft.phone)) n.phone = "Enter a valid phone number";
    setErrors(n);
    if (Object.keys(n).length) return;
    session.updateUser(role, draft);
    setEditing(false);
    toast.success("Profile updated", "Your changes are kept only on this page and have not been sent to a server.");
  };

  const stats =
    role === 'student'
      ? [
          ["Courses", getEnrolledCourses().length],
          ["Completed", getEnrolledCourses().filter((e) => e.state === 'completed').length],
          ["Average Result", '89%'],
        ]
      : [
          ["Courses", courses.filter((c) => c.teacherId === user.id).length],
          ["Students", studentRecords.length],
          ["Rating", '4.8'],
        ];

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Dashboard", to: `/${role}/dashboard` }, { label: "Profile" }]} title="My profile" description="Personal and academic details visible to your instructors and classmates." actions={<ButtonLink to={`/${role}/settings`} variant="secondary">Settings</ButtonLink>} />

      <div className="grid grid-aside-main">
        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card>
            <div className="stack" style={{ alignItems: 'center', textAlign: 'center', ['--gap' as string]: '12px' }}>
              <div style={{ position: 'relative' }}>
                {avatar ? <img src={avatar} alt="Profile Photo" style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover' }} /> : <Avatar name={name} size={104} />}
                <button type="button" className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Change Photo" style={{ position: 'absolute', right: -2, bottom: -2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34 }}>
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
                      toast.info("Photo updated", "Your photo is displayed only in this browser and has not been uploaded.");
                    }
                  }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--fs-lg)' }}>{name}</h2>
                <div className="small muted">{role === 'student' ? user.program : user.title}</div>
              </div>
              <Badge tone="accent">{role === 'student' ? "Student" : "Teacher"}</Badge>
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
          <Card title="Contact Details">
            <ul className="check-list">
              <li><Mail aria-hidden="true" />{user.email}</li>
              <li><Phone aria-hidden="true" />{user.phone || "Not specified"}</li>
              <li><MapPin aria-hidden="true" />{user.city || "Not specified"}</li>
              <li><BookOpen aria-hidden="true" />{user.institution || "Not specified"}</li>
              <li><Calendar aria-hidden="true" />Joined: {formatDate(user.joinedAt)}</li>
            </ul>
          </Card>
        </div>

        <form onSubmit={save} noValidate>
          <Card
            title="Personal Details"
            subtitle={editing ? "Editing mode" : "Select Edit to update your details"}
            actions={
              !editing && (
                <Button variant="secondary" size="sm" icon={<Pencil />} onClick={() => { setDraft(user); setEditing(true); }}>Edit</Button>
              )
            }
            footer={
              editing && (
                <>
                  <Button variant="secondary" icon={<X />} onClick={() => { setEditing(false); setErrors({}); }}>Cancel</Button>
                  <Button type="submit" variant="primary">Save Changes</Button>
                </>
              )
            }
          >
            <div className="stack" style={{ ['--gap' as string]: '16px' }}>
              <div className="grid grid-2" style={{ ['--gap' as string]: '16px' }}>
                <Input label="First Name" required value={editing ? draft.firstName : user.firstName} disabled={!editing} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
                <Input label="Last Name" required value={editing ? draft.lastName : user.lastName} disabled={!editing} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
                <Input label="Email" type="email" required value={editing ? draft.email : user.email} disabled={!editing} onChange={(e) => set('email', e.target.value)} error={errors.email} />
                <Input label="Phone" value={(editing ? draft.phone : user.phone) ?? ''} disabled={!editing} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="+374 XX XXX XXX" />
                <Input label="City" value={(editing ? draft.city : user.city) ?? ''} disabled={!editing} onChange={(e) => set('city', e.target.value)} />
                <Input label={role === 'student' ? "Educational Institution" : "Organization"} value={(editing ? draft.institution : user.institution) ?? ''} disabled={!editing} onChange={(e) => set('institution', e.target.value)} />
                {role === 'student' ? (
                  <>
                    <Input label="Field of Study" value={(editing ? draft.program : user.program) ?? ''} disabled={!editing} onChange={(e) => set('program', e.target.value)} />
                    <Input label="Year of Study" value={(editing ? draft.year : user.year) ?? ''} disabled={!editing} onChange={(e) => set('year', e.target.value)} />
                  </>
                ) : (
                  <Input label="Job Title" value={(editing ? draft.title : user.title) ?? ''} disabled={!editing} onChange={(e) => set('title', e.target.value)} fieldClassName="span-2" />
                )}
              </div>
              <Textarea label="About Me" value={(editing ? draft.bio : user.bio) ?? ''} disabled={!editing} onChange={(e) => set('bio', e.target.value)} rows={4} hint={editing ? `${(draft.bio ?? '').length}/400 characters` : undefined} maxLength={400} />
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}

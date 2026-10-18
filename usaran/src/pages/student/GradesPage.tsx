import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ClipboardList, FileQuestion, Hourglass, MessageSquareText } from 'lucide-react';
import { getGradeRows, scoreTone, type GradeRow } from '../../data/studentView';
import { getEnrolledCourses } from '../../data/enrollments';
import { fullName, getUser } from '../../data/users';
import { DataTable } from '../../components/ui/DataTable';
import { Card, EmptyState, PageHeader, Segmented } from '../../components/ui/Misc';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Field';
import { StatCard } from '../../components/ui/StatCard';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Progress';
import { average, formatDate, letterGrade } from '../../lib/format';

export function GradesPage() {
  const navigate = useNavigate();
  const rows = getGradeRows();
  const graded = rows.filter((r) => r.percent >= 0);
  const [kind, setKind] = useState<'all' | 'assignment' | 'quiz'>('all');
  const [course, setCourse] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () => rows.filter((r) => (kind === 'all' || r.kind === kind) && (course === 'all' || r.course.id === course) && (!q.trim() || r.title.toLowerCase().includes(q.trim().toLowerCase()))),
    [rows, kind, course, q],
  );

  const courses = getEnrolledCourses().filter((e) => e.state !== 'not-started');
  const feedback = rows.filter((r) => r.feedback).slice(0, 4);

  return (
    <>
      <PageHeader breadcrumbs={[{ label: 'Վահանակ', to: '/student/dashboard' }, { label: 'Գնահատականներ' }]} title="Գնահատականներ և արդյունքներ" description="Առաջադրանքների գնահատականները, թեստերի արդյունքները և դասավանդողների մեկնաբանությունները մեկ տեղում։" />

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Ընդհանուր միջին" value={average(graded.map((r) => r.percent))} unit="%" icon={<Award />} meta={`Գնահատական՝ ${letterGrade(average(graded.map((r) => r.percent)))}`} />
        <StatCard label="Առաջադրանքներ" value={average(graded.filter((r) => r.kind === 'assignment').map((r) => r.percent))} unit="%" icon={<ClipboardList />} tone="navy" meta={`${graded.filter((r) => r.kind === 'assignment').length} գնահատված աշխատանք`} />
        <StatCard label="Թեստեր" value={average(graded.filter((r) => r.kind === 'quiz').map((r) => r.percent))} unit="%" icon={<FileQuestion />} tone="success" meta={`${graded.filter((r) => r.kind === 'quiz').length} անցած թեստ`} />
        <StatCard label="Սպասում է գնահատման" value={rows.filter((r) => r.status === 'submitted').length} icon={<Hourglass />} tone="warning" meta="հանձնված աշխատանքներ" />
      </div>

      <section className="mb-20">
        <div className="section-title"><h2>Ամփոփում ըստ դասընթացների</h2></div>
        <div className="grid grid-3">
          {courses.map(({ course, progress }) => {
            const cr = graded.filter((r) => r.course.id === course.id);
            const avg = average(cr.map((r) => r.percent));
            return (
              <div key={course.id} className="card card--pad stack" style={{ ['--gap' as string]: '12px' }}>
                <div className="row row--between row--top">
                  <div style={{ minWidth: 0 }}>
                    <div className="strong small" style={{ color: 'var(--navy-900)' }}>{course.title}</div>
                    <div className="xs muted">{fullName(getUser(course.teacherId))}</div>
                  </div>
                  {cr.length ? <span className={`score-pill score-pill--${scoreTone(avg)}`}>{letterGrade(avg)}</span> : <Badge>Դեռ չկա</Badge>}
                </div>
                <div className="row" style={{ ['--gap' as string]: '20px' }}>
                  <div>
                    <div className="xs muted">Միջին</div>
                    <div className="strong tabular">{cr.length ? `${avg}%` : '—'}</div>
                  </div>
                  <div>
                    <div className="xs muted">Գնահատված</div>
                    <div className="strong tabular">{cr.length}</div>
                  </div>
                </div>
                <div>
                  <div className="xs muted" style={{ marginBottom: 4 }}>Դասընթացի առաջընթաց</div>
                  <ProgressBar value={progress} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-main-aside">
        <Card title="Բոլոր արդյունքները" padded={false}>
          <div className="filters-bar" style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <SearchBar value={q} onChange={setQ} placeholder="Որոնել" />
            <Select aria-label="Դասընթաց" value={course} onChange={(e) => setCourse(e.target.value)} options={[{ value: 'all', label: 'Բոլոր դասընթացները' }, ...courses.map((c) => ({ value: c.course.id, label: c.course.title }))]} />
            <Segmented label="Տեսակ" value={kind} onChange={setKind} items={[{ key: 'all', label: 'Բոլորը' }, { key: 'assignment', label: 'Առաջադրանքներ' }, { key: 'quiz', label: 'Թեստեր' }]} />
          </div>
          <DataTable<GradeRow>
            caption="Գնահատականներ"
            rows={filtered}
            rowKey={(r) => r.kind + r.id}
            onRowClick={(r) => navigate(r.to)}
            initialSort={{ key: 'date', dir: 'desc' }}
            columns={[
              { key: 'title', header: 'Անվանում', sortValue: (r) => r.title, render: (r) => <><div className="cell-title">{r.title}</div><div className="cell-sub">{r.course.title}</div></> },
              { key: 'kind', header: 'Տեսակ', render: (r) => <Badge tone={r.kind === 'quiz' ? 'info' : 'neutral'}>{r.kind === 'quiz' ? 'Թեստ' : 'Առաջադրանք'}</Badge> },
              { key: 'date', header: 'Ամսաթիվ', sortValue: (r) => r.date, render: (r) => <span className="nowrap">{formatDate(r.date)}</span> },
              { key: 'status', header: 'Կարգավիճակ', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'score', header: 'Արդյունք', align: 'right', sortValue: (r) => r.percent, render: (r) => (r.percent < 0 ? <span className="muted">—</span> : <span className={`score-pill score-pill--${scoreTone(r.percent)}`}>{r.score}/{r.max}</span>) },
            ]}
            empty={<EmptyState compact title="Արդյունքներ չկան" text="Փոխեք զտիչները։" />}
          />
        </Card>

        <Card title="Դասավանդողների մեկնաբանություններ" padded={false}>
          {feedback.length === 0 ? (
            <EmptyState compact title="Մեկնաբանություններ դեռ չկան" />
          ) : (
            <div className="list">
              {feedback.map((r) => (
                <div key={r.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                  <span className="list-row__icon"><MessageSquareText /></span>
                  <div className="grow stack" style={{ ['--gap' as string]: '4px' }}>
                    <div className="row row--between">
                      <span className="list-row__title">{r.title}</span>
                      <span className={`score-pill score-pill--${scoreTone(r.percent)}`}>{r.percent}%</span>
                    </div>
                    <p className="small secondary">{r.feedback}</p>
                    <span className="xs muted">{fullName(getUser(r.course.teacherId))}, {formatDate(r.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

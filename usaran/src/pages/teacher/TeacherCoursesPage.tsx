import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookMarked, Eye, EyeOff, FolderTree, MoreHorizontal, Pencil, PlusCircle, Trash2, Users } from 'lucide-react';
import type { Course, CourseStatus } from '../../types';
import { teacherCourses } from '../../data/teacherView';
import { categoryName, difficultyLabel, lessonCount } from '../../data/courses';
import { coursePerformance } from '../../data/analytics';
import { useToast } from '../../context/ToastContext';
import { ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState, PageHeader, Tabs, Thumb } from '../../components/ui/Misc';
import { ConfirmDialog, Dropdown } from '../../components/ui/Overlay';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/Progress';
import { formatDate, formatNumber } from '../../lib/format';
import { tr } from '../../i18n';

export function TeacherCoursesPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [list, setList] = useState<Course[]>(teacherCourses);
  const [tab, setTab] = useState<'all' | CourseStatus>('all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [level, setLevel] = useState('all');
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const rows = useMemo(
    () =>
      list.filter(
        (c) =>
          (tab === 'all' || c.status === tab) &&
          (level === 'all' || c.difficulty === level) &&
          (!q.trim() || c.title.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [list, tab, level, q],
  );

  const toggleStatus = (c: Course) => {
    const next: CourseStatus = c.status === 'published' ? 'draft' : 'published';
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    toast.success(next === 'published' ? tr("Course published", "Դասընթացը հրապարակվեց") : tr("Course moved to drafts", "Դասընթացը տեղափոխվեց սևագրեր"), tr("Demo: this change is kept only on this page.", "Ցուցադրական ռեժիմ։ Փոփոխությունը պահվում է միայն այս էջում։"));
  };

  const enrolled = list.reduce((n, c) => n + c.enrolled, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/teacher/dashboard' }, { label: tr("Courses", "Դասընթացներ") }]}
        title={tr("My courses", "Իմ դասընթացները")}
        description={tr("Manage course content, visibility, and enrollments.", "Կառավարեք դասընթացների բովանդակությունը, տեսանելիությունը և գրանցումները։")}
        actions={<ButtonLink to="/teacher/courses/create" icon={<PlusCircle />}>{tr("Create Course", "Ստեղծել դասընթաց")}</ButtonLink>}
      />

      <div className="grid grid-4 mb-20">
        <StatCard label={tr("Total Courses", "Ընդամենը դասընթաց")} value={list.length} icon={<BookMarked />} />
        <StatCard label={tr("Published", "Հրապարակված")} value={list.filter((c) => c.status === 'published').length} icon={<Eye />} tone="success" />
        <StatCard label={tr("Drafts", "Սևագրեր")} value={list.filter((c) => c.status === 'draft').length} icon={<EyeOff />} tone="warning" />
        <StatCard label={tr("Enrollments", "Գրանցումներ")} value={formatNumber(enrolled)} icon={<Users />} tone="navy" meta={tr("across all courses", "բոլոր դասընթացներում")} />
      </div>

      <div className="card">
        <div style={{ padding: '0 16px' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'all', label: tr("All", "Բոլորը"), count: list.length },
              { key: 'published', label: tr("Published", "Հրապարակված"), count: list.filter((c) => c.status === 'published').length },
              { key: 'draft', label: tr("Drafts", "Սևագրեր"), count: list.filter((c) => c.status === 'draft').length },
            ]}
          />
        </div>
        <div className="filters-bar" style={{ padding: 16 }}>
          <SearchBar value={q} onChange={setQ} placeholder={tr("Search courses", "Որոնել դասընթաց")} />
          <Select aria-label={tr("Level", "Մակարդակ")} value={level} onChange={(e) => setLevel(e.target.value)} options={[{ value: 'all', label: tr("All Levels", "Բոլոր մակարդակները") }, ...Object.entries(difficultyLabel).map(([value, label]) => ({ value, label }))]} />
        </div>
        <DataTable<Course>
          caption={tr("Course list", "Դասընթացների ցուցակ")}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/teacher/courses/${c.id}`)}
          empty={
            <EmptyState
              icon={<BookMarked size={24} />}
              title={q ? tr("No courses found", "Դասընթաց չգտնվեց") : tr("No courses in this section", "Այս բաժնում դասընթացներ չկան")}
              text={tr("Create a new course or change your filters.", "Ստեղծեք նոր դասընթաց կամ փոխեք զտիչները։")}
              action={<ButtonLink to="/teacher/courses/create" variant="secondary">{tr("Create Course", "Ստեղծել դասընթաց")}</ButtonLink>}
            />
          }
          columns={[
            {
              key: 'title',
              header: tr("Course", "Դասընթաց"),
              sortValue: (c) => c.title,
              render: (c) => (
                <div className="row" style={{ ['--gap' as string]: '12px', minWidth: 260 }}>
                  <Thumb src={c.image} alt="" className="table-thumb" />
                  <div style={{ minWidth: 0 }}>
                    <div className="cell-title">{c.title}</div>
                    <div className="cell-sub">{categoryName(c.category)}, {difficultyLabel[c.difficulty]}</div>
                  </div>
                </div>
              ),
            },
            { key: 'status', header: tr("Status", "Կարգավիճակ"), sortValue: (c) => c.status, render: (c) => <StatusBadge status={c.status} /> },
            { key: 'students', header: tr("Students", "Ուսանողներ"), align: 'right', sortValue: (c) => c.enrolled, render: (c) => formatNumber(c.enrolled) },
            { key: 'lessons', header: tr("Lessons", "Դասեր"), align: 'right', sortValue: (c) => lessonCount(c), render: (c) => lessonCount(c) },
            {
              key: 'completion',
              header: tr("Completion Rate", "Ավարտման մակարդակ"),
              sortValue: (c) => coursePerformance.find((p) => p.courseId === c.id)?.completionRate ?? 0,
              render: (c) => {
                const p = coursePerformance.find((x) => x.courseId === c.id);
                return p ? <div style={{ minWidth: 120 }}><ProgressBar value={p.completionRate} /></div> : <span className="muted small">—</span>;
              },
            },
            { key: 'updated', header: tr("Last Updated", "Թարմացվել է"), sortValue: (c) => c.updatedAt, render: (c) => <span className="nowrap">{formatDate(c.updatedAt)}</span> },
            {
              key: 'actions',
              header: '',
              render: (c) => (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Dropdown
                    trigger={({ toggle, open }) => (
                      <button type="button" className="icon-btn" onClick={toggle} aria-expanded={open} aria-label={tr(`Actions: ${c.title}`, `Գործողություններ՝ ${c.title}`)}>
                        <MoreHorizontal />
                      </button>
                    )}
                  >
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/courses/${c.id}`} onClick={close}><Eye />{tr("View", "Դիտել")}</Link>
                        <Link className="dropdown__item" to={`/teacher/courses/${c.id}/edit`} onClick={close}><Pencil />{tr("Edit", "Խմբագրել")}</Link>
                        <Link className="dropdown__item" to={`/teacher/courses/${c.id}/content`} onClick={close}><FolderTree />{tr("Content", "Բովանդակություն")}</Link>
                        <button type="button" className="dropdown__item" onClick={() => { toggleStatus(c); close(); }}>
                          {c.status === 'published' ? <EyeOff /> : <Eye />}
                          {c.status === 'published' ? tr("Unpublish", "Հանել հրապարակումից") : tr("Publish", "Հրապարակել")}
                        </button>
                        <div className="dropdown__sep" />
                        <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setToDelete(c); close(); }}><Trash2 />{tr("Delete", "Ջնջել")}</button>
                      </>
                    )}
                  </Dropdown>
                </div>
              ),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          setList((l) => l.filter((c) => c.id !== toDelete.id));
          toast.success(tr("Course deleted", "Դասընթացը ջնջվեց"), tr("Kept only on this page. Refreshing will restore it.", "Փոփոխությունը պահվում է միայն այս էջում։ Էջը թարմացնելիս դասընթացը կվերականգնվի։"));
        }}
        title={tr("Delete this course?", "Ջնջե՞լ դասընթացը")}
        text={toDelete ? tr(`${toDelete.title}, its ${lessonCount(toDelete)} lessons, and the progress of ${formatNumber(toDelete.enrolled)} students will be deleted. This action cannot be undone.`, `«${toDelete.title}» դասընթացը, նրա ${lessonCount(toDelete)} դասը և ${formatNumber(toDelete.enrolled)} ուսանողի առաջընթացը կջնջվեն։ Այս գործողությունը հնարավոր չէ չեղարկել։`) : ''}
        confirmLabel={tr("Delete Course", "Ջնջել դասընթացը")}
      />
    </>
  );
}

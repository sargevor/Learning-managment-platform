import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { getEnrolledCourses } from '../../data/enrollments';
import { categoryName, findLesson, lessonCount } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState, PageHeader, Tabs, Thumb } from '../../components/ui/Misc';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Field';
import { ProgressBar } from '../../components/ui/Progress';
import { StatusBadge } from '../../components/ui/Badge';
import { compareText, relativeTime } from '../../lib/format';
import { tr } from '../../i18n';

type TabKey = 'all' | EnrollmentState;

export function MyCoursesPage() {
  const [params] = useSearchParams();
  const all = getEnrolledCourses();
  const [tab, setTab] = useState<TabKey>('all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState('recent');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((e) => tab === 'all' || e.state === tab)
      .filter((e) => !term || e.course.title.toLowerCase().includes(term) || categoryName(e.course.category).toLowerCase().includes(term))
      .sort((a, b) => (sort === 'progress' ? b.progress - a.progress : sort === 'title' ? compareText(a.course.title, b.course.title) : b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed)));
  }, [all, tab, q, sort]);

  const count = (s: EnrollmentState) => all.filter((e) => e.state === s).length;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/student/dashboard' }, { label: tr("My courses", "Իմ դասընթացները") }]}
        title={tr("My courses", "Իմ դասընթացները")}
        description={tr("Find your courses, track your progress, and pick up where you left off.", "Գտեք ձեր դասընթացները, հետևեք առաջընթացին և շարունակեք այնտեղից, որտեղ կանգ էիք առել։")}
        actions={<ButtonLink to="/courses" variant="secondary" icon={<BookOpen />}>{tr("Find a New Course", "Գտնել նոր դասընթաց")}</ButtonLink>}
      />
      <div className="stack" style={{ ['--gap' as string]: '18px' }}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: tr("All", "Բոլորը"), count: all.length },
            { key: 'in-progress', label: tr("In progress", "Ընթացքում"), count: count('in-progress') },
            { key: 'completed', label: tr("Completed", "Ավարտված"), count: count('completed') },
            { key: 'not-started', label: tr("Not started", "Չսկսված"), count: count('not-started') },
          ]}
        />
        <div className="filters-bar">
          <SearchBar value={q} onChange={setQ} placeholder={tr("Search my courses", "Որոնել իմ դասընթացներում")} />
          <Select
            aria-label={tr("Sort By", "Դասավորել")}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: 'recent', label: tr("Recently Visited", "Վերջերս դիտվածները") },
              { value: 'progress', label: tr("By Progress", "Ըստ առաջընթացի") },
              { value: 'title', label: tr("By Title", "Ըստ անվանման") },
            ]}
          />
        </div>

        {list.length === 0 ? (
          <div className="card">
            <EmptyState
              title={q ? tr("No results found", "Ոչինչ չգտնվեց") : tr("No courses in this section", "Այս բաժնում դասընթացներ չկան")}
              text={q ? tr(`No courses match “${q}”.`, `«${q}» հարցմանը համապատասխանող դասընթաց չկա։`) : tr("Browse the catalog and enroll in a new course.", "Դիտեք կատալոգը և գրանցվեք նոր դասընթացի։")}
              action={q ? <button type="button" className="btn btn--secondary" onClick={() => setQ('')}>{tr("Clear search", "Մաքրել որոնումը")}</button> : <ButtonLink to="/courses">{tr("Browse Courses", "Բացել կատալոգը")}</ButtonLink>}
            />
          </div>
        ) : (
          <div className="grid grid-3 course-grid">
            {list.map(({ course, enrollment, progress, state }) => {
              const last = findLesson(enrollment.lastLessonId);
              return (
                <article key={course.id} className="course-card">
                  <Link to={`/student/courses/${course.id}/learn`} tabIndex={-1} aria-hidden="true">
                    <Thumb src={course.image} alt="" />
                  </Link>
                  <div className="course-card__body">
                    <div className="row row--between">
                      <span className="course-card__cat">{categoryName(course.category)}</span>
                      <StatusBadge status={state} />
                    </div>
                    <h2 className="course-card__title">
                      <Link to={`/student/courses/${course.id}/learn`} style={{ color: 'inherit' }}>{course.title}</Link>
                    </h2>
                    <span className="small secondary">{fullName(getUser(course.teacherId))}</span>
                    <ProgressBar value={progress} />
                    <div className="xs muted">
                      {enrollment.completedLessonIds.length} / {lessonCount(course)}{tr(" lessons completed ", " դաս ավարտված")}</div>
                    <div className="course-card__meta" style={{ flexDirection: 'column', gap: 10 }}>
                      <span className="tag">
                        <PlayCircle aria-hidden="true" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {state === 'not-started' ? tr("First lesson: ", "Առաջին դասը՝ ") : tr("Last lesson: ", "Վերջին դասը՝ ")}
                          {last?.lesson.title}
                        </span>
                      </span>
                      <span className="tag">
                        <Clock aria-hidden="true" />{tr("Last visited: ", "Վերջին այցը՝ ")}{state === 'not-started' ? tr("not yet visited", "դեռ չի եղել") : relativeTime(enrollment.lastAccessed)}
                      </span>
                      <ButtonLink to={`/student/courses/${course.id}/learn`} variant={state === 'completed' ? 'secondary' : 'primary'} block>
                        {state === 'not-started' ? tr("Start Learning", "Սկսել ուսումը") : state === 'completed' ? tr("Review Materials", "Վերանայել նյութերը") : tr("Continue Learning", "Շարունակել ուսումը")}
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

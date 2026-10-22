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
import { relativeTime } from '../../lib/format';

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
      .sort((a, b) => (sort === 'progress' ? b.progress - a.progress : sort === 'title' ? a.course.title.localeCompare(b.course.title, 'en') : b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed)));
  }, [all, tab, q, sort]);

  const count = (s: EnrollmentState) => all.filter((e) => e.state === s).length;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/student/dashboard' }, { label: "My courses" }]}
        title="My courses"
        description="Find your courses, track your progress, and pick up where you left off."
        actions={<ButtonLink to="/courses" variant="secondary" icon={<BookOpen />}>Find a New Course</ButtonLink>}
      />
      <div className="stack" style={{ ['--gap' as string]: '18px' }}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: "All", count: all.length },
            { key: 'in-progress', label: "In progress", count: count('in-progress') },
            { key: 'completed', label: "Completed", count: count('completed') },
            { key: 'not-started', label: "Not started", count: count('not-started') },
          ]}
        />
        <div className="filters-bar">
          <SearchBar value={q} onChange={setQ} placeholder="Search my courses" />
          <Select
            aria-label="Sort By"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: 'recent', label: "Recently Visited" },
              { value: 'progress', label: "By Progress" },
              { value: 'title', label: "By Title" },
            ]}
          />
        </div>

        {list.length === 0 ? (
          <div className="card">
            <EmptyState
              title={q ? "No results found" : "No courses in this section"}
              text={q ? `No courses match “${q}”.` : "Browse the catalog and enroll in a new course."}
              action={q ? <button type="button" className="btn btn--secondary" onClick={() => setQ('')}>Clear search</button> : <ButtonLink to="/courses">Browse Courses</ButtonLink>}
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
                      {enrollment.completedLessonIds.length} / {lessonCount(course)} lessons completed </div>
                    <div className="course-card__meta" style={{ flexDirection: 'column', gap: 10 }}>
                      <span className="tag">
                        <PlayCircle aria-hidden="true" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {state === 'not-started' ? "First lesson: " : "Last lesson: "}
                          {last?.lesson.title}
                        </span>
                      </span>
                      <span className="tag">
                        <Clock aria-hidden="true" />Last visited: {state === 'not-started' ? "not yet visited" : relativeTime(enrollment.lastAccessed)}
                      </span>
                      <ButtonLink to={`/student/courses/${course.id}/learn`} variant={state === 'completed' ? 'secondary' : 'primary'} block>
                        {state === 'not-started' ? "Start Learning" : state === 'completed' ? "Review Materials" : "Continue Learning"}
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

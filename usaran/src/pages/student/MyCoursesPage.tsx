import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Check, CircleCheck, Clock, Flame, Layers, Play, RotateCcw, SlidersHorizontal, Trophy } from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { getEnrolledCourses, type EnrolledCourse } from '../../data/enrollments';
import { allLessons, categoryName } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { studentWeeklyMinutes } from '../../data/analytics';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState, Tabs } from '../../components/ui/Misc';
import { SearchBar } from '../../components/ui/SearchBar';
import { Chip, Ring } from '../../components/ui/Visual';
import { LESSON_ICONS } from '../../components/course/CourseBits';
import { daysUntil, formatShortDate, TODAY } from '../../lib/format';
import { CATEGORY_ICONS } from '../../lib/visual';

type TabKey = 'all' | EnrollmentState;

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const bare = (title: string) => title.replace(/^(Quiz|Assignment):\s*/, '');

function lastVisit(e: EnrolledCourse): string {
  if (e.state === 'not-started') return 'Not yet';
  const d = -daysUntil(e.enrollment.lastAccessed);
  if (d <= 0) return 'Today';
  if (d < 7) return `${d} d ago`;
  return formatShortDate(e.enrollment.lastAccessed);
}

export function MyCoursesPage() {
  const [params] = useSearchParams();
  const all = getEnrolledCourses();
  const [tab, setTab] = useState<TabKey>('all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState('recent');

  // The top-bar search navigates here with ?q=, also while the page is already open.
  const paramQ = params.get('q');
  useEffect(() => {
    if (paramQ !== null) setQ(paramQ);
  }, [paramQ]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((e) => tab === 'all' || e.state === tab)
      .filter((e) => !term || e.course.title.toLowerCase().includes(term) || categoryName(e.course.category).toLowerCase().includes(term))
      .sort((a, b) => (sort === 'progress' ? b.progress - a.progress : sort === 'title' ? a.course.title.localeCompare(b.course.title) : b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed)));
  }, [all, tab, q, sort]);

  const count = (s: EnrollmentState) => all.filter((e) => e.state === s).length;

  const todayIndex = (TODAY.getDay() + 6) % 7;
  let streak = 0;
  for (let i = todayIndex; i >= 0 && studentWeeklyMinutes[i]?.value > 0; i--) streak++;

  return (
    <>
      <ShellTitle
        title="My courses"
        meta={
          <>
            <Flame aria-hidden="true" />
            <b>{streak}-day streak</b>
            <span className="sl-dot" aria-hidden="true" />
            {WEEKDAYS_LONG[TODAY.getDay()]}, {TODAY.getDate()} {MONTHS_LONG[TODAY.getMonth()]}
          </>
        }
      />

      <section aria-label="Filter courses" className="sl-filters">
        <Tabs
          value={tab}
          onChange={setTab}
          label="Course status"
          items={[
            { key: 'all', label: 'All', count: all.length, icon: <Layers /> },
            { key: 'in-progress', label: 'Active', count: count('in-progress'), icon: <Play /> },
            { key: 'not-started', label: 'New', count: count('not-started'), icon: <BookOpen /> },
            { key: 'completed', label: 'Done', count: count('completed'), icon: <Trophy /> },
          ]}
        />
        <div className="sl-filters__right">
          <SearchBar value={q} onChange={setQ} placeholder="Search my courses" label="Search my courses" className="sl-filters__search" />
          <label className="sl-sort">
            <span className="sr-only">Sort</span>
            <SlidersHorizontal aria-hidden="true" />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Recent</option>
              <option value="progress">Progress</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>
      </section>

      {list.length === 0 ? (
        <div className="sl-card">
          <EmptyState
            title={q ? 'Nothing found' : 'No courses here'}
            action={
              q ? (
                <button type="button" className="btn btn--secondary" onClick={() => setQ('')}>
                  <RotateCcw />
                  Clear
                </button>
              ) : (
                <ButtonLink to="/courses" icon={<BookOpen />}>Catalog</ButtonLink>
              )
            }
          />
        </div>
      ) : (
        <section aria-label="Courses" className="sl-mc-grid">
          {list.map((e) => {
            const { course, enrollment, progress, state } = e;
            const lessons = allLessons(course);
            const next = lessons.find((l) => !enrollment.completedLessonIds.includes(l.id));
            const done = state === 'completed';
            const CatIcon = CATEGORY_ICONS[course.category];
            const NextIcon = next ? LESSON_ICONS[next.type] : CircleCheck;
            const teacher = fullName(getUser(course.teacherId));
            const to = `/student/courses/${course.id}/learn`;
            const ctaTo = next ? `${to}?lesson=${next.id}` : to;
            return (
              <article key={course.id} className="sl-mc v-lift">
                <Link to={ctaTo} className="sl-mc__media" tabIndex={-1} aria-hidden="true">
                  <img src={course.image} alt="" loading="lazy" />
                  <span className="sl-mc__shade" />
                  <Chip tone="white" className="sl-mc__cat" icon={<CatIcon />}>{categoryName(course.category)}</Chip>
                  <span className="sl-mc__badge">
                    {done ? (
                      <span className="sl-mc__done" role="img" aria-label="Completed"><Check /></span>
                    ) : (
                      <Ring value={progress} size={54} thickness={6} label="Progress" />
                    )}
                  </span>
                </Link>
                <div className="sl-mc__body">
                  <h2 className="sl-mc__title">
                    <Link to={to}>{course.title}</Link>
                  </h2>
                  <div className="sl-mc__teacher">
                    <Avatar name={teacher} size={30} />
                    <span>{teacher}</span>
                    <Chip icon={<Clock />} title="Last visit">{lastVisit(e)}</Chip>
                  </div>
                  <div className="sl-mc__foot">
                    <span className="sl-next">
                      <NextIcon aria-hidden="true" className="sl-next__icon" />
                      <span className="sl-next__text">{next ? bare(next.title) : `All ${lessons.length} lessons`}</span>
                    </span>
                    {done ? (
                      <ButtonLink to={to} variant="secondary" icon={<RotateCcw />}>Review</ButtonLink>
                    ) : (
                      <ButtonLink to={ctaTo} icon={<Play />}>{state === 'not-started' ? 'Start' : 'Continue'}</ButtonLink>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

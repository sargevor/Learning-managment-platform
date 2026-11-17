import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, BookOpen, CirclePlay, FileQuestionMark, GraduationCap, Layers, LibraryBig, MessageSquare, Play, Search, Sparkles, Star,
} from 'lucide-react';
import type { CategoryId, Course } from '../../types';
import { categories, findLesson, publishedCourses } from '../../data/courses';
import { fullName, teachers } from '../../data/users';
import { getEnrolledCourses } from '../../data/enrollments';
import { getGradeRows } from '../../data/studentView';
import { shortTitle } from '../../data/teacherView';
import { CourseCard } from '../../components/course/CourseBits';
import { Avatar } from '../../components/ui/Misc';
import { CATEGORY_ICONS, SCENES, categoryImage, photoFor } from '../../lib/visual';

/* Four-point star used as a small decorative accent. */
function Spark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
    </svg>
  );
}

const byCategory = (id: CategoryId) => publishedCourses.filter((c) => c.category === id);
const avgRating = (list: Course[]) => {
  const rated = list.filter((c) => c.rating > 0);
  return rated.length ? rated.reduce((n, c) => n + c.rating, 0) / rated.length : 0;
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const STEPS = [
  { title: 'Pick a course', icon: Search },
  { title: 'Watch lessons', icon: CirclePlay },
  { title: 'Take quizzes', icon: FileQuestionMark },
  { title: 'Get feedback', icon: MessageSquare },
];

const FACES = ['Tigran Melkonyan', 'Ani Hakobyan', 'Sona Mikayelyan', 'Hayk Vardanyan'];

export function HomePage() {
  const enrolled = getEnrolledCourses();
  const grades = getGradeRows().filter((g) => g.percent >= 0);
  const current = [...enrolled].filter((e) => e.state === 'in-progress').sort((a, b) => b.enrollment.lastAccessed.localeCompare(a.enrollment.lastAccessed))[0] ?? enrolled[0];
  const currentLesson = current ? findLesson(current.enrollment.lastLessonId) : undefined;
  const moduleIndex = current && currentLesson ? current.course.modules.findIndex((m) => m.id === currentLesson.module.id) : 0;
  const lessonIndex = currentLesson ? currentLesson.module.lessons.findIndex((l) => l.id === currentLesson.lesson.id) : 0;
  const latestGrade = [...grades].filter((g) => g.kind === 'assignment').sort((a, b) => b.date.localeCompare(a.date))[0];
  const platformRating = avgRating(publishedCourses);
  const featured = publishedCourses.filter((c) => c.featured).slice(0, 4);

  return (
    <div className="pub-page">
      <div className="pub-stack">
        {/* ───────── Hero ───────── */}
        <section className="pub-wrap pub-hero">
          <div className="pub-hero__copy">
            <span className="pub-badge">
              <span className="pub-badge__new"><Sparkles aria-hidden="true" />New</span>
              Learn online
            </span>
            <h1 className="pub-hero__title">
              Learn with{' '}
              <span className="pub-hl">
                inspiration
                <svg viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 12 C 50 3, 110 3, 150 9 S 215 15, 237 6" />
                </svg>
              </span>
            </h1>
            <p className="pub-hero__lead">Video lessons, quizzes and feedback in one place.</p>
            <div className="pub-actions">
              <Link to="/register" className="pub-btn pub-btn--dark">Start learning<ArrowRight aria-hidden="true" /></Link>
              <button type="button" className="pub-btn pub-btn--light pub-btn--play" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="pub-btn__dot"><Play aria-hidden="true" /></span>How it works
              </button>
            </div>
            <div className="pub-proof">
              <div className="pub-faces">
                {FACES.map((n) => <Avatar key={n} name={n} size={46} />)}
              </div>
              <div className="pub-proof__text">
                <span className="pub-stars" role="img" aria-label={`Average course rating ${platformRating.toFixed(1)} out of 5`}>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} aria-hidden="true" />)}
                  <b>{platformRating.toFixed(1)}</b>
                </span>
                <span className="pub-proof__label">Avg course rating</span>
              </div>
            </div>
          </div>

          <div className="pub-stage">
            <div className="pub-stage__bg" aria-hidden="true" />
            <div className="pub-stage__arch"><img src={SCENES.hero} alt="Students laughing while working together on laptops" /></div>
            <Spark className="pub-spark pub-spark--a" />
            <Spark className="pub-spark pub-spark--b" />
            {latestGrade && (
              <div className="pub-float pub-float--grade" aria-hidden="true">
                <span className="pub-ibox"><Award /></span>
                <span>
                  <small>New grade</small>
                  <b className="tabular">{latestGrade.score}<span>/{latestGrade.max}</span></b>
                </span>
              </div>
            )}
            {current && (
              <div className="pub-float pub-float--course" aria-hidden="true">
                <img src={current.course.image} alt="" />
                <span className="pub-float__body">
                  <span className="pub-float__row"><b>{shortTitle(current.course.id)}</b><b className="pub-float__pct">{Math.round(current.progress)}%</b></span>
                  <span className="pub-float__meta"><Layers />Module {moduleIndex + 1} · {lessonIndex + 1}/{currentLesson?.module.lessons.length ?? 0}</span>
                  <span className="pub-bar"><span style={{ width: `${current.progress}%` }} /></span>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ───────── Subjects ───────── */}
        <section className="pub-wrap pub-section" aria-labelledby="subjects-h">
          <div className="pub-head">
            <h2 id="subjects-h" className="pub-h2">Pick a subject</h2>
            <Link to="/courses" className="pub-more">All courses<ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="pub-grid pub-grid--260">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              const n = byCategory(c.id).length;
              return (
                <Link key={c.id} to={`/courses?category=${c.id}`} className="pub-tile v-lift">
                  <img src={categoryImage(c.id)} alt="" loading="lazy" />
                  <span className="pub-tile__scrim" aria-hidden="true" />
                  <span className="pub-tile__icon" aria-hidden="true"><Icon /></span>
                  <span className="pub-tile__foot">
                    <b>{c.name}</b>
                    <span className="pub-glass"><BookOpen aria-hidden="true" />{plural(n, 'course')}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ───────── Featured courses ───────── */}
        <section className="pub-wrap pub-section" aria-labelledby="featured-h">
          <div className="pub-head">
            <h2 id="featured-h" className="pub-h2">Featured courses</h2>
            <Link to="/courses" className="pub-more">All courses<ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="pub-grid pub-grid--260 pub-courses">
            {featured.map((c) => <CourseCard key={c.id} course={c} hideDescription />)}
          </div>
        </section>

        {/* ───────── How it works ───────── */}
        <section id="how" className="pub-wrap pub-section" aria-labelledby="how-h">
          <h2 id="how-h" className="pub-h2">How it works</h2>
          <ol className="pub-grid pub-grid--240 pub-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="pub-step">
                <span className="pub-step__icon" aria-hidden="true"><s.icon /></span>
                <span className="pub-step__n" aria-hidden="true">{i + 1}</span>
                <b>{s.title}</b>
              </li>
            ))}
          </ol>
        </section>

        {/* ───────── Teachers ───────── */}
        <section className="pub-wrap pub-section" aria-labelledby="teachers-h">
          <h2 id="teachers-h" className="pub-h2">Meet your teachers</h2>
          <div className="pub-grid pub-grid--240">
            {teachers.slice(0, 4).map((t) => {
              const name = fullName(t);
              const mine = publishedCourses.filter((c) => c.teacherId === t.id);
              const RoleIcon = mine[0] ? CATEGORY_ICONS[mine[0].category] : GraduationCap;
              const photo = photoFor(name);
              return (
                <div key={t.id} className="pub-teacher">
                  <span className="pub-teacher__arch">
                    {photo ? <img src={photo} alt={name} loading="lazy" /> : <span className="pub-initials" role="img" aria-label={name}>{t.firstName[0]}{t.lastName[0]}</span>}
                  </span>
                  <span className="pub-teacher__text">
                    <b>{name}</b>
                    <span className="pub-teacher__role"><RoleIcon aria-hidden="true" />{(t.title ?? 'Teacher').split(',')[0]}</span>
                  </span>
                  <span className="pub-chips">
                    {mine.length > 0 && <span className="pub-chip pub-chip--blue"><Star aria-hidden="true" />{avgRating(mine).toFixed(1)}</span>}
                    <span className="pub-chip"><BookOpen aria-hidden="true" />{plural(mine.length, 'course')}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────── Call to action ───────── */}
        <section className="pub-wrap">
          <div className="pub-cta">
            <div className="pub-cta__copy">
              <span className="pub-cta__kicker"><Sparkles aria-hidden="true" />Start today</span>
              <h2>Choose a course</h2>
              <div className="pub-cta__facts">
                <span><LibraryBig aria-hidden="true" />{plural(publishedCourses.length, 'course')}</span>
                <span><Layers aria-hidden="true" />{plural(categories.length, 'subject')}</span>
              </div>
              <div className="pub-actions">
                <Link to="/register" className="pub-btn pub-btn--light">Sign up<ArrowRight aria-hidden="true" /></Link>
                <Link to="/student/dashboard" className="pub-btn pub-btn--ghost"><GraduationCap aria-hidden="true" />Try demo</Link>
              </div>
            </div>
            <div className="pub-cta__art">
              <span className="pub-cta__ring" aria-hidden="true" />
              <span className="pub-cta__arch"><img src={SCENES.cta} alt="Students studying together in a library" loading="lazy" /></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


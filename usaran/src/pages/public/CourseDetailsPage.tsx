import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, ChartColumn, Check, ChevronDown, ChevronsUpDown, CirclePlay, ClipboardList, Clock, FileQuestionMark, FileText, Globe, GraduationCap, Layers, Lock, Paperclip, Play, Plus, Presentation, RotateCcw, Star, Users, Video } from 'lucide-react';
import { difficultyLabel, getCourse, lessonCount, publishedCourses } from '../../data/courses';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { fullName, getUser } from '../../data/users';
import { isEnrolled } from '../../data/enrollments';
import { CATEGORY_SHORT } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Overlay';
import { useToast } from '../../context/ToastContext';
import { cx, formatDate, formatNumber } from '../../lib/format';
import { CATEGORY_ICONS, categoryImage, photoFor } from '../../lib/visual';
import type { Lesson, LessonType } from '../../types';

const TYPE_ICON: Record<LessonType, typeof Video> = {
  video: Video,
  text: FileText,
  resource: Paperclip,
  quiz: FileQuestionMark,
  assignment: ClipboardList,
};
const TYPE_ORDER: LessonType[] = ['video', 'text', 'resource', 'quiz', 'assignment'];

const hm = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);
const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();

export function CourseDetailsPage() {
  const { id } = useParams();
  // Keyed by id so state (open modules, enrolment, photo) resets when moving to a related course.
  return <CourseDetails key={id} id={id} />;
}

function CourseDetails({ id }: { id: string | undefined }) {
  const course = getCourse(id);
  const toast = useToast();
  const [open, setOpen] = useState<Set<string>>(() => new Set(course?.modules[0] ? [course.modules[0].id] : []));
  const [enrolled, setEnrolled] = useState(() => (course ? isEnrolled(course.id) : false));
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [preview, setPreview] = useState<Lesson | null>(null);
  const [heroImg, setHeroImg] = useState(course?.image);

  if (!course || course.status !== 'published') {
    return (
      <div className="cat-page">
        <div className="cat-wrap">
          <div className="cat-empty">
            <EmptyState
              icon={<BookOpen size={26} />}
              title="Course not found"
              action={<ButtonLink to="/courses" variant="primary" icon={<ArrowLeft />}>Courses</ButtonLink>}
            />
          </div>
        </div>
      </div>
    );
  }

  const teacher = getUser(course.teacherId);
  const teacherName = fullName(teacher);
  const teacherPhoto = photoFor(teacherName);
  const teacherCourses = publishedCourses.filter((c) => c.teacherId === course.teacherId);
  const teacherRating = teacherCourses.reduce((n, c) => n + c.rating, 0) / (teacherCourses.length || 1);
  const teacherStudents = teacherCourses.reduce((n, c) => n + c.enrolled, 0);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id && q.status === 'published');
  const lessons = course.modules.flatMap((m) => m.lessons);
  const videoMin = lessons.filter((l) => l.type === 'video').reduce((n, l) => n + l.durationMin, 0);
  const firstPreview = lessons.find((l) => l.preview);
  const related = publishedCourses
    .filter((c) => c.id !== course.id && c.category === course.category)
    .concat(publishedCourses.filter((c) => c.id !== course.id && c.category !== course.category))
    .slice(0, 3);
  const allOpen = open.size === course.modules.length;
  const toggle = (mid: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(mid)) n.delete(mid);
      else n.add(mid);
      return n;
    });
  const CatIcon = CATEGORY_ICONS[course.category] ?? BookOpen;
  const fallback = categoryImage(course.category);

  const heroChips = [
    { icon: Star, label: course.rating.toFixed(1), aria: 'Rating' },
    { icon: Users, label: formatNumber(course.enrolled), aria: 'Students' },
    { icon: Clock, label: `${course.durationHours} h`, aria: 'Duration' },
    { icon: ChartColumn, label: difficultyLabel[course.difficulty], aria: 'Level' },
    { icon: Globe, label: course.language, aria: 'Language' },
  ];
  const included = [
    { icon: Video, label: 'Video', v: hm(videoMin) },
    { icon: ClipboardList, label: 'Graded tasks', v: String(courseAssignments.length) },
    { icon: FileQuestionMark, label: 'Quizzes', v: String(courseQuizzes.length) },
    { icon: Award, label: 'Certificate', check: true },
  ];

  return (
    <div className="cat-page cat-page--detail">
      <div className="cat-wrap cat-detail">
        <div className="cat-detail__main">
          {/* Hero */}
          <section className="cat-hero-card">
            <img className="cat-hero-card__img" src={heroImg || fallback} alt="" onError={() => heroImg !== fallback && setHeroImg(fallback)} />
            <div className="cat-hero-card__scrim" aria-hidden="true" />
            <div className="cat-hero-card__inner">
              <div className="cat-hero-card__top">
                <Link to="/courses" className="cat-glass-chip cat-glass-chip--link">
                  <ArrowLeft aria-hidden="true" />
                  Courses
                </Link>
                <Link to={`/courses?category=${course.category}`} className="cat-white-chip">
                  <CatIcon aria-hidden="true" />
                  {CATEGORY_SHORT[course.category]}
                </Link>
              </div>
              <div className="cat-hero-card__text">
                <h1>{course.title}</h1>
                <p>{course.shortDescription}</p>
              </div>
              <div className="cat-hero-card__bottom">
                <ul className="cat-hero-card__chips">
                  {heroChips.map((h) => (
                    <li key={h.aria} className="cat-glass-chip" aria-label={`${h.aria}: ${h.label}`}>
                      <h.icon aria-hidden="true" />
                      {h.label}
                    </li>
                  ))}
                </ul>
                <div className="cat-byline">
                  {teacherPhoto ? <img src={teacherPhoto} alt="" /> : <span className="cat-byline__ini" aria-hidden="true">{initialsOf(teacherName)}</span>}
                  <span>
                    <b>{teacherName}</b>
                    <span><Presentation aria-hidden="true" />Teacher</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* What you'll learn */}
          <section className="cat-box">
            <h2 className="cat-h2">What you'll learn</h2>
            <ul className="cat-learn">
              {course.objectives.map((o) => (
                <li key={o}>
                  <span className="cat-learn__check" aria-hidden="true"><Check /></span>
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {/* Curriculum */}
          <section className="cat-box">
            <div className="cat-box__head">
              <h2 className="cat-h2">Curriculum</h2>
              <div className="cat-box__tools">
                <span className="cat-grey-chip"><Layers aria-hidden="true" />{course.modules.length} modules</span>
                <span className="cat-grey-chip"><BookOpen aria-hidden="true" />{lessonCount(course)} lessons</span>
                <button type="button" className="cat-grey-chip cat-grey-chip--btn" aria-label={allOpen ? 'Collapse all modules' : 'Expand all modules'} onClick={() => setOpen(allOpen ? new Set() : new Set(course.modules.map((m) => m.id)))}>
                  <ChevronsUpDown aria-hidden="true" />
                  {allOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </div>
            <div className="cat-modules">
              {course.modules.map((m, mi) => {
                const isOpen = open.has(m.id);
                const total = m.lessons.reduce((n, l) => n + l.durationMin, 0);
                const counts = TYPE_ORDER.map((t) => ({ t, n: m.lessons.filter((l) => l.type === t).length })).filter((x) => x.n > 0);
                return (
                  <div key={m.id} className={cx('cat-module', isOpen && 'is-open')}>
                    <button type="button" className="cat-module__head" aria-expanded={isOpen} onClick={() => toggle(m.id)}>
                      <span className="cat-module__num">{mi + 1}</span>
                      <span className="cat-module__title">
                        <b>{m.title}</b>
                        <span className="cat-module__types">
                          {counts.map(({ t, n }) => {
                            const Icon = TYPE_ICON[t];
                            return (
                              <span key={t} aria-label={`${n} ${t}`}>
                                <Icon aria-hidden="true" />
                                {n}
                              </span>
                            );
                          })}
                        </span>
                      </span>
                      <span className="cat-grey-chip cat-module__time"><Clock aria-hidden="true" />{hm(total)}</span>
                      <span className="cat-module__chev" aria-hidden="true"><ChevronDown /></span>
                    </button>
                    {isOpen && (
                      <ul className="cat-lessons">
                        {m.lessons.map((l) => {
                          const Icon = TYPE_ICON[l.type];
                          const locked = !l.preview && !enrolled;
                          return (
                            <li key={l.id} className="cat-lesson">
                              <span className="cat-lesson__icon" aria-hidden="true"><Icon /></span>
                              <span className="cat-lesson__title">{l.title}</span>
                              {l.preview && (
                                <button type="button" className="cat-preview-btn" onClick={() => setPreview(l)}>
                                  <CirclePlay aria-hidden="true" />
                                  Preview
                                </button>
                              )}
                              {locked && (
                                <span className="cat-lesson__lock" aria-label="Locked" role="img"><Lock aria-hidden="true" /></span>
                              )}
                              <span className="cat-lesson__min">{l.durationMin} min</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Teacher */}
          <section className="cat-box cat-teacher">
            {teacherPhoto ? (
              <img className="cat-teacher__photo" src={teacherPhoto} alt={teacherName} />
            ) : (
              <span className="cat-teacher__photo cat-teacher__photo--ini" aria-hidden="true">{initialsOf(teacherName)}</span>
            )}
            <div className="cat-teacher__body">
              <div>
                <div className="cat-teacher__label"><Presentation aria-hidden="true" />Your teacher</div>
                <h2 className="cat-h2">{teacherName}</h2>
                {teacher?.title && <div className="cat-teacher__role">{teacher.title}</div>}
              </div>
              <div className="cat-teacher__stats">
                <span className="cat-tstat">
                  <span className="cat-tstat__icon" aria-hidden="true"><Star /></span>
                  <span><b>{teacherRating.toFixed(1)}</b><span>Rating</span></span>
                </span>
                <span className="cat-tstat">
                  <span className="cat-tstat__icon" aria-hidden="true"><BookOpen /></span>
                  <span><b>{teacherCourses.length}</b><span>Courses</span></span>
                </span>
                <span className="cat-tstat">
                  <span className="cat-tstat__icon" aria-hidden="true"><Users /></span>
                  <span><b>{formatNumber(teacherStudents)}</b><span>Students</span></span>
                </span>
              </div>
            </div>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="cat-related">
              <h2 className="cat-h2">Related</h2>
              <div className="cat-related__grid">
                {related.map((r) => (
                  <Link key={r.id} to={`/courses/${r.id}`} className="cat-mini v-lift">
                    <img src={r.image || categoryImage(r.category)} alt="" loading="lazy" onError={(e) => { e.currentTarget.src = categoryImage(r.category); }} />
                    <span className="cat-mini__text">
                      <b>{r.title}</b>
                      <span className="cat-mini__meta">
                        <span className="cat-mini__rate"><Star aria-hidden="true" />{r.rating.toFixed(1)}</span>
                        <span><Clock aria-hidden="true" />{r.durationHours} h</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Enrol card */}
        <aside className="cat-enrol" aria-label="Enrol">
          <div className="cat-enrol__head">
            <span className="cat-enrol__icon" aria-hidden="true"><GraduationCap /></span>
            <span>
              <b>{enrolled ? 'Enrolled' : 'Start today'}</b>
              <span><RotateCcw aria-hidden="true" />Updated {formatDate(course.updatedAt)}</span>
            </span>
          </div>
          {enrolled ? (
            <ButtonLink to={`/student/courses/${course.id}/learn`} variant="primary" size="lg" block icon={<Play />} className="cat-enrol__main">Continue</ButtonLink>
          ) : (
            <Button variant="primary" size="lg" block icon={<Plus />} className="cat-enrol__main" onClick={() => setConfirmEnroll(true)}>Enrol</Button>
          )}
          {firstPreview && (
            <Button variant="secondary" block icon={<CirclePlay />} onClick={() => setPreview(firstPreview)}>Preview</Button>
          )}
          <div className="cat-enrol__sep" />
          <h2 className="cat-enrol__h">What's included</h2>
          <ul className="cat-included">
            {included.map((x) => (
              <li key={x.label}>
                <span className="cat-included__icon" aria-hidden="true"><x.icon /></span>
                <span className="cat-included__label">{x.label}</span>
                {x.v && <b>{x.v}</b>}
                {x.check && <span className="cat-included__check" role="img" aria-label="Included"><Check aria-hidden="true" /></span>}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Modal
        open={confirmEnroll}
        onClose={() => setConfirmEnroll(false)}
        title="Enrol"
        description={course.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnroll(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<Check />}
              onClick={() => {
                setEnrolled(true);
                setConfirmEnroll(false);
                toast.success('Enrolled', 'Demo only: resets on refresh.');
              }}
            >Confirm</Button>
          </>
        }
      >
        <ul className="cat-confirm">
          <li><span className="cat-included__icon" aria-hidden="true"><BookOpen /></span>{lessonCount(course)} lessons</li>
          <li><span className="cat-included__icon" aria-hidden="true"><ClipboardList /></span>{courseAssignments.length} tasks</li>
          <li><span className="cat-included__icon" aria-hidden="true"><FileQuestionMark /></span>{courseQuizzes.length} quizzes</li>
        </ul>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title ?? ''} description="Preview" size="lg">
        <div className="cat-video" style={{ backgroundImage: `linear-gradient(rgba(11,22,48,.55), rgba(11,22,48,.55)), url(${heroImg || fallback})` }}>
          <span className="cat-video__play"><Play aria-hidden="true" /></span>
          <span className="cat-video__time"><Clock aria-hidden="true" />{preview?.durationMin} min</span>
        </div>
      </Modal>
    </div>
  );
}

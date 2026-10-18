import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, BarChart3, BookOpen, CheckCircle2, ChevronDown, ClipboardList, Clock, FileQuestion, Globe, PlayCircle, Star, Users } from 'lucide-react';
import { categoryName, difficultyLabel, getCourse, lessonCount, publishedCourses } from '../../data/courses';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { fullName, getUser } from '../../data/users';
import { isEnrolled } from '../../data/enrollments';
import { CourseCard, LessonItem } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, Breadcrumbs, EmptyState, Thumb } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Overlay';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { cx, formatDate, formatNumber } from '../../lib/format';
import type { Lesson } from '../../types';

export function CourseDetailsPage() {
  const { id } = useParams();
  const course = getCourse(id);
  const toast = useToast();
  const [open, setOpen] = useState<Set<string>>(() => new Set(course?.modules[0] ? [course.modules[0].id] : []));
  const [enrolled, setEnrolled] = useState(() => (course ? isEnrolled(course.id) : false));
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [preview, setPreview] = useState<Lesson | null>(null);

  if (!course || course.status !== 'published') {
    return (
      <div className="container page-pad">
        <div className="card">
          <EmptyState
            icon={<BookOpen size={24} />}
            title="Դասընթացը չի գտնվել"
            text="Հնարավոր է՝ այն հեռացվել է կամ դեռ հրապարակված չէ։"
            action={<ButtonLink to="/courses" variant="primary">Վերադառնալ կատալոգ</ButtonLink>}
          />
        </div>
      </div>
    );
  }

  const teacher = getUser(course.teacherId);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id && q.status === 'published');
  const related = publishedCourses.filter((c) => c.id !== course.id && c.category === course.category).concat(publishedCourses.filter((c) => c.id !== course.id && c.category !== course.category)).slice(0, 3);
  const allOpen = open.size === course.modules.length;
  const toggle = (mid: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(mid)) n.delete(mid);
      else n.add(mid);
      return n;
    });

  return (
    <>
      <section className="course-hero">
        <div className="container course-hero__grid">
          <div className="stack" style={{ ['--gap' as string]: '14px' }}>
            <Breadcrumbs items={[{ label: 'Դասընթացներ', to: '/courses' }, { label: categoryName(course.category), to: `/courses?category=${course.category}` }, { label: course.title }]} />
            <h1 className="course-hero__title">{course.title}</h1>
            <p className="course-hero__lead">{course.shortDescription}</p>
            <div className="course-hero__meta">
              <span><Star size={15} style={{ color: '#f2c14e', fill: '#f2c14e' }} aria-hidden="true" /> {course.rating.toFixed(1)} վարկանիշ</span>
              <span><Users size={15} aria-hidden="true" /> {formatNumber(course.enrolled)} ուսանող</span>
              <span><Clock size={15} aria-hidden="true" /> {course.durationHours} ժամ</span>
              <span><BarChart3 size={15} aria-hidden="true" /> {difficultyLabel[course.difficulty]}</span>
              <span><Globe size={15} aria-hidden="true" /> {course.language}</span>
            </div>
            <div className="row" style={{ marginTop: 6 }}>
              <Avatar name={fullName(teacher)} size={40} />
              <div>
                <div className="small" style={{ color: 'rgba(255,255,255,.7)' }}>Դասավանդող</div>
                <div className="strong" style={{ color: '#fff' }}>{fullName(teacher)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container course-layout">
        <div className="stack" style={{ ['--gap' as string]: '28px', minWidth: 0 }}>
          <section className="card card--pad">
            <h2 className="block-title">Դասընթացի մասին</h2>
            <p className="secondary" style={{ maxWidth: 720 }}>{course.description}</p>
          </section>

          <section className="card card--pad">
            <h2 className="block-title">Ինչ կսովորեք</h2>
            <ul className="objectives">
              {course.objectives.map((o) => (
                <li key={o}>
                  <CheckCircle2 aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card__header">
              <div>
                <h2>Դասընթացի ծրագիր</h2>
                <div className="sub">
                  {course.modules.length} մոդուլ, {lessonCount(course)} դաս, ընդհանուր {course.durationHours} ժամ
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(allOpen ? new Set() : new Set(course.modules.map((m) => m.id)))}>
                {allOpen ? 'Փակել բոլորը' : 'Բացել բոլորը'}
              </Button>
            </div>
            <div className="curriculum">
              {course.modules.map((m, mi) => {
                const isOpen = open.has(m.id);
                return (
                  <div key={m.id} className="curriculum__module">
                    <button type="button" className="curriculum__head" aria-expanded={isOpen} onClick={() => toggle(m.id)}>
                      <ChevronDown className={cx('chev', isOpen && 'is-open')} aria-hidden="true" />
                      <span className="grow">
                        <span className="xs muted" style={{ display: 'block' }}>Մոդուլ {mi + 1}</span>
                        <span className="strong">{m.title}</span>
                      </span>
                      <span className="xs muted">{m.lessons.length} դաս, {m.lessons.reduce((n, l) => n + l.durationMin, 0)} ր</span>
                    </button>
                    {isOpen && (
                      <div className="curriculum__lessons">
                        {m.lessons.map((l) => (
                          <LessonItem
                            key={l.id}
                            lesson={l}
                            locked={!l.preview && !enrolled}
                            showType
                            trailing={l.preview ? <Button variant="ghost" size="sm" icon={<PlayCircle />} onClick={() => setPreview(l)}>Նախադիտում</Button> : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="block-title">Առաջադրանքներ և թեստեր</h2>
            <p className="small secondary" style={{ marginBottom: 16 }}>Գիտելիքները ամրապնդվում են գործնական աշխատանքներով, որոնք գնահատում է դասավանդողը, և ավտոմատ ստուգվող թեստերով։</p>
            <div className="grid grid-2">
              <div className="info-tile">
                <ClipboardList aria-hidden="true" />
                <div>
                  <div className="strong">{courseAssignments.length} գործնական առաջադրանք</div>
                  <ul className="info-tile__list">
                    {courseAssignments.slice(0, 3).map((a) => (
                      <li key={a.id}>{a.title} <span className="muted">({a.maxScore} միավոր)</span></li>
                    ))}
                    {courseAssignments.length === 0 && <li className="muted">Առաջադրանքները կավելացվեն դասընթացի ընթացքում</li>}
                  </ul>
                </div>
              </div>
              <div className="info-tile">
                <FileQuestion aria-hidden="true" />
                <div>
                  <div className="strong">{courseQuizzes.length} ստուգողական թեստ</div>
                  <ul className="info-tile__list">
                    {courseQuizzes.map((q) => (
                      <li key={q.id}>{q.title} <span className="muted">({q.questions.length} հարց)</span></li>
                    ))}
                    {courseQuizzes.length === 0 && <li className="muted">Ինքնաստուգման հարցեր յուրաքանչյուր մոդուլի վերջում</li>}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="block-title">Դասավանդող</h2>
            <div className="row row--top" style={{ ['--gap' as string]: '16px' }}>
              <Avatar name={fullName(teacher)} size={64} />
              <div className="stack" style={{ ['--gap' as string]: '6px' }}>
                <div className="strong" style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>{fullName(teacher)}</div>
                <div className="small muted">{teacher?.title}</div>
                <p className="small secondary">{teacher?.bio}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="course-aside">
          <div className="card enroll-card">
            <Thumb src={course.image} alt="" />
            <div className="stack" style={{ padding: 20, ['--gap' as string]: '14px' }}>
              <div className="row row--between">
                <span className="enroll-card__price">Անվճար</span>
                <Badge tone="accent">{categoryName(course.category)}</Badge>
              </div>
              {enrolled ? (
                <>
                  <ButtonLink to={`/student/courses/${course.id}/learn`} variant="primary" size="lg" block>Շարունակել ուսումը</ButtonLink>
                  <p className="xs muted" style={{ textAlign: 'center' }}>Դուք գրանցված եք այս դասընթացին (դեմո)</p>
                </>
              ) : (
                <Button variant="primary" size="lg" block onClick={() => setConfirmEnroll(true)}>Գրանցվել դասընթացին</Button>
              )}
              <ul className="enroll-card__list">
                <li><PlayCircle aria-hidden="true" />{lessonCount(course)} դաս՝ տեսանյութերով և նյութերով</li>
                <li><ClipboardList aria-hidden="true" />{courseAssignments.length} առաջադրանք դասավանդողի գնահատմամբ</li>
                <li><FileQuestion aria-hidden="true" />{courseQuizzes.length} թեստ ակնթարթային արդյունքով</li>
                <li><Award aria-hidden="true" />Ավարտական վկայական</li>
                <li><Clock aria-hidden="true" />Թարմացվել է {formatDate(course.updatedAt)}</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <h2 className="section-head__title">Նմանատիպ դասընթացներ</h2>
            <Link to="/courses" className="small strong">Բոլոր դասընթացները</Link>
          </div>
          <div className="grid grid-3 course-grid">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={confirmEnroll}
        onClose={() => setConfirmEnroll(false)}
        title="Գրանցվել դասընթացին"
        description={course.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnroll(false)}>Չեղարկել</Button>
            <Button
              variant="primary"
              onClick={() => {
                setEnrolled(true);
                setConfirmEnroll(false);
                toast.success('Դուք գրանցվեցիք դասընթացին', 'Դեմո ռեժիմ. գրանցումը պահվում է միայն այս էջում։');
              }}
            >
              Հաստատել գրանցումը
            </Button>
          </>
        }
      >
        <p className="small secondary">Գրանցվելուց հետո կբացվեն դասընթացի բոլոր դասերը, առաջադրանքները և թեստերը։ Այս ցուցադրական տարբերակում գրանցումը չի ուղարկվում սերվեր և կչեղարկվի էջը թարմացնելիս։</p>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title ?? ''} description="Դասի նախադիտում" size="lg">
        <div className="video-placeholder">
          <PlayCircle size={56} aria-hidden="true" />
          <span>Տեսանյութի նախադիտում ({preview?.durationMin} րոպե)</span>
          <span className="xs" style={{ opacity: 0.7 }}>Ցուցադրական տարբերակում տեսանյութեր չեն հոսթավորվում</span>
        </div>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, BarChart3, BookOpen, Check, ChevronDown, ClipboardList, Clock, FileQuestion, Globe, Layers, PlayCircle, RefreshCw, Star, Users } from 'lucide-react';
import { categoryName, difficultyLabel, getCourse, lessonCount, publishedCourses } from '../../data/courses';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { fullName, getUser } from '../../data/users';
import { isEnrolled } from '../../data/enrollments';
import { LessonItem } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, Breadcrumbs, EmptyState, Thumb } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Overlay';
import { useToast } from '../../context/ToastContext';
import { cx, formatDate, formatNumber } from '../../lib/format';
import { CATEGORY_TINT } from '../../lib/visual';
import type { Lesson } from '../../types';
import { tr } from '../../i18n';

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
        <div className="empty-panel">
          <EmptyState
            icon={<BookOpen size={26} />}
            title={tr("Course not found", "Դասընթացը չի գտնվել")}
            text={tr("This course may have been removed or is not published yet.", "Հնարավոր է՝ այն հեռացվել է կամ դեռ հրապարակված չէ։")}
            action={<ButtonLink to="/courses" variant="primary">{tr("Back to Courses", "Վերադառնալ կատալոգ")}</ButtonLink>}
          />
        </div>
      </div>
    );
  }

  const teacher = getUser(course.teacherId);
  const teacherCourses = publishedCourses.filter((c) => c.teacherId === course.teacherId);
  const teacherRating = teacherCourses.reduce((n, c) => n + c.rating, 0) / (teacherCourses.length || 1);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id && q.status === 'published');
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

  return (
    <>
      <section className="page-band">
        <div className="container cd-grid">
          <div className="stack" style={{ ['--gap' as string]: '0px', minWidth: 0 }}>
            <Breadcrumbs items={[{ label: tr("Home", "Գլխավոր"), to: '/' }, { label: tr("Courses", "Դասընթացներ"), to: '/courses' }, { label: categoryName(course.category), to: `/courses?category=${course.category}` }]} />
            <h1 className="cd-title">{course.title}</h1>
            <p className="cd-lead">{course.shortDescription}</p>
            <div className="cd-meta">
              <span className="r"><Star aria-hidden="true" />{course.rating.toFixed(1)}</span>
              <span><Users aria-hidden="true" />{formatNumber(course.enrolled)}{tr(" students", " ուսանող")}</span>
              <span><Clock aria-hidden="true" />{course.durationHours}{tr(" hr", " ժամ")}</span>
              <span><BarChart3 aria-hidden="true" />{difficultyLabel[course.difficulty]}</span>
              <span><Globe aria-hidden="true" />{course.language}</span>
            </div>
            <div className="cd-byline">
              <Avatar name={fullName(teacher)} size={50} />
              <div>
                <b>{fullName(teacher)}</b>
                <span>{teacher?.title}</span>
              </div>
            </div>
          </div>

          <aside className="enroll-card">
            <div className="enroll-card__media">
              <Thumb src={course.image} alt="" ratio="16 / 10" />
              <span className="enroll-card__tag">{categoryName(course.category)}</span>
            </div>
            <div className="enroll-card__body">
              {enrolled ? (
                <>
                  <ButtonLink to={`/student/courses/${course.id}/learn`} variant="accent" size="lg" block>{tr("Continue Learning", "Շարունակել ուսումը")}</ButtonLink>
                  <p className="xs muted" style={{ textAlign: 'center' }}>{tr("You are enrolled in this course (demo)", "Դուք գրանցված եք այս դասընթացին (ցուցադրական ռեժիմ)")}</p>
                </>
              ) : (
                <Button variant="accent" size="lg" block onClick={() => setConfirmEnroll(true)}>{tr("Enroll in Course", "Գրանցվել դասընթացին")}</Button>
              )}
              <ul className="enroll-card__list">
                <li><Layers aria-hidden="true" />{course.modules.length}{tr(" modules · ", " մոդուլ · ")}{lessonCount(course)}{tr(" lessons", " դաս")}</li>
                <li><ClipboardList aria-hidden="true" />{courseAssignments.length}{tr(" instructor-graded assignments", " առաջադրանք դասավանդողի գնահատմամբ")}</li>
                <li><FileQuestion aria-hidden="true" />{courseQuizzes.length}{tr(" quizzes with instant results", " թեստ ակնթարթային արդյունքով")}</li>
                <li><Award aria-hidden="true" />{tr("Certificate of Completion", "Ավարտական վկայական")}</li>
                <li><RefreshCw aria-hidden="true" />{tr("Last updated: ", "Թարմացվել է ")}{formatDate(course.updatedAt)}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <div className="container cd-grid cd-body">
        <div className="stack" style={{ ['--gap' as string]: '48px', minWidth: 0 }}>
          <section>
            <h2 className="cd-h">{tr("About This Course", "Դասընթացի մասին")}</h2>
            <p className="cd-text">{course.description}</p>
          </section>

          <section>
            <h2 className="cd-h">{tr("What You Will Learn", "Ինչ կսովորեք")}</h2>
            <ul className="objectives">
              {course.objectives.map((o) => (
                <li key={o}>
                  <span className="tint-box t-mint"><Check /></span>
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="row row--between" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
              <div>
                <h2 className="cd-h" style={{ margin: 0 }}>{tr("Curriculum", "Դասընթացի ծրագիր")}</h2>
                <p className="small muted" style={{ marginTop: 4 }}>
                  {course.modules.length}{tr(" modules, ", " մոդուլ, ")}{lessonCount(course)}{tr(" lessons, ", " դաս, ընդհանուր ")}{course.durationHours}{tr(" hours in total ", " ժամ")}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setOpen(allOpen ? new Set() : new Set(course.modules.map((m) => m.id)))}>
                {allOpen ? tr("Collapse All", "Ծալել բոլորը") : tr("Expand All", "Բացել բոլորը")}
              </Button>
            </div>
            <div className="curriculum">
              {course.modules.map((m, mi) => {
                const isOpen = open.has(m.id);
                return (
                  <div key={m.id} className={cx('curriculum__module', isOpen && 'is-open')}>
                    <button type="button" className="curriculum__head" aria-expanded={isOpen} onClick={() => toggle(m.id)}>
                      <span className="curriculum__num">{mi + 1}</span>
                      <span className="grow">
                        <span className="strong" style={{ display: 'block' }}>{m.title}</span>
                        <span className="xs muted">{m.lessons.length}{tr(" lessons · ", " դաս · ")}{m.lessons.reduce((n, l) => n + l.durationMin, 0)}{tr(" min", " րոպե")}</span>
                      </span>
                      <ChevronDown className={cx('chev', isOpen && 'is-open')} aria-hidden="true" />
                    </button>
                    {isOpen && (
                      <div className="curriculum__lessons">
                        {m.lessons.map((l) => (
                          <LessonItem
                            key={l.id}
                            lesson={l}
                            locked={!l.preview && !enrolled}
                            showType
                            trailing={l.preview ? <Button variant="ghost" size="sm" icon={<PlayCircle />} onClick={() => setPreview(l)}>{tr("Preview", "Նախադիտում")}</Button> : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="cd-h">{tr("Assignments and Quizzes", "Առաջադրանքներ և թեստեր")}</h2>
            <p className="cd-text" style={{ marginBottom: 18 }}>{tr("Build your skills with practical assignments reviewed by your instructor and automatically graded quizzes.", "Գիտելիքներն ամրապնդվում են գործնական աշխատանքներով, որոնք գնահատում է դասավանդողը, և ավտոմատ ստուգվող թեստերով։")}</p>
            <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
              <div className="info-tile t-peach">
                <span className="tint-box"><ClipboardList /></span>
                <div>
                  <div className="strong">{courseAssignments.length}{tr(" practical assignments", " գործնական առաջադրանք")}</div>
                  <ul className="info-tile__list">
                    {courseAssignments.slice(0, 3).map((a) => (
                      <li key={a.id}>{a.title} <span className="muted">({a.maxScore}{tr(" points)", " միավոր)")}</span></li>
                    ))}
                    {courseAssignments.length === 0 && <li className="muted">{tr("Assignments will be added during the course", "Առաջադրանքները կավելացվեն դասընթացի ընթացքում")}</li>}
                  </ul>
                </div>
              </div>
              <div className="info-tile t-sun">
                <span className="tint-box"><FileQuestion /></span>
                <div>
                  <div className="strong">{courseQuizzes.length}{tr(" quizzes", " ստուգողական թեստ")}</div>
                  <ul className="info-tile__list">
                    {courseQuizzes.map((q) => (
                      <li key={q.id}>{q.title} <span className="muted">({q.questions.length}{tr(" questions)", " հարց)")}</span></li>
                    ))}
                    {courseQuizzes.length === 0 && <li className="muted">{tr("Self-check questions at the end of each module", "Ինքնաստուգման հարցեր յուրաքանչյուր մոդուլի վերջում")}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="cd-side">
          <div className={cx('teacher-card', CATEGORY_TINT[course.category])}>
            <div className="cd-byline" style={{ margin: 0 }}>
              <Avatar name={fullName(teacher)} size={60} />
              <div>
                <b>{fullName(teacher)}</b>
                <span>{teacher?.title}</span>
              </div>
            </div>
            {teacher?.bio && <p>{teacher.bio}</p>}
            <div className="cd-meta" style={{ margin: 0 }}>
              <span className="r"><Star aria-hidden="true" />{teacherRating.toFixed(1)}</span>
              <span><BookOpen aria-hidden="true" />{teacherCourses.length}{tr(" courses", " դասընթաց")}</span>
            </div>
          </div>
          <h3 className="cd-side__title">{tr("Related Courses", "Նմանատիպ դասընթացներ")}</h3>
          {related.map((r) => (
            <Link key={r.id} to={`/courses/${r.id}`} className="mini-course">
              <Thumb src={r.image} alt="" ratio="4 / 3" className="mini-course__img" />
              <div>
                <b>{r.title}</b>
                <span>★ {r.rating.toFixed(1)} · {r.durationHours}{tr(" hr", " ժամ")}</span>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      <Modal
        open={confirmEnroll}
        onClose={() => setConfirmEnroll(false)}
        title={tr("Enroll in Course", "Գրանցվել դասընթացին")}
        description={course.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnroll(false)}>{tr("Cancel", "Չեղարկել")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                setEnrolled(true);
                setConfirmEnroll(false);
                toast.success(tr("You are enrolled", "Դուք գրանցվեցիք դասընթացին"), tr("Demo: your enrollment is kept only on this page.", "Ցուցադրական ռեժիմ։ Գրանցումը պահվում է միայն այս էջում։"));
              }}
            >{tr("Confirm Enrollment", "Հաստատել գրանցումը")}</Button>
          </>
        }
      >
        <p className="small secondary">{tr("Enrollment unlocks all lessons, assignments, and quizzes in this course. In this demo, enrollment is not sent to a server and resets when you refresh the page.", "Գրանցվելուց հետո կբացվեն դասընթացի բոլոր դասերը, առաջադրանքները և թեստերը։ Այս ցուցադրական տարբերակում գրանցումը չի ուղարկվում սերվեր և կչեղարկվի էջը թարմացնելիս։")}</p>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title ?? ''} description={tr("Lesson Preview", "Դասի նախադիտում")} size="lg">
        <div className="video-placeholder" style={{ backgroundImage: `linear-gradient(rgba(15,30,61,.55), rgba(15,30,61,.55)), url(${course.image})` }}>
          <span className="video-placeholder__play"><PlayCircle size={34} aria-hidden="true" /></span>
          <span>{tr("Video preview (", "Տեսանյութի նախադիտում (")}{preview?.durationMin}{tr(" min)", " րոպե)")}</span>
          <span className="xs" style={{ opacity: 0.75 }}>{tr("Videos are not available in this demo", "Ցուցադրական տարբերակում տեսանյութերը հասանելի չեն")}</span>
        </div>
      </Modal>
    </>
  );
}

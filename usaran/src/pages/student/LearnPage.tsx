import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, FileArchive, FileText, Link2, Maximize2, PanelLeftClose, PanelLeftOpen, Play, Settings2, Volume2 } from 'lucide-react';
import { allLessons, getCourse } from '../../data/courses';
import { studentEnrollments } from '../../data/enrollments';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { getLessonContent } from '../../data/lessonContent';
import { fullName, getUser } from '../../data/users';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { LESSON_TYPE_LABEL, LessonItem } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, Notice, Tabs } from '../../components/ui/Misc';
import { ProgressBar } from '../../components/ui/Progress';
import { Textarea } from '../../components/ui/Field';
import { BrandMark } from '../../components/layout/Brand';
import { LangSwitch } from '../../components/layout/LangSwitch';
import { cx, percent } from '../../lib/format';
import { tr } from '../../i18n';

export function LearnPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const course = getCourse(id);
  const enrollment = studentEnrollments.find((e) => e.courseId === id);
  const session = useDemoSession();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<'content' | 'resources' | 'notes'>('content');
  const [notes, setNotes] = useState('');
  const [playing, setPlaying] = useState(false);

  const lessons = useMemo(() => (course ? allLessons(course) : []), [course]);
  const currentId = params.get('lesson') ?? enrollment?.lastLessonId ?? lessons[0]?.id;
  const index = Math.max(0, lessons.findIndex((l) => l.id === currentId));
  const current = lessons[index];
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set(current ? [current.moduleId] : []));

  useEffect(() => {
    if (current) setOpenModules((s) => new Set(s).add(current.moduleId));
    setPlaying(false);
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [current]);

  if (!course || !enrollment || !current) {
    return (
      <div className="container page-pad">
        <div className="card">
          <EmptyState
            title={tr("Course unavailable", "Դասընթացը հասանելի չէ")}
            text={tr("You are not enrolled in this course, or it does not exist.", "Դուք գրանցված չեք այս դասընթացին կամ այն գոյություն չունի։")}
            action={<ButtonLink to="/student/courses">{tr("Back to My Courses", "Վերադառնալ իմ դասընթացներին")}</ButtonLink>}
          />
        </div>
      </div>
    );
  }

  const isDone = (lid: string) => enrollment.completedLessonIds.includes(lid) || session.completedLessons.has(lid);
  const doneCount = lessons.filter((l) => isDone(l.id)).length;
  const progress = percent(doneCount, lessons.length);
  const module = course.modules.find((m) => m.id === current.moduleId)!;
  const content = getLessonContent(course, module, current);
  const go = (lid: string) => setParams({ lesson: lid });
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const relatedAssignment = current.type === 'assignment' ? assignments.find((a) => a.courseId === course.id && current.title.toLowerCase().includes(a.title.toLowerCase())) ?? assignments.find((a) => a.courseId === course.id) : undefined;
  const relatedQuiz = current.type === 'quiz' ? quizzes.find((q) => q.courseId === course.id && q.status === 'published') : undefined;

  const markComplete = () => {
    const done = isDone(current.id);
    if (enrollment.completedLessonIds.includes(current.id)) return;
    session.toggleLesson(current.id, !done);
    if (!done) {
      toast.success(tr("Lesson marked as complete", "Դասը նշվեց որպես ավարտված"), tr("Your progress has been updated only on this page.", "Առաջընթացը թարմացվել է միայն այս էջում։"));
      if (next) go(next.id);
    }
  };

  return (
    <div className={cx('learn', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open')}>
      <header className="learn__top">
        <Link to="/student/courses" className="icon-btn" aria-label={tr("Back to My Courses", "Վերադառնալ իմ դասընթացներին")}>
          <ArrowLeft />
        </Link>
        <BrandMark />
        <button
          type="button"
          className="icon-btn"
          onClick={() => (window.innerWidth <= 960 ? setMobileOpen((o) => !o) : setCollapsed((c) => !c))}
          aria-label={collapsed ? tr("Show course curriculum", "Ցույց տալ դասընթացի ծրագիրը") : tr("Hide course curriculum", "Թաքցնել դասընթացի ծրագիրը")}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
        <div className="learn__heading">
          <div className="xs muted">{fullName(getUser(course.teacherId))}</div>
          <div className="learn__title">{course.title}</div>
        </div>
        <div className="learn__progress">
          <span className="nowrap muted">{doneCount}/{lessons.length}{tr(" lessons", " դաս")}</span>
          <div className="grow"><ProgressBar value={progress} label={tr("Course Progress", "Դասընթացի առաջընթաց")} /></div>
        </div>
        <LangSwitch className="learn__lang" />
      </header>

      <div className="learn__body">
        <aside className="learn__sidebar" aria-label={tr("Course Curriculum", "Դասընթացի ծրագիր")}>
          <div className="learn__sidebar-head">
            <div className="strong small" style={{ color: 'var(--navy-900)' }}>{tr("Course Curriculum", "Դասընթացի ծրագիր")}</div>
            <div className="xs muted" style={{ margin: '2px 0 10px' }}>{course.modules.length}{tr(" modules, ", " մոդուլ, ")}{lessons.length}{tr(" lessons", " դաս")}</div>
            <ProgressBar value={progress} />
          </div>
          {course.modules.map((m, mi) => {
            const open = openModules.has(m.id);
            const mDone = m.lessons.filter((l) => isDone(l.id)).length;
            return (
              <div key={m.id} className="learn__module">
                <button
                  type="button"
                  className="curriculum__head"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenModules((s) => {
                      const n = new Set(s);
                      if (n.has(m.id)) n.delete(m.id);
                      else n.add(m.id);
                      return n;
                    })
                  }
                >
                  <span className="grow">
                    <span className="xs muted" style={{ display: 'block' }}>{tr("Module ", "Մոդուլ ")}{mi + 1}, {mDone}/{m.lessons.length}</span>
                    <span className="strong small">{m.title}</span>
                  </span>
                  {mDone === m.lessons.length ? <CheckCircle2 size={18} color="var(--success-600)" aria-label={tr("Module complete", "Մոդուլն ավարտված է")} /> : <ChevronDown className={cx('chev', open && 'is-open')} aria-hidden="true" />}
                </button>
                {open && (
                  <div className="curriculum__lessons">
                    {m.lessons.map((l) => (
                      <LessonItem key={l.id} lesson={l} done={isDone(l.id)} active={l.id === current.id} onClick={() => go(l.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>
        {mobileOpen && <div className="scrim" style={{ display: 'block', position: 'fixed', inset: '68px 0 0', background: 'rgba(15,30,61,.32)', zIndex: 45 }} onClick={() => setMobileOpen(false)} />}

        <main className="learn__main">
          <div className="row row--wrap xs muted" style={{ ['--gap' as string]: '8px', marginBottom: 8 }}>
            <span>{tr("Module ", "Մոդուլ ")}{course.modules.indexOf(module) + 1}. {module.title}</span>
            <Badge tone="accent">{LESSON_TYPE_LABEL[current.type]}</Badge>
            <span>{current.durationMin}{tr(" min", " րոպե")}</span>
          </div>
          <div className="row row--between row--top row--wrap" style={{ marginBottom: 20 }}>
            <h1 style={{ maxWidth: 680 }}>{current.title}</h1>
            <Button variant={isDone(current.id) ? 'secondary' : 'success'} icon={<CheckCircle2 />} onClick={markComplete} aria-pressed={isDone(current.id)}>
              {isDone(current.id) ? tr("Completed", "Ավարտված է") : tr("Mark as Complete", "Նշել որպես ավարտված")}
            </Button>
          </div>

          {current.type === 'video' && (
            <div className="video-placeholder" style={{ position: 'relative', marginBottom: 20, backgroundImage: `linear-gradient(rgba(15,30,61,.62), rgba(15,30,61,.62)), url(${course.image})` }}>
              <button type="button" onClick={() => setPlaying((p) => !p)} className="video-placeholder__play" aria-label={playing ? tr("Pause", "Դադար") : tr("Play video", "Միացնել տեսանյութը")}>
                <Play size={30} />
              </button>
              <span>{playing ? tr("Simulated video player; no actual video is available", "Տեսանյութի նմանակում․ իրական տեսանյութ հասանելի չէ") : tr(`Video lesson, ${current.durationMin} min`, `Տեսադաս, ${current.durationMin} րոպե`)}</span>
              <div className="row video-placeholder__bar" style={{ ['--gap' as string]: '12px' }} aria-hidden="true">
                <Play size={14} />
                <div className="progress__track grow" style={{ background: 'rgba(255,255,255,.25)', height: 6 }}>
                  <div className="progress__fill" style={{ width: playing ? '34%' : '0%', background: '#fff' }} />
                </div>
                <span className="xs">{playing ? '04:12' : '00:00'} / {current.durationMin}:00</span>
                <Volume2 size={14} />
                <Settings2 size={14} />
                <Maximize2 size={14} />
              </div>
            </div>
          )}

          {current.type === 'assignment' && relatedAssignment && (
            <Notice tone="info" className="mb-20">
              <strong>{relatedAssignment.title}</strong>{tr(". View the assignment page for the deadline, maximum score, and submission instructions.", "։ Վերջնաժամկետը, առավելագույն միավորը և հանձնման պահանջները տեսեք առաջադրանքի էջում։")}{' '}
              <Link to={`/student/assignments/${relatedAssignment.id}`}>{tr("Open Assignment", "Բացել առաջադրանքը")}</Link>
            </Notice>
          )}
          {current.type === 'quiz' && relatedQuiz && (
            <Notice tone="info" className="mb-20">{tr("This lesson is a quiz with ", "Այս դասը թեստ է՝ ")}{relatedQuiz.questions.length}{tr(" questions and a ", " հարցով և ")}{relatedQuiz.timeLimitMin}{tr("-minute time limit. ", " րոպե ժամանակով։ ")}<Link to={`/student/quizzes/${relatedQuiz.id}`}>{tr("Take Quiz", "Անցնել թեստը")}</Link>
            </Notice>
          )}

          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'content', label: tr("Lesson Content", "Դասի նյութը") },
              { key: 'resources', label: tr("Resources", "Ֆայլեր և հղումներ"), count: content.resources.length },
              { key: 'notes', label: tr("My Notes", "Իմ նշումները") },
            ]}
          />

          <div style={{ paddingTop: 22 }}>
            {tab === 'content' && (
              <article className="lesson-article">
                <p>{content.intro}</p>
                {content.sections.map((s) => (
                  <section key={s.heading}>
                    <h2>{s.heading}</h2>
                    {s.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {s.code && (
                      <pre className="code-block">
                        <code style={{ background: 'none', border: 0, padding: 0, color: 'inherit' }}>{s.code}</code>
                      </pre>
                    )}
                  </section>
                ))}
                <div className="key-points">
                  <h3>{tr("Key Takeaways", "Հիմնական մտքեր")}</h3>
                  <ul>
                    {content.keyPoints.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )}
            {tab === 'resources' && (
              <div className="stack" style={{ ['--gap' as string]: '10px', maxWidth: 640 }}>
                {content.resources.map((r) => {
                  const Icon = r.kind === 'zip' ? FileArchive : r.kind === 'link' ? Link2 : FileText;
                  return (
                    <div key={r.name} className="file-row">
                      <span className="file-row__icon"><Icon /></span>
                      <div className="grow">
                        <div className="strong">{r.name}</div>
                        <div className="xs muted">{r.kind === 'link' ? tr("External Link", "Արտաքին հղում") : r.size}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={r.kind === 'link' ? <ExternalLink /> : <Download />}
                        onClick={() => toast.info(r.kind === 'link' ? tr("External Link", "Արտաքին հղում") : tr("File Download", "Ֆայլի ներբեռնում"), tr("Files and external links are not available in this demo.", "Ցուցադրական տարբերակում ֆայլերն ու արտաքին հղումները հասանելի չեն։"))}
                      >
                        {r.kind === 'link' ? tr("Open", "Բացել") : tr("Download", "Ներբեռնել")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === 'notes' && (
              <div className="stack" style={{ ['--gap' as string]: '10px', maxWidth: 640 }}>
                <Textarea label={tr("Notes for This Lesson", "Նշումներ այս դասի համար")} placeholder={tr("Write down key ideas or questions for your instructor…", "Գրեք կարևոր մտքեր կամ հարցեր դասավանդողի համար…")} value={notes} onChange={(e) => setNotes(e.target.value)} hint={tr("Notes are kept only on this page and will be lost when you refresh.", "Նշումները պահվում են միայն այս էջում և կկորչեն թարմացնելիս։")} />
                <div>
                  <Button variant="secondary" disabled={!notes.trim()} onClick={() => toast.success(tr("Note saved", "Նշումը պահվեց"), tr("Demo: your note has not been sent to a server.", "Ցուցադրական ռեժիմ։ Նշումը չի ուղարկվել սերվեր։"))}>{tr("Save Note", "Պահել նշումը")}</Button>
                </div>
              </div>
            )}
          </div>

          <nav className="lesson-nav" aria-label={tr("Lesson navigation", "Դասերի միջև նավարկում")}>
            {prev ? (
              <Button variant="secondary" icon={<ChevronLeft />} onClick={() => go(prev.id)}>{tr("Previous Lesson", "Նախորդ դաս")}</Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button variant="primary" iconRight={<ChevronRight />} onClick={() => go(next.id)}>{tr("Next Lesson: ", "Հաջորդ դաս՝ ")}{next.title.length > 32 ? next.title.slice(0, 32) + '…' : next.title}</Button>
            ) : (
              <ButtonLink to="/student/progress" variant="primary">{tr("View Progress", "Դիտել առաջընթացը")}</ButtonLink>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}

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
import { cx, percent } from '../../lib/format';

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
            title="Դասընթացը հասանելի չէ"
            text="Դուք գրանցված չեք այս դասընթացին կամ այն գոյություն չունի։"
            action={<ButtonLink to="/student/courses">Վերադառնալ իմ դասընթացներին</ButtonLink>}
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
      toast.success('Դասը նշվեց որպես ավարտված', 'Առաջընթացը թարմացվել է միայն այս էջում։');
      if (next) go(next.id);
    }
  };

  return (
    <div className={cx('learn', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open')}>
      <header className="learn__top">
        <Link to="/student/courses" className="icon-btn" aria-label="Վերադառնալ իմ դասընթացներին">
          <ArrowLeft />
        </Link>
        <BrandMark light />
        <button
          type="button"
          className="icon-btn"
          onClick={() => (window.innerWidth <= 960 ? setMobileOpen((o) => !o) : setCollapsed((c) => !c))}
          aria-label={collapsed ? 'Ցույց տալ դասընթացի ծրագիրը' : 'Թաքցնել դասընթացի ծրագիրը'}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
        <div className="learn__heading">
          <div className="xs" style={{ color: 'rgba(255,255,255,.6)' }}>{fullName(getUser(course.teacherId))}</div>
          <div className="learn__title">{course.title}</div>
        </div>
        <div className="learn__progress">
          <span style={{ color: 'rgba(255,255,255,.7)' }} className="nowrap">{doneCount}/{lessons.length} դաս</span>
          <div className="grow"><ProgressBar value={progress} label="Դասընթացի առաջընթաց" /></div>
        </div>
      </header>

      <div className="learn__body">
        <aside className="learn__sidebar" aria-label="Դասընթացի ծրագիր">
          <div className="learn__sidebar-head">
            <div className="strong small" style={{ color: 'var(--navy-900)' }}>Դասընթացի ծրագիր</div>
            <div className="xs muted" style={{ margin: '2px 0 10px' }}>{course.modules.length} մոդուլ, {lessons.length} դաս</div>
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
                    <span className="xs muted" style={{ display: 'block' }}>Մոդուլ {mi + 1}, {mDone}/{m.lessons.length}</span>
                    <span className="strong small">{m.title}</span>
                  </span>
                  {mDone === m.lessons.length ? <CheckCircle2 size={18} color="var(--success-600)" aria-label="Մոդուլն ավարտված է" /> : <ChevronDown className={cx('chev', open && 'is-open')} aria-hidden="true" />}
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
        {mobileOpen && <div className="scrim" style={{ display: 'block', position: 'fixed', inset: '60px 0 0', background: 'rgba(11,22,48,.4)', zIndex: 45 }} onClick={() => setMobileOpen(false)} />}

        <main className="learn__main">
          <div className="row row--wrap xs muted" style={{ ['--gap' as string]: '8px', marginBottom: 8 }}>
            <span>Մոդուլ {course.modules.indexOf(module) + 1}. {module.title}</span>
            <Badge tone="accent">{LESSON_TYPE_LABEL[current.type]}</Badge>
            <span>{current.durationMin} րոպե</span>
          </div>
          <div className="row row--between row--top row--wrap" style={{ marginBottom: 20 }}>
            <h1 style={{ maxWidth: 680 }}>{current.title}</h1>
            <Button variant={isDone(current.id) ? 'secondary' : 'success'} icon={<CheckCircle2 />} onClick={markComplete} aria-pressed={isDone(current.id)}>
              {isDone(current.id) ? 'Ավարտված է' : 'Նշել որպես ավարտված'}
            </Button>
          </div>

          {current.type === 'video' && (
            <div className="video-placeholder" style={{ position: 'relative', marginBottom: 20 }}>
              <button type="button" onClick={() => setPlaying((p) => !p)} className="icon-btn" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.14)', color: '#fff' }} aria-label={playing ? 'Դադար' : 'Միացնել տեսանյութը'}>
                <Play size={30} />
              </button>
              <span>{playing ? 'Տեսանյութի նմանակում. իրական տեսանյութ չի հոսթավորվում' : `Տեսադաս, ${current.durationMin} րոպե`}</span>
              <div className="row" style={{ position: 'absolute', left: 16, right: 16, bottom: 12, ['--gap' as string]: '12px' }} aria-hidden="true">
                <Play size={14} />
                <div className="progress__track grow" style={{ background: 'rgba(255,255,255,.2)', height: 4 }}>
                  <div className="progress__fill" style={{ width: playing ? '34%' : '0%', background: '#8c99ec' }} />
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
              <strong>{relatedAssignment.title}</strong>՝ վերջնաժամկետ, առավելագույն միավոր և հանձնման ձևը տես առաջադրանքի էջում։{' '}
              <Link to={`/student/assignments/${relatedAssignment.id}`}>Բացել առաջադրանքը</Link>
            </Notice>
          )}
          {current.type === 'quiz' && relatedQuiz && (
            <Notice tone="info" className="mb-20">
              Այս դասը թեստ է՝ {relatedQuiz.questions.length} հարցով և {relatedQuiz.timeLimitMin} րոպե ժամանակով։ <Link to={`/student/quizzes/${relatedQuiz.id}`}>Անցնել թեստը</Link>
            </Notice>
          )}

          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'content', label: 'Նյութ' },
              { key: 'resources', label: 'Ռեսուրսներ', count: content.resources.length },
              { key: 'notes', label: 'Իմ նշումները' },
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
                  <h3>Հիմնական մտքեր</h3>
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
                        <div className="xs muted">{r.kind === 'link' ? 'Արտաքին հղում' : r.size}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={r.kind === 'link' ? <ExternalLink /> : <Download />}
                        onClick={() => toast.info(r.kind === 'link' ? 'Արտաքին հղում' : 'Ֆայլի ներբեռնում', 'Ցուցադրական տարբերակում ֆայլեր և հղումներ չեն պահվում։')}
                      >
                        {r.kind === 'link' ? 'Բացել' : 'Ներբեռնել'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === 'notes' && (
              <div className="stack" style={{ ['--gap' as string]: '10px', maxWidth: 640 }}>
                <Textarea label="Նշումներ այս դասի համար" placeholder="Գրեք կարևոր մտքեր, հարցեր դասավանդողին…" value={notes} onChange={(e) => setNotes(e.target.value)} hint="Նշումները պահվում են միայն այս էջում և կկորչեն թարմացնելիս։" />
                <div>
                  <Button variant="secondary" disabled={!notes.trim()} onClick={() => toast.success('Նշումը պահվեց', 'Դեմո ռեժիմ. նշումը չի ուղարկվել սերվեր։')}>Պահել նշումը</Button>
                </div>
              </div>
            )}
          </div>

          <nav className="lesson-nav" aria-label="Դասերի միջև նավարկում">
            {prev ? (
              <Button variant="secondary" icon={<ChevronLeft />} onClick={() => go(prev.id)}>
                Նախորդ դաս
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button variant="primary" iconRight={<ChevronRight />} onClick={() => go(next.id)}>Հաջորդ դաս՝ {next.title.length > 32 ? next.title.slice(0, 32) + '…' : next.title}</Button>
            ) : (
              <ButtonLink to="/student/progress" variant="primary">Դիտել առաջընթացը</ButtonLink>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}

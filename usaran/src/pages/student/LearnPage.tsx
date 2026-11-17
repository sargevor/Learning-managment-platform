import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Clock, Download, FileArchive, FileQuestion, FileText, Languages, Layers,
  Link2, Paperclip, Pause, Pencil, Play, Save, Settings, TrendingUp, Video,
} from 'lucide-react';
import type { LessonType } from '../../types';
import { allLessons, categoryName, getCourse } from '../../data/courses';
import { studentEnrollments } from '../../data/enrollments';
import { assignments } from '../../data/assignments';
import { quizzes } from '../../data/quizzes';
import { getLessonContent } from '../../data/lessonContent';
import { fullName, getUser } from '../../data/users';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Chip, Meter, Ring } from '../../components/ui/Visual';
import { cx, percent } from '../../lib/format';
import { CATEGORY_ICONS, SCENES } from '../../lib/visual';

const TYPE_ICON: Record<LessonType, typeof Video> = {
  video: Video,
  text: FileText,
  resource: Paperclip,
  assignment: ClipboardList,
  quiz: FileQuestion,
};
const TYPE_LABEL: Record<LessonType, string> = {
  video: 'Video',
  text: 'Reading',
  resource: 'Resource',
  assignment: 'Task',
  quiz: 'Quiz',
};

type TabKey = 'overview' | 'resources' | 'notes';

export function LearnPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const course = getCourse(id);
  const enrollment = studentEnrollments.find((e) => e.courseId === id);
  const session = useDemoSession();
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>('overview');
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
    window.scrollTo(0, 0);
  }, [current]);

  if (!course || !enrollment || !current) {
    return (
      <>
        <ShellTitle title="Course" />
        <div className="sl-card">
          <EmptyState title="Course unavailable" action={<ButtonLink to="/student/courses" icon={<ChevronLeft />}>My courses</ButtonLink>} />
        </div>
      </>
    );
  }

  const isDone = (lid: string) => enrollment.completedLessonIds.includes(lid) || session.completedLessons.has(lid);
  const doneCount = lessons.filter((l) => isDone(l.id)).length;
  const progress = percent(doneCount, lessons.length);
  const moduleIndex = course.modules.findIndex((m) => m.id === current.moduleId);
  const module = course.modules[moduleIndex];
  const content = getLessonContent(course, module, current);
  const go = (lid: string) => setParams({ lesson: lid });
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const currentDone = isDone(current.id);
  const relatedAssignment = current.type === 'assignment' ? assignments.find((a) => a.courseId === course.id && current.title.toLowerCase().includes(a.title.toLowerCase())) ?? assignments.find((a) => a.courseId === course.id) : undefined;
  const relatedQuiz = current.type === 'quiz' ? quizzes.find((q) => q.courseId === course.id && q.status === 'published') : undefined;
  const teacher = fullName(getUser(course.teacherId));
  const CatIcon = CATEGORY_ICONS[course.category];
  const TypeIcon = TYPE_ICON[current.type];

  const markComplete = () => {
    if (enrollment.completedLessonIds.includes(current.id)) return;
    session.toggleLesson(current.id, !currentDone);
    if (!currentDone) {
      toast.success('Lesson done', 'Progress updated on this page only.');
      if (next) go(next.id);
    }
  };

  const toggleModule = (mid: string) =>
    setOpenModules((s) => {
      const n = new Set(s);
      if (n.has(mid)) n.delete(mid);
      else n.add(mid);
      return n;
    });

  const tabs: { key: TabKey; label: string; icon: typeof Video; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'resources', label: 'Resources', icon: Paperclip, count: content.resources.length },
    { key: 'notes', label: 'Notes', icon: Pencil },
  ];

  return (
    <>
      <ShellTitle
        title={course.title}
        meta={
          <>
            <CatIcon aria-hidden="true" />
            <b>{categoryName(course.category)}</b>
            <span className="sl-dot" aria-hidden="true" />
            <Avatar name={teacher} size={20} />
            {teacher}
          </>
        }
      />

      <section className="sl-learn">
        {/* Player column */}
        <div className="sl-learn__main">
          <div className={cx('sl-player', current.type !== 'video' && 'sl-player--short')}>
            <img src={current.type === 'video' ? SCENES.video : course.image} alt="" />
            <span className="sl-player__scrim" aria-hidden="true" />
            <Chip tone="glass" className="sl-player__module" icon={<Layers />}>
              Module {moduleIndex + 1} · {module.title}
            </Chip>

            {current.type === 'video' && (
              <>
                <button type="button" className="sl-player__big" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause video' : 'Play video'}>
                  {playing ? <Pause /> : <Play className="sl-player__play-icon" />}
                </button>
                <div className="sl-player__bar">
                  <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? <Pause /> : <Play />}
                  </button>
                  {/* Simulated player: no real video in the demo. */}
                  <span className="sl-player__time">{playing ? '04:12' : '00:00'}</span>
                  <span className="sl-player__track" aria-hidden="true">
                    <span style={{ width: playing ? '34%' : '0%' }} />
                    <i style={{ left: playing ? '34%' : '0%' }} />
                  </span>
                  <span className="sl-player__time sl-player__time--muted">{current.durationMin}:00</span>
                  <button type="button" className="sl-player__extra" aria-label="Captions" onClick={() => toast.info('Captions', 'Not available in the demo.')}><Languages /></button>
                  <button type="button" className="sl-player__extra" aria-label="Player settings" onClick={() => toast.info('Player settings', 'Not available in the demo.')}><Settings /></button>
                </div>
              </>
            )}

            {current.type !== 'video' && (
              <span className="sl-player__center">
                <span className="sl-player__type" aria-hidden="true"><TypeIcon /></span>
                {relatedAssignment && (
                  <ButtonLink to={`/student/assignments/${relatedAssignment.id}`} variant="secondary" icon={<ClipboardList />}>Open task</ButtonLink>
                )}
                {relatedQuiz && (
                  <ButtonLink to={`/student/quizzes/${relatedQuiz.id}`} variant="secondary" icon={<Play />}>Start quiz</ButtonLink>
                )}
              </span>
            )}
          </div>

          {/* Lesson head */}
          <div className="sl-card sl-lesson-head">
            <div className="sl-lesson-head__text">
              <span className="sl-lesson-head__chips">
                <Chip tone="blue" icon={<TypeIcon />}>{TYPE_LABEL[current.type]}</Chip>
                <Chip icon={<Clock />}>{current.durationMin} min</Chip>
              </span>
              <h2>{current.title}</h2>
            </div>
            <nav aria-label="Lesson navigation" className="sl-lesson-head__nav">
              <Button variant="secondary" icon={<ChevronLeft />} onClick={() => prev && go(prev.id)} disabled={!prev}>Previous</Button>
              <Button variant={currentDone ? 'secondary' : 'primary'} icon={<Check />} onClick={markComplete} aria-pressed={currentDone}>
                {currentDone ? 'Done' : 'Mark complete'}
              </Button>
              {next ? (
                <Button variant="secondary" iconRight={<ChevronRight />} onClick={() => go(next.id)}>Next</Button>
              ) : (
                <ButtonLink to="/student/progress" variant="secondary" icon={<TrendingUp />}>Progress</ButtonLink>
              )}
            </nav>
          </div>

          {/* Tabs */}
          <div className="sl-card sl-ltabs">
            <div role="tablist" aria-label="Lesson" className="sl-ltabs__list">
              {tabs.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="sl-ltabs__tab" onClick={() => setTab(t.key)}>
                  <t.icon aria-hidden="true" />
                  {t.label}
                  {t.count !== undefined && <span className="sl-ltabs__count">{t.count}</span>}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="sl-ltabs__panel">
              {tab === 'overview' && (
                <article className="sl-article">
                  <p>{content.intro}</p>
                  {content.sections.map((s) => (
                    <section key={s.heading}>
                      <h3>{s.heading}</h3>
                      {s.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {s.code && (
                        <pre className="sl-code">
                          <code>{s.code}</code>
                        </pre>
                      )}
                    </section>
                  ))}
                  <ul className="sl-keypoints" aria-label="Key points">
                    {content.keyPoints.map((k) => (
                      <li key={k}>
                        <span className="sl-keypoints__check" aria-hidden="true"><Check /></span>
                        {k}
                      </li>
                    ))}
                  </ul>
                </article>
              )}

              {tab === 'resources' && (
                <div className="sl-files">
                  {content.resources.map((r) => {
                    const Icon = r.kind === 'zip' ? FileArchive : r.kind === 'link' ? Link2 : FileText;
                    const isLink = r.kind === 'link';
                    return (
                      <div key={r.name} className="sl-file">
                        <span className="sl-file__icon" aria-hidden="true"><Icon /></span>
                        <span className="sl-file__name">{r.name}</span>
                        <Chip>{isLink ? 'Link' : r.size}</Chip>
                        <button
                          type="button"
                          className="sl-icon-btn"
                          aria-label={isLink ? `Open ${r.name}` : `Download ${r.name}`}
                          onClick={() => toast.info(isLink ? 'External link' : 'Download', 'Not available in the demo.')}
                        >
                          {isLink ? <ArrowRight /> : <Download />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === 'notes' && (
                <div className="sl-notes">
                  <label htmlFor="lesson-notes" className="sr-only">Notes</label>
                  <textarea id="lesson-notes" className="textarea" rows={6} placeholder="Key ideas, questions…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <div>
                    <Button variant="secondary" icon={<Save />} disabled={!notes.trim()} onClick={() => toast.success('Note saved', 'Kept on this page only.')}>Save</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum column */}
        <aside aria-label="Course curriculum" className="sl-learn__side">
          <div className="sl-card sl-learn-progress">
            <Ring value={progress} size={92} thickness={11} label="Course progress" />
            <div>
              <div className="sl-learn-progress__value">
                {doneCount}
                <small> of {lessons.length}</small>
              </div>
              <div className="sl-learn-progress__label">lessons done</div>
            </div>
          </div>

          <div className="sl-card sl-modules">
            <h2>Modules</h2>
            <div className="sl-modules__list">
              {course.modules.map((m, mi) => {
                const open = openModules.has(m.id);
                const mDone = m.lessons.filter((l) => isDone(l.id)).length;
                const allDone = mDone === m.lessons.length;
                return (
                  <div key={m.id} className={cx('sl-module', open && 'is-open')}>
                    <button type="button" className="sl-module__head" aria-expanded={open} onClick={() => toggleModule(m.id)}>
                      <span className={cx('sl-module__num', allDone && 'is-done')}>{allDone ? <Check aria-label="Module done" /> : mi + 1}</span>
                      <span className="sl-module__text">
                        <span className="sl-module__title">{m.title}</span>
                        <span className="sl-module__meter">
                          <Meter value={percent(mDone, m.lessons.length)} height={6} label={`${m.title} progress`} />
                          <span>{mDone}/{m.lessons.length}</span>
                        </span>
                      </span>
                      {open ? <ChevronDown aria-hidden="true" className="sl-module__chev" /> : <ChevronRight aria-hidden="true" className="sl-module__chev" />}
                    </button>
                    {open && (
                      <div className="sl-module__lessons">
                        {m.lessons.map((l) => {
                          const LIcon = TYPE_ICON[l.type];
                          const isCurrent = l.id === current.id;
                          const done = isDone(l.id);
                          return (
                            <Link
                              key={l.id}
                              to={`?lesson=${l.id}`}
                              className={cx('sl-lesson', isCurrent && 'is-current')}
                              aria-current={isCurrent ? 'step' : undefined}
                            >
                              <span className="sl-lesson__type" aria-hidden="true"><LIcon /></span>
                              <span className="sl-lesson__title">{l.title}</span>
                              <span className="sl-lesson__dur">{l.durationMin} min</span>
                              {isCurrent ? (
                                <span className="sl-lesson__state sl-lesson__state--play" role="img" aria-label="Playing"><Play /></span>
                              ) : done ? (
                                <span className="sl-lesson__state sl-lesson__state--done" role="img" aria-label="Done"><Check /></span>
                              ) : (
                                <span className="sl-lesson__state sl-lesson__state--todo" aria-hidden="true" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Calendar, Check, ChevronLeft, ChevronRight, CircleCheck, Clock, Eye, ListChecks, Play, RotateCcw, Send, Star, Target, Timer, TriangleAlert } from 'lucide-react';
import { getQuiz, quizMaxScore, scoreAnswers, attemptsFor } from '../../data/quizzes';
import { getCourse } from '../../data/courses';
import { isEnrolled } from '../../data/enrollments';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { CATEGORY_ICONS } from '../../lib/visual';
import { cx, formatShortDate, TODAY } from '../../lib/format';

type Phase = 'intro' | 'taking' | 'review';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuizPage() {
  const { id } = useParams();
  const quiz = getQuiz(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { setLastAttempt } = useDemoSession();
  const [phase, setPhase] = useState<Phase>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState((quiz?.timeLimitMin ?? 0) * 60);
  const [confirm, setConfirm] = useState(false);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    if (phase === 'intro' || !quiz) return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase, quiz]);

  useEffect(() => {
    if (phase !== 'intro' && secondsLeft === 0 && quiz) {
      toast.warning('Time is up', 'Your quiz was submitted automatically.');
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (!quiz || quiz.status !== 'published' || !isEnrolled(quiz.courseId)) {
    return (
      <>
        <ShellTitle title="Quiz" />
        <div className="card">
          <EmptyState title="Quiz unavailable" action={<ButtonLink to="/student/quizzes" icon={<ArrowLeft />}>Quizzes</ButtonLink>} />
        </div>
      </>
    );
  }

  const course = getCourse(quiz.courseId)!;
  const CatIcon = CATEGORY_ICONS[course.category];
  const prev = attemptsFor(quiz.id);
  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const isAnswered = (qid: string) => (answers[qid] ?? []).length > 0;
  const answeredCount = quiz.questions.filter((x) => isAnswered(x.id)).length;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const attemptsLeft = quiz.attemptsAllowed - prev.length;
  const attemptNo = Math.min(prev.length + 1, quiz.attemptsAllowed);

  function finish() {
    if (!quiz) return;
    const score = scoreAnswers(quiz, answers);
    setLastAttempt({
      id: `local-${Date.now()}`,
      quizId: quiz.id,
      studentId: 's1',
      answers,
      score,
      maxScore: quizMaxScore(quiz),
      completedAt: TODAY.toISOString().slice(0, 16),
      durationMin: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    });
    navigate(`/student/quizzes/${quiz.id}/results`);
  }

  const select = (optionId: string) => {
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      const next = q.kind === 'single' ? [optionId] : cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId];
      return { ...a, [q.id]: next };
    });
  };

  const toggleFlag = () =>
    setFlagged((s) => {
      const n = new Set(s);
      if (n.has(q.id)) n.delete(q.id);
      else n.add(q.id);
      return n;
    });

  const title = (
    <ShellTitle
      title={quiz.title}
      meta={
        <>
          <CatIcon aria-hidden="true" />
          <b>{course.title}</b>
          <span className="sr-dot" aria-hidden="true" />
          Attempt {attemptNo} of {quiz.attemptsAllowed}
        </>
      }
    />
  );

  const back = (
    <Link to="/student/quizzes" className="sr-back">
      <ArrowLeft aria-hidden="true" />
      Quizzes
    </Link>
  );

  /* ---------- Intro ---------- */
  if (phase === 'intro') {
    const facts = [
      { icon: <Timer />, label: `${quiz.timeLimitMin} min` },
      { icon: <Star />, label: `${quizMaxScore(quiz)} points` },
      { icon: <Target />, label: `Pass ${quiz.passPercent}%` },
      { icon: <RotateCcw />, label: `${prev.length}/${quiz.attemptsAllowed} attempts` },
      { icon: <Calendar />, label: `Due ${formatShortDate(quiz.dueDate)}` },
    ];
    return (
      <>
        {title}
        <div className="sr-narrow">
          {back}
          <section className="sr-hero" aria-label="Quiz">
            <img src={course.image} alt="" className="sr-hero__img" />
            <div className="sr-hero__scrim" aria-hidden="true" />
            <div className="sr-hero__inner">
              <span className="sr-hero__badge" aria-hidden="true"><Play /></span>
              <div className="sr-hero__text">
                <h2 className="sr-hero__title">{total} questions</h2>
                <div className="sr-hero__facts">
                  {facts.map((f) => (
                    <span key={f.label} className="sr-glass-chip">{f.icon}{f.label}</span>
                  ))}
                </div>
                <div className="sr-hero__actions">
                  <button
                    type="button"
                    className="sr-btn-white"
                    disabled={attemptsLeft <= 0}
                    onClick={() => {
                      setPhase('taking');
                      setStartedAt(Date.now());
                    }}
                  >
                    {prev.length ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
                    {prev.length ? 'Retake' : 'Start'}
                  </button>
                  {prev.length > 0 && (
                    <Link to={`/student/quizzes/${quiz.id}/results`} className="sr-btn-ghost">
                      <Eye aria-hidden="true" />
                      Last result
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="sr-card" aria-labelledby="rules-title">
            <h2 id="rules-title" className="sr-h2">Rules</h2>
            <ul className="sr-rules">
              {quiz.instructions.map((i, n) => (
                <li key={i}>
                  <span className="sr-rules__n" aria-hidden="true">{n + 1}</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </>
    );
  }

  /* ---------- Navigator (taking + review) ---------- */
  const navigator = (
    <div className="sr-navbar">
      <nav aria-label="Questions" className="sr-dots">
        {quiz.questions.map((x, i) => {
          const answered = isAnswered(x.id);
          const isCurrent = phase === 'taking' && i === current;
          return (
            <button
              key={x.id}
              type="button"
              className={cx('sr-qdot', answered && 'is-answered', isCurrent && 'is-current')}
              onClick={() => {
                setPhase('taking');
                setCurrent(i);
              }}
              aria-label={`Question ${i + 1}${answered ? ', answered' : ''}${flagged.has(x.id) ? ', flagged' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {i + 1}
              {flagged.has(x.id) && <span className="sr-qdot__flag" aria-hidden="true"><Bookmark /></span>}
            </button>
          );
        })}
        <span className="sr-dots__count">{answeredCount}/{total}</span>
      </nav>
      <span className={cx('sr-timer', secondsLeft < 60 && 'is-low')} role="timer" aria-live="off" aria-label={`Time left ${mm}:${ss}`}>
        <Clock aria-hidden="true" />
        {mm}:{ss}
      </span>
    </div>
  );

  return (
    <>
      {title}
      <div className="sr-narrow">
        {back}
        {navigator}

        {phase === 'taking' ? (
          <section className="sr-qcard-big" aria-labelledby="q-title">
            <div className="sr-qhead">
              <span className="sr-qnum">{current + 1}</span>
              <span className="sr-qof">of {total}</span>
              <span className="sr-chip sr-chip--lg">
                {q.kind === 'single' ? <CircleCheck aria-hidden="true" /> : <ListChecks aria-hidden="true" />}
                {q.kind === 'single' ? 'One answer' : 'Several answers'}
              </span>
              <span className="sr-chip sr-chip--lg"><Star aria-hidden="true" />{q.points} {q.points === 1 ? 'point' : 'points'}</span>
              <span className="sr-grow" />
              <Button variant={flagged.has(q.id) ? 'primary' : 'secondary'} icon={<Bookmark />} aria-pressed={flagged.has(q.id)} onClick={toggleFlag}>
                {flagged.has(q.id) ? 'Flagged' : 'Flag'}
              </Button>
            </div>

            <h2 id="q-title" className="sr-qtext">{q.text}</h2>

            <div className="sr-options" role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-labelledby="q-title">
              {q.options.map((o, i) => {
                const selected = (answers[q.id] ?? []).includes(o.id);
                return (
                  <label key={o.id} className={cx('sr-option', selected && 'is-selected')}>
                    <input type={q.kind === 'single' ? 'radio' : 'checkbox'} name={q.id} checked={selected} onChange={() => select(o.id)} />
                    <span className="sr-option__key">{LETTERS[i]}</span>
                    <span className="sr-option__text">{o.text}</span>
                    {selected && <span className="sr-option__check" aria-hidden="true"><Check /></span>}
                  </label>
                );
              })}
            </div>

            <div className="sr-qfoot">
              <Button variant="secondary" icon={<ChevronLeft />} disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
              <div className="sr-qfoot__right">
                {current < total - 1 ? (
                  <>
                    <Button variant="secondary" icon={<Send />} onClick={() => setPhase('review')}>Finish</Button>
                    <Button variant="primary" iconRight={<ChevronRight />} onClick={() => setCurrent((c) => c + 1)}>Next</Button>
                  </>
                ) : (
                  <Button variant="primary" icon={<Send />} onClick={() => setPhase('review')}>Finish</Button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="sr-qcard-big" aria-labelledby="review-title">
            <div className="sr-qhead">
              <h2 id="review-title" className="sr-h2">Review</h2>
              <span className="sr-grow" />
              {answeredCount < total ? (
                <span className="sr-chip sr-chip--lg sr-chip--red"><TriangleAlert aria-hidden="true" />{total - answeredCount} unanswered</span>
              ) : (
                <span className="sr-chip sr-chip--lg sr-chip--blue"><CircleCheck aria-hidden="true" />All answered</span>
              )}
            </div>
            <div className="sr-review">
              {quiz.questions.map((x, i) => {
                const given = answers[x.id] ?? [];
                return (
                  <button
                    key={x.id}
                    type="button"
                    className="sr-review__row"
                    onClick={() => {
                      setCurrent(i);
                      setPhase('taking');
                    }}
                  >
                    <span className={cx('sr-num', given.length ? 'sr-num--navy' : 'sr-num--red')}>{i + 1}</span>
                    <span className="sr-review__q">{x.text}</span>
                    {flagged.has(x.id) && <Bookmark className="sr-review__flag" aria-label="Flagged" />}
                    {given.length ? (
                      <span className="sr-letters">
                        {given.map((g) => (
                          <span key={g} className="sr-letter">{LETTERS[x.options.findIndex((o) => o.id === g)]}</span>
                        ))}
                      </span>
                    ) : (
                      <span className="sr-chip sr-chip--red">Empty</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="sr-qfoot">
              <Button variant="secondary" icon={<ChevronLeft />} onClick={() => setPhase('taking')}>Questions</Button>
              <Button variant="primary" icon={<Send />} onClick={() => setConfirm(true)}>Submit</Button>
            </div>
          </section>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={finish}
        tone="warning"
        title="Submit quiz?"
        text={`${answeredCount} of ${total} answered. Answers can't be changed after submitting.`}
        confirmLabel="Submit"
      />
    </>
  );
}

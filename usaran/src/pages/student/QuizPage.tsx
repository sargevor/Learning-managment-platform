import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flag, HelpCircle, ListChecks, Repeat, Timer } from 'lucide-react';
import { getQuiz, quizMaxScore, scoreAnswers, attemptsFor } from '../../data/quizzes';
import { getCourse } from '../../data/courses';
import { isEnrolled } from '../../data/enrollments';
import { useDemoSession } from '../../context/DemoSession';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, EmptyState, Notice, PageHeader } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { ProgressBar } from '../../components/ui/Progress';
import { cx, formatDateTime, percent, TODAY } from '../../lib/format';

type Phase = 'intro' | 'taking' | 'review';
const LETTERS = ["A", "B", "C", "D", "E", "F"];

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
      toast.warning("Time is up", "Your quiz was submitted automatically.");
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (!quiz || quiz.status !== 'published' || !isEnrolled(quiz.courseId)) {
    return (
      <div className="card">
        <EmptyState title="Quiz unavailable" text="This quiz does not exist or is not published yet." action={<ButtonLink to="/student/quizzes">All Quizzes</ButtonLink>} />
      </div>
    );
  }

  const course = getCourse(quiz.courseId)!;
  const prev = attemptsFor(quiz.id);
  const q = quiz.questions[current];
  const answeredCount = quiz.questions.filter((x) => (answers[x.id] ?? []).length > 0).length;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const attemptsLeft = quiz.attemptsAllowed - prev.length;

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

  if (phase === 'intro') {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: "Quizzes", to: '/student/quizzes' }, { label: quiz.title }]} title={quiz.title} description={`${course.title}. ${quiz.description}`} />
        <div className="grid grid-main-aside">
          <Card title="Instructions">
            <ul className="check-list">
              {quiz.instructions.map((i) => (
                <li key={i}><ListChecks aria-hidden="true" />{i}</li>
              ))}
            </ul>
            <Notice tone="neutral" className="mt-20">This quiz is graded entirely in your browser. Answers are not sent to a server and will be lost when you refresh the page.</Notice>
            <div className="row row--wrap" style={{ marginTop: 22, ['--gap' as string]: '10px' }}>
              <Button
                variant="primary"
                size="lg"
                disabled={attemptsLeft <= 0}
                onClick={() => {
                  setPhase('taking');
                  setStartedAt(Date.now());
                }}
              >
                {prev.length ? "Start a New Attempt" : "Start Quiz"}
              </Button>
              {prev.length > 0 && <ButtonLink to={`/student/quizzes/${quiz.id}/results`} variant="secondary" size="lg">Previous Result</ButtonLink>}
            </div>
          </Card>
          <Card title="About This Quiz">
            <dl className="kv">
              <dt><span className="row" style={{ ['--gap' as string]: '6px' }}><HelpCircle size={14} />Questions</span></dt>
              <dd>{quiz.questions.length}</dd>
              <dt><span className="row" style={{ ['--gap' as string]: '6px' }}><Timer size={14} />Time</span></dt>
              <dd>{quiz.timeLimitMin} min</dd>
              <dt>Maximum Score</dt>
              <dd>{quizMaxScore(quiz)}</dd>
              <dt>Passing Score</dt>
              <dd>{quiz.passPercent}%</dd>
              <dt><span className="row" style={{ ['--gap' as string]: '6px' }}><Repeat size={14} />Attempts</span></dt>
              <dd>{prev.length} / {quiz.attemptsAllowed}</dd>
              <dt><span className="row" style={{ ['--gap' as string]: '6px' }}><Clock size={14} />Available Until</span></dt>
              <dd>{formatDateTime(quiz.dueDate)}</dd>
            </dl>
          </Card>
        </div>
      </>
    );
  }

  const nav = (
    <aside className="card card--pad stack" style={{ ['--gap' as string]: '16px', position: 'sticky', top: 88 }}>
      <div className="row row--between">
        <span className="small strong">Time Remaining</span>
        <span className={cx('timer', secondsLeft < 60 && 'timer--low')} role="timer" aria-live="off">
          <Timer size={16} aria-hidden="true" />
          {mm}:{ss}
        </span>
      </div>
      <div>
        <div className="row row--between xs muted" style={{ marginBottom: 6 }}>
          <span>Answered</span>
          <span>{answeredCount} / {quiz.questions.length}</span>
        </div>
        <ProgressBar value={percent(answeredCount, quiz.questions.length)} showValue={false} label="Answered Questions" />
      </div>
      <div className="quiz-nav" role="navigation" aria-label="Question navigation">
        {quiz.questions.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className={cx((answers[x.id] ?? []).length > 0 && 'is-answered', phase === 'taking' && i === current && 'is-current', flagged.has(x.id) && 'is-flagged')}
            onClick={() => {
              setPhase('taking');
              setCurrent(i);
            }}
            aria-label={`Question ${i + 1}${(answers[x.id] ?? []).length ? ", answered" : ''}${flagged.has(x.id) ? ", flagged" : ''}`}
            aria-current={i === current ? 'step' : undefined}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="xs muted row row--wrap" style={{ ['--gap' as string]: '6px 14px' }}>
        <span className="row" style={{ ['--gap' as string]: '6px' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent-100)' }} />Answered</span>
        <span className="row" style={{ ['--gap' as string]: '6px' }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning-600)' }} />Flagged</span>
      </div>
      {phase === 'taking' && <Button variant="secondary" block onClick={() => setPhase('review')}>Review and Submit</Button>}
    </aside>
  );

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Quizzes", to: '/student/quizzes' }, { label: quiz.title }]} title={quiz.title} />
      <div className="quiz-layout">
        {phase === 'taking' ? (
          <section className="card" aria-labelledby="q-title">
            <div className="card__header">
              <div className="row" style={{ ['--gap' as string]: '10px' }}>
                <strong className="small">Question {current + 1} / {quiz.questions.length}</strong>
                <Badge tone={q.kind === 'single' ? 'info' : 'accent'}>{q.kind === 'single' ? "Single Answer" : "Multiple Answers"}</Badge>
                <span className="xs muted">{q.points} points</span>
              </div>
              <Button
                variant={flagged.has(q.id) ? 'secondary' : 'ghost'}
                size="sm"
                icon={<Flag />}
                aria-pressed={flagged.has(q.id)}
                onClick={() =>
                  setFlagged((s) => {
                    const n = new Set(s);
                    if (n.has(q.id)) n.delete(q.id);
                    else n.add(q.id);
                    return n;
                  })
                }
              >
                {flagged.has(q.id) ? "Flagged" : "Flag for Review"}
              </Button>
            </div>
            <div className="card__body stack" style={{ ['--gap' as string]: '18px' }}>
              <h2 id="q-title" style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.45 }}>{q.text}</h2>
              {q.kind === 'multiple' && <p className="small muted" style={{ marginTop: -8 }}>Select all correct answers.</p>}
              <div className="stack" style={{ ['--gap' as string]: '10px' }} role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-labelledby="q-title">
                {q.options.map((o, i) => {
                  const selected = (answers[q.id] ?? []).includes(o.id);
                  return (
                    <label key={o.id} className={cx('option', selected && 'is-selected')}>
                      <input type={q.kind === 'single' ? 'radio' : 'checkbox'} name={q.id} checked={selected} onChange={() => select(o.id)} />
                      <span className="option__key">{LETTERS[i]}</span>
                      <span>{o.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="card__footer" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ChevronLeft />} disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
              {current < quiz.questions.length - 1 ? (
                <Button variant="primary" iconRight={<ChevronRight />} onClick={() => setCurrent((c) => c + 1)}>Next</Button>
              ) : (
                <Button variant="primary" onClick={() => setPhase('review')}>Review Answers</Button>
              )}
            </div>
          </section>
        ) : (
          <section className="card">
            <div className="card__header">
              <div>
                <h2>Review Before Submitting</h2>
                <div className="sub">Check your answers. Select a question to return to it and change your response.</div>
              </div>
            </div>
            <div className="card__body stack" style={{ ['--gap' as string]: '14px' }}>
              {answeredCount < quiz.questions.length && (
                <Notice tone="warning">
                  {quiz.questions.length - answeredCount} questions remain unanswered. Unanswered questions receive 0 points. </Notice>
              )}
              <div className="list card" style={{ borderRadius: 'var(--r-md)' }}>
                {quiz.questions.map((x, i) => {
                  const given = answers[x.id] ?? [];
                  return (
                    <button
                      key={x.id}
                      type="button"
                      className="list-row"
                      style={{ border: 0, borderBottom: '1px solid var(--border)', background: 'transparent', textAlign: 'left', width: '100%' }}
                      onClick={() => {
                        setCurrent(i);
                        setPhase('taking');
                      }}
                    >
                      <span className="strong small" style={{ width: 24 }}>{i + 1}.</span>
                      <span className="grow small" style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', color: 'var(--navy-900)' }}>{x.text}</span>
                        <span className="xs muted">
                          {given.length ? `Selected: ${given.map((g) => LETTERS[x.options.findIndex((o) => o.id === g)]).join(', ')}` : "No answer"}
                        </span>
                      </span>
                      {flagged.has(x.id) && <Flag size={14} color="var(--warning-600)" aria-label="Flagged" />}
                      {given.length ? <Badge tone="success">Answered</Badge> : <Badge tone="danger">Unanswered</Badge>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="card__footer" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" icon={<ChevronLeft />} onClick={() => setPhase('taking')}>Back to Questions</Button>
              <Button variant="primary" onClick={() => setConfirm(true)}>Submit Quiz</Button>
            </div>
          </section>
        )}
        {nav}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={finish}
        tone="warning"
        title="Submit your quiz?"
        text={
          <span className="row row--top" style={{ ['--gap' as string]: '8px' }}>
            <AlertTriangle size={16} style={{ flex: 'none', marginTop: 2 }} />You have answered {answeredCount} out of {quiz.questions.length} questions. You will not be able to change your answers after submitting.</span>
        }
        confirmLabel="Submit"
      />
    </>
  );
}

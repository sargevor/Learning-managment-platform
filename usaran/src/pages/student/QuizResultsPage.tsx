import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX, Lightbulb, List, Play, RotateCcw, Star, Target, Timer, X } from 'lucide-react';
import { attemptsFor, getQuiz } from '../../data/quizzes';
import { getCourse } from '../../data/courses';
import { useDemoSession } from '../../context/DemoSession';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { CATEGORY_ICONS } from '../../lib/visual';
import { cx, formatDate, percent } from '../../lib/format';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

type ChipKind = 'ok' | 'bad' | 'fix';

function AnswerChip({ k, text, kind }: { k: string; text: string; kind: ChipKind }) {
  return (
    <span className={cx('sr-ans', `sr-ans--${kind}`)}>
      <span className="sr-ans__key">{k}</span>
      <span className="sr-ans__text">{text}</span>
      <span className="sr-ans__mark" aria-label={kind === 'bad' ? 'Wrong' : kind === 'fix' ? 'Correct answer' : 'Correct'}>
        {kind === 'bad' ? <X /> : <Check />}
      </span>
    </span>
  );
}

export function QuizResultsPage() {
  const { id } = useParams();
  const quiz = getQuiz(id);
  const { lastAttempt } = useDemoSession();
  const [show, setShow] = useState<'all' | 'wrong'>('all');

  const stored = quiz ? attemptsFor(quiz.id) : [];
  const attempt = lastAttempt?.quizId === quiz?.id ? lastAttempt : stored[stored.length - 1];

  if (!quiz || !attempt) {
    return (
      <>
        <ShellTitle title="Quiz results" />
        <div className="card">
          <EmptyState
            icon={<Target size={24} />}
            title="No result yet"
            action={quiz ? <ButtonLink to={`/student/quizzes/${quiz.id}`} icon={<Play />}>Start</ButtonLink> : <ButtonLink to="/student/quizzes" icon={<ArrowLeft />}>Quizzes</ButtonLink>}
          />
        </div>
      </>
    );
  }

  const course = getCourse(quiz.courseId)!;
  const CatIcon = CATEGORY_ICONS[course.category];
  const p = percent(attempt.score, attempt.maxScore);
  const passed = p >= quiz.passPercent;
  const isCorrect = (qid: string, correct: string[]) => [...(attempt.answers[qid] ?? [])].sort().join() === [...correct].sort().join();
  const correctCount = quiz.questions.filter((q) => isCorrect(q.id, q.correct)).length;
  const wrongCount = quiz.questions.length - correctCount;
  const visible = quiz.questions.filter((q) => show === 'all' || !isCorrect(q.id, q.correct));
  const isLocal = attempt === lastAttempt;
  const attemptsUsed = stored.length + (isLocal ? 1 : 0);
  const attemptNo = isLocal ? attemptsUsed : stored.indexOf(attempt) + 1;

  const facts = [
    { icon: <Timer />, label: `${attempt.durationMin} of ${quiz.timeLimitMin} min` },
    { icon: <RotateCcw />, label: `Attempt ${attemptNo} of ${quiz.attemptsAllowed}` },
    { icon: <Star />, label: `${attempt.score}/${attempt.maxScore} points` },
  ];

  return (
    <>
      <ShellTitle
        title="Quiz results"
        meta={
          <>
            <CatIcon aria-hidden="true" />
            <b>{course.title}</b>
            <span className="sr-dot" aria-hidden="true" />
            {formatDate(attempt.completedAt)}
          </>
        }
      />

      <Link to="/student/quizzes" className="sr-back sr-back--tight">
        <ArrowLeft aria-hidden="true" />
        Quizzes
      </Link>

      <section className="sr-hero sr-hero--result" aria-label="Result">
        <img src={course.image} alt="" className="sr-hero__img" />
        <div className="sr-hero__scrim" aria-hidden="true" />
        <div className="sr-hero__inner">
          <div className="sr-bigring" role="img" aria-label={`Score ${p}%`} style={{ background: `conic-gradient(var(--surface) 0 ${p}%, rgba(255,255,255,.16) 0)` }}>
            <div className="sr-bigring__inner">
              <b>{p}<span>%</span></b>
              <span>Pass {quiz.passPercent}%</span>
            </div>
          </div>
          <div className="sr-hero__text">
            <div className="sr-hero__status">
              {passed ? (
                <span className="sr-status sr-status--pass"><CircleCheck aria-hidden="true" />Passed</span>
              ) : (
                <span className="sr-status sr-status--fail"><CircleX aria-hidden="true" />Not passed</span>
              )}
              <span className="sr-hero__quiz">{quiz.title}</span>
            </div>
            <div className="sr-hero__big">{correctCount} of {quiz.questions.length} correct</div>
            <div className="sr-hero__facts">
              {facts.map((f) => (
                <span key={f.label} className="sr-glass-chip">{f.icon}{f.label}</span>
              ))}
            </div>
            <div className="sr-hero__actions">
              {attemptsUsed < quiz.attemptsAllowed && (
                <Link to={`/student/quizzes/${quiz.id}`} className="sr-btn-white"><RotateCcw aria-hidden="true" />Retake</Link>
              )}
              <Link to="/student/quizzes" className="sr-btn-ghost"><ArrowLeft aria-hidden="true" />Back</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sr-card" aria-labelledby="review-title">
        <div className="sr-card__head">
          <h2 id="review-title" className="sr-h2">Answer review</h2>
          <div className="sr-seg" role="group" aria-label="Show">
            <button type="button" aria-pressed={show === 'all'} onClick={() => setShow('all')}>
              <List aria-hidden="true" />All <span className="sr-seg__n">{quiz.questions.length}</span>
            </button>
            <button type="button" aria-pressed={show === 'wrong'} onClick={() => setShow('wrong')}>
              <CircleX aria-hidden="true" />Wrong <span className="sr-seg__n">{wrongCount}</span>
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState compact icon={<CircleCheck size={22} />} title="All correct" />
        ) : (
          <div className="sr-arows">
            {visible.map((q) => {
              const i = quiz.questions.indexOf(q);
              const ok = isCorrect(q.id, q.correct);
              const given = attempt.answers[q.id] ?? [];
              const chosen = q.options.map((o, oi) => ({ o, k: LETTERS[oi] })).filter((x) => given.includes(x.o.id));
              const missed = q.options.map((o, oi) => ({ o, k: LETTERS[oi] })).filter((x) => q.correct.includes(x.o.id) && !given.includes(x.o.id));
              return (
                <article key={q.id} className="sr-arow">
                  <span className={cx('sr-num', ok ? 'sr-num--blue' : 'sr-num--red')}>{i + 1}</span>
                  <div className="sr-arow__main">
                    <h3>{q.text}</h3>
                    <div className="sr-arow__answers">
                      {chosen.length === 0 && <span className="sr-chip sr-chip--lg sr-chip--red">No answer</span>}
                      {chosen.map(({ o, k }) => (
                        <AnswerChip key={o.id} k={k} text={o.text} kind={q.correct.includes(o.id) ? 'ok' : 'bad'} />
                      ))}
                      {!ok && missed.length > 0 && (
                        <>
                          <ArrowRight className="sr-arow__arrow" aria-hidden="true" />
                          {missed.map(({ o, k }) => (
                            <AnswerChip key={o.id} k={k} text={o.text} kind="fix" />
                          ))}
                        </>
                      )}
                    </div>
                    {!ok && q.explanation && (
                      <p className="sr-arow__tip"><Lightbulb aria-hidden="true" />{q.explanation}</p>
                    )}
                  </div>
                  <span className={cx('sr-pts', !ok && 'sr-pts--red')}>{ok ? `+${q.points} pt` : `0/${q.points} pt`}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

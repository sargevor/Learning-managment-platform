import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Lightbulb, RotateCcw, Target, XCircle } from 'lucide-react';
import { attemptsFor, getQuiz } from '../../data/quizzes';
import { getCourse } from '../../data/courses';
import { useDemoSession } from '../../context/DemoSession';
import { ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, EmptyState, Notice, PageHeader, Segmented } from '../../components/ui/Misc';
import { ProgressRing } from '../../components/ui/Progress';
import { StatCard } from '../../components/ui/StatCard';
import { cx, formatDateTime, percent } from '../../lib/format';

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizResultsPage() {
  const { id } = useParams();
  const quiz = getQuiz(id);
  const { lastAttempt } = useDemoSession();
  const [show, setShow] = useState<'all' | 'wrong'>('all');

  const stored = quiz ? attemptsFor(quiz.id) : [];
  const attempt = lastAttempt?.quizId === quiz?.id ? lastAttempt : stored[stored.length - 1];

  if (!quiz || !attempt) {
    return (
      <div className="card">
        <EmptyState
          icon={<Target size={24} />}
          title="No result yet"
          text="You have not taken this quiz yet."
          action={quiz ? <ButtonLink to={`/student/quizzes/${quiz.id}`}>Take Quiz</ButtonLink> : <ButtonLink to="/student/quizzes">All Quizzes</ButtonLink>}
        />
      </div>
    );
  }

  const course = getCourse(quiz.courseId)!;
  const p = percent(attempt.score, attempt.maxScore);
  const passed = p >= quiz.passPercent;
  const isCorrect = (qid: string, correct: string[]) => [...(attempt.answers[qid] ?? [])].sort().join() === [...correct].sort().join();
  const correctCount = quiz.questions.filter((q) => isCorrect(q.id, q.correct)).length;
  const visible = quiz.questions.filter((q) => show === 'all' || !isCorrect(q.id, q.correct));
  const isLocal = attempt === lastAttempt;
  const attemptsUsed = stored.length + (isLocal ? 1 : 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Quizzes", to: '/student/quizzes' }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: "Results" }]}
        title="Quiz Results"
        description={`${quiz.title}, ${course.title}`}
        actions={
          <>
            <ButtonLink to="/student/quizzes" variant="secondary">All Quizzes</ButtonLink>
            {attemptsUsed < quiz.attemptsAllowed && <ButtonLink to={`/student/quizzes/${quiz.id}`} variant="primary" icon={<RotateCcw />}>Try Again</ButtonLink>}
          </>
        }
      />

      {isLocal && <Notice tone="neutral" className="mb-20">Your result was calculated in your browser and has not been saved. It will be lost when you refresh the page.</Notice>}

      <Card className="mb-20">
        <div className="result-hero">
          <ProgressRing value={p} size={132} stroke={11} color={passed ? 'var(--success-600)' : 'var(--danger-600)'} label="result" />
          <div className="stack grow" style={{ ['--gap' as string]: '8px', minWidth: 240 }}>
            <div>{passed ? <Badge tone="success" dot>Quiz Passed</Badge> : <Badge tone="danger" dot>Passing score not reached</Badge>}</div>
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>
              {attempt.score} / {attempt.maxScore} points</h2>
            <p className="secondary small">
              {passed ? `Well done! You reached the passing score of ${quiz.passPercent}%.` : `The passing score is ${quiz.passPercent}%. Review your incorrect answers and try again.`}
            </p>
            <span className="xs muted">Completed on {formatDateTime(attempt.completedAt)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Correct Answers" value={correctCount} unit={`/${quiz.questions.length}`} icon={<CheckCircle2 />} tone="success" />
        <StatCard label="Incorrect or Unanswered" value={quiz.questions.length - correctCount} icon={<XCircle />} tone="danger" />
        <StatCard label="Percentage" value={p} unit="%" icon={<Target />} />
        <StatCard label="Duration" value={attempt.durationMin} unit=" min" icon={<Clock />} tone="navy" meta={`time limit: ${quiz.timeLimitMin} min`} />
      </div>

      <Card
        title="Answer Review"
        actions={<Segmented label="Show" value={show} onChange={setShow} items={[{ key: 'all', label: "All" }, { key: 'wrong', label: "Incorrect Answers Only" }]} />}
      >
        {visible.length === 0 ? (
          <EmptyState compact icon={<CheckCircle2 size={22} />} title="No incorrect answers" text="You answered every question correctly." />
        ) : (
          <div className="stack" style={{ ['--gap' as string]: '22px' }}>
            {visible.map((q) => {
              const i = quiz.questions.indexOf(q);
              const ok = isCorrect(q.id, q.correct);
              const given = attempt.answers[q.id] ?? [];
              return (
                <article key={q.id} className="stack" style={{ ['--gap' as string]: '10px', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <div className="row row--between row--top">
                    <h3 style={{ fontSize: 'var(--fs-base)' }}>
                      {i + 1}. {q.text}
                    </h3>
                    {ok ? <Badge tone="success">+{q.points} points</Badge> : <Badge tone="danger">0 / {q.points}</Badge>}
                  </div>
                  {q.options.map((o, oi) => {
                    const chosen = given.includes(o.id);
                    const correct = q.correct.includes(o.id);
                    return (
                      <div key={o.id} className={cx('option', correct && 'is-correct', chosen && !correct && 'is-wrong')} style={{ cursor: 'default' }}>
                        <span className="option__key">{LETTERS[oi]}</span>
                        <span className="grow">{o.text}</span>
                        {chosen && <span className="xs strong">Your Selection</span>}
                        {correct ? <CheckCircle2 size={18} color="var(--success-600)" aria-label="Correct Answer" /> : chosen ? <XCircle size={18} color="var(--danger-600)" aria-label="Incorrect Selection" /> : null}
                      </div>
                    );
                  })}
                  {given.length === 0 && <span className="small" style={{ color: 'var(--danger-700)' }}>This question was not answered</span>}
                  {q.explanation && (
                    <div className="notice notice--neutral">
                      <Lightbulb aria-hidden="true" />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

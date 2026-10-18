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

const LETTERS = ['Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ'];

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
          title="Արդյունք դեռ չկա"
          text="Դուք դեռ չեք անցել այս թեստը։"
          action={quiz ? <ButtonLink to={`/student/quizzes/${quiz.id}`}>Անցնել թեստը</ButtonLink> : <ButtonLink to="/student/quizzes">Բոլոր թեստերը</ButtonLink>}
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
        breadcrumbs={[{ label: 'Թեստեր', to: '/student/quizzes' }, { label: quiz.title, to: `/student/quizzes/${quiz.id}` }, { label: 'Արդյունքներ' }]}
        title="Թեստի արդյունքներ"
        description={`${quiz.title}, ${course.title}`}
        actions={
          <>
            <ButtonLink to="/student/quizzes" variant="secondary">Բոլոր թեստերը</ButtonLink>
            {attemptsUsed < quiz.attemptsAllowed && <ButtonLink to={`/student/quizzes/${quiz.id}`} variant="primary" icon={<RotateCcw />}>Կրկին փորձել</ButtonLink>}
          </>
        }
      />

      {isLocal && <Notice tone="neutral" className="mb-20">Արդյունքը հաշվարկվել է բրաուզերում և պահպանված չէ։ Էջը թարմացնելիս այն կվերանա։</Notice>}

      <Card className="mb-20">
        <div className="result-hero">
          <ProgressRing value={p} size={132} stroke={11} color={passed ? 'var(--success-600)' : 'var(--danger-600)'} label="արդյունք" />
          <div className="stack grow" style={{ ['--gap' as string]: '8px', minWidth: 240 }}>
            <div>{passed ? <Badge tone="success" dot>Թեստը հանձնված է</Badge> : <Badge tone="danger" dot>Անցողիկ շեմը չի հաղթահարվել</Badge>}</div>
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>
              {attempt.score} / {attempt.maxScore} միավոր
            </h2>
            <p className="secondary small">
              {passed ? `Գերազանց է։ Դուք հաղթահարեցիք ${quiz.passPercent}% շեմը։` : `Անցողիկ շեմը ${quiz.passPercent}% է։ Վերանայեք սխալ պատասխանները և փորձեք կրկին։`}
            </p>
            <span className="xs muted">Ավարտված է {formatDateTime(attempt.completedAt)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Ճիշտ պատասխաններ" value={correctCount} unit={`/${quiz.questions.length}`} icon={<CheckCircle2 />} tone="success" />
        <StatCard label="Սխալ կամ բաց" value={quiz.questions.length - correctCount} icon={<XCircle />} tone="danger" />
        <StatCard label="Տոկոս" value={p} unit="%" icon={<Target />} />
        <StatCard label="Տևողություն" value={attempt.durationMin} unit=" ր" icon={<Clock />} tone="navy" meta={`սահմանաչափը՝ ${quiz.timeLimitMin} ր`} />
      </div>

      <Card
        title="Պատասխանների վերանայում"
        actions={<Segmented label="Ցուցադրել" value={show} onChange={setShow} items={[{ key: 'all', label: 'Բոլորը' }, { key: 'wrong', label: 'Միայն սխալները' }]} />}
      >
        {visible.length === 0 ? (
          <EmptyState compact icon={<CheckCircle2 size={22} />} title="Սխալ պատասխաններ չկան" text="Բոլոր հարցերին ճիշտ եք պատասխանել։" />
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
                    {ok ? <Badge tone="success">+{q.points} միավոր</Badge> : <Badge tone="danger">0 / {q.points}</Badge>}
                  </div>
                  {q.options.map((o, oi) => {
                    const chosen = given.includes(o.id);
                    const correct = q.correct.includes(o.id);
                    return (
                      <div key={o.id} className={cx('option', correct && 'is-correct', chosen && !correct && 'is-wrong')} style={{ cursor: 'default' }}>
                        <span className="option__key">{LETTERS[oi]}</span>
                        <span className="grow">{o.text}</span>
                        {chosen && <span className="xs strong">Ձեր ընտրությունը</span>}
                        {correct ? <CheckCircle2 size={18} color="var(--success-600)" aria-label="Ճիշտ տարբերակ" /> : chosen ? <XCircle size={18} color="var(--danger-600)" aria-label="Սխալ ընտրություն" /> : null}
                      </div>
                    );
                  })}
                  {given.length === 0 && <span className="small" style={{ color: 'var(--danger-700)' }}>Հարցին պատասխան չի տրվել</span>}
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

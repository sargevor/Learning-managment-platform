import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CircleCheck, CircleX, Clock, Eye, FileCheck, FileQuestionMark, Layers, ListChecks, Lock, Play, RotateCcw, Timer, Trophy } from 'lucide-react';
import type { QuizState } from '../../types';
import { getStudentQuizzes, type StudentQuiz } from '../../data/studentView';
import { categoryName } from '../../data/courses';
import { ShellTitle } from '../../components/layout/AppShell';
import { EmptyState, Tabs } from '../../components/ui/Misc';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Ring } from '../../components/ui/Visual';
import { CATEGORY_ICONS } from '../../lib/visual';
import { average, cx, daysUntil, formatShortDate } from '../../lib/format';

type Filter = 'all' | QuizState;

/** Short category labels for the photo chip. */
const SHORT_CAT: Partial<Record<string, string>> = {
  ai: 'AI',
  data: 'Data',
  science: 'Science',
  business: 'Business',
};

export function StudentQuizzesPage() {
  const all = getStudentQuizzes();
  const [filter, setFilter] = useState<Filter>('all');
  const list = all.filter((q) => filter === 'all' || q.state === filter);
  const taken = all.filter((q) => q.bestPercent !== undefined);
  const count = (s: QuizState) => all.filter((q) => q.state === s).length;

  return (
    <>
      <ShellTitle
        title="Quizzes"
        meta={
          <>
            <Trophy aria-hidden="true" />
            <b>{average(taken.map((q) => q.bestPercent!))}% average</b>
            <span className="sr-dot" aria-hidden="true" />
            {taken.length}/{all.length} done
          </>
        }
      />

      <div className="sr-tabs-row">
        <Tabs
          label="Quiz status"
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all', label: 'All', count: all.length, icon: <Layers /> },
            {
              key: 'available',
              label: 'Available',
              count: count('available'),
              icon: <Play />,
            },
            {
              key: 'passed',
              label: 'Passed',
              count: count('passed'),
              icon: <CircleCheck />,
            },
            {
              key: 'failed',
              label: 'Not passed',
              count: count('failed'),
              icon: <CircleX />,
            },
            {
              key: 'locked',
              label: 'Locked',
              count: count('locked'),
              icon: <Lock />,
            },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon={<FileQuestionMark size={24} />} title="No quizzes here" />
        </div>
      ) : (
        <section aria-label="Quizzes" className="sr-quiz-grid">
          {list.map((q) => (
            <QuizTile key={q.quiz.id} q={q} />
          ))}
        </section>
      )}
    </>
  );
}

function QuizTile({ q }: { q: StudentQuiz }) {
  const { quiz, course, attempts, bestPercent, state } = q;
  const done = bestPercent !== undefined;
  const locked = state === 'locked';
  const canRetake = done && attempts.length < quiz.attemptsAllowed;
  const days = daysUntil(quiz.dueDate);
  const urgent = !done && !locked && days <= 2;
  const CatIcon = CATEGORY_ICONS[course.category];
  const quizUrl = `/student/quizzes/${quiz.id}`;
  const resultsUrl = `${quizUrl}/results`;
  const lastDate = done ? [...attempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0].completedAt : quiz.dueDate;

  return (
    <article className="sr-qcard v-lift">
      <div className="sr-qcard__media">
        <img src={course.image} alt="" className={cx(locked && 'is-locked')} />
        <span className="sr-qcard__cat">
          <CatIcon aria-hidden="true" />
          {SHORT_CAT[course.category] ?? categoryName(course.category)}
        </span>
        <span className={cx('sr-qcard__icon', locked ? 'is-locked' : done ? 'is-done' : 'is-open')} aria-hidden="true">
          {locked ? <Lock /> : done ? <FileCheck /> : <FileQuestionMark />}
        </span>
        {done && (
          <Link to={resultsUrl} className="sr-qcard__ring" aria-label={`Best score ${bestPercent}%, see results`}>
            <Ring value={bestPercent!} size={54} thickness={6} label="Best score" />
          </Link>
        )}
      </div>
      <div className="sr-qcard__body">
        <div className="sr-qcard__title">
          <h2>{quiz.title}</h2>
          <div className="sr-ellipsis sr-muted">{course.title}</div>
        </div>
        <div className="sr-chips">
          <span className="sr-chip">
            <ListChecks aria-hidden="true" />
            {quiz.questions.length} questions
          </span>
          <span className="sr-chip">
            <Timer aria-hidden="true" />
            {quiz.timeLimitMin} min
          </span>
          <span className="sr-chip" title="Attempts used">
            <RotateCcw aria-hidden="true" />
            {attempts.length}/{quiz.attemptsAllowed}
          </span>
        </div>
        <div className="sr-qcard__foot">
          <span className={cx('sr-chip', 'sr-chip--lg', done ? 'sr-chip--blue' : urgent ? 'sr-chip--red' : '')}>
            {done ? <CircleCheck aria-hidden="true" /> : urgent ? <Clock aria-hidden="true" /> : <Calendar aria-hidden="true" />}
            {done ? formatShortDate(lastDate) : `Due ${formatShortDate(quiz.dueDate)}`}
            {!done && <span className="sr-chip__sub">· {days < 0 ? 'late' : `${days} d`}</span>}
          </span>
          {locked ? (
            <Button variant="secondary" disabled icon={<Lock />}>
              Locked
            </Button>
          ) : !done ? (
            <ButtonLink to={quizUrl} variant="primary" icon={<Play />}>
              Start
            </ButtonLink>
          ) : canRetake ? (
            <ButtonLink to={quizUrl} variant="secondary" icon={<RotateCcw />}>
              Retake
            </ButtonLink>
          ) : (
            <ButtonLink to={resultsUrl} variant="secondary" icon={<Eye />}>
              Review
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}

import { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import type { QuizState } from '../../types';
import { getStudentQuizzes } from '../../data/studentView';
import { QuizCard } from '../../components/course/CourseBits';
import { EmptyState, PageHeader, Tabs } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { average } from '../../lib/format';

type Filter = 'all' | QuizState;

export function StudentQuizzesPage() {
  const all = getStudentQuizzes();
  const [filter, setFilter] = useState<Filter>('all');
  const list = all.filter((q) => filter === 'all' || q.state === filter);
  const taken = all.filter((q) => q.bestPercent !== undefined);
  const count = (s: QuizState) => all.filter((q) => q.state === s).length;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: '/student/dashboard' }, { label: "Quizzes" }]}
        title="Quizzes"
        description="Test your understanding with quizzes. See your result and answer explanations as soon as you finish."
      />
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Available Quizzes" value={count('available')} icon={<FileQuestion />} />
        <StatCard label="Passed" value={count('passed')} unit={`/${taken.length}`} tone="success" icon={<FileQuestion />} />
        <StatCard label="Average Result" value={average(taken.map((q) => q.bestPercent!))} unit="%" tone="navy" icon={<FileQuestion />} />
      </div>
      <div className="stack" style={{ ['--gap' as string]: '18px' }}>
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all', label: "All", count: all.length },
            { key: 'available', label: "Available", count: count('available') },
            { key: 'passed', label: "Passed", count: count('passed') },
            { key: 'failed', label: "Not passed", count: count('failed') },
            { key: 'locked', label: "Locked", count: count('locked') },
          ]}
        />
        {list.length === 0 ? (
          <div className="card">
            <EmptyState icon={<FileQuestion size={24} />} title="No quizzes in this section" text="New quizzes will appear when you reach the relevant course module." />
          </div>
        ) : (
          <div className="grid grid-2">
            {list.map((q) => (
              <QuizCard key={q.quiz.id} quiz={q.quiz} state={q.state} courseTitle={q.course.title} bestPercent={q.bestPercent} to={q.attempts.length ? `/student/quizzes/${q.quiz.id}/results` : `/student/quizzes/${q.quiz.id}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

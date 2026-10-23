import { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import type { QuizState } from '../../types';
import { getStudentQuizzes } from '../../data/studentView';
import { QuizCard } from '../../components/course/CourseBits';
import { EmptyState, PageHeader, Tabs } from '../../components/ui/Misc';
import { StatCard } from '../../components/ui/StatCard';
import { average } from '../../lib/format';
import { tr } from '../../i18n';

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
        breadcrumbs={[{ label: tr("Dashboard", "Վահանակ"), to: '/student/dashboard' }, { label: tr("Quizzes", "Թեստեր") }]}
        title={tr("Quizzes", "Թեստեր")}
        description={tr("Test your understanding with quizzes. See your result and answer explanations as soon as you finish.", "Ստուգեք ձեր գիտելիքները թեստերով։ Ավարտելուն պես կտեսնեք արդյունքը և պատասխանների բացատրությունները։")}
      />
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label={tr("Available Quizzes", "Հասանելի թեստեր")} value={count('available')} icon={<FileQuestion />} />
        <StatCard label={tr("Passed", "Հանձնված")} value={count('passed')} unit={`/${taken.length}`} tone="success" icon={<FileQuestion />} />
        <StatCard label={tr("Average Result", "Միջին արդյունք")} value={average(taken.map((q) => q.bestPercent!))} unit="%" tone="navy" icon={<FileQuestion />} />
      </div>
      <div className="stack" style={{ ['--gap' as string]: '18px' }}>
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all', label: tr("All", "Բոլորը"), count: all.length },
            { key: 'available', label: tr("Available", "Հասանելի"), count: count('available') },
            { key: 'passed', label: tr("Passed", "Հանձնված"), count: count('passed') },
            { key: 'failed', label: tr("Not passed", "Չհանձնված"), count: count('failed') },
            { key: 'locked', label: tr("Locked", "Փակ"), count: count('locked') },
          ]}
        />
        {list.length === 0 ? (
          <div className="card">
            <EmptyState icon={<FileQuestion size={24} />} title={tr("No quizzes in this section", "Այս բաժնում թեստեր չկան")} text={tr("New quizzes will appear when you reach the relevant course module.", "Նոր թեստերը կհայտնվեն դասընթացի համապատասխան մոդուլը սկսելիս։")} />
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

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { QuizAttempt, User } from '../types';
import { students, teachers, DEMO_STUDENT_ID, DEMO_TEACHER_ID } from '../data/users';

/**
 * In-memory demo session. Nothing here is persisted or verified —
 * a page reload restores the original mock data.
 */
interface DemoSessionApi {
  student: User;
  teacher: User;
  updateUser: (role: 'student' | 'teacher', patch: Partial<User>) => void;
  lastAttempt?: QuizAttempt;
  setLastAttempt: (a: QuizAttempt) => void;
  completedLessons: Set<string>;
  toggleLesson: (id: string, done?: boolean) => void;
}

const Ctx = createContext<DemoSessionApi | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<User>(() => students.find((s) => s.id === DEMO_STUDENT_ID)!);
  const [teacher, setTeacher] = useState<User>(() => teachers.find((t) => t.id === DEMO_TEACHER_ID)!);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt>();
  const [completedLessons, setCompleted] = useState<Set<string>>(new Set());

  const api = useMemo<DemoSessionApi>(
    () => ({
      student,
      teacher,
      updateUser: (role, patch) => (role === 'student' ? setStudent((u) => ({ ...u, ...patch })) : setTeacher((u) => ({ ...u, ...patch }))),
      lastAttempt,
      setLastAttempt,
      completedLessons,
      toggleLesson: (id, done) =>
        setCompleted((prev) => {
          const next = new Set(prev);
          const shouldAdd = done ?? !next.has(id);
          if (shouldAdd) next.add(id);
          else next.delete(id);
          return next;
        }),
    }),
    [student, teacher, lastAttempt, completedLessons],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useDemoSession(): DemoSessionApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDemoSession must be used inside DemoSessionProvider');
  return ctx;
}

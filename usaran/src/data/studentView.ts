/** Derived, read-only views of mock data for the demo student. */
import type { Assignment, AssignmentStatus, Course, Quiz, QuizAttempt, QuizState, Submission } from '../types';
import { assignments, assignmentStatusFor, studentSubmission } from './assignments';
import { getCourse } from './courses';
import { getEnrolledCourses } from './enrollments';
import { attemptsFor, quizzes } from './quizzes';
import { percent } from '../lib/format';

export interface StudentAssignment {
  assignment: Assignment;
  course: Course;
  submission?: Submission;
  status: AssignmentStatus;
}

export function getStudentAssignments(): StudentAssignment[] {
  const ids = getEnrolledCourses().map((e) => e.course.id);
  return assignments
    .filter((a) => ids.includes(a.courseId))
    .map((a) => {
      const submission = studentSubmission(a.id);
      return { assignment: a, course: getCourse(a.courseId)!, submission, status: assignmentStatusFor(a, submission) };
    })
    .sort((a, b) => a.assignment.dueDate.localeCompare(b.assignment.dueDate));
}

export interface StudentQuiz {
  quiz: Quiz;
  course: Course;
  attempts: QuizAttempt[];
  bestPercent?: number;
  state: QuizState;
}

export function getStudentQuizzes(): StudentQuiz[] {
  const enrolled = getEnrolledCourses();
  return quizzes
    .filter((q) => q.status === 'published' && enrolled.some((e) => e.course.id === q.courseId))
    .map((quiz) => {
      const attempts = attemptsFor(quiz.id);
      const bestPercent = attempts.length ? Math.max(...attempts.map((a) => percent(a.score, a.maxScore))) : undefined;
      const e = enrolled.find((x) => x.course.id === quiz.courseId)!;
      let state: QuizState = 'available';
      if (bestPercent !== undefined) state = bestPercent >= quiz.passPercent ? 'passed' : 'failed';
      else if (e.state === 'not-started') state = 'locked';
      return { quiz, course: getCourse(quiz.courseId)!, attempts, bestPercent, state };
    })
    .sort((a, b) => a.quiz.dueDate.localeCompare(b.quiz.dueDate));
}

export interface GradeRow {
  id: string;
  kind: 'assignment' | 'quiz';
  title: string;
  course: Course;
  score: number;
  max: number;
  percent: number;
  date: string;
  feedback?: string;
  status: string;
  to: string;
}

export function getGradeRows(): GradeRow[] {
  const rows: GradeRow[] = [];
  for (const sa of getStudentAssignments()) {
    if (sa.submission?.status === 'graded' && sa.submission.score !== undefined) {
      rows.push({
        id: sa.assignment.id,
        kind: 'assignment',
        title: sa.assignment.title,
        course: sa.course,
        score: sa.submission.score,
        max: sa.assignment.maxScore,
        percent: percent(sa.submission.score, sa.assignment.maxScore),
        date: sa.submission.gradedAt ?? sa.assignment.dueDate,
        feedback: sa.submission.feedback,
        status: 'graded',
        to: `/student/assignments/${sa.assignment.id}`,
      });
    } else if (sa.status === 'submitted') {
      rows.push({ id: sa.assignment.id, kind: 'assignment', title: sa.assignment.title, course: sa.course, score: 0, max: sa.assignment.maxScore, percent: -1, date: sa.submission?.submittedAt ?? sa.assignment.dueDate, status: 'submitted', to: `/student/assignments/${sa.assignment.id}` });
    }
  }
  for (const sq of getStudentQuizzes()) {
    const best = [...sq.attempts].sort((a, b) => b.score - a.score)[0];
    if (best) {
      rows.push({
        id: sq.quiz.id,
        kind: 'quiz',
        title: sq.quiz.title,
        course: sq.course,
        score: best.score,
        max: best.maxScore,
        percent: percent(best.score, best.maxScore),
        date: best.completedAt,
        status: sq.state,
        to: `/student/quizzes/${sq.quiz.id}/results`,
      });
    }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export function scoreTone(p: number): 'good' | 'mid' | 'low' {
  return p >= 85 ? 'good' : p >= 65 ? 'mid' : 'low';
}

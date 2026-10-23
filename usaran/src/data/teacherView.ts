/** Derived views of mock data for the demo teacher. */
import type { Assignment, Course, Quiz, Submission, User } from '../types';
import { courses, getCourse } from './courses';
import { getAssignment, submissions, teacherAssignments, TEACHER_COURSE_IDS } from './assignments';
import { quizzes } from './quizzes';
import { getUser, DEMO_TEACHER_ID } from './users';
import { studentRecords } from './analytics';
import { tr } from '../i18n';

export { TEACHER_COURSE_IDS };

export const teacherCourses: Course[] = courses.filter((c) => c.teacherId === DEMO_TEACHER_ID);
export const teacherQuizzes = quizzes.filter((q) => TEACHER_COURSE_IDS.includes(q.courseId));

export interface SubmissionRow {
  submission: Submission;
  assignment: Assignment;
  course: Course;
  student: User;
}

export function teacherSubmissionRows(): SubmissionRow[] {
  const ids = new Set(teacherAssignments.map((a) => a.id));
  return submissions
    .filter((s) => ids.has(s.assignmentId) && s.status !== 'draft')
    .map((submission) => {
      const assignment = getAssignment(submission.assignmentId)!;
      return { submission, assignment, course: getCourse(assignment.courseId)!, student: getUser(submission.studentId)! };
    })
    .filter((r) => r.student)
    .sort((a, b) => (b.submission.submittedAt ?? '').localeCompare(a.submission.submittedAt ?? ''));
}

export function studentsInCourse(courseId: string) {
  return studentRecords.filter((r) => r.courseIds.includes(courseId));
}

const SHORT_TITLES: Record<string, string> = { react: 'React', js: 'JavaScript', 'python-data': 'Python', sql: 'SQL', algorithms: tr("Algorithms", "Ալգորիթմներ") };

/** Compact course label for chart axes and legends. */
export function shortTitle(courseId: string): string {
  return SHORT_TITLES[courseId] ?? getCourse(courseId)?.title ?? courseId;
}

/** Illustrative per-quiz result summary (no real attempt tracking exists). */
export function quizResultSummary(q: Quiz) {
  const seed = q.id.length * 7 + q.questions.length * 3;
  const attempts = q.status === 'draft' ? 0 : 40 + (seed * 13) % 160;
  const avg = q.status === 'draft' ? 0 : 68 + (seed % 22);
  const passRate = q.status === 'draft' ? 0 : Math.min(97, avg + 6);
  return { attempts, avg, passRate };
}

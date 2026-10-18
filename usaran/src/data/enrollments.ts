import type { Course, Enrollment, EnrollmentState } from '../types';
import { allLessons, getCourse, lessonCount } from './courses';

function lessonsUpTo(courseId: string, count: number): string[] {
  const course = getCourse(courseId);
  if (!course) return [];
  return allLessons(course)
    .slice(0, count)
    .map((l) => l.id);
}

function allOf(courseId: string): string[] {
  const course = getCourse(courseId);
  return course ? allLessons(course).map((l) => l.id) : [];
}

/** Demo student's enrollments (illustrative data, not persisted). */
export const studentEnrollments: Enrollment[] = [
  { courseId: 'react', completedLessonIds: lessonsUpTo('react', 9), lastLessonId: 'react-m2-l5', lastAccessed: '2026-10-15T09:40', enrolledAt: '2026-09-02' },
  { courseId: 'ux', completedLessonIds: lessonsUpTo('ux', 7), lastLessonId: 'ux-m3-l3', lastAccessed: '2026-10-14T19:15', enrolledAt: '2026-08-20' },
  { courseId: 'ml', completedLessonIds: lessonsUpTo('ml', 4), lastLessonId: 'ml-m2-l2', lastAccessed: '2026-10-13T21:05', enrolledAt: '2026-09-15' },
  { courseId: 'linear-algebra', completedLessonIds: [], lastLessonId: 'linear-algebra-m1-l1', lastAccessed: '2026-10-08T10:00', enrolledAt: '2026-10-08' },
  { courseId: 'js', completedLessonIds: allOf('js'), lastLessonId: 'js-m4-l4', lastAccessed: '2026-09-21T18:30', enrolledAt: '2026-06-01' },
  { courseId: 'python-data', completedLessonIds: allOf('python-data'), lastLessonId: 'python-data-m3-l3', lastAccessed: '2026-08-29T16:10', enrolledAt: '2026-05-12' },
];

export function enrollmentProgress(e: Enrollment, course: Course): number {
  const total = lessonCount(course);
  return total === 0 ? 0 : Math.round((e.completedLessonIds.length / total) * 100);
}

export function enrollmentState(progress: number): EnrollmentState {
  if (progress >= 100) return 'completed';
  if (progress <= 0) return 'not-started';
  return 'in-progress';
}

export interface EnrolledCourse {
  course: Course;
  enrollment: Enrollment;
  progress: number;
  state: EnrollmentState;
}

export function getEnrolledCourses(): EnrolledCourse[] {
  return studentEnrollments
    .map((enrollment) => {
      const course = getCourse(enrollment.courseId);
      if (!course) return undefined;
      const progress = enrollmentProgress(enrollment, course);
      return { course, enrollment, progress, state: enrollmentState(progress) };
    })
    .filter((x): x is EnrolledCourse => Boolean(x));
}

export function isEnrolled(courseId: string): boolean {
  return studentEnrollments.some((e) => e.courseId === courseId);
}

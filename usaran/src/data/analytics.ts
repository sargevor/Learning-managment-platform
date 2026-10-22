import type { ActivityPoint, CoursePerformance, Notification, StudentRecord } from '../types';
import { WEEKDAYS_SHORT } from '../lib/format';

/* ---------- Demo student activity ---------- */

export const studentWeeklyMinutes: ActivityPoint[] = [45, 80, 30, 95, 60, 25, 0].map((value, i) => ({ label: WEEKDAYS_SHORT[i], value }));

export const studentWeeklyTrend: ActivityPoint[] = [
  ["Jul 28", 180], ["Aug 4", 240], ["Aug 11", 210], ["Aug 18", 300], ["Aug 25", 150], ["Sep 1", 120],
  ["Sep 8", 260], ["Sep 15", 310], ["Sep 22", 280], ["Sep 29", 345], ["Oct 6", 290], ["Oct 13", 335],
].map(([label, value]) => ({ label: String(label), value: Number(value) }));

export const studentScoreTrend: ActivityPoint[] = [
  ["Jul", 84], ["Aug", 90], ["Sep", 86], ["Oct", 88],
].map(([label, value]) => ({ label: String(label), value: Number(value) }));

/* ---------- Teacher analytics (illustrative) ---------- */

export const coursePerformance: CoursePerformance[] = [
  { courseId: 'react', enrolled: 1284, completionRate: 46, avgAssignment: 84, avgQuiz: 79, activeLast7: 412 },
  { courseId: 'js', enrolled: 3410, completionRate: 71, avgAssignment: 88, avgQuiz: 85, activeLast7: 690 },
  { courseId: 'python-data', enrolled: 1976, completionRate: 58, avgAssignment: 81, avgQuiz: 77, activeLast7: 388 },
  { courseId: 'sql', enrolled: 842, completionRate: 34, avgAssignment: 76, avgQuiz: 72, activeLast7: 205 },
];

export const enrollmentTrend: Record<string, number[]> = {
  react: [62, 78, 91, 104, 118, 133, 150, 171, 160, 182, 196, 214],
  js: [210, 228, 240, 236, 262, 280, 301, 318, 296, 330, 352, 371],
  'python-data': [120, 131, 140, 152, 149, 163, 177, 180, 192, 201, 210, 224],
  sql: [30, 38, 41, 55, 60, 64, 71, 80, 86, 92, 101, 118],
};

export const trendLabels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const teacherWeeklyActivity: ActivityPoint[] = [312, 405, 388, 451, 397, 210, 164].map((value, i) => ({ label: WEEKDAYS_SHORT[i], value }));

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const teacherCourseIds = ['react', 'js', 'python-data', 'sql'];

function buildRecords(): StudentRecord[] {
  const rand = seeded(42);
  const fixed: StudentRecord = {
    userId: 's1',
    courseIds: ['react', 'js', 'python-data'],
    progress: 82,
    avgScore: 90,
    assignmentsDone: 6,
    assignmentsTotal: 7,
    quizAvg: 87,
    lastActive: '2026-10-15T09:40',
    status: 'active',
    weeklyMinutes: [45, 80, 30, 95, 60, 25, 0],
  };
  const list: StudentRecord[] = [fixed];
  for (let i = 2; i <= 14; i++) {
    const nCourses = 1 + Math.floor(rand() * 3);
    const courseIds = [...teacherCourseIds].sort(() => rand() - 0.5).slice(0, nCourses);
    const progress = Math.round(8 + rand() * 90);
    const avgScore = Math.round(58 + rand() * 40);
    const total = 2 + nCourses * 2;
    const done = Math.min(total, Math.round(total * (progress / 100) + rand()));
    const daysAgo = Math.floor(rand() * 20);
    const status: StudentRecord['status'] = daysAgo > 12 ? 'inactive' : avgScore < 68 || progress < 20 ? 'at-risk' : 'active';
    const last = new Date('2026-10-15T12:00');
    last.setDate(last.getDate() - daysAgo);
    last.setHours(8 + Math.floor(rand() * 13));
    list.push({
      userId: `s${i}`,
      courseIds,
      progress,
      avgScore,
      assignmentsDone: done,
      assignmentsTotal: total,
      quizAvg: Math.round(55 + rand() * 42),
      lastActive: last.toISOString().slice(0, 16),
      status,
      weeklyMinutes: Array.from({ length: 7 }, () => (status === 'inactive' ? Math.round(rand() * 10) : Math.round(rand() * 110))),
    });
  }
  return list;
}

export const studentRecords: StudentRecord[] = buildRecords();

export function getStudentRecord(id: string | undefined): StudentRecord | undefined {
  return studentRecords.find((r) => r.userId === id);
}

export interface ActivityEvent {
  id: string;
  studentId: string;
  text: string;
  courseId: string;
  time: string;
  kind: 'submission' | 'quiz' | 'lesson' | 'enroll';
}

export const recentActivity: ActivityEvent[] = [
  { id: 'e1', studentId: 's4', kind: 'submission', text: "submitted the Component Library assignment", courseId: 'react', time: '2026-10-15T10:42' },
  { id: 'e2', studentId: 's1', kind: 'lesson', text: "completed the Lists and the key Attribute lesson", courseId: 'react', time: '2026-10-15T09:40' },
  { id: 'e3', studentId: 's11', kind: 'quiz', text: "completed the pandas Fundamentals quiz with 92%", courseId: 'python-data', time: '2026-10-15T08:15' },
  { id: 'e4', studentId: 's7', kind: 'enroll', text: "enrolled in the course", courseId: 'sql', time: '2026-10-14T21:03' },
  { id: 'e5', studentId: 's2', kind: 'submission', text: "submitted the Query Collection assignment", courseId: 'sql', time: '2026-10-14T18:27' },
  { id: 'e6', studentId: 's12', kind: 'quiz', text: "completed the React Core Concepts quiz with 75%", courseId: 'react', time: '2026-10-14T16:50' },
];

/* ---------- Notifications ---------- */

export const notifications: Notification[] = [
  { id: 'n1', role: 'student', title: "Deadline approaching", text: "The Linear Regression Model assignment is due the day after tomorrow.", time: '2026-10-15T08:00', unread: true, to: '/student/assignments/a-ml-regression' },
  { id: 'n2', role: 'student', title: "New grade", text: "Lilit Grigoryan graded your Interview Analysis assignment.", time: '2026-10-03T11:00', unread: true, to: '/student/grades' },
  { id: 'n3', role: 'student', title: "New quiz", text: "The React Core Concepts quiz is now available in the React course.", time: '2026-10-12T10:00', unread: false, to: '/student/quizzes/q-react-basics' },
  { id: 'n4', role: 'teacher', title: "5 new submissions", text: "Submissions for Component Library are awaiting grading.", time: '2026-10-15T10:42', unread: true, to: '/teacher/grading' },
  { id: 'n5', role: 'teacher', title: "Activity has dropped", text: "3 students have not accessed the course for more than 12 days.", time: '2026-10-14T09:00', unread: true, to: '/teacher/students' },
  { id: 'n6', role: 'teacher', title: "Draft course", text: "Algorithms and Data Structures has not been published yet.", time: '2026-10-11T15:20', unread: false, to: '/teacher/courses/algorithms' },
];

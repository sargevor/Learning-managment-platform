import type { ActivityPoint, CoursePerformance, Notification, StudentRecord } from '../types';
import { WEEKDAYS_SHORT } from '../lib/format';

/* ---------- Demo student activity ---------- */

export const studentWeeklyMinutes: ActivityPoint[] = [45, 80, 30, 95, 60, 25, 0].map((value, i) => ({ label: WEEKDAYS_SHORT[i], value }));

export const studentWeeklyTrend: ActivityPoint[] = [
  ['28 հլս', 180], ['4 օգս', 240], ['11 օգս', 210], ['18 օգս', 300], ['25 օգս', 150], ['1 սեպ', 120],
  ['8 սեպ', 260], ['15 սեպ', 310], ['22 սեպ', 280], ['29 սեպ', 345], ['6 հոկ', 290], ['13 հոկ', 335],
].map(([label, value]) => ({ label: String(label), value: Number(value) }));

export const studentScoreTrend: ActivityPoint[] = [
  ['Հլս', 84], ['Օգս', 90], ['Սեպ', 86], ['Հոկ', 88],
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

export const trendLabels = ['նոյ', 'դեկ', 'հնվ', 'փտր', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ', 'հոկ'];

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
  { id: 'e1', studentId: 's4', kind: 'submission', text: 'հանձնեց «Կոմպոնենտների գրադարան» առաջադրանքը', courseId: 'react', time: '2026-10-15T10:42' },
  { id: 'e2', studentId: 's1', kind: 'lesson', text: 'ավարտեց «Ցուցակներ և key հատկանիշ» դասը', courseId: 'react', time: '2026-10-15T09:40' },
  { id: 'e3', studentId: 's11', kind: 'quiz', text: 'անցավ «Pandas հիմունքներ» թեստը՝ 92%', courseId: 'python-data', time: '2026-10-15T08:15' },
  { id: 'e4', studentId: 's7', kind: 'enroll', text: 'գրանցվեց դասընթացին', courseId: 'sql', time: '2026-10-14T21:03' },
  { id: 'e5', studentId: 's2', kind: 'submission', text: 'հանձնեց «Հարցումների հավաքածու» առաջադրանքը', courseId: 'sql', time: '2026-10-14T18:27' },
  { id: 'e6', studentId: 's12', kind: 'quiz', text: 'անցավ «React-ի հիմնական գաղափարներ» թեստը՝ 75%', courseId: 'react', time: '2026-10-14T16:50' },
];

/* ---------- Notifications ---------- */

export const notifications: Notification[] = [
  { id: 'n1', role: 'student', title: 'Մոտենում է վերջնաժամկետը', text: '«Գծային ռեգրեսիայի մոդել» առաջադրանքը պետք է հանձնել վաղը չէ մյուս օրը։', time: '2026-10-15T08:00', unread: true, to: '/student/assignments/a-ml-regression' },
  { id: 'n2', role: 'student', title: 'Նոր գնահատական', text: 'Լիլիթ Գրիգորյանը գնահատեց «Հարցազրույցների վերլուծություն» աշխատանքը։', time: '2026-10-03T11:00', unread: true, to: '/student/grades' },
  { id: 'n3', role: 'student', title: 'Նոր թեստ', text: 'React դասընթացում հասանելի է «React-ի հիմնական գաղափարներ» թեստը։', time: '2026-10-12T10:00', unread: false, to: '/student/quizzes/q-react-basics' },
  { id: 'n4', role: 'teacher', title: '5 նոր հանձնում', text: '«Կոմպոնենտների գրադարան» առաջադրանքը սպասում է գնահատման։', time: '2026-10-15T10:42', unread: true, to: '/teacher/grading' },
  { id: 'n5', role: 'teacher', title: 'Ակտիվության անկում', text: '3 ուսանող ավելի քան 12 օր չի մուտք գործել դասընթաց։', time: '2026-10-14T09:00', unread: true, to: '/teacher/students' },
  { id: 'n6', role: 'teacher', title: 'Սևագիր դասընթաց', text: '«Ալգորիթմներ և տվյալների կառուցվածքներ» դասընթացը դեռ հրապարակված չէ։', time: '2026-10-11T15:20', unread: false, to: '/teacher/courses/algorithms' },
];

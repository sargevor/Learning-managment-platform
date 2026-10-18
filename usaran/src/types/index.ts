export type Role = 'student' | 'teacher';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type CategoryId =
  | 'programming'
  | 'design'
  | 'math'
  | 'ai'
  | 'data'
  | 'languages'
  | 'science'
  | 'business';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  courseCount: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  title?: string;
  bio?: string;
  institution?: string;
  program?: string;
  year?: string;
  city?: string;
  phone?: string;
  joinedAt: string;
}

export type LessonType = 'video' | 'text' | 'resource' | 'assignment' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  preview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type CourseStatus = 'published' | 'draft' | 'archived';

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: CategoryId;
  difficulty: Difficulty;
  durationHours: number;
  enrolled: number;
  rating: number;
  teacherId: string;
  image: string;
  status: CourseStatus;
  objectives: string[];
  modules: Module[];
  updatedAt: string;
  featured?: boolean;
  language: string;
}

export type EnrollmentState = 'not-started' | 'in-progress' | 'completed';

export interface Enrollment {
  courseId: string;
  completedLessonIds: string[];
  lastLessonId: string;
  lastAccessed: string;
  enrolledAt: string;
}

export type AssignmentStatus = 'not-started' | 'draft' | 'submitted' | 'graded' | 'overdue';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  instructions: string[];
  requirements: string[];
  dueDate: string;
  maxScore: number;
  allowFiles: boolean;
  createdAt: string;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

export interface Attachment {
  name: string;
  sizeKb: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt?: string;
  answer: string;
  attachments: Attachment[];
  score?: number;
  feedback?: string;
  gradedAt?: string;
  late?: boolean;
}

export type QuestionKind = 'single' | 'multiple';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  text: string;
  options: QuizOption[];
  correct: string[];
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string[];
  timeLimitMin: number;
  attemptsAllowed: number;
  passPercent: number;
  dueDate: string;
  status: 'published' | 'draft';
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string[]>;
  score: number;
  maxScore: number;
  completedAt: string;
  durationMin: number;
}

export interface Notification {
  id: string;
  role: Role;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  to: string;
}

export interface ActivityPoint {
  label: string;
  value: number;
}

export interface StudentRecord {
  userId: string;
  courseIds: string[];
  progress: number;
  avgScore: number;
  assignmentsDone: number;
  assignmentsTotal: number;
  quizAvg: number;
  lastActive: string;
  status: 'active' | 'at-risk' | 'inactive';
  weeklyMinutes: number[];
}

export interface CoursePerformance {
  courseId: string;
  enrolled: number;
  completionRate: number;
  avgAssignment: number;
  avgQuiz: number;
  activeLast7: number;
}

export type QuizState = 'available' | 'passed' | 'failed' | 'locked';

import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './context/ToastContext';
import { DemoSessionProvider } from './context/DemoSession';

import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage, RegisterPage } from './pages/public/AuthPages';
import { NotFoundPage } from './pages/public/NotFoundPage';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { LearnPage } from './pages/student/LearnPage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { AssignmentDetailPage } from './pages/student/AssignmentDetailPage';
import { StudentQuizzesPage } from './pages/student/StudentQuizzesPage';
import { QuizPage } from './pages/student/QuizPage';
import { QuizResultsPage } from './pages/student/QuizResultsPage';
import { GradesPage } from './pages/student/GradesPage';
import { ProgressPage } from './pages/student/ProgressPage';

import { ProfilePage } from './pages/shared/ProfilePage';
import { SettingsPage } from './pages/shared/SettingsPage';

import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCoursesPage } from './pages/teacher/TeacherCoursesPage';
import { CourseFormPage } from './pages/teacher/CourseFormPage';
import { TeacherCourseDetailPage } from './pages/teacher/TeacherCourseDetailPage';
import { CourseContentPage } from './pages/teacher/CourseContentPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { AssignmentSubmissionsPage } from './pages/teacher/AssignmentSubmissionsPage';
import { TeacherQuizzesPage } from './pages/teacher/TeacherQuizzesPage';
import { QuizEditorPage } from './pages/teacher/QuizEditorPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherStudentDetailPage } from './pages/teacher/TeacherStudentDetailPage';
import { GradingCenterPage } from './pages/teacher/GradingCenterPage';
import { ReportsPage } from './pages/teacher/ReportsPage';

/* A hash router lets the static preview build work on any host; the regular build uses clean URLs. */
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <ToastProvider>
      <DemoSessionProvider>
        <Router>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CatalogPage />} />
              <Route path="courses/:id" element={<CourseDetailsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            <Route path="student/courses/:id/learn" element={<LearnPage />} />
            <Route path="student" element={<AppShell role="student" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<MyCoursesPage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route path="assignments/:id" element={<AssignmentDetailPage />} />
              <Route path="quizzes" element={<StudentQuizzesPage />} />
              <Route path="quizzes/:id" element={<QuizPage />} />
              <Route path="quizzes/:id/results" element={<QuizResultsPage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage role="student" />} />
              <Route path="settings" element={<SettingsPage role="student" />} />
              <Route path="*" element={<NotFoundPage inApp />} />
            </Route>

            <Route path="teacher" element={<AppShell role="teacher" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCoursesPage />} />
              <Route path="courses/create" element={<CourseFormPage />} />
              <Route path="courses/:id" element={<TeacherCourseDetailPage />} />
              <Route path="courses/:id/edit" element={<CourseFormPage />} />
              <Route path="courses/:id/content" element={<CourseContentPage />} />
              <Route path="assignments" element={<TeacherAssignmentsPage />} />
              <Route path="assignments/:id/submissions" element={<AssignmentSubmissionsPage />} />
              <Route path="quizzes" element={<TeacherQuizzesPage />} />
              <Route path="quizzes/:id/edit" element={<QuizEditorPage />} />
              <Route path="students" element={<TeacherStudentsPage />} />
              <Route path="students/:id" element={<TeacherStudentDetailPage />} />
              <Route path="grading" element={<GradingCenterPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<ProfilePage role="teacher" />} />
              <Route path="settings" element={<SettingsPage role="teacher" />} />
              <Route path="*" element={<NotFoundPage inApp />} />
            </Route>

            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </DemoSessionProvider>
    </ToastProvider>
  );
}

# Ուսարան — Online Learning Management Platform (frontend)

A complete, frontend-only interface for an online learning platform with separate **student** and **teacher** environments. The interface language is Armenian; code and identifiers are in English.

> This is a demonstration UI. There is no backend, database, API, or authentication. All data is mock data defined in `src/data`, and every change (submissions, grades, profile edits, course edits) lives only in component state and resets on page reload.

## Run

```bash
npm install
npm run dev        # development server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

Requires Node 18+. A static build that works from any folder or host (hash-based URLs) can be made with:

```bash
VITE_HASH_ROUTER=true npx vite build --base ./
```

## Tech

- React 18 + TypeScript + Vite
- React Router 6 for routing
- Plain CSS with design tokens (`src/styles`); see Design below
- Lucide icons, self-hosted Noto Sans / Noto Serif Armenian fonts
- Hand-built SVG charts (no chart library)

## Design

- Light, airy surfaces on a cool gray background. Brand navy `#0F1E3D` is the main color (buttons, logo, active states, progress and chart fills); indigo `#4A5BD0` marks small highlights such as the serif accent word in headlines and links.
- Pastel tints (`.t-sky`, `.t-mint`, `.t-lilac`, `.t-sun`, `.t-rose`, `.t-peach`) color categories, lesson types and icon boxes (`.tint-box`).
- Photos are framed as arches, after Armenian stone architecture; the logo is the same arch.
- Noto Sans Armenian 800 for headings, Noto Serif Armenian for accent words; pill-shaped buttons, tabs and inputs; 20–28px card radii.

## Structure

```
src/
  App.tsx                 route table
  main.tsx                entry, fonts, global styles
  types/                  domain types (Course, Lesson, Assignment, Quiz, Submission, User, reports…)
  data/                   mock data + derived read-only views
    courses.ts users.ts enrollments.ts assignments.ts quizzes.ts analytics.ts lessonContent.ts
    studentView.ts teacherView.ts
  context/                ToastContext, DemoSession (in-memory demo state)
  lib/format.ts           Armenian date/number formatting, fixed demo "today" (15 Oct 2026)
  components/
    ui/                   Button, Field (Input/Select/Textarea/Checkbox/Toggle), SearchBar, Badge/StatusBadge,
                          Progress (bar/ring), StatCard, DataTable, Overlay (Modal/ConfirmDialog/Dropdown),
                          Misc (Card, PageHeader, Breadcrumbs, Tabs, Segmented, Pagination, Notice,
                          DemoFlag, Avatar, Person, Thumb, Skeleton), EmptyState
    charts/Charts.tsx     BarChart, LineChart, HBarChart, DonutChart, ChartCard
    course/               CourseCard, LessonItem, AssignmentCard, QuizCard, GradingPanel
    layout/               PublicLayout, AppShell (collapsible sidebar + top bar), Brand
  pages/
    public/               Home, Catalog, CourseDetails, About, Login/Register, NotFound
    student/              Dashboard, MyCourses, Learn, Assignments, AssignmentDetail, Quizzes,
                          Quiz (intro → questions → review), QuizResults, Grades, Progress
    teacher/              Dashboard, Courses, CourseForm (create/edit), CourseDetail, CourseContent,
                          Assignments, AssignmentSubmissions, Quizzes, QuizEditor, Students,
                          StudentDetail, GradingCenter, Reports
    shared/               Profile, Settings (used by both roles)
  lib/visual.ts           category tints and icons, demo portraits, home page photos
  styles/                 base.css (tokens), components.css, layout.css, pages.css, landing.css (home page, `lp-` classes)
```

## Routes

Public: `/`, `/courses`, `/courses/:id`, `/about`, `/login`, `/register`

Student: `/student/dashboard`, `/student/courses`, `/student/courses/:id/learn`, `/student/assignments`, `/student/assignments/:id`, `/student/quizzes`, `/student/quizzes/:id`, `/student/quizzes/:id/results`, `/student/grades`, `/student/progress`, `/student/profile`, `/student/settings`

Teacher: `/teacher/dashboard`, `/teacher/courses`, `/teacher/courses/create`, `/teacher/courses/:id`, `/teacher/courses/:id/edit`, `/teacher/courses/:id/content`, `/teacher/assignments`, `/teacher/assignments/:id/submissions`, `/teacher/quizzes`, `/teacher/quizzes/:id/edit` (use `new` as the id for a new quiz), `/teacher/students`, `/teacher/students/:id`, `/teacher/grading`, `/teacher/reports`, `/teacher/profile`, `/teacher/settings`

Unknown URLs show a not-found page inside the matching environment.

## Demo roles

- On `/login`, pick **Ուսանող** (student) or **Դասավանդող** (teacher); any well-formed email and a 6+ character password work, or use "Լրացնել դեմո տվյալներով".
- Inside the app, the switch in the top bar moves between the two environments at any time.
- Demo student: Անի Հակոբյան. Demo teacher: Արմեն Սարգսյան (teaches React, JavaScript, Python, SQL, Algorithms).

## Notes

- Statistics on the home page, dashboards and reports are illustrative and marked with a "Ցուցադրական տվյալներ" label.
- Course thumbnails load from Unsplash; if an image cannot load, a styled placeholder is shown instead. Home page photos, category photos and demo portraits are self-hosted in `public/images` (Unsplash license).
- Export buttons show a demonstration message and do not produce files; Print uses the browser print dialog with a print stylesheet.

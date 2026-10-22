import type { Assignment, AssignmentStatus, Submission } from '../types';
import { DEMO_STUDENT_ID, students } from './users';
import { TODAY } from '../lib/format';

export const assignments: Assignment[] = [
  {
    id: 'a-react-components',
    courseId: 'react',
    title: "Component Library",
    summary: "Build 6 reusable UI components and document how to use them.",
    instructions: [
      "Create Button, Input, Select, Badge, Card, and Modal components.",
      "Each component should accept size and variant props.",
      "Write a short README with usage examples.",
      "Explain your decisions in the answer field and link to your repository.",
    ],
    requirements: ["TypeScript types for all props", "Keyboard accessibility", "No external UI libraries", "Up to 600 lines of code"],
    dueDate: '2026-10-18T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-29',
  },
  {
    id: 'a-react-forms',
    courseId: 'react',
    title: "Form Validation with Hooks",
    summary: "Write a custom useForm hook to manage field values and errors.",
    instructions: [
      "Create a useForm hook with initial values and validation rules.",
      "Use it in a registration form with 5 fields.",
      "Display errors below each field after it loses focus.",
    ],
    requirements: ["No external libraries", "At least 3 validation rules", "Clear error messages"],
    dueDate: '2026-10-25T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'a-react-router',
    courseId: 'react',
    title: "Multi-page App with React Router",
    summary: "Build a 4-page application with nested layouts and dynamic routes.",
    instructions: ["Define a shared layout with a navigation panel.", "Add a dynamic route with an :id parameter.", "Handle pages that do not exist."],
    requirements: ['React Router 6', "Highlight the active link", "Loading states"],
    dueDate: '2026-11-05T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-12',
  },
  {
    id: 'a-js-dom',
    courseId: 'js',
    title: "Working with the DOM: Task List",
    summary: "Create a task list with add, complete, and filter features.",
    instructions: ["Implement adding and deleting tasks.", "Add a completed status.", "Add filters for all, active, and completed tasks."],
    requirements: ["Plain JavaScript only", "Event delegation"],
    dueDate: '2026-07-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-07-06',
  },
  {
    id: 'a-js-async',
    courseId: 'js',
    title: "Async Weather Widget",
    summary: "Build a widget that displays sample data loaded from a local file.",
    instructions: ["Use async/await.", "Display loading and error states."],
    requirements: ["Error handling with try/catch", "Readable code"],
    dueDate: '2026-08-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'a-py-cleaning',
    courseId: 'python-data',
    title: "Data Cleaning with pandas",
    summary: "Clean the sample Yerevan public transport data and summarize your findings.",
    instructions: ["Identify and handle missing values.", "Correct data types and remove duplicates.", "Present 3 findings."],
    requirements: ['Jupyter notebook', "Commented code"],
    dueDate: '2026-07-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-06-25',
  },
  {
    id: 'a-py-viz',
    courseId: 'python-data',
    title: "Data Visualization Report",
    summary: "Prepare a report with 5 charts using an open dataset of your choice.",
    instructions: ["Choose a dataset.", "Create 5 different types of charts.", "Include a brief explanation for each chart."],
    requirements: ["Axis labels", "Accessible color palette"],
    dueDate: '2026-08-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'a-sql-queries',
    courseId: 'sql',
    title: "Query Collection",
    summary: "Write 10 SQL queries for the sample library schema.",
    instructions: ["Use at least 3 types of JOIN.", "Use GROUP BY and HAVING."],
    requirements: ["A short explanation for each query"],
    dueDate: '2026-10-20T23:59',
    maxScore: 50,
    allowFiles: true,
    createdAt: '2026-10-03',
  },
  {
    id: 'a-ux-interviews',
    courseId: 'ux',
    title: "Interview Analysis",
    summary: "Conduct 3 interviews and present a synthesis of your findings.",
    instructions: ["Prepare an interview guide.", "Conduct and document 3 interviews.", "Group your observations by theme."],
    requirements: ["Participant consent", "Anonymous data"],
    dueDate: '2026-09-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-14',
  },
  {
    id: 'a-ux-journey',
    courseId: 'ux',
    title: "User Journey Map",
    summary: "Map the experience of ordering a book from an online library.",
    instructions: ["Define your persona.", "Describe the stages, actions, and feelings.", "Identify 3 opportunities for improvement."],
    requirements: ["PDF or image", "Link to the source file"],
    dueDate: '2026-10-12T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-28',
  },
  {
    id: 'a-ml-prep',
    courseId: 'ml',
    title: "Data Preparation",
    summary: "Prepare the sample housing price data for modeling.",
    instructions: ["Handle missing values.", "Encode categorical features.", "Normalize numeric features."],
    requirements: ['scikit-learn Pipeline', "Brief summary of results"],
    dueDate: '2026-10-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-26',
  },
  {
    id: 'a-ml-regression',
    courseId: 'ml',
    title: "Linear Regression Model",
    summary: "Train and evaluate a linear regression model using the prepared data.",
    instructions: ["Split the data into training and test sets.", "Train the model.", "Calculate MAE and R² and interpret the results."],
    requirements: ["Reproducible results (random_state)", "Chart of predicted and actual values"],
    dueDate: '2026-10-17T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-05',
  },
];

export function getAssignment(id: string | undefined): Assignment | undefined {
  return assignments.find((a) => a.id === id);
}

/* ---------- Submissions ---------- */

const demoStudentSubmissions: Submission[] = [
  {
    id: 'sub-s1-react-components',
    assignmentId: 'a-react-components',
    studentId: DEMO_STUDENT_ID,
    status: 'draft',
    answer: "I organized shared component styles using CSS variables. Button has three variants: primary, secondary, and ghost.",
    attachments: [{ name: 'components-readme.md', sizeKb: 12 }],
  },
  {
    id: 'sub-s1-ux-journey',
    assignmentId: 'a-ux-journey',
    studentId: DEMO_STUDENT_ID,
    status: 'submitted',
    submittedAt: '2026-10-12T21:40',
    answer: "The persona is a 34-year-old teacher who orders books in the evening. Her main difficulty is uncertainty about delivery times.",
    attachments: [{ name: 'journey-map.pdf', sizeKb: 1840 }],
  },
  {
    id: 'sub-s1-ux-interviews',
    assignmentId: 'a-ux-interviews',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-09-29T18:12',
    answer: "I conducted 3 interviews and identified 4 key themes: trust, speed, search, and delivery.",
    attachments: [{ name: 'interview-synthesis.pdf', sizeKb: 920 }],
    score: 88,
    feedback: "The synthesis is well organized and the themes are clear. Next time, include participant quotes to support your conclusions.",
    gradedAt: '2026-10-03T11:00',
  },
  {
    id: 'sub-s1-js-dom',
    assignmentId: 'a-js-dom',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-18T20:05',
    answer: "Adding, deleting, completing, and filtering tasks are implemented. I used event delegation on the list.",
    attachments: [{ name: 'todo-app.zip', sizeKb: 46 }],
    score: 95,
    feedback: "Excellent work. The code is clean and the filters work perfectly.",
    gradedAt: '2026-07-21T10:20',
  },
  {
    id: 'sub-s1-js-async',
    assignmentId: 'a-js-async',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-29T22:47',
    answer: "The widget displays loading, error, and success states.",
    attachments: [{ name: 'weather-widget.zip', sizeKb: 58 }],
    score: 90,
    feedback: "Good error handling. The repeated code could be extracted into a separate function.",
    gradedAt: '2026-09-01T09:30',
  },
  {
    id: 'sub-s1-py-cleaning',
    assignmentId: 'a-py-cleaning',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-09T17:00',
    answer: "Cleaned 12,450 rows and removed 318 duplicates.",
    attachments: [{ name: 'transport-cleaning.ipynb', sizeKb: 410 }],
    score: 84,
    feedback: "Good work. One conclusion needs stronger support from the data.",
    gradedAt: '2026-07-13T12:10',
  },
  {
    id: 'sub-s1-py-viz',
    assignmentId: 'a-py-viz',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-19T23:10',
    answer: "The report includes 5 charts about tourism in Armenia.",
    attachments: [{ name: 'tourism-report.pdf', sizeKb: 2310 }],
    score: 91,
    feedback: "The charts are clear and well chosen. Thank you for the detailed explanations.",
    gradedAt: '2026-08-24T15:45',
  },
];

/** Deterministic pseudo-random generator so mock data looks varied but stays stable. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const answerSamples = [
  "I completed the work according to the requirements. Validation took the most time; I eventually separated it into individual functions.",
  "I have attached the project archive. My answer describes its structure and the areas where I would appreciate feedback.",
  "I divided the solution into a data layer, UI, and helper functions. The README includes setup instructions.",
  "I completed every requirement except the final optional one, which I did not have time to finish.",
];

const teacherAssignmentIds = ['a-react-components', 'a-react-forms', 'a-js-dom', 'a-js-async', 'a-py-cleaning', 'a-py-viz', 'a-sql-queries'];

function generateClassSubmissions(): Submission[] {
  const rand = seeded(17);
  const list: Submission[] = [];
  for (const aid of teacherAssignmentIds) {
    const a = getAssignment(aid)!;
    const isPast = new Date(a.dueDate) < TODAY;
    for (const st of students.slice(1, 13)) {
      const r = rand();
      if (!isPast && r < 0.35) continue; // not submitted yet
      if (isPast && r < 0.08) continue;
      const graded = isPast ? rand() < 0.92 : rand() < 0.25;
      const score = Math.round(a.maxScore * (0.62 + rand() * 0.37));
      const day = Math.max(1, Math.round(rand() * 6));
      const due = new Date(a.dueDate);
      const submitted = new Date(due.getTime() - day * 86400000 + Math.round(rand() * 10) * 3600000);
      if (!isPast && submitted > TODAY) submitted.setTime(TODAY.getTime() - day * 3600000 * 5);
      list.push({
        id: `sub-${st.id}-${aid}`,
        assignmentId: aid,
        studentId: st.id,
        status: graded ? 'graded' : 'submitted',
        submittedAt: submitted.toISOString().slice(0, 16),
        answer: answerSamples[Math.floor(rand() * answerSamples.length)],
        attachments: rand() > 0.3 ? [{ name: `${aid.replace('a-', '')}-${st.id}.zip`, sizeKb: Math.round(40 + rand() * 900) }] : [],
        score: graded ? score : undefined,
        feedback: graded ? "The work meets the requirements. See the code for detailed feedback." : undefined,
        gradedAt: graded ? new Date(due.getTime() + 3 * 86400000).toISOString().slice(0, 16) : undefined,
        late: rand() < 0.1,
      });
    }
  }
  return list;
}

export const submissions: Submission[] = [...demoStudentSubmissions, ...generateClassSubmissions()];

export function submissionsFor(assignmentId: string): Submission[] {
  return submissions.filter((s) => s.assignmentId === assignmentId);
}

export function studentSubmission(assignmentId: string, studentId = DEMO_STUDENT_ID): Submission | undefined {
  return submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
}

export function assignmentStatusFor(a: Assignment, sub: Submission | undefined): AssignmentStatus {
  if (sub?.status === 'graded' || sub?.status === 'returned') return 'graded';
  if (sub?.status === 'submitted') return 'submitted';
  if (new Date(a.dueDate) < TODAY) return 'overdue';
  if (sub?.status === 'draft') return 'draft';
  return 'not-started';
}

/* ---------- Teacher-side helpers ---------- */

export const TEACHER_COURSE_IDS = ['react', 'js', 'python-data', 'sql', 'algorithms'];

export const teacherAssignments = assignments.filter((a) => TEACHER_COURSE_IDS.includes(a.courseId));

export function pendingTeacherSubmissions(): Submission[] {
  const ids = new Set(teacherAssignments.map((a) => a.id));
  return submissions.filter((s) => ids.has(s.assignmentId) && s.status === 'submitted');
}

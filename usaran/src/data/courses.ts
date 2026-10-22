import type { Category, Course, LessonType, Module } from '../types';

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

type L = [title: string, type: LessonType, minutes: number, preview?: boolean];

function mods(courseId: string, list: [string, L[]][]): Module[] {
  return list.map(([title, lessons], mi) => ({
    id: `${courseId}-m${mi + 1}`,
    title,
    lessons: lessons.map(([t, type, durationMin, preview], li) => ({
      id: `${courseId}-m${mi + 1}-l${li + 1}`,
      title: t,
      type,
      durationMin,
      preview,
    })),
  }));
}

export const categories: Category[] = [
  { id: 'programming', name: "Programming", description: "Web development, apps, and algorithms", courseCount: 48 },
  { id: 'design', name: "Design", description: "UX research and interfaces", courseCount: 21 },
  { id: 'math', name: "Mathematics", description: "Calculus, algebra, and statistics", courseCount: 26 },
  { id: 'ai', name: "Artificial intelligence", description: "Machine learning and deep learning", courseCount: 17 },
  { id: 'data', name: "Data analysis", description: "Python, SQL, and data visualization", courseCount: 19 },
  { id: 'languages', name: "Languages", description: "Academic and professional communication", courseCount: 14 },
  { id: 'science', name: "Natural sciences", description: "Physics, chemistry, and biology", courseCount: 12 },
  { id: 'business', name: "Business and management", description: "Projects, teams, and finance", courseCount: 16 },
];

export const difficultyLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export function categoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? "Other";
}

export const courses: Course[] = [
  {
    id: 'react',
    title: "React: Building Modern Interfaces",
    shortDescription: "Build React components, manage state, and use hooks to create a multi-page application.",
    description:
      "Go from React fundamentals to a complete multi-page app. Each module ends with a practical assignment, and you will build an interface for managing learning projects throughout the course.",
    category: 'programming',
    difficulty: 'intermediate',
    durationHours: 32,
    enrolled: 1284,
    rating: 4.8,
    teacherId: 't1',
    image: img('1633356122544-f134324a6cee'),
    status: 'published',
    featured: true,
    language: "English",
    updatedAt: '2026-09-28',
    objectives: [
      "Build reusable components and organize their hierarchy",
      "Manage state with useState, useReducer, and Context",
      "Work with side effects and asynchronous data",
      "Create a multi-page application with React Router",
      "Write readable, testable, and accessible UI code",
    ],
    modules: mods('react', [
      ["React Fundamentals", [
        ["Why React? A Declarative Approach", 'video', 14, true],
        ["JSX Syntax", 'text', 10, true],
        ["Your First Component", 'video', 18],
        ["Props and Data Flow", 'video', 16],
        ["Quiz: Core Concepts", 'quiz', 15],
      ]],
      ["State and Events", [
        ["The useState Hook", 'video', 20],
        ["Handling Events", 'text', 12],
        ["Controlled Forms in React", 'video', 22],
        ["Lists and the key Attribute", 'video', 15],
        ["Assignment: Component Library", 'assignment', 90],
      ]],
      ["Effects and Data", [
        ["The useEffect Lifecycle", 'video', 24],
        ["Loading Asynchronous Data", 'video', 21],
        ["Creating Custom Hooks", 'text', 16],
        ["Additional Resources and Examples", 'resource', 10],
        ["Assignment: Form Validation with Hooks", 'assignment', 75],
      ]],
      ["Routing and Architecture", [
        ["React Router: Routes and Layouts", 'video', 26],
        ["Context API and Global State", 'video', 19],
        ["Folder Structure for Large Projects", 'text', 14],
        ["Final Project", 'assignment', 180],
      ]],
    ]),
  },
  {
    id: 'js',
    title: "JavaScript Fundamentals",
    shortDescription: "Learn JavaScript fundamentals: variables, functions, the DOM, and asynchronous programming.",
    description:
      "A step-by-step introduction to JavaScript and its use in the browser. Short lessons and interactive exercises help beginners put each topic into practice.",
    category: 'programming',
    difficulty: 'beginner',
    durationHours: 24,
    enrolled: 3410,
    rating: 4.9,
    teacherId: 't1',
    image: img('1579468118864-1b9ea3c0db4a'),
    status: 'published',
    featured: true,
    language: "English",
    updatedAt: '2026-08-14',
    objectives: [
      "Understand data types and operators",
      "Write functions and work with arrays",
      "Modify page content using the DOM",
      "Use Promises and async/await",
    ],
    modules: mods('js', [
      ["JavaScript Fundamentals", [
        ["Introduction and Environment Setup", 'video', 12, true],
        ["Variables and Types", 'video', 18, true],
        ["Operators and Conditions", 'text', 14],
      ]],
      ["Functions and Arrays", [
        ["Declaring Functions", 'video', 20],
        ["Array Methods", 'video', 22],
        ["Quiz: Types and Functions", 'quiz', 15],
      ]],
      ["DOM and Events", [
        ["The DOM Tree", 'video', 16],
        ["Handling Events", 'video', 18],
        ["Assignment: Task List", 'assignment', 60],
      ]],
      ["Asynchronous JavaScript", [
        ["Callbacks and Promises", 'video', 22],
        ['async/await', 'text', 15],
        ["Quiz: Asynchronous Programming", 'quiz', 15],
        ["Assignment: Weather Widget", 'assignment', 75],
      ]],
    ]),
  },
  {
    id: 'python-data',
    title: "Python for Data Analysis",
    shortDescription: "Use NumPy, pandas, and visualization to turn real data into insights.",
    description:
      "Learn to clean, analyze, and present data with Python using open datasets.",
    category: 'data',
    difficulty: 'intermediate',
    durationHours: 28,
    enrolled: 1976,
    rating: 4.7,
    teacherId: 't1',
    image: img('1551288049-bebda4e38f71'),
    status: 'published',
    featured: true,
    language: "English",
    updatedAt: '2026-07-30',
    objectives: [
      "Import and clean tabular data with pandas",
      "Group, merge, and summarize data",
      "Build charts that communicate data clearly",
      "Prepare an analytical report",
    ],
    modules: mods('python-data', [
      ["Python Fundamentals Review", [
        ["Your Workspace and Jupyter", 'video', 15, true],
        ["Data Structures in Python", 'text', 18],
      ]],
      ["NumPy and pandas", [
        ["NumPy Arrays", 'video', 20],
        ["DataFrame Fundamentals", 'video', 24],
        ["Quiz: pandas Fundamentals", 'quiz', 15],
        ["Assignment: Data Cleaning", 'assignment', 90],
      ]],
      ["Data Visualization", [
        ["Matplotlib and Chart Types", 'video', 22],
        ["Choosing the Right Chart", 'text', 12],
        ["Assignment: Data Visualization Report", 'assignment', 120],
      ]],
    ]),
  },
  {
    id: 'sql',
    title: "SQL and Database Design",
    shortDescription: "Queries, joins, and normalization in relational databases.",
    description:
      "Write efficient SQL queries, design tables, and understand how real applications organize data.",
    category: 'data',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 842,
    rating: 4.6,
    teacherId: 't1',
    image: img('1544383835-bda2bc66a55d'),
    status: 'published',
    language: "English",
    updatedAt: '2026-10-02',
    objectives: ["Write SELECT queries with filters", "Use JOINs and aggregate functions", "Design a normalized schema"],
    modules: mods('sql', [
      ["Introduction", [
        ["The Relational Model", 'video', 14, true],
        ["Your First Query", 'video', 16],
      ]],
      ["Queries", [
        ['WHERE, ORDER BY, LIMIT', 'video', 18],
        ["Types of JOIN", 'video', 24],
        ["Assignment: Query Collection", 'assignment', 60],
      ]],
    ]),
  },
  {
    id: 'algorithms',
    title: "Algorithms and Data Structures",
    shortDescription: "Complexity analysis, sorting, graphs, and dynamic programming.",
    description: "An advanced course for technical interviews and competitive programming.",
    category: 'programming',
    difficulty: 'advanced',
    durationHours: 40,
    enrolled: 0,
    rating: 0,
    teacherId: 't1',
    image: img('1509228468518-180dd4864904'),
    status: 'draft',
    language: "English",
    updatedAt: '2026-10-11',
    objectives: ["Evaluate algorithm complexity", "Apply graph algorithms", "Solve problems with dynamic programming"],
    modules: mods('algorithms', [
      ["Complexity Analysis", [
        ["Big-O Notation", 'video', 18],
        ["Recursion", 'text', 20],
      ]],
    ]),
  },
  {
    id: 'ux',
    title: "UX/UI Design Fundamentals",
    shortDescription: "User research, information architecture, and prototypes.",
    description:
      "Explore the complete user experience design process, from research to a tested prototype.",
    category: 'design',
    difficulty: 'beginner',
    durationHours: 20,
    enrolled: 2207,
    rating: 4.8,
    teacherId: 't2',
    image: img('1581291518857-4e27b48ff24e'),
    status: 'published',
    featured: true,
    language: "English",
    updatedAt: '2026-09-12',
    objectives: ["Conduct user interviews", "Create personas and a user journey map", "Create and test prototypes"],
    modules: mods('ux', [
      ["What Is UX?", [
        ["Design Thinking", 'video', 15, true],
        ["UX and UI: The Differences", 'text', 10, true],
      ]],
      ["Research", [
        ["Planning an Interview", 'video', 18],
        ["Synthesizing Findings", 'video', 20],
        ["Assignment: Interview Analysis", 'assignment', 90],
      ]],
      ["Design", [
        ["User Journey Map", 'video', 16],
        ["Assignment: User Journey Map", 'assignment', 90],
        ["Quiz: Usability Principles", 'quiz', 12],
      ]],
      ["Prototypes", [
        ["Low- and High-Fidelity Prototypes", 'video', 22],
        ["Usability Testing", 'video', 20],
      ]],
    ]),
  },
  {
    id: 'figma',
    title: "Interface Design in Figma",
    shortDescription: "Auto layout, components, and design systems.",
    description: "A practical course in creating consistent interfaces efficiently with Figma.",
    category: 'design',
    difficulty: 'intermediate',
    durationHours: 16,
    enrolled: 1530,
    rating: 4.7,
    teacherId: 't2',
    image: img('1561070791-2526d30994b5'),
    status: 'published',
    language: "English",
    updatedAt: '2026-06-20',
    objectives: ["Use Auto Layout", "Build a component library", "Prepare designs for developer handoff"],
    modules: mods('figma', [
      ["Workspace", [["Interface Overview", 'video', 12, true], ["Frames and Grids", 'video', 15]]],
      ["Components", [["Variants and Properties", 'video', 20], ["Design Tokens", 'text', 14]]],
    ]),
  },
  {
    id: 'ml',
    title: "Introduction to Machine Learning",
    shortDescription: "Regression, classification, and model evaluation with Python.",
    description:
      "Understand core machine learning concepts and gain hands-on experience with scikit-learn.",
    category: 'ai',
    difficulty: 'intermediate',
    durationHours: 36,
    enrolled: 2894,
    rating: 4.9,
    teacherId: 't4',
    image: img('1677442136019-21780ecad995'),
    status: 'published',
    featured: true,
    language: "English",
    updatedAt: '2026-09-30',
    objectives: ["Distinguish supervised and unsupervised learning", "Build regression and classification models", "Evaluate models with appropriate metrics"],
    modules: mods('ml', [
      ["Core Concepts", [
        ["What Is Machine Learning?", 'video', 16, true],
        ["Data, Features, and Labels", 'text', 12, true],
        ["Quiz: Terminology", 'quiz', 12],
      ]],
      ["Data Preparation", [
        ["Missing Values", 'video', 18],
        ["Normalization and Encoding", 'video', 20],
        ["Assignment: Data Preparation", 'assignment', 80],
      ]],
      ["Regression", [
        ["Linear Regression", 'video', 24],
        ["Loss Functions and Gradient Descent", 'text', 18],
        ["Assignment: Linear Regression Model", 'assignment', 120],
      ]],
      ["Classification", [
        ["Logistic Regression", 'video', 22],
        ["Decision Trees", 'video', 20],
        ["Model Evaluation Metrics", 'text', 16],
      ]],
    ]),
  },
  {
    id: 'deep-learning',
    title: "Deep Learning and Neural Networks",
    shortDescription: "Multilayer networks, convolutional models, and recurrent models.",
    description: "An advanced course covering neural network theory and practical applications with PyTorch.",
    category: 'ai',
    difficulty: 'advanced',
    durationHours: 44,
    enrolled: 1120,
    rating: 4.8,
    teacherId: 't4',
    image: img('1555255707-c07966088b7b'),
    status: 'published',
    language: "English",
    updatedAt: '2026-05-18',
    objectives: ["Understand backpropagation", "Train CNN models", "Work with sequences"],
    modules: mods('deep-learning', [
      ["Neural Networks", [["Perceptron", 'video', 18, true], ["Activation Functions", 'text', 12]]],
      ['CNN', [["Convolution", 'video', 24], ["Image Classification", 'video', 26]]],
    ]),
  },
  {
    id: 'ai-tools',
    title: "AI Tools at Work",
    shortDescription: "Use AI tools responsibly and effectively in your everyday work.",
    description: "A practical course with no prior programming knowledge required.",
    category: 'ai',
    difficulty: 'beginner',
    durationHours: 8,
    enrolled: 4120,
    rating: 4.6,
    teacherId: 't4',
    image: img('1620712943543-bcc4688e7485'),
    status: 'published',
    language: "English",
    updatedAt: '2026-10-05',
    objectives: ["Write clear prompts", "Verify the accuracy of results", "Understand ethical boundaries"],
    modules: mods('ai-tools', [
      ["Introduction", [["How Language Models Work", 'video', 14, true], ["Writing Prompts", 'text', 12]]],
    ]),
  },
  {
    id: 'linear-algebra',
    title: "Linear Algebra",
    shortDescription: "Vectors, matrices, eigenvalues, and their applications.",
    description: "Combine rigorous theory with geometric intuition through applications in data science and engineering.",
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 30,
    enrolled: 1648,
    rating: 4.7,
    teacherId: 't3',
    image: img('1635070041078-e363dbe005cb'),
    status: 'published',
    language: "English",
    updatedAt: '2026-08-01',
    objectives: ["Perform matrix operations", "Solve systems of linear equations", "Find eigenvalues and eigenvectors"],
    modules: mods('linear-algebra', [
      ["Vectors", [["Vectors and Operations", 'video', 18, true], ["Dot Product", 'text', 14], ["Quiz: Vectors and Matrices", 'quiz', 15]]],
      ["Matrices", [["Matrix Multiplication", 'video', 20], ["Determinant", 'video', 18]]],
      ["Eigenvalues", [["Eigenvectors", 'video', 22], ["Applications", 'text', 15]]],
    ]),
  },
  {
    id: 'calculus',
    title: "Calculus I",
    shortDescription: "Limits, derivatives, and integrals with clear explanations.",
    description: "A first-year university course with worked examples.",
    category: 'math',
    difficulty: 'beginner',
    durationHours: 26,
    enrolled: 2380,
    rating: 4.6,
    teacherId: 't3',
    image: img('1596495578065-6e0763fa1178'),
    status: 'published',
    language: "English",
    updatedAt: '2026-04-11',
    objectives: ["Calculate limits", "Differentiate and analyze functions", "Calculate definite integrals"],
    modules: mods('calculus', [
      ["Limits", [["Limits of Sequences", 'video', 20, true], ["Limits of Functions", 'video', 22]]],
      ["Derivatives", [["Definition of a Derivative", 'video', 18], ["Differentiation Rules", 'text', 16]]],
    ]),
  },
  {
    id: 'statistics',
    title: "Probability and Statistics",
    shortDescription: "Distributions, hypothesis testing, and confidence intervals.",
    description: "Applied statistics for data analysis and research.",
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 22,
    enrolled: 1310,
    rating: 4.5,
    teacherId: 't3',
    image: img('1543286386-713bdd548da4'),
    status: 'published',
    language: "English",
    updatedAt: '2026-07-07',
    objectives: ["Work with random variables", "Test statistical hypotheses"],
    modules: mods('statistics', [
      ["Probability", [["Events", 'video', 16, true], ["Conditional Probability", 'video', 18]]],
    ]),
  },
  {
    id: 'academic-english',
    title: "Academic English",
    shortDescription: "Read academic texts, write essays, and give presentations.",
    description: "For B1–B2 students who want to communicate confidently in an academic setting.",
    category: 'languages',
    difficulty: 'intermediate',
    durationHours: 20,
    enrolled: 1870,
    rating: 4.7,
    teacherId: 't5',
    image: img('1456513080510-7bf3a84b82f8'),
    status: 'published',
    language: "English",
    updatedAt: '2026-09-02',
    objectives: ["Structure an academic essay", "Cite sources correctly", "Present research orally"],
    modules: mods('academic-english', [
      ["Reading", [["Structure of a Research Paper", 'video', 15, true], ["Speed Reading Techniques", 'text', 12]]],
    ]),
  },
  {
    id: 'physics',
    title: "Physics: Mechanics Fundamentals",
    shortDescription: "Kinematics, Newton's laws, and energy through experiments and exercises.",
    description: "A course bridging secondary school and university physics.",
    category: 'science',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 960,
    rating: 4.5,
    teacherId: 't3',
    image: img('1636466497217-26a8cbeaf0aa'),
    status: 'published',
    language: "English",
    updatedAt: '2026-03-15',
    objectives: ["Solve kinematics problems", "Apply Newton's laws"],
    modules: mods('physics', [
      ["Kinematics", [["Describing Motion", 'video', 16, true], ["Acceleration", 'video', 18]]],
    ]),
  },
  {
    id: 'project-management',
    title: "Project Management",
    shortDescription: "Planning, risk, Agile methods, and teamwork.",
    description: "Practical tools for completing small and medium projects on time and within budget.",
    category: 'business',
    difficulty: 'beginner',
    durationHours: 14,
    enrolled: 1440,
    rating: 4.6,
    teacherId: 't5',
    image: img('1552664730-d307ca884978'),
    status: 'published',
    language: "English",
    updatedAt: '2026-08-25',
    objectives: ["Create a project plan", "Manage risks", "Apply core Scrum practices"],
    modules: mods('project-management', [
      ["Planning", [["The Project Lifecycle", 'video', 14, true], ["Work Breakdown Structure", 'text', 12]]],
    ]),
  },
];

export function getCourse(id: string | undefined): Course | undefined {
  return courses.find((c) => c.id === id);
}

export const publishedCourses = courses.filter((c) => c.status === 'published');

export function lessonCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function allLessons(course: Course) {
  return course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
}

export function findLesson(lessonId: string | undefined) {
  for (const c of courses) {
    for (const m of c.modules) {
      const l = m.lessons.find((x) => x.id === lessonId);
      if (l) return { course: c, module: m, lesson: l };
    }
  }
  return undefined;
}

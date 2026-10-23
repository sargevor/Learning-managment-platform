import type { Category, Course, LessonType, Module } from '../types';
import { tr } from '../i18n';

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
  { id: 'programming', name: tr("Programming", "Ծրագրավորում"), description: tr("Web development, apps, and algorithms", "Վեբ մշակում, հավելվածներ և ալգորիթմներ"), courseCount: 48 },
  { id: 'design', name: tr("Design", "Դիզայն"), description: tr("UX research and interfaces", "UX հետազոտություն և միջերեսներ"), courseCount: 21 },
  { id: 'math', name: tr("Mathematics", "Մաթեմատիկա"), description: tr("Calculus, algebra, and statistics", "Մաթեմատիկական անալիզ, հանրահաշիվ և վիճակագրություն"), courseCount: 26 },
  { id: 'ai', name: tr("Artificial intelligence", "Արհեստական բանականություն"), description: tr("Machine learning and deep learning", "Մեքենայական և խորը ուսուցում"), courseCount: 17 },
  { id: 'data', name: tr("Data analysis", "Տվյալների վերլուծություն"), description: tr("Python, SQL, and data visualization", "Python, SQL և տվյալների պատկերավորում"), courseCount: 19 },
  { id: 'languages', name: tr("Languages", "Լեզուներ"), description: tr("Academic and professional communication", "Ակադեմիական և գործնական հաղորդակցություն"), courseCount: 14 },
  { id: 'science', name: tr("Natural sciences", "Բնական գիտություններ"), description: tr("Physics, chemistry, and biology", "Ֆիզիկա, քիմիա և կենսաբանություն"), courseCount: 12 },
  { id: 'business', name: tr("Business and management", "Բիզնես և կառավարում"), description: tr("Projects, teams, and finance", "Նախագծեր, թիմեր և ֆինանսներ"), courseCount: 16 },
];

export const difficultyLabel = {
  beginner: tr("Beginner", "Սկսնակ"),
  intermediate: tr("Intermediate", "Միջին"),
  advanced: tr("Advanced", "Խորացված"),
} as const;

export function categoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? tr("Other", "Այլ");
}

export const courses: Course[] = [
  {
    id: 'react',
    title: tr("React: Building Modern Interfaces", "React․ ժամանակակից միջերեսների մշակում"),
    shortDescription: tr("Build React components, manage state, and use hooks to create a multi-page application.", "Բաղադրիչներ, վիճակ, hook-եր և բազմաէջ հավելվածներ՝ իրական նախագծի օրինակով։"),
    description:
      tr("Go from React fundamentals to a complete multi-page app. Each module ends with a practical assignment, and you will build an interface for managing learning projects throughout the course.", "Դասընթացը ձեզ կուղեկցի React-ի հիմնական գաղափարներից մինչև ամբողջական բազմաէջ հավելվածի ստեղծում։ Յուրաքանչյուր մոդուլ ավարտվում է գործնական առաջադրանքով, իսկ դասընթացի ընթացքում դուք կկառուցեք ուսումնական նախագծերի կառավարման միջերես։"),
    category: 'programming',
    difficulty: 'intermediate',
    durationHours: 32,
    enrolled: 1284,
    rating: 4.8,
    teacherId: 't1',
    image: img('1633356122544-f134324a6cee'),
    status: 'published',
    featured: true,
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-09-28',
    objectives: [
      tr("Build reusable components and organize their hierarchy", "Կառուցել բազմակի օգտագործման բաղադրիչներ և կազմակերպել դրանց հիերարխիան"),
      tr("Manage state with useState, useReducer, and Context", "Կառավարել վիճակը useState, useReducer և Context-ի միջոցով"),
      tr("Work with side effects and asynchronous data", "Աշխատել կողմնակի էֆեկտների և ասինխրոն տվյալների հետ"),
      tr("Create a multi-page application with React Router", "Ստեղծել բազմաէջ հավելված React Router-ով"),
      tr("Write readable, testable, and accessible UI code", "Գրել ընթեռնելի, թեստավորվող և մատչելի միջերեսի կոդ"),
    ],
    modules: mods('react', [
      [tr("React Fundamentals", "React-ի հիմունքներ"), [
        [tr("Why React? A Declarative Approach", "Ինչո՞ւ React․ դեկլարատիվ մոտեցում"), 'video', 14, true],
        [tr("JSX Syntax", "JSX-ի շարահյուսությունը"), 'text', 10, true],
        [tr("Your First Component", "Առաջին բաղադրիչը"), 'video', 18],
        [tr("Props and Data Flow", "Props և տվյալների փոխանցում"), 'video', 16],
        [tr("Quiz: Core Concepts", "Ստուգողական թեստ․ հիմնական գաղափարներ"), 'quiz', 15],
      ]],
      [tr("State and Events", "Վիճակ և իրադարձություններ"), [
        [tr("The useState Hook", "useState hook-ը"), 'video', 20],
        [tr("Handling Events", "Իրադարձությունների մշակում"), 'text', 12],
        [tr("Controlled Forms in React", "Վերահսկվող ձևաթղթեր React-ում"), 'video', 22],
        [tr("Lists and the key Attribute", "Ցուցակներ և key հատկանիշը"), 'video', 15],
        [tr("Assignment: Component Library", "Գործնական առաջադրանք․ բաղադրիչների գրադարան"), 'assignment', 90],
      ]],
      [tr("Effects and Data", "Էֆեկտներ և տվյալներ"), [
        [tr("The useEffect Lifecycle", "useEffect-ի կյանքի ցիկլը"), 'video', 24],
        [tr("Loading Asynchronous Data", "Ասինխրոն տվյալների բեռնում"), 'video', 21],
        [tr("Creating Custom Hooks", "Սեփական hook-երի ստեղծում"), 'text', 16],
        [tr("Additional Resources and Examples", "Լրացուցիչ նյութեր և օրինակներ"), 'resource', 10],
        [tr("Assignment: Form Validation with Hooks", "Առաջադրանք․ ձևաթղթի ստուգում hook-երի միջոցով"), 'assignment', 75],
      ]],
      [tr("Routing and Architecture", "Երթուղավորում և ճարտարապետություն"), [
        [tr("React Router: Routes and Layouts", "React Router․ երթուղիներ և դասավորություններ"), 'video', 26],
        [tr("Context API and Global State", "Context API և գլոբալ վիճակ"), 'video', 19],
        [tr("Folder Structure for Large Projects", "Թղթապանակների կառուցվածքը մեծ նախագծերում"), 'text', 14],
        [tr("Final Project", "Եզրափակիչ նախագիծ"), 'assignment', 180],
      ]],
    ]),
  },
  {
    id: 'js',
    title: tr("JavaScript Fundamentals", "JavaScript-ի հիմունքներ"),
    shortDescription: tr("Learn JavaScript fundamentals: variables, functions, the DOM, and asynchronous programming.", "JavaScript-ի հիմունքները զրոյից․ փոփոխականներ, ֆունկցիաներ, DOM և ասինխրոն կոդ։"),
    description:
      tr("A step-by-step introduction to JavaScript and its use in the browser. Short lessons and interactive exercises help beginners put each topic into practice.", "Սկսնակների համար նախատեսված դասընթաց, որը քայլ առ քայլ բացատրում է JavaScript լեզուն և դիտարկիչում դրա կիրառությունը։ Դասերը կարճ են, իսկ յուրաքանչյուր թեմա ամրապնդվում է ինտերակտիվ վարժություններով։"),
    category: 'programming',
    difficulty: 'beginner',
    durationHours: 24,
    enrolled: 3410,
    rating: 4.9,
    teacherId: 't1',
    image: img('1579468118864-1b9ea3c0db4a'),
    status: 'published',
    featured: true,
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-08-14',
    objectives: [
      tr("Understand data types and operators", "Հասկանալ տվյալների տիպերը և օպերատորները"),
      tr("Write functions and work with arrays", "Գրել ֆունկցիաներ և աշխատել զանգվածների հետ"),
      tr("Modify page content using the DOM", "Փոփոխել էջի բովանդակությունը DOM-ի միջոցով"),
      tr("Use Promises and async/await", "Կիրառել Promise և async/await"),
    ],
    modules: mods('js', [
      [tr("JavaScript Fundamentals", "Լեզվի հիմունքներ"), [
        [tr("Introduction and Environment Setup", "Ներածություն և միջավայրի կարգավորում"), 'video', 12, true],
        [tr("Variables and Types", "Փոփոխականներ և տիպեր"), 'video', 18, true],
        [tr("Operators and Conditions", "Օպերատորներ և պայմաններ"), 'text', 14],
      ]],
      [tr("Functions and Arrays", "Ֆունկցիաներ և զանգվածներ"), [
        [tr("Declaring Functions", "Ֆունկցիաների հայտարարում"), 'video', 20],
        [tr("Array Methods", "Զանգվածների մեթոդներ"), 'video', 22],
        [tr("Quiz: Types and Functions", "Թեստ․ տիպեր և ֆունկցիաներ"), 'quiz', 15],
      ]],
      [tr("DOM and Events", "DOM և իրադարձություններ"), [
        [tr("The DOM Tree", "DOM ծառը"), 'video', 16],
        [tr("Handling Events", "Իրադարձությունների մշակում"), 'video', 18],
        [tr("Assignment: Task List", "Առաջադրանք․ խնդիրների ցուցակ"), 'assignment', 60],
      ]],
      [tr("Asynchronous JavaScript", "Ասինխրոն JavaScript"), [
        [tr("Callbacks and Promises", "Callback և Promise"), 'video', 22],
        ['async/await', 'text', 15],
        [tr("Quiz: Asynchronous Programming", "Թեստ․ ասինխրոն ծրագրավորում"), 'quiz', 15],
        [tr("Assignment: Weather Widget", "Առաջադրանք․ եղանակի տեղեկատու"), 'assignment', 75],
      ]],
    ]),
  },
  {
    id: 'python-data',
    title: tr("Python for Data Analysis", "Python տվյալների վերլուծության համար"),
    shortDescription: tr("Use NumPy, pandas, and visualization to turn real data into insights.", "NumPy, pandas և պատկերավորում․ իրական տվյալներից մինչև եզրակացություններ։"),
    description:
      tr("Learn to clean, analyze, and present data with Python using open datasets.", "Դասընթացը նախատեսված է նրանց համար, ովքեր ցանկանում են Python-ով մաքրել, վերլուծել և ներկայացնել տվյալներ։ Աշխատանքը կատարվում է բաց տվյալների հավաքածուներով։"),
    category: 'data',
    difficulty: 'intermediate',
    durationHours: 28,
    enrolled: 1976,
    rating: 4.7,
    teacherId: 't1',
    image: img('1551288049-bebda4e38f71'),
    status: 'published',
    featured: true,
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-07-30',
    objectives: [
      tr("Import and clean tabular data with pandas", "Ներմուծել և մաքրել աղյուսակային տվյալներ pandas-ով"),
      tr("Group, merge, and summarize data", "Կատարել խմբավորում, միավորում և ամփոփում"),
      tr("Build charts that communicate data clearly", "Կառուցել տվյալները հստակ ներկայացնող գրաֆիկներ"),
      tr("Prepare an analytical report", "Պատրաստել վերլուծական զեկույց"),
    ],
    modules: mods('python-data', [
      [tr("Python Fundamentals Review", "Python-ի հիմունքների կրկնություն"), [
        [tr("Your Workspace and Jupyter", "Աշխատանքային միջավայր և Jupyter"), 'video', 15, true],
        [tr("Data Structures in Python", "Տվյալների կառուցվածքներ Python-ում"), 'text', 18],
      ]],
      [tr("NumPy and pandas", "NumPy և pandas"), [
        [tr("NumPy Arrays", "NumPy զանգվածներ"), 'video', 20],
        [tr("DataFrame Fundamentals", "DataFrame-ի հիմունքներ"), 'video', 24],
        [tr("Quiz: pandas Fundamentals", "Թեստ․ pandas-ի հիմունքներ"), 'quiz', 15],
        [tr("Assignment: Data Cleaning", "Առաջադրանք․ տվյալների մաքրում"), 'assignment', 90],
      ]],
      [tr("Data Visualization", "Տվյալների պատկերավորում"), [
        [tr("Matplotlib and Chart Types", "Matplotlib և գրաֆիկների տեսակներ"), 'video', 22],
        [tr("Choosing the Right Chart", "Ինչպես ընտրել ճիշտ գրաֆիկը"), 'text', 12],
        [tr("Assignment: Data Visualization Report", "Առաջադրանք․ պատկերավորման զեկույց"), 'assignment', 120],
      ]],
    ]),
  },
  {
    id: 'sql',
    title: tr("SQL and Database Design", "SQL և տվյալների բազաների նախագծում"),
    shortDescription: tr("Queries, joins, and normalization in relational databases.", "Հարցումներ, միացումներ և նորմալացում հարաբերական բազաներում։"),
    description:
      tr("Write efficient SQL queries, design tables, and understand how real applications organize data.", "Կսովորեք գրել արդյունավետ SQL հարցումներ, նախագծել աղյուսակներ և հասկանալ, թե ինչպես են տվյալները կազմակերպվում իրական հավելվածներում։"),
    category: 'data',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 842,
    rating: 4.6,
    teacherId: 't1',
    image: img('1544383835-bda2bc66a55d'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-10-02',
    objectives: [tr("Write SELECT queries with filters", "Գրել SELECT հարցումներ զտիչներով"), tr("Use JOINs and aggregate functions", "Կիրառել JOIN-եր և համախմբման ֆունկցիաներ"), tr("Design a normalized schema", "Նախագծել նորմալացված սխեմա")],
    modules: mods('sql', [
      [tr("Introduction", "Ներածություն"), [
        [tr("The Relational Model", "Հարաբերական մոդելը"), 'video', 14, true],
        [tr("Your First Query", "Առաջին հարցումը"), 'video', 16],
      ]],
      [tr("Queries", "Հարցումներ"), [
        ['WHERE, ORDER BY, LIMIT', 'video', 18],
        [tr("Types of JOIN", "JOIN-երի տեսակները"), 'video', 24],
        [tr("Assignment: Query Collection", "Առաջադրանք․ հարցումների հավաքածու"), 'assignment', 60],
      ]],
    ]),
  },
  {
    id: 'algorithms',
    title: tr("Algorithms and Data Structures", "Ալգորիթմներ և տվյալների կառուցվածքներ"),
    shortDescription: tr("Complexity analysis, sorting, graphs, and dynamic programming.", "Բարդության վերլուծություն, տեսակավորում, գրաֆներ և դինամիկ ծրագրավորում։"),
    description: tr("An advanced course for technical interviews and competitive programming.", "Խորացված դասընթաց՝ տեխնիկական հարցազրույցներին և մրցութային ծրագրավորմանը նախապատրաստվողների համար։"),
    category: 'programming',
    difficulty: 'advanced',
    durationHours: 40,
    enrolled: 0,
    rating: 0,
    teacherId: 't1',
    image: img('1509228468518-180dd4864904'),
    status: 'draft',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-10-11',
    objectives: [tr("Evaluate algorithm complexity", "Գնահատել ալգորիթմի բարդությունը"), tr("Apply graph algorithms", "Կիրառել գրաֆների ալգորիթմներ"), tr("Solve problems with dynamic programming", "Լուծել խնդիրներ դինամիկ ծրագրավորմամբ")],
    modules: mods('algorithms', [
      [tr("Complexity Analysis", "Բարդության վերլուծություն"), [
        [tr("Big-O Notation", "Big-O նշագրում"), 'video', 18],
        [tr("Recursion", "Ռեկուրսիա"), 'text', 20],
      ]],
    ]),
  },
  {
    id: 'ux',
    title: tr("UX/UI Design Fundamentals", "UX/UI դիզայնի հիմունքներ"),
    shortDescription: tr("User research, information architecture, and prototypes.", "Օգտատերերի հետազոտություն, տեղեկատվական ճարտարապետություն և նախատիպեր։"),
    description:
      tr("Explore the complete user experience design process, from research to a tested prototype.", "Դասընթացը ներկայացնում է օգտատիրոջ փորձի նախագծման ամբողջական գործընթացը՝ հետազոտությունից մինչև թեստավորված նախատիպ։"),
    category: 'design',
    difficulty: 'beginner',
    durationHours: 20,
    enrolled: 2207,
    rating: 4.8,
    teacherId: 't2',
    image: img('1581291518857-4e27b48ff24e'),
    status: 'published',
    featured: true,
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-09-12',
    objectives: [tr("Conduct user interviews", "Անցկացնել օգտատիրոջ հարցազրույցներ"), tr("Create personas and a user journey map", "Ստեղծել պերսոնաներ և օգտատիրոջ ճանապարհի քարտեզ"), tr("Create and test prototypes", "Ստեղծել և թեստավորել նախատիպեր")],
    modules: mods('ux', [
      [tr("What Is UX?", "Ի՞նչ է UX-ը"), [
        [tr("Design Thinking", "Դիզայնի մտածողություն"), 'video', 15, true],
        [tr("UX and UI: The Differences", "UX և UI․ տարբերությունները"), 'text', 10, true],
      ]],
      [tr("Research", "Հետազոտություն"), [
        [tr("Planning an Interview", "Հարցազրույցի պլանավորում"), 'video', 18],
        [tr("Synthesizing Findings", "Արդյունքների սինթեզ"), 'video', 20],
        [tr("Assignment: Interview Analysis", "Առաջադրանք․ հարցազրույցների վերլուծություն"), 'assignment', 90],
      ]],
      [tr("Design", "Նախագծում"), [
        [tr("User Journey Map", "Օգտատիրոջ ճանապարհի քարտեզ"), 'video', 16],
        [tr("Assignment: User Journey Map", "Առաջադրանք․ ճանապարհի քարտեզ"), 'assignment', 90],
        [tr("Quiz: Usability Principles", "Թեստ․ օգտագործելիության սկզբունքներ"), 'quiz', 12],
      ]],
      [tr("Prototypes", "Նախատիպեր"), [
        [tr("Low- and High-Fidelity Prototypes", "Ցածր և բարձր մանրամասնության նախատիպեր"), 'video', 22],
        [tr("Usability Testing", "Օգտագործելիության թեստավորում"), 'video', 20],
      ]],
    ]),
  },
  {
    id: 'figma',
    title: tr("Interface Design in Figma", "Միջերեսի նախագծում Figma-ում"),
    shortDescription: tr("Auto layout, components, and design systems.", "Auto Layout, բաղադրիչներ և դիզայն համակարգեր։"),
    description: tr("A practical course in creating consistent interfaces efficiently with Figma.", "Գործնական դասընթաց՝ Figma-ում արագ և հետևողական միջերեսներ ստեղծելու համար։"),
    category: 'design',
    difficulty: 'intermediate',
    durationHours: 16,
    enrolled: 1530,
    rating: 4.7,
    teacherId: 't2',
    image: img('1561070791-2526d30994b5'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-06-20',
    objectives: [tr("Use Auto Layout", "Օգտագործել Auto Layout"), tr("Build a component library", "Կառուցել բաղադրիչների գրադարան"), tr("Prepare designs for developer handoff", "Պատրաստել դիզայնը մշակողներին փոխանցելու համար")],
    modules: mods('figma', [
      [tr("Workspace", "Միջավայր"), [[tr("Interface Overview", "Միջերեսի ակնարկ"), 'video', 12, true], [tr("Frames and Grids", "Շրջանակներ և ցանցեր"), 'video', 15]]],
      [tr("Components", "Բաղադրիչներ"), [[tr("Variants and Properties", "Տարբերակներ և հատկություններ"), 'video', 20], [tr("Design Tokens", "Դիզայնի տոկեններ"), 'text', 14]]],
    ]),
  },
  {
    id: 'ml',
    title: tr("Introduction to Machine Learning", "Մեքենայական ուսուցման ներածություն"),
    shortDescription: tr("Regression, classification, and model evaluation with Python.", "Ռեգրեսիա, դասակարգում և մոդելի գնահատում Python-ով։"),
    description:
      tr("Understand core machine learning concepts and gain hands-on experience with scikit-learn.", "Դասընթացը տալիս է մեքենայական ուսուցման հիմնարար գաղափարների հստակ պատկերացում և գործնական հմտություններ scikit-learn գրադարանով։"),
    category: 'ai',
    difficulty: 'intermediate',
    durationHours: 36,
    enrolled: 2894,
    rating: 4.9,
    teacherId: 't4',
    image: img('1677442136019-21780ecad995'),
    status: 'published',
    featured: true,
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-09-30',
    objectives: [tr("Distinguish supervised and unsupervised learning", "Տարբերակել վերահսկվող և չվերահսկվող ուսուցումը"), tr("Build regression and classification models", "Կառուցել ռեգրեսիայի և դասակարգման մոդելներ"), tr("Evaluate models with appropriate metrics", "Գնահատել մոդելը համապատասխան ցուցանիշներով")],
    modules: mods('ml', [
      [tr("Core Concepts", "Հիմնական գաղափարներ"), [
        [tr("What Is Machine Learning?", "Ի՞նչ է մեքենայական ուսուցումը"), 'video', 16, true],
        [tr("Data, Features, and Labels", "Տվյալներ, հատկանիշներ, պիտակներ"), 'text', 12, true],
        [tr("Quiz: Terminology", "Թեստ․ տերմինաբանություն"), 'quiz', 12],
      ]],
      [tr("Data Preparation", "Տվյալների նախապատրաստում"), [
        [tr("Missing Values", "Բացակայող արժեքներ"), 'video', 18],
        [tr("Normalization and Encoding", "Նորմավորում և կոդավորում"), 'video', 20],
        [tr("Assignment: Data Preparation", "Առաջադրանք․ տվյալների նախապատրաստում"), 'assignment', 80],
      ]],
      [tr("Regression", "Ռեգրեսիա"), [
        [tr("Linear Regression", "Գծային ռեգրեսիա"), 'video', 24],
        [tr("Loss Functions and Gradient Descent", "Կորստի ֆունկցիաներ և գրադիենտային վայրէջք"), 'text', 18],
        [tr("Assignment: Linear Regression Model", "Առաջադրանք․ գծային ռեգրեսիայի մոդել"), 'assignment', 120],
      ]],
      [tr("Classification", "Դասակարգում"), [
        [tr("Logistic Regression", "Լոգիստիկ ռեգրեսիա"), 'video', 22],
        [tr("Decision Trees", "Որոշումների ծառեր"), 'video', 20],
        [tr("Model Evaluation Metrics", "Մոդելի գնահատման ցուցանիշներ"), 'text', 16],
      ]],
    ]),
  },
  {
    id: 'deep-learning',
    title: tr("Deep Learning and Neural Networks", "Խորը ուսուցում և նեյրոնային ցանցեր"),
    shortDescription: tr("Multilayer networks, convolutional models, and recurrent models.", "Բազմաշերտ ցանցեր, փաթույթային և ռեկուրենտ մոդելներ։"),
    description: tr("An advanced course covering neural network theory and practical applications with PyTorch.", "Խորացված դասընթաց՝ նեյրոնային ցանցերի տեսության և PyTorch-ով կիրառության մասին։"),
    category: 'ai',
    difficulty: 'advanced',
    durationHours: 44,
    enrolled: 1120,
    rating: 4.8,
    teacherId: 't4',
    image: img('1555255707-c07966088b7b'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-05-18',
    objectives: [tr("Understand backpropagation", "Հասկանալ հետադարձ տարածումը"), tr("Train CNN models", "Ուսուցանել CNN մոդելներ"), tr("Work with sequences", "Աշխատել հաջորդականությունների հետ")],
    modules: mods('deep-learning', [
      [tr("Neural Networks", "Նեյրոնային ցանցեր"), [[tr("Perceptron", "Պերցեպտրոն"), 'video', 18, true], [tr("Activation Functions", "Ակտիվացման ֆունկցիաներ"), 'text', 12]]],
      ['CNN', [[tr("Convolution", "Փաթույթ (convolution)"), 'video', 24], [tr("Image Classification", "Պատկերների դասակարգում"), 'video', 26]]],
    ]),
  },
  {
    id: 'ai-tools',
    title: tr("AI Tools at Work", "Արհեստական բանականության գործիքներն աշխատանքում"),
    shortDescription: tr("Use AI tools responsibly and effectively in your everyday work.", "Ինչպես պատասխանատու և արդյունավետ կիրառել արհեստական բանականության գործիքներն ամենօրյա աշխատանքում։"),
    description: tr("A practical course with no prior programming knowledge required.", "Գործնական դասընթաց՝ առանց ծրագրավորման նախնական գիտելիքների։"),
    category: 'ai',
    difficulty: 'beginner',
    durationHours: 8,
    enrolled: 4120,
    rating: 4.6,
    teacherId: 't4',
    image: img('1620712943543-bcc4688e7485'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-10-05',
    objectives: [tr("Write clear prompts", "Ձևակերպել հստակ հարցումներ"), tr("Verify the accuracy of results", "Ստուգել արդյունքների ճշգրտությունը"), tr("Understand ethical boundaries", "Հասկանալ էթիկական սահմանները")],
    modules: mods('ai-tools', [
      [tr("Introduction", "Ներածություն"), [[tr("How Language Models Work", "Ինչպես են աշխատում լեզվական մոդելները"), 'video', 14, true], [tr("Writing Prompts", "Հարցումների ձևակերպում"), 'text', 12]]],
    ]),
  },
  {
    id: 'linear-algebra',
    title: tr("Linear Algebra", "Գծային հանրահաշիվ"),
    shortDescription: tr("Vectors, matrices, eigenvalues, and their applications.", "Վեկտորներ, մատրիցներ, սեփական արժեքներ և դրանց կիրառությունները։"),
    description: tr("Combine rigorous theory with geometric intuition through applications in data science and engineering.", "Դասընթացը համատեղում է խիստ տեսությունը և երկրաչափական ներըմբռնումը՝ տվյալագիտության և ճարտարագիտության կիրառություններով։"),
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 30,
    enrolled: 1648,
    rating: 4.7,
    teacherId: 't3',
    image: img('1635070041078-e363dbe005cb'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-08-01',
    objectives: [tr("Perform matrix operations", "Կատարել գործողություններ մատրիցների հետ"), tr("Solve systems of linear equations", "Լուծել գծային հավասարումների համակարգեր"), tr("Find eigenvalues and eigenvectors", "Գտնել սեփական արժեքներ և վեկտորներ")],
    modules: mods('linear-algebra', [
      [tr("Vectors", "Վեկտորներ"), [[tr("Vectors and Operations", "Վեկտորներ և գործողություններ"), 'video', 18, true], [tr("Dot Product", "Սկալյար արտադրյալ"), 'text', 14], [tr("Quiz: Vectors and Matrices", "Թեստ․ վեկտորներ և մատրիցներ"), 'quiz', 15]]],
      [tr("Matrices", "Մատրիցներ"), [[tr("Matrix Multiplication", "Մատրիցների բազմապատկում"), 'video', 20], [tr("Determinant", "Որոշիչ"), 'video', 18]]],
      [tr("Eigenvalues", "Սեփական արժեքներ"), [[tr("Eigenvectors", "Սեփական վեկտորներ"), 'video', 22], [tr("Applications", "Կիրառություններ"), 'text', 15]]],
    ]),
  },
  {
    id: 'calculus',
    title: tr("Calculus I", "Մաթեմատիկական անալիզ I"),
    shortDescription: tr("Limits, derivatives, and integrals with clear explanations.", "Սահմաններ, ածանցյալներ և ինտեգրալներ՝ պարզ բացատրություններով։"),
    description: tr("A first-year university course with worked examples.", "Բուհական առաջին կուրսի ծրագրին համապատասխան դասընթաց՝ լուծված օրինակներով։"),
    category: 'math',
    difficulty: 'beginner',
    durationHours: 26,
    enrolled: 2380,
    rating: 4.6,
    teacherId: 't3',
    image: img('1596495578065-6e0763fa1178'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-04-11',
    objectives: [tr("Calculate limits", "Հաշվել սահմաններ"), tr("Differentiate and analyze functions", "Ածանցել և ուսումնասիրել ֆունկցիաներ"), tr("Calculate definite integrals", "Հաշվել որոշյալ ինտեգրալներ")],
    modules: mods('calculus', [
      [tr("Limits", "Սահմաններ"), [[tr("Limits of Sequences", "Հաջորդականության սահման"), 'video', 20, true], [tr("Limits of Functions", "Ֆունկցիայի սահման"), 'video', 22]]],
      [tr("Derivatives", "Ածանցյալ"), [[tr("Definition of a Derivative", "Ածանցյալի սահմանումը"), 'video', 18], [tr("Differentiation Rules", "Ածանցման կանոններ"), 'text', 16]]],
    ]),
  },
  {
    id: 'statistics',
    title: tr("Probability and Statistics", "Հավանականություն և վիճակագրություն"),
    shortDescription: tr("Distributions, hypothesis testing, and confidence intervals.", "Բաշխումներ, վարկածների ստուգում և վստահության միջակայքեր։"),
    description: tr("Applied statistics for data analysis and research.", "Կիրառական վիճակագրություն՝ տվյալների վերլուծության և հետազոտությունների համար։"),
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 22,
    enrolled: 1310,
    rating: 4.5,
    teacherId: 't3',
    image: img('1543286386-713bdd548da4'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-07-07',
    objectives: [tr("Work with random variables", "Աշխատել պատահական մեծությունների հետ"), tr("Test statistical hypotheses", "Ստուգել վիճակագրական վարկածներ")],
    modules: mods('statistics', [
      [tr("Probability", "Հավանականություն"), [[tr("Events", "Պատահույթներ"), 'video', 16, true], [tr("Conditional Probability", "Պայմանական հավանականություն"), 'video', 18]]],
    ]),
  },
  {
    id: 'academic-english',
    title: tr("Academic English", "Ակադեմիական անգլերեն"),
    shortDescription: tr("Read academic texts, write essays, and give presentations.", "Գիտական տեքստերի ընթերցում, էսսեների գրում և ներկայացումներ։"),
    description: tr("For B1–B2 students who want to communicate confidently in an academic setting.", "B1–B2 մակարդակի ուսանողների համար՝ ակադեմիական միջավայրում վստահ հաղորդակցվելու նպատակով։"),
    category: 'languages',
    difficulty: 'intermediate',
    durationHours: 20,
    enrolled: 1870,
    rating: 4.7,
    teacherId: 't5',
    image: img('1456513080510-7bf3a84b82f8'),
    status: 'published',
    language: tr("Armenian / English", "Հայերեն / անգլերեն"),
    updatedAt: '2026-09-02',
    objectives: [tr("Structure an academic essay", "Կառուցել ակադեմիական էսսե"), tr("Cite sources correctly", "Ճիշտ հղումներ կատարել աղբյուրներին"), tr("Present research orally", "Բանավոր ներկայացնել հետազոտությունը")],
    modules: mods('academic-english', [
      [tr("Reading", "Ընթերցում"), [[tr("Structure of a Research Paper", "Գիտական հոդվածի կառուցվածքը"), 'video', 15, true], [tr("Speed Reading Techniques", "Արագ ընթերցման տեխնիկաներ"), 'text', 12]]],
    ]),
  },
  {
    id: 'physics',
    title: tr("Physics: Mechanics Fundamentals", "Ֆիզիկա․ մեխանիկայի հիմունքներ"),
    shortDescription: tr("Kinematics, Newton's laws, and energy through experiments and exercises.", "Կինեմատիկա, Նյուտոնի օրենքներ և էներգիա՝ փորձերով և խնդիրներով։"),
    description: tr("A course bridging secondary school and university physics.", "Դասընթաց, որը կամուրջ է դպրոցական և բուհական ֆիզիկայի միջև։"),
    category: 'science',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 960,
    rating: 4.5,
    teacherId: 't3',
    image: img('1636466497217-26a8cbeaf0aa'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-03-15',
    objectives: [tr("Solve kinematics problems", "Լուծել կինեմատիկայի խնդիրներ"), tr("Apply Newton's laws", "Կիրառել Նյուտոնի օրենքները")],
    modules: mods('physics', [
      [tr("Kinematics", "Կինեմատիկա"), [[tr("Describing Motion", "Շարժման նկարագրությունը"), 'video', 16, true], [tr("Acceleration", "Արագացում"), 'video', 18]]],
    ]),
  },
  {
    id: 'project-management',
    title: tr("Project Management", "Նախագծերի կառավարում"),
    shortDescription: tr("Planning, risk, Agile methods, and teamwork.", "Պլանավորում, ռիսկեր, Agile մեթոդներ և թիմային աշխատանք։"),
    description: tr("Practical tools for completing small and medium projects on time and within budget.", "Գործնական գործիքներ՝ փոքր և միջին նախագծերը ժամանակին և բյուջեի սահմաններում ավարտելու համար։"),
    category: 'business',
    difficulty: 'beginner',
    durationHours: 14,
    enrolled: 1440,
    rating: 4.6,
    teacherId: 't5',
    image: img('1552664730-d307ca884978'),
    status: 'published',
    language: tr("Armenian", "Հայերեն"),
    updatedAt: '2026-08-25',
    objectives: [tr("Create a project plan", "Կազմել նախագծի պլան"), tr("Manage risks", "Կառավարել ռիսկերը"), tr("Apply core Scrum practices", "Կիրառել Scrum-ի հիմնական գործելակերպերը")],
    modules: mods('project-management', [
      [tr("Planning", "Պլանավորում"), [[tr("The Project Lifecycle", "Նախագծի կյանքի ցիկլը"), 'video', 14, true], [tr("Work Breakdown Structure", "Աշխատանքների տրոհման կառուցվածք"), 'text', 12]]],
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

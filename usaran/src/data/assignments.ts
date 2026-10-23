import type { Assignment, AssignmentStatus, Submission } from '../types';
import { DEMO_STUDENT_ID, students } from './users';
import { TODAY } from '../lib/format';
import { tr } from '../i18n';

export const assignments: Assignment[] = [
  {
    id: 'a-react-components',
    courseId: 'react',
    title: tr("Component Library", "Բաղադրիչների գրադարան"),
    summary: tr("Build 6 reusable UI components and document how to use them.", "Ստեղծեք միջերեսի 6 բազմակի օգտագործման բաղադրիչ և նկարագրեք դրանց կիրառությունը։"),
    instructions: [
      tr("Create Button, Input, Select, Badge, Card, and Modal components.", "Ստեղծեք Button, Input, Select, Badge, Card և Modal բաղադրիչները։"),
      tr("Each component should accept size and variant props.", "Յուրաքանչյուր բաղադրիչ պետք է ընդունի props՝ չափի և տարբերակի համար։"),
      tr("Write a short README with usage examples.", "Կազմեք կարճ README՝ կիրառության օրինակներով։"),
      tr("Explain your decisions in the answer field and link to your repository.", "Պատասխանի դաշտում նկարագրեք ձեր որոշումները և հղում տվեք պահոցին։"),
    ],
    requirements: [tr("TypeScript types for all props", "TypeScript տիպեր բոլոր props-երի համար"), tr("Keyboard accessibility", "Ստեղնաշարով հասանելիություն"), tr("No external UI libraries", "Առանց արտաքին UI գրադարանների"), tr("Up to 600 lines of code", "Կոդի ծավալը՝ մինչև 600 տող")],
    dueDate: '2026-10-18T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-29',
  },
  {
    id: 'a-react-forms',
    courseId: 'react',
    title: tr("Form Validation with Hooks", "Ձևաթղթի ստուգում hook-երի միջոցով"),
    summary: tr("Write a custom useForm hook to manage field values and errors.", "Գրեք սեփական useForm hook, որը կառավարում է դաշտերի արժեքներն ու սխալները։"),
    instructions: [
      tr("Create a useForm hook with initial values and validation rules.", "Ստեղծեք useForm hook՝ սկզբնական արժեքներով և ստուգման կանոններով։"),
      tr("Use it in a registration form with 5 fields.", "Կիրառեք այն գրանցման ձևաթղթում՝ 5 դաշտով։"),
      tr("Display errors below each field after it loses focus.", "Սխալները ցուցադրեք դաշտի տակ՝ դաշտից դուրս գալուց հետո։"),
    ],
    requirements: [tr("No external libraries", "Առանց արտաքին գրադարանների"), tr("At least 3 validation rules", "Ստուգման առնվազն 3 կանոն"), tr("Clear error messages", "Սխալների հստակ հաղորդագրություններ")],
    dueDate: '2026-10-25T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'a-react-router',
    courseId: 'react',
    title: tr("Multi-page App with React Router", "React Router-ով բազմաէջ հավելված"),
    summary: tr("Build a 4-page application with nested layouts and dynamic routes.", "Կառուցեք 4 էջանոց հավելված՝ ներդրված դասավորություններով և դինամիկ երթուղիներով։"),
    instructions: [tr("Define a shared layout with a navigation panel.", "Սահմանեք ընդհանուր դասավորություն՝ նավարկման վահանակով։"), tr("Add a dynamic route with an :id parameter.", "Ավելացրեք դինամիկ երթուղի՝ :id պարամետրով։"), tr("Handle pages that do not exist.", "Մշակեք գոյություն չունեցող էջի դեպքը։")],
    requirements: ['React Router 6', tr("Highlight the active link", "Ակտիվ հղման ընդգծում"), tr("Loading states", "Բեռնման վիճակներ")],
    dueDate: '2026-11-05T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-12',
  },
  {
    id: 'a-js-dom',
    courseId: 'js',
    title: tr("Working with the DOM: Task List", "DOM-ի հետ աշխատանք․ խնդիրների ցուցակ"),
    summary: tr("Create a task list with add, complete, and filter features.", "Ստեղծեք խնդիրների ցուցակ՝ ավելացման, նշման և զտման հնարավորությամբ։"),
    instructions: [tr("Implement adding and deleting tasks.", "Իրականացրեք խնդիրների ավելացումն ու ջնջումը։"), tr("Add a completed status.", "Ավելացրեք «ավարտված» նշումը։"), tr("Add filters for all, active, and completed tasks.", "Ավելացրեք զտիչներ՝ «Բոլորը», «Ակտիվ», «Ավարտված»։")],
    requirements: [tr("Plain JavaScript only", "Միայն մաքուր JavaScript"), tr("Event delegation", "Իրադարձությունների պատվիրակում")],
    dueDate: '2026-07-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-07-06',
  },
  {
    id: 'a-js-async',
    courseId: 'js',
    title: tr("Async Weather Widget", "Եղանակի տեղեկատու՝ ասինխրոն կոդով"),
    summary: tr("Build a widget that displays sample data loaded from a local file.", "Կառուցեք եղանակի տեղեկատու, որը ցուցադրում է տեղական ֆայլից բեռնված նմուշային տվյալներ։"),
    instructions: [tr("Use async/await.", "Օգտագործեք async/await։"), tr("Display loading and error states.", "Ցուցադրեք բեռնման և սխալի վիճակները։")],
    requirements: [tr("Error handling with try/catch", "Սխալների մշակում try/catch-ով"), tr("Readable code", "Ընթեռնելի կոդ")],
    dueDate: '2026-08-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'a-py-cleaning',
    courseId: 'python-data',
    title: tr("Data Cleaning with pandas", "Տվյալների մաքրում pandas-ով"),
    summary: tr("Clean the sample Yerevan public transport data and summarize your findings.", "Մաքրեք Երևանի հանրային տրանսպորտի նմուշային տվյալները և ամփոփեք արդյունքները։"),
    instructions: [tr("Identify and handle missing values.", "Հայտնաբերեք և մշակեք բացակայող արժեքները։"), tr("Correct data types and remove duplicates.", "Ուղղեք տվյալների տիպերը և հեռացրեք կրկնությունները։"), tr("Present 3 findings.", "Ներկայացրեք 3 եզրակացություն։")],
    requirements: ['Jupyter notebook', tr("Commented code", "Մեկնաբանված կոդ")],
    dueDate: '2026-07-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-06-25',
  },
  {
    id: 'a-py-viz',
    courseId: 'python-data',
    title: tr("Data Visualization Report", "Տվյալների պատկերավորման զեկույց"),
    summary: tr("Prepare a report with 5 charts using an open dataset of your choice.", "Պատրաստեք 5 գրաֆիկից բաղկացած զեկույց ձեր ընտրած բաց տվյալների հիման վրա։"),
    instructions: [tr("Choose a dataset.", "Ընտրեք տվյալների հավաքածու։"), tr("Create 5 different types of charts.", "Կառուցեք 5 տարբեր տեսակի գրաֆիկ։"), tr("Include a brief explanation for each chart.", "Յուրաքանչյուր գրաֆիկին կցեք կարճ մեկնաբանություն։")],
    requirements: [tr("Axis labels", "Առանցքների պիտակներ"), tr("Accessible color palette", "Մատչելի գունապնակ")],
    dueDate: '2026-08-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'a-sql-queries',
    courseId: 'sql',
    title: tr("Query Collection", "Հարցումների հավաքածու"),
    summary: tr("Write 10 SQL queries for the sample library schema.", "Գրեք 10 SQL հարցում գրադարանի նմուշային սխեմայի համար։"),
    instructions: [tr("Use at least 3 types of JOIN.", "Օգտագործեք առնվազն 3 տեսակի JOIN։"), tr("Use GROUP BY and HAVING.", "Կիրառեք GROUP BY և HAVING։")],
    requirements: [tr("A short explanation for each query", "Յուրաքանչյուր հարցման համար՝ կարճ բացատրություն")],
    dueDate: '2026-10-20T23:59',
    maxScore: 50,
    allowFiles: true,
    createdAt: '2026-10-03',
  },
  {
    id: 'a-ux-interviews',
    courseId: 'ux',
    title: tr("Interview Analysis", "Հարցազրույցների վերլուծություն"),
    summary: tr("Conduct 3 interviews and present a synthesis of your findings.", "Անցկացրեք 3 հարցազրույց և ներկայացրեք սինթեզի արդյունքները։"),
    instructions: [tr("Prepare an interview guide.", "Կազմեք հարցազրույցի ուղեցույց։"), tr("Conduct and document 3 interviews.", "Անցկացրեք և արձանագրեք 3 հարցազրույց։"), tr("Group your observations by theme.", "Խմբավորեք դիտարկումները թեմաներով։")],
    requirements: [tr("Participant consent", "Մասնակիցների համաձայնություն"), tr("Anonymous data", "Անանուն տվյալներ")],
    dueDate: '2026-09-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-14',
  },
  {
    id: 'a-ux-journey',
    courseId: 'ux',
    title: tr("User Journey Map", "Օգտատիրոջ ճանապարհի քարտեզ"),
    summary: tr("Map the experience of ordering a book from an online library.", "Կառուցեք ճանապարհի քարտեզ՝ առցանց գրադարանից գիրք պատվիրելու սցենարի համար։"),
    instructions: [tr("Define your persona.", "Սահմանեք պերսոնան։"), tr("Describe the stages, actions, and feelings.", "Նկարագրեք փուլերը, գործողությունները և զգացողությունները։"), tr("Identify 3 opportunities for improvement.", "Առանձնացրեք 3 բարելավման հնարավորություն։")],
    requirements: [tr("PDF or image", "PDF կամ պատկեր"), tr("Link to the source file", "Հղում սկզբնական ֆայլին")],
    dueDate: '2026-10-12T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-28',
  },
  {
    id: 'a-ml-prep',
    courseId: 'ml',
    title: tr("Data Preparation", "Տվյալների նախապատրաստում"),
    summary: tr("Prepare the sample housing price data for modeling.", "Նախապատրաստեք բնակարանների գների նմուշային տվյալները մոդելավորման համար։"),
    instructions: [tr("Handle missing values.", "Մշակեք բացակայող արժեքները։"), tr("Encode categorical features.", "Կոդավորեք կատեգորիկ հատկանիշները։"), tr("Normalize numeric features.", "Նորմավորեք թվային հատկանիշները։")],
    requirements: ['scikit-learn Pipeline', tr("Brief summary of results", "Արդյունքների համառոտ նկարագրություն")],
    dueDate: '2026-10-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-26',
  },
  {
    id: 'a-ml-regression',
    courseId: 'ml',
    title: tr("Linear Regression Model", "Գծային ռեգրեսիայի մոդել"),
    summary: tr("Train and evaluate a linear regression model using the prepared data.", "Ուսուցանեք և գնահատեք գծային ռեգրեսիայի մոդել նախապատրաստված տվյալներով։"),
    instructions: [tr("Split the data into training and test sets.", "Բաժանեք տվյալներն ուսուցման և թեստային մասերի։"), tr("Train the model.", "Ուսուցանեք մոդելը։"), tr("Calculate MAE and R² and interpret the results.", "Հաշվեք MAE և R² ցուցանիշները և մեկնաբանեք արդյունքները։")],
    requirements: [tr("Reproducible results (random_state)", "Վերարտադրելի արդյունքներ (random_state)"), tr("Chart of predicted and actual values", "Գրաֆիկ՝ կանխատեսված և իրական արժեքներով")],
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
    answer: tr("I organized shared component styles using CSS variables. Button has three variants: primary, secondary, and ghost.", "Բաղադրիչների ընդհանուր ոճերը կազմակերպել եմ CSS փոփոխականներով։ Button-ն ունի երեք տարբերակ՝ primary, secondary և ghost։"),
    attachments: [{ name: 'components-readme.md', sizeKb: 12 }],
  },
  {
    id: 'sub-s1-ux-journey',
    assignmentId: 'a-ux-journey',
    studentId: DEMO_STUDENT_ID,
    status: 'submitted',
    submittedAt: '2026-10-12T21:40',
    answer: tr("The persona is a 34-year-old teacher who orders books in the evening. Her main difficulty is uncertainty about delivery times.", "Պերսոնան 34 տարեկան ուսուցչուհի է, որն երեկոյան ժամերին գրքեր է պատվիրում։ Նրա հիմնական դժվարությունն առաքման ժամկետների անորոշությունն է։"),
    attachments: [{ name: 'journey-map.pdf', sizeKb: 1840 }],
  },
  {
    id: 'sub-s1-ux-interviews',
    assignmentId: 'a-ux-interviews',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-09-29T18:12',
    answer: tr("I conducted 3 interviews and identified 4 key themes: trust, speed, search, and delivery.", "Անցկացրել եմ 3 հարցազրույց և առանձնացրել 4 հիմնական թեմա՝ վստահություն, արագություն, որոնում և առաքում։"),
    attachments: [{ name: 'interview-synthesis.pdf', sizeKb: 920 }],
    score: 88,
    feedback: tr("The synthesis is well organized and the themes are clear. Next time, include participant quotes to support your conclusions.", "Սինթեզը լավ կառուցված է, թեմաները հստակ են։ Հաջորդ անգամ ավելացրեք մասնակիցների մեջբերումներ՝ եզրակացություններն ավելի համոզիչ դարձնելու համար։"),
    gradedAt: '2026-10-03T11:00',
  },
  {
    id: 'sub-s1-js-dom',
    assignmentId: 'a-js-dom',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-18T20:05',
    answer: tr("Adding, deleting, completing, and filtering tasks are implemented. I used event delegation on the list.", "Իրականացրել եմ խնդիրների ավելացումը, ջնջումը, նշումը և զտումը։ Ցուցակի վրա օգտագործել եմ իրադարձությունների պատվիրակում։"),
    attachments: [{ name: 'todo-app.zip', sizeKb: 46 }],
    score: 95,
    feedback: tr("Excellent work. The code is clean and the filters work perfectly.", "Գերազանց աշխատանք։ Կոդը մաքուր է, իսկ զտիչներն աշխատում են անթերի։"),
    gradedAt: '2026-07-21T10:20',
  },
  {
    id: 'sub-s1-js-async',
    assignmentId: 'a-js-async',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-29T22:47',
    answer: tr("The widget displays loading, error, and success states.", "Տեղեկատուն ցուցադրում է բեռնման, սխալի և հաջող ավարտի վիճակները։"),
    attachments: [{ name: 'weather-widget.zip', sizeKb: 58 }],
    score: 90,
    feedback: tr("Good error handling. The repeated code could be extracted into a separate function.", "Սխալի վիճակը լավ է մշակված։ Կրկնվող կոդը կարելի էր առանձնացնել առանձին ֆունկցիայի մեջ։"),
    gradedAt: '2026-09-01T09:30',
  },
  {
    id: 'sub-s1-py-cleaning',
    assignmentId: 'a-py-cleaning',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-09T17:00',
    answer: tr("Cleaned 12,450 rows and removed 318 duplicates.", "Մաքրվել է 12 450 տող, հեռացվել է 318 կրկնություն։"),
    attachments: [{ name: 'transport-cleaning.ipynb', sizeKb: 410 }],
    score: 84,
    feedback: tr("Good work. One conclusion needs stronger support from the data.", "Լավ աշխատանք։ Եզրակացություններից մեկը բավարար չափով հիմնավորված չէ տվյալներով։"),
    gradedAt: '2026-07-13T12:10',
  },
  {
    id: 'sub-s1-py-viz',
    assignmentId: 'a-py-viz',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-19T23:10',
    answer: tr("The report includes 5 charts about tourism in Armenia.", "Զեկույցը ներառում է 5 գրաֆիկ Հայաստանի զբոսաշրջության տվյալների վերաբերյալ։"),
    attachments: [{ name: 'tourism-report.pdf', sizeKb: 2310 }],
    score: 91,
    feedback: tr("The charts are clear and well chosen. Thank you for the detailed explanations.", "Գրաֆիկները հստակ են և ճիշտ ընտրված։ Շնորհակալություն մանրակրկիտ մեկնաբանությունների համար։"),
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
  tr("I completed the work according to the requirements. Validation took the most time; I eventually separated it into individual functions.", "Աշխատանքը կատարել եմ ըստ պահանջների։ Ամենաշատ ժամանակը խլեց ստուգման տրամաբանությունը, որը վերջում առանձնացրի առանձին ֆունկցիաների մեջ։"),
  tr("I have attached the project archive. My answer describes its structure and the areas where I would appreciate feedback.", "Կցում եմ նախագծի արխիվը։ Պատասխանի դաշտում նկարագրել եմ կառուցվածքը և այն մասերը, որոնց վերաբերյալ կցանկանայի ստանալ կարծիք։"),
  tr("I divided the solution into a data layer, UI, and helper functions. The README includes setup instructions.", "Լուծումը բաժանել եմ երեք մասի՝ տվյալների շերտ, միջերես և օժանդակ ֆունկցիաներ։ README ֆայլում կա գործարկման նկարագրություն։"),
  tr("I completed every requirement except the final optional one, which I did not have time to finish.", "Կատարել եմ բոլոր կետերը, բացի վերջին լրացուցիչ պահանջից, որի համար ժամանակս չբավականացրեց։"),
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
        feedback: graded ? tr("The work meets the requirements. See the code for detailed feedback.", "Աշխատանքը համապատասխանում է պահանջներին։ Մանրամասն մեկնաբանությունները տեսեք կոդում։") : undefined,
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

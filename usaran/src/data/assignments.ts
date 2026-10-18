import type { Assignment, AssignmentStatus, Submission } from '../types';
import { DEMO_STUDENT_ID, students } from './users';
import { TODAY } from '../lib/format';

export const assignments: Assignment[] = [
  {
    id: 'a-react-components',
    courseId: 'react',
    title: 'Կոմպոնենտների գրադարան',
    summary: 'Ստեղծեք ինտերֆեյսի 6 վերօգտագործվող կոմպոնենտ և փաստաթղթավորեք դրանց կիրառությունը։',
    instructions: [
      'Ստեղծեք Button, Input, Select, Badge, Card և Modal կոմպոնենտները։',
      'Յուրաքանչյուր կոմպոնենտ պետք է ընդունի props՝ չափի և տարբերակի համար։',
      'Կազմեք կարճ README՝ կիրառության օրինակներով։',
      'Պատասխանի դաշտում նկարագրեք ձեր որոշումները և հղում տվեք պահոցին։',
    ],
    requirements: ['TypeScript տիպեր բոլոր props-երի համար', 'Ստեղնաշարով հասանելիություն', 'Առանց արտաքին UI գրադարանների', 'Կոդի ծավալը՝ մինչև 600 տող'],
    dueDate: '2026-10-18T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-29',
  },
  {
    id: 'a-react-forms',
    courseId: 'react',
    title: 'Ձևաթղթի վալիդացիա hook-երով',
    summary: 'Գրեք useForm սեփական hook, որը կառավարում է դաշտերի արժեքները և սխալները։',
    instructions: [
      'Ստեղծեք useForm hook՝ սկզբնական արժեքներով և վալիդացիայի կանոններով։',
      'Կիրառեք այն գրանցման ձևաթղթում՝ 5 դաշտով։',
      'Սխալները ցուցադրեք դաշտի տակ՝ դաշտից դուրս գալուց հետո։',
    ],
    requirements: ['Առանց արտաքին գրադարանների', 'Առնվազն 3 տեսակի վալիդացիա', 'Մատչելի սխալի հաղորդագրություններ'],
    dueDate: '2026-10-25T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'a-react-router',
    courseId: 'react',
    title: 'React Router-ով բազմաէջ հավելված',
    summary: 'Կառուցեք 4 էջանոց հավելված՝ ներդրված դասավորություններով և դինամիկ երթուղիներով։',
    instructions: ['Սահմանեք ընդհանուր դասավորություն՝ նավարկման վահանակով։', 'Ավելացրեք դինամիկ երթուղի՝ :id պարամետրով։', 'Մշակեք գոյություն չունեցող էջի դեպքը։'],
    requirements: ['React Router 6', 'Ակտիվ հղման ընդգծում', 'Բեռնման վիճակներ'],
    dueDate: '2026-11-05T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-10-12',
  },
  {
    id: 'a-js-dom',
    courseId: 'js',
    title: 'DOM-ի հետ աշխատանք. խնդիրների ցուցակ',
    summary: 'Ստեղծեք խնդիրների ցուցակ՝ ավելացման, նշման և զտման հնարավորությամբ։',
    instructions: ['Իրականացրեք խնդրի ավելացում և ջնջում։', 'Ավելացրեք «ավարտված» նշումը։', 'Ավելացրեք զտիչներ՝ բոլորը, ակտիվ, ավարտված։'],
    requirements: ['Միայն մաքուր JavaScript', 'Իրադարձությունների պատվիրակում'],
    dueDate: '2026-07-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-07-06',
  },
  {
    id: 'a-js-async',
    courseId: 'js',
    title: 'Եղանակի վիդջեթ ասինխրոն կոդով',
    summary: 'Կառուցեք վիդջեթ, որը ցուցադրում է տեղական ֆայլից բեռնված օրինակային տվյալներ։',
    instructions: ['Օգտագործեք async/await։', 'Ցուցադրեք բեռնման և սխալի վիճակները։'],
    requirements: ['Սխալների մշակում try/catch-ով', 'Ընթեռնելի կոդ'],
    dueDate: '2026-08-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'a-py-cleaning',
    courseId: 'python-data',
    title: 'Տվյալների մաքրում pandas-ով',
    summary: 'Մաքրեք Երևանի հանրային տրանսպորտի օրինակային տվյալները և ամփոփեք արդյունքները։',
    instructions: ['Հայտնաբերեք և մշակեք բացակայող արժեքները։', 'Ուղղեք տիպերը և կրկնությունները։', 'Ներկայացրեք 3 եզրակացություն։'],
    requirements: ['Jupyter notebook', 'Մեկնաբանված կոդ'],
    dueDate: '2026-07-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-06-25',
  },
  {
    id: 'a-py-viz',
    courseId: 'python-data',
    title: 'Վիզուալիզացիայի զեկույց',
    summary: 'Պատրաստեք 5 գրաֆիկից բաղկացած զեկույց ձեր ընտրած բաց տվյալների հիման վրա։',
    instructions: ['Ընտրեք տվյալների հավաքածու։', 'Կառուցեք 5 տարբեր տեսակի գրաֆիկ։', 'Յուրաքանչյուր գրաֆիկին կցեք կարճ մեկնաբանություն։'],
    requirements: ['Առանցքների պիտակներ', 'Հասանելի գունապնակ'],
    dueDate: '2026-08-20T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'a-sql-queries',
    courseId: 'sql',
    title: 'Հարցումների հավաքածու',
    summary: 'Գրեք 10 SQL հարցում գրադարանի օրինակային սխեմայի համար։',
    instructions: ['Օգտագործեք առնվազն 3 տեսակի JOIN։', 'Կիրառեք GROUP BY և HAVING։'],
    requirements: ['Յուրաքանչյուր հարցման համար՝ կարճ բացատրություն'],
    dueDate: '2026-10-20T23:59',
    maxScore: 50,
    allowFiles: true,
    createdAt: '2026-10-03',
  },
  {
    id: 'a-ux-interviews',
    courseId: 'ux',
    title: 'Հարցազրույցների վերլուծություն',
    summary: 'Անցկացրեք 3 հարցազրույց և ներկայացրեք սինթեզի արդյունքները։',
    instructions: ['Կազմեք հարցազրույցի ուղեցույց։', 'Անցկացրեք և արձանագրեք 3 հարցազրույց։', 'Խմբավորեք դիտարկումները թեմաներով։'],
    requirements: ['Մասնակիցների համաձայնություն', 'Անանուն տվյալներ'],
    dueDate: '2026-09-30T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-14',
  },
  {
    id: 'a-ux-journey',
    courseId: 'ux',
    title: 'Օգտատիրոջ ճանապարհի քարտեզ',
    summary: 'Կառուցեք ճանապարհի քարտեզ՝ առցանց գրադարանից գիրք պատվիրելու սցենարի համար։',
    instructions: ['Սահմանեք պերսոնան։', 'Նկարագրեք փուլերը, գործողությունները և զգացողությունները։', 'Առանձնացրեք 3 բարելավման հնարավորություն։'],
    requirements: ['PDF կամ պատկեր', 'Հղում աղբյուր ֆայլին'],
    dueDate: '2026-10-12T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-28',
  },
  {
    id: 'a-ml-prep',
    courseId: 'ml',
    title: 'Տվյալների նախապատրաստում',
    summary: 'Նախապատրաստեք բնակարանների գների օրինակային տվյալները մոդելավորման համար։',
    instructions: ['Մշակեք բացակայող արժեքները։', 'Կոդավորեք կատեգորիկ հատկանիշները։', 'Նորմալացրեք թվային հատկանիշները։'],
    requirements: ['scikit-learn Pipeline', 'Արդյունքների համառոտ նկարագրություն'],
    dueDate: '2026-10-10T23:59',
    maxScore: 100,
    allowFiles: true,
    createdAt: '2026-09-26',
  },
  {
    id: 'a-ml-regression',
    courseId: 'ml',
    title: 'Գծային ռեգրեսիայի մոդել',
    summary: 'Ուսուցանեք և գնահատեք գծային ռեգրեսիայի մոդել նախապատրաստված տվյալներով։',
    instructions: ['Բաժանեք տվյալները ուսուցման և թեստային մասերի։', 'Ուսուցանեք մոդելը։', 'Հաշվեք MAE և R² մետրիկաները և մեկնաբանեք։'],
    requirements: ['Վերարտադրելի արդյունքներ (random_state)', 'Գրաֆիկ՝ կանխատեսված և իրական արժեքներով'],
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
    answer: 'Կոմպոնենտների ընդհանուր ոճերը կազմակերպել եմ CSS փոփոխականներով։ Button-ը ունի երեք տարբերակ՝ primary, secondary և ghost։',
    attachments: [{ name: 'components-readme.md', sizeKb: 12 }],
  },
  {
    id: 'sub-s1-ux-journey',
    assignmentId: 'a-ux-journey',
    studentId: DEMO_STUDENT_ID,
    status: 'submitted',
    submittedAt: '2026-10-12T21:40',
    answer: 'Պերսոնան՝ 34 տարեկան ուսուցչուհի, որը երեկոյան ժամերին պատվիրում է գրքեր։ Ամենամեծ դժվարությունը առաքման ժամկետների անորոշությունն է։',
    attachments: [{ name: 'journey-map.pdf', sizeKb: 1840 }],
  },
  {
    id: 'sub-s1-ux-interviews',
    assignmentId: 'a-ux-interviews',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-09-29T18:12',
    answer: 'Անցկացվել է 3 հարցազրույց։ Առանձնացվել է 4 հիմնական թեմա՝ վստահություն, արագություն, որոնում և առաքում։',
    attachments: [{ name: 'interview-synthesis.pdf', sizeKb: 920 }],
    score: 88,
    feedback: 'Սինթեզը լավ կառուցված է, թեմաները հստակ են։ Հաջորդ անգամ ավելացրեք մասնակիցների մեջբերումներ՝ եզրակացություններն ավելի համոզիչ դարձնելու համար։',
    gradedAt: '2026-10-03T11:00',
  },
  {
    id: 'sub-s1-js-dom',
    assignmentId: 'a-js-dom',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-18T20:05',
    answer: 'Իրականացված են ավելացում, ջնջում, նշում և զտում։ Օգտագործել եմ իրադարձությունների պատվիրակում ցուցակի վրա։',
    attachments: [{ name: 'todo-app.zip', sizeKb: 46 }],
    score: 95,
    feedback: 'Գերազանց աշխատանք։ Կոդը մաքուր է, իսկ զտիչները աշխատում են անթերի։',
    gradedAt: '2026-07-21T10:20',
  },
  {
    id: 'sub-s1-js-async',
    assignmentId: 'a-js-async',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-29T22:47',
    answer: 'Վիդջեթը ցուցադրում է բեռնման, սխալի և հաջող վիճակները։',
    attachments: [{ name: 'weather-widget.zip', sizeKb: 58 }],
    score: 90,
    feedback: 'Լավ է մշակված սխալի վիճակը։ Կարելի էր կրկնվող կոդը հանել առանձին ֆունկցիայի մեջ։',
    gradedAt: '2026-09-01T09:30',
  },
  {
    id: 'sub-s1-py-cleaning',
    assignmentId: 'a-py-cleaning',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-07-09T17:00',
    answer: 'Մաքրվել է 12 450 տող, հեռացվել է 318 կրկնություն։',
    attachments: [{ name: 'transport-cleaning.ipynb', sizeKb: 410 }],
    score: 84,
    feedback: 'Լավ աշխատանք։ Եզրակացություններից մեկը բավարար հիմնավորված չէ տվյալներով։',
    gradedAt: '2026-07-13T12:10',
  },
  {
    id: 'sub-s1-py-viz',
    assignmentId: 'a-py-viz',
    studentId: DEMO_STUDENT_ID,
    status: 'graded',
    submittedAt: '2026-08-19T23:10',
    answer: 'Զեկույցը ներառում է 5 գրաֆիկ Հայաստանի զբոսաշրջության տվյալների վերաբերյալ։',
    attachments: [{ name: 'tourism-report.pdf', sizeKb: 2310 }],
    score: 91,
    feedback: 'Գրաֆիկները հստակ են և ճիշտ ընտրված։ Շնորհակալություն մանրակրկիտ մեկնաբանությունների համար։',
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
  'Աշխատանքը կատարել եմ ըստ պահանջների։ Ամենաշատ ժամանակը տարավ վալիդացիայի տրամաբանությունը, որը վերջում առանձնացրեցի առանձին ֆունկցիաների։',
  'Կցում եմ նախագծի արխիվը։ Պատասխանի դաշտում նկարագրել եմ կառուցվածքը և այն մասերը, որոնց վերաբերյալ կցանկանայի ստանալ կարծիք։',
  'Լուծումը բաժանել եմ երեք մասի՝ տվյալների շերտ, ինտերֆեյս և օժանդակ ֆունկցիաներ։ README ֆայլում կա գործարկման նկարագրություն։',
  'Կատարել եմ բոլոր կետերը, բացի վերջին լրացուցիչ պահանջից, որի համար ժամանակ չբավականացրեց։',
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
        feedback: graded ? 'Աշխատանքը համապատասխանում է պահանջներին։ Մանրամասն մեկնաբանությունները տես կոդի մեջ։' : undefined,
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

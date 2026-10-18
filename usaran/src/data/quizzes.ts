import type { Quiz, QuizAttempt, QuizQuestion } from '../types';
import { DEMO_STUDENT_ID } from './users';

type Q = [kind: 'single' | 'multiple', text: string, options: string[], correct: number[], points?: number, explanation?: string];

function qs(prefix: string, list: Q[]): QuizQuestion[] {
  return list.map(([kind, text, options, correct, points = 1, explanation], i) => ({
    id: `${prefix}-q${i + 1}`,
    kind,
    text,
    options: options.map((t, oi) => ({ id: `${prefix}-q${i + 1}-o${oi + 1}`, text: t })),
    correct: correct.map((ci) => `${prefix}-q${i + 1}-o${ci + 1}`),
    points,
    explanation,
  }));
}

const standardInstructions = [
  'Թեստը սկսելուց հետո ժամաչափը չի կանգնում։',
  'Կարող եք ազատ տեղաշարժվել հարցերի միջև և փոխել պատասխանները մինչև հանձնելը։',
  'Մի քանի պատասխանով հարցերում միավորը տրվում է միայն բոլոր ճիշտ տարբերակներն ընտրելու դեպքում։',
  'Հանձնելուց առաջ կտեսնեք ամփոփիչ էջ՝ չպատասխանված հարցերի նշումով։',
];

export const quizzes: Quiz[] = [
  {
    id: 'q-react-basics',
    courseId: 'react',
    title: 'React-ի հիմնական գաղափարներ',
    description: 'Ստուգեք ձեր գիտելիքները JSX-ի, կոմպոնենտների, props-երի և վիճակի վերաբերյալ։',
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-20T23:59',
    status: 'published',
    questions: qs('react', [
      ['single', 'Ի՞նչ է վերադարձնում React ֆունկցիոնալ կոմպոնենտը։', ['HTML տող', 'React տարր (JSX)', 'DOM հանգույց', 'CSS դաս'], [1], 2, 'Կոմպոնենտը վերադարձնում է React տարրեր, որոնք React-ը հետո համապատասխանեցնում է DOM-ին։'],
      ['single', 'Ո՞ր hook-ն է նախատեսված կոմպոնենտի տեղային վիճակը պահելու համար։', ['useEffect', 'useMemo', 'useState', 'useRef'], [2], 1],
      ['multiple', 'Ընտրեք ճիշտ պնդումները props-երի վերաբերյալ։', ['Props-երը փոխանցվում են ծնողից զավակին', 'Կոմպոնենտը կարող է ուղղակիորեն փոփոխել իր props-երը', 'Props-ով կարելի է փոխանցել ֆունկցիաներ', 'Props-երը միայն տողեր են'], [0, 2], 2, 'Props-երը միայն կարդալու համար են և կարող են լինել ցանկացած տիպի։'],
      ['single', 'Ինչու՞ է ցուցակի տարրերին անհրաժեշտ key հատկանիշը։', ['Ոճավորման համար', 'Որպեսզի React-ը նույնականացնի տարրերը թարմացումների ժամանակ', 'Որոնողական համակարգերի համար', 'Այն պարտադիր չէ'], [1], 1],
      ['single', 'Ե՞րբ է գործարկվում useEffect-ը դատարկ կախվածությունների զանգվածով։', ['Յուրաքանչյուր ռենդերից հետո', 'Միայն առաջին ռենդերից հետո', 'Երբեք', 'Միայն ապամոնտաժման ժամանակ'], [1], 1],
      ['multiple', 'Ո՞ր տարբերակներն են ճիշտ JSX-ում։', ['class-ի փոխարեն օգտագործվում է className', 'Արտահայտությունները գրվում են ձևավոր փակագծերում', 'Կարելի է վերադարձնել մի քանի տարր առանց ծնողի կամ Fragment-ի', 'Ինքնափակվող թեգերը պետք է ավարտվեն />-ով'], [0, 1, 3], 2],
      ['single', 'Ի՞նչ է «վերահսկվող» ձևաթղթի դաշտը։', ['Դաշտ, որի արժեքը պահվում է React-ի վիճակում', 'Դաշտ՝ disabled հատկանիշով', 'Դաշտ, որը վալիդացվում է սերվերում', 'Դաշտ՝ առանց onChange-ի'], [0], 1],
      ['single', 'Ո՞ր մոտեցումն է նախընտրելի խորը ներդրված կոմպոնենտներին ընդհանուր տվյալ փոխանցելու համար։', ['Գլոբալ փոփոխական window-ում', 'Context API', 'localStorage', 'Props-երի կրկնօրինակում յուրաքանչյուր մակարդակում'], [1], 1],
    ]),
  },
  {
    id: 'q-js-types',
    courseId: 'js',
    title: 'JavaScript. տիպեր և ֆունկցիաներ',
    description: 'Պարզ տիպեր, համեմատություն և ֆունկցիաների հայտարարման ձևեր։',
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-15T23:59',
    status: 'published',
    questions: qs('jst', [
      ['single', 'Ի՞նչ արդյունք կտա typeof null արտահայտությունը։', ['"null"', '"object"', '"undefined"', '"number"'], [1], 1],
      ['single', 'Ո՞ր օպերատորն է համեմատում և՛ արժեքը, և՛ տիպը։', ['==', '=', '===', '!='], [2], 1],
      ['multiple', 'Ընտրեք պարզ (primitive) տիպերը։', ['string', 'array', 'boolean', 'symbol'], [0, 2, 3], 2],
      ['single', 'Ինչո՞վ են տարբերվում arrow ֆունկցիաները։', ['Չունեն սեփական this', 'Չեն կարող վերադարձնել արժեք', 'Միշտ ասինխրոն են', 'Չեն ընդունում պարամետրեր'], [0], 1],
    ]),
  },
  {
    id: 'q-js-async',
    courseId: 'js',
    title: 'Ասինխրոն ծրագրավորում',
    description: 'Promise, async/await և սխալների մշակում։',
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 1,
    passPercent: 70,
    dueDate: '2026-09-05T23:59',
    status: 'published',
    questions: qs('jsa', [
      ['single', 'Ի՞նչ է վերադարձնում async ֆունկցիան։', ['Միշտ undefined', 'Promise', 'Callback', 'Գեներատոր'], [1], 1],
      ['multiple', 'Ո՞րն են Promise-ի հնարավոր վիճակները։', ['pending', 'fulfilled', 'rejected', 'paused'], [0, 1, 2], 2],
      ['single', 'Ինչպե՞ս բռնել սխալը await-ի ժամանակ։', ['if/else', 'try/catch', 'switch', 'Ոչ մի կերպ'], [1], 1],
      ['single', 'Promise.all-ը ե՞րբ է մերժվում։', ['Երբ բոլորը մերժվում են', 'Երբ առաջինը մերժվում է', 'Երբեք', 'Միայն ժամանակի սպառման դեպքում'], [1], 1],
    ]),
  },
  {
    id: 'q-ml-terms',
    courseId: 'ml',
    title: 'Մեքենայական ուսուցման տերմինաբանություն',
    description: 'Հիմնական հասկացություններ՝ տվյալներ, մոդել, ուսուցում և գնահատում։',
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 2,
    passPercent: 60,
    dueDate: '2026-10-19T23:59',
    status: 'published',
    questions: qs('mlt', [
      ['single', 'Ո՞ր խնդիրն է ռեգրեսիայի օրինակ։', ['Էլ. նամակը սպա՞մ է, թե՞ ոչ', 'Բնակարանի գնի կանխատեսում', 'Հաճախորդների խմբավորում', 'Պատկերի վրա կատվի հայտնաբերում'], [1], 1],
      ['multiple', 'Ո՞րն են վերահսկվող ուսուցման ալգորիթմներ։', ['Գծային ռեգրեսիա', 'K-means', 'Որոշումների ծառ', 'Լոգիստիկ ռեգրեսիա'], [0, 2, 3], 2],
      ['single', 'Ի՞նչ է գերհարմարեցումը (overfitting)։', ['Մոդելը վատ է աշխատում ուսուցման տվյալներում', 'Մոդելը հիշում է ուսուցման տվյալները և վատ է ընդհանրացնում', 'Տվյալները չափազանց քիչ են', 'Ուսուցումը շատ արագ է'], [1], 1],
      ['single', 'Ինչու՞ են տվյալները բաժանում ուսուցման և թեստային մասերի։', ['Ուսուցումն արագացնելու համար', 'Մոդելը նոր տվյալների վրա անկողմնակալ գնահատելու համար', 'Հիշողություն խնայելու համար', 'Դա պարտադիր չէ'], [1], 1],
      ['single', 'Ո՞ր մետրիկան է հարմար դասակարգման անհավասարակշիռ դասերի դեպքում։', ['Ճշգրտություն (accuracy)', 'F1 միավոր', 'MAE', 'R²'], [1], 1],
    ]),
  },
  {
    id: 'q-ux-usability',
    courseId: 'ux',
    title: 'Օգտագործելիության սկզբունքներ',
    description: 'Հեուրիստիկաներ և ինտերֆեյսի գնահատման հիմունքներ։',
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-08T23:59',
    status: 'published',
    questions: qs('uxu', [
      ['single', 'Ի՞նչ է նշանակում «համակարգի վիճակի տեսանելիություն»։', ['Համակարգը միշտ տեղեկացնում է օգտատիրոջը, թե ինչ է կատարվում', 'Բոլոր կարգավորումները տեսանելի են', 'Ինտերֆեյսը թափանցիկ է', 'Կոդը բաց է'], [0], 1],
      ['multiple', 'Ո՞րն են սխալների կանխարգելման լավ օրինակներ։', ['Հաստատման պատուհան ջնջելուց առաջ', 'Ամսաթվի ընտրիչ ազատ տեքստի փոխարեն', 'Թաքնված կոճակներ', 'Անհասանելի գործողությունների անջատում'], [0, 1, 3], 2],
      ['single', 'Քանի՞ մասնակից է սովորաբար բավարար որակական թեստավորման մեկ փուլի համար։', ['1', '5', '50', '500'], [1], 1],
      ['single', 'Ո՞րն է ճանաչման և հիշողության սկզբունքի լավ կիրառություն։', ['Պահանջել հրամաններ անգիր իմանալ', 'Ցուցադրել վերջերս օգտագործված տարրերը', 'Թաքցնել ընտրացանկը', 'Օգտագործել միայն պատկերակներ'], [1], 1],
    ]),
  },
  {
    id: 'q-linalg-vectors',
    courseId: 'linear-algebra',
    title: 'Վեկտորներ և մատրիցներ',
    description: 'Վեկտորների գործողություններ և մատրիցների չափողականություն։',
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 65,
    dueDate: '2026-11-02T23:59',
    status: 'published',
    questions: qs('lav', [
      ['single', 'Ինչի՞ է հավասար (1, 2) և (3, 4) վեկտորների սկալյար արտադրյալը։', ['10', '11', '14', '7'], [1], 1],
      ['single', '2×3 և 3×4 մատրիցների արտադրյալի չափը՝', ['2×4', '3×3', '4×2', 'Հնարավոր չէ բազմապատկել'], [0], 1],
      ['multiple', 'Ո՞րն են միավոր մատրիցի հատկություններ։', ['Քառակուսի է', 'Գլխավոր անկյունագծում 1-եր են', 'Բոլոր տարրերը 1 են', 'AI = A ցանկացած համապատասխան A-ի համար'], [0, 1, 3], 2],
      ['single', 'Երկու վեկտոր ուղղահայաց են, եթե նրանց սկալյար արտադրյալը՝', ['1 է', '0 է', 'Բացասական է', 'Հավասար է երկարությունների արտադրյալին'], [1], 1],
    ]),
  },
  {
    id: 'q-pandas',
    courseId: 'python-data',
    title: 'Pandas հիմունքներ',
    description: 'DataFrame-ի ստեղծում, ընտրություն և խմբավորում։',
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-05T23:59',
    status: 'published',
    questions: qs('pd', [
      ['single', 'Ո՞ր մեթոդն է ցույց տալիս DataFrame-ի առաջին տողերը։', ['first()', 'head()', 'top()', 'start()'], [1], 1],
      ['single', 'Ինչպե՞ս ընտրել տողեր պիտակով։', ['iloc', 'loc', 'at_index', 'select'], [1], 1],
      ['multiple', 'Ո՞ր մեթոդներն են օգնում աշխատել բացակայող արժեքների հետ։', ['isna()', 'fillna()', 'dropna()', 'missing()'], [0, 1, 2], 2],
      ['single', 'groupby-ից հետո ի՞նչ է անհրաժեշտ արդյունք ստանալու համար։', ['Ագրեգացիայի ֆունկցիա', 'Ոչինչ', 'Վերանվանում', 'Տեսակավորում'], [0], 1],
    ]),
  },
  {
    id: 'q-sql-joins',
    courseId: 'sql',
    title: 'JOIN-երի տեսակները',
    description: 'INNER, LEFT, RIGHT և FULL միացումներ։',
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-28T23:59',
    status: 'draft',
    questions: qs('sqlj', [
      ['single', 'Ո՞ր JOIN-ն է վերադարձնում միայն համընկնող տողերը։', ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'], [1], 1],
      ['single', 'LEFT JOIN-ի դեպքում ձախ աղյուսակի չհամընկնող տողերը՝', ['Բաց են թողնվում', 'Վերադարձվում են NULL արժեքներով', 'Առաջացնում են սխալ', 'Կրկնապատկվում են'], [1], 1],
    ]),
  },
];

export function getQuiz(id: string | undefined): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}

export function quizMaxScore(q: Quiz): number {
  return q.questions.reduce((n, x) => n + x.points, 0);
}

export function scoreAnswers(q: Quiz, answers: Record<string, string[]>): number {
  return q.questions.reduce((sum, question) => {
    const given = [...(answers[question.id] ?? [])].sort().join('|');
    const correct = [...question.correct].sort().join('|');
    return sum + (given === correct ? question.points : 0);
  }, 0);
}

function attempt(id: string, quizId: string, pickWrong: string[], completedAt: string, durationMin: number): QuizAttempt {
  const q = getQuiz(quizId)!;
  const answers: Record<string, string[]> = {};
  q.questions.forEach((question) => {
    answers[question.id] = pickWrong.includes(question.id)
      ? [question.options.find((o) => !question.correct.includes(o.id))!.id]
      : [...question.correct];
  });
  return { id, quizId, studentId: DEMO_STUDENT_ID, answers, score: scoreAnswers(q, answers), maxScore: quizMaxScore(q), completedAt, durationMin };
}

/** Previous attempts of the demo student (illustrative). */
export const quizAttempts: QuizAttempt[] = [
  attempt('att-1', 'q-js-types', ['jst-q4'], '2026-07-12T19:20', 11),
  attempt('att-2', 'q-js-async', [], '2026-09-03T20:05', 9),
  attempt('att-3', 'q-ux-usability', ['uxu-q3'], '2026-10-06T18:40', 8),
  attempt('att-4', 'q-pandas', ['pd-q2'], '2026-07-02T16:30', 12),
];

export function attemptsFor(quizId: string): QuizAttempt[] {
  return quizAttempts.filter((a) => a.quizId === quizId);
}

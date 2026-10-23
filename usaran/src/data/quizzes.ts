import type { Quiz, QuizAttempt, QuizQuestion } from '../types';
import { DEMO_STUDENT_ID } from './users';
import { tr } from '../i18n';

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
  tr("The timer cannot be paused once you start the quiz.", "Թեստը սկսելուց հետո ժամաչափը չի կանգնում։"),
  tr("You can move between questions and change your answers before submitting.", "Կարող եք ազատ տեղաշարժվել հարցերի միջև և փոխել պատասխանները մինչև հանձնելը։"),
  tr("For multiple-answer questions, you must select all correct options to earn points.", "Մի քանի պատասխանով հարցերում միավորը տրվում է միայն բոլոր ճիշտ տարբերակներն ընտրելու դեպքում։"),
  tr("Before submitting, you will see a summary highlighting any unanswered questions.", "Հանձնելուց առաջ կտեսնեք ամփոփիչ էջ՝ չպատասխանված հարցերի նշումով։"),
];

export const quizzes: Quiz[] = [
  {
    id: 'q-react-basics',
    courseId: 'react',
    title: tr("React Core Concepts", "React-ի հիմնական գաղափարներ"),
    description: tr("Test your understanding of JSX, components, props, and state.", "Ստուգեք ձեր գիտելիքները JSX-ի, բաղադրիչների, props-երի և վիճակի վերաբերյալ։"),
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-20T23:59',
    status: 'published',
    questions: qs('react', [
      ['single', tr("What does a React function component return?", "Ի՞նչ է վերադարձնում React ֆունկցիոնալ բաղադրիչը։"), [tr("An HTML string", "HTML տող"), tr("A React element (JSX)", "React տարր (JSX)"), tr("A DOM node", "DOM հանգույց"), tr("A CSS class", "CSS դաս")], [1], 2, tr("A component returns React elements, which React then reconciles with the DOM.", "Բաղադրիչը վերադարձնում է React տարրեր, որոնք React-ը հետո համապատասխանեցնում է DOM-ին։")],
      ['single', tr("Which hook stores a component's local state?", "Ո՞ր hook-ն է նախատեսված բաղադրիչի տեղային վիճակը պահելու համար։"), ['useEffect', 'useMemo', 'useState', 'useRef'], [2], 1],
      ['multiple', tr("Select the correct statements about props.", "Ընտրեք ճիշտ պնդումները props-երի վերաբերյալ։"), [tr("Props are passed from parent to child", "Props-երը փոխանցվում են ծնողից զավակին"), tr("A component can directly modify its props", "Բաղադրիչը կարող է ուղղակիորեն փոփոխել իր props-երը"), tr("Functions can be passed as props", "Props-ով կարելի է փոխանցել ֆունկցիաներ"), tr("Props can only be strings", "Props-երը միայն տողեր են")], [0, 2], 2, tr("Props are read-only and can hold values of any type.", "Props-երը միայն կարդալու համար են և կարող են լինել ցանկացած տիպի։")],
      ['single', tr("Why do list items need a key attribute?", "Ինչո՞ւ է ցուցակի տարրերին անհրաժեշտ key հատկանիշը։"), [tr("For styling", "Ոճավորման համար"), tr("To help React identify items during updates", "Որպեսզի React-ը նույնականացնի տարրերը թարմացումների ժամանակ"), tr("For search engines", "Որոնողական համակարգերի համար"), tr("It is not required", "Այն պարտադիր չէ")], [1], 1],
      ['single', tr("When does useEffect run with an empty dependency array?", "Ե՞րբ է գործարկվում useEffect-ը դատարկ կախվածությունների զանգվածով։"), [tr("After every render", "Յուրաքանչյուր արտապատկերումից հետո"), tr("After the initial render", "Միայն առաջին արտապատկերումից հետո"), tr("Never", "Երբեք"), tr("Only when the component unmounts", "Միայն բաղադրիչի հեռացման (unmount) ժամանակ")], [1], 1],
      ['multiple', tr("Which statements about JSX are correct?", "JSX-ի վերաբերյալ ո՞ր պնդումներն են ճիշտ։"), [tr("Use className instead of class", "class-ի փոխարեն օգտագործվում է className"), tr("Expressions go inside curly braces", "Արտահայտությունները գրվում են ձևավոր փակագծերում"), tr("You can return multiple elements without a parent or Fragment", "Կարելի է վերադարձնել մի քանի տարր առանց ծնողի կամ Fragment-ի"), tr("Self-closing tags must end with />", "Ինքնափակվող թեգերը պետք է ավարտվեն />-ով")], [0, 1, 3], 2],
      ['single', tr("What is a controlled form input in React?", "Ի՞նչ է «վերահսկվող» ձևաթղթի դաշտը։"), [tr("An input whose value is stored in React state", "Դաշտ, որի արժեքը պահվում է React-ի վիճակում"), tr("An input with the disabled attribute", "Դաշտ՝ disabled հատկանիշով"), tr("An input whose value is validated on the server", "Դաշտ, որի արժեքը ստուգվում է սերվերում"), tr("An input without onChange", "Դաշտ՝ առանց onChange-ի")], [0], 1],
      ['single', tr("Which approach is preferred for sharing data with deeply nested components?", "Ո՞ր մոտեցումն է նախընտրելի խորը ներդրված բաղադրիչներին ընդհանուր տվյալներ փոխանցելու համար։"), [tr("A global variable on window", "Գլոբալ փոփոխական window-ում"), 'Context API', 'localStorage', tr("Duplicating props at every level", "Props-երի կրկնօրինակում յուրաքանչյուր մակարդակում")], [1], 1],
    ]),
  },
  {
    id: 'q-js-types',
    courseId: 'js',
    title: tr("JavaScript: Types and Functions", "JavaScript․ տիպեր և ֆունկցիաներ"),
    description: tr("Primitive types, comparisons, and function declarations.", "Պարզ տիպեր, համեմատություն և ֆունկցիաների հայտարարման ձևեր։"),
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-15T23:59',
    status: 'published',
    questions: qs('jst', [
      ['single', tr("What does typeof null return?", "Ի՞նչ արդյունք կտա typeof null արտահայտությունը։"), ['"null"', '"object"', '"undefined"', '"number"'], [1], 1],
      ['single', tr("Which operator compares both value and type?", "Ո՞ր օպերատորն է համեմատում և՛ արժեքը, և՛ տիպը։"), ['==', '=', '===', '!='], [2], 1],
      ['multiple', tr("Select the primitive types.", "Ընտրեք պարզ (primitive) տիպերը։"), ['string', 'array', 'boolean', 'symbol'], [0, 2, 3], 2],
      ['single', tr("What is a distinctive feature of arrow functions?", "Ինչո՞վ են առանձնանում սլաքային (arrow) ֆունկցիաները։"), [tr("They do not have their own this", "Չունեն սեփական this"), tr("They cannot return a value", "Չեն կարող վերադարձնել արժեք"), tr("They are always asynchronous", "Միշտ ասինխրոն են"), tr("They do not accept parameters", "Չեն ընդունում պարամետրեր")], [0], 1],
    ]),
  },
  {
    id: 'q-js-async',
    courseId: 'js',
    title: tr("Asynchronous Programming", "Ասինխրոն ծրագրավորում"),
    description: tr("Promises, async/await, and error handling.", "Promise, async/await և սխալների մշակում։"),
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 1,
    passPercent: 70,
    dueDate: '2026-09-05T23:59',
    status: 'published',
    questions: qs('jsa', [
      ['single', tr("What does an async function return?", "Ի՞նչ է վերադարձնում async ֆունկցիան։"), [tr("Always undefined", "Միշտ undefined"), 'Promise', 'Callback', tr("A generator", "Գեներատոր")], [1], 1],
      ['multiple', tr("What are the possible states of a Promise?", "Որո՞նք են Promise-ի հնարավոր վիճակները։"), ['pending', 'fulfilled', 'rejected', 'paused'], [0, 1, 2], 2],
      ['single', tr("How do you handle an error from an awaited operation?", "Ինչպե՞ս մշակել await-ով սպասվող գործողության սխալը։"), ['if/else', 'try/catch', 'switch', tr("You cannot", "Ոչ մի կերպ")], [1], 1],
      ['single', tr("When does Promise.all reject?", "Promise.all-ն ե՞րբ է մերժվում։"), [tr("When all promises reject", "Երբ բոլորը մերժվում են"), tr("When the first promise rejects", "Երբ դրանցից առաջինը մերժվում է"), tr("Never", "Երբեք"), tr("Only on a timeout", "Միայն ժամանակի սպառման դեպքում")], [1], 1],
    ]),
  },
  {
    id: 'q-ml-terms',
    courseId: 'ml',
    title: tr("Machine Learning Terminology", "Մեքենայական ուսուցման տերմինաբանություն"),
    description: tr("Key concepts: data, models, training, and evaluation.", "Հիմնական հասկացություններ՝ տվյալներ, մոդել, ուսուցում և գնահատում։"),
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 2,
    passPercent: 60,
    dueDate: '2026-10-19T23:59',
    status: 'published',
    questions: qs('mlt', [
      ['single', tr("Which task is an example of regression?", "Ո՞ր խնդիրն է ռեգրեսիայի օրինակ։"), [tr("Classifying an email as spam or not spam", "Էլ. նամակի դասակարգում՝ սպամ է, թե ոչ"), tr("Predicting a house price", "Բնակարանի գնի կանխատեսում"), tr("Grouping customers", "Հաճախորդների խմբավորում"), tr("Detecting a cat in an image", "Պատկերի վրա կատվի հայտնաբերում")], [1], 1],
      ['multiple', tr("Which algorithms use supervised learning?", "Ո՞ր ալգորիթմներն են կիրառում վերահսկվող ուսուցում։"), [tr("Linear Regression", "Գծային ռեգրեսիա"), 'K-means', tr("Decision tree", "Որոշումների ծառ"), tr("Logistic Regression", "Լոգիստիկ ռեգրեսիա")], [0, 2, 3], 2],
      ['single', tr("What is overfitting?", "Ի՞նչ է գերհարմարեցումը (overfitting)։"), [tr("The model performs poorly on the training data", "Մոդելը վատ է աշխատում ուսուցման տվյալներում"), tr("The model memorizes the training data and generalizes poorly", "Մոդելը հիշում է ուսուցման տվյալները և վատ է ընդհանրացնում"), tr("There is too little data", "Տվյալները չափազանց քիչ են"), tr("Training is too fast", "Ուսուցումը շատ արագ է")], [1], 1],
      ['single', tr("Why split data into training and test sets?", "Ինչո՞ւ են տվյալները բաժանում ուսուցման և թեստային մասերի։"), [tr("To speed up training", "Ուսուցումն արագացնելու համար"), tr("To evaluate the model on unseen data", "Մոդելը նոր տվյալների վրա անկողմնակալ գնահատելու համար"), tr("To save memory", "Հիշողություն խնայելու համար"), tr("It is not necessary", "Դա պարտադիր չէ")], [1], 1],
      ['single', tr("Which metric is useful for classification with imbalanced classes?", "Ո՞ր ցուցանիշն է հարմար դասակարգման համար, երբ դասերն անհավասարակշիռ են։"), [tr("Accuracy", "Ճշգրտություն (accuracy)"), tr("F1 score", "F1 ցուցանիշ"), 'MAE', 'R²'], [1], 1],
    ]),
  },
  {
    id: 'q-ux-usability',
    courseId: 'ux',
    title: tr("Usability Principles", "Օգտագործելիության սկզբունքներ"),
    description: tr("Heuristics and the fundamentals of interface evaluation.", "Հեուրիստիկաներ և միջերեսի գնահատման հիմունքներ։"),
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-08T23:59',
    status: 'published',
    questions: qs('uxu', [
      ['single', tr("What does visibility of system status mean?", "Ի՞նչ է նշանակում «համակարգի վիճակի տեսանելիություն»։"), [tr("The system keeps users informed about what is happening", "Համակարգը միշտ տեղեկացնում է օգտատիրոջը, թե ինչ է կատարվում"), tr("All settings are visible", "Բոլոր կարգավորումները տեսանելի են"), tr("The interface is transparent", "Միջերեսը թափանցիկ է"), tr("The source code is open", "Ելակետային կոդը բաց է")], [0], 1],
      ['multiple', tr("Which are good examples of error prevention?", "Որո՞նք են սխալների կանխարգելման լավ օրինակները։"), [tr("A confirmation dialog before deleting", "Հաստատման պատուհան ջնջելուց առաջ"), tr("A date picker instead of a free-text field", "Ամսաթվի ընտրիչ ազատ տեքստի փոխարեն"), tr("Hidden buttons", "Թաքնված կոճակներ"), tr("Disabling unavailable actions", "Անհասանելի գործողությունների անջատում")], [0, 1, 3], 2],
      ['single', tr("How many participants are typically enough for one round of qualitative usability testing?", "Օգտագործելիության որակական թեստավորման մեկ փուլի համար սովորաբար քանի՞ մասնակից է բավարար։"), ['1', '5', '50', '500'], [1], 1],
      ['single', tr("Which is a good example of recognition rather than recall?", "Ո՞րն է «ճանաչել, ոչ թե հիշել» սկզբունքի լավ օրինակը։"), [tr("Requiring users to memorize commands", "Պահանջել հրամաններ անգիր իմանալ"), tr("Showing recently used items", "Ցուցադրել վերջերս օգտագործված տարրերը"), tr("Hiding the menu", "Թաքցնել ընտրացանկը"), tr("Using only icons", "Օգտագործել միայն պատկերակներ")], [1], 1],
    ]),
  },
  {
    id: 'q-linalg-vectors',
    courseId: 'linear-algebra',
    title: tr("Vectors and Matrices", "Վեկտորներ և մատրիցներ"),
    description: tr("Vector operations and matrix dimensions.", "Գործողություններ վեկտորների հետ և մատրիցների չափերը։"),
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 65,
    dueDate: '2026-11-02T23:59',
    status: 'published',
    questions: qs('lav', [
      ['single', tr("What is the dot product of (1, 2) and (3, 4)?", "Ինչի՞ է հավասար (1, 2) և (3, 4) վեկտորների սկալյար արտադրյալը։"), ['10', '11', '14', '7'], [1], 1],
      ['single', tr("What is the size of the product of a 2×3 matrix and a 3×4 matrix?", "Ինչպիսի՞ն է 2×3 և 3×4 մատրիցների արտադրյալի չափը։"), ['2×4', '3×3', '4×2', tr("The matrices cannot be multiplied", "Մատրիցները հնարավոր չէ բազմապատկել")], [0], 1],
      ['multiple', tr("Which are properties of an identity matrix?", "Որո՞նք են միավոր մատրիցի հատկությունները։"), [tr("It is square", "Քառակուսի է"), tr("Its main diagonal contains ones", "Գլխավոր անկյունագծի տարրերը 1 են"), tr("Every element is one", "Բոլոր տարրերը 1 են"), tr("AI = A for every compatible matrix A", "AI = A ցանկացած համապատասխան A-ի համար")], [0, 1, 3], 2],
      ['single', tr("Two vectors are perpendicular when their dot product is:", "Երկու վեկտոր ուղղահայաց են, եթե նրանց սկալյար արտադրյալը՝"), [tr("1", "1 է"), tr("0", "0 է"), tr("Negative", "Բացասական է"), tr("Equal to the product of their lengths", "Հավասար է երկարությունների արտադրյալին")], [1], 1],
    ]),
  },
  {
    id: 'q-pandas',
    courseId: 'python-data',
    title: tr("pandas Fundamentals", "pandas-ի հիմունքներ"),
    description: tr("Creating, selecting, and grouping DataFrames.", "DataFrame-ի ստեղծում, ընտրություն և խմբավորում։"),
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-05T23:59',
    status: 'published',
    questions: qs('pd', [
      ['single', tr("Which method displays the first rows of a DataFrame?", "Ո՞ր մեթոդն է ցույց տալիս DataFrame-ի առաջին տողերը։"), ['first()', 'head()', 'top()', 'start()'], [1], 1],
      ['single', tr("How do you select rows by label?", "Ինչպե՞ս ընտրել տողեր պիտակով։"), ['iloc', 'loc', 'at_index', 'select'], [1], 1],
      ['multiple', tr("Which methods help you handle missing values?", "Ո՞ր մեթոդներն են օգնում աշխատել բացակայող արժեքների հետ։"), ['isna()', 'fillna()', 'dropna()', 'missing()'], [0, 1, 2], 2],
      ['single', tr("What is needed after groupby to produce a summarized result?", "groupby-ից հետո ի՞նչ է անհրաժեշտ արդյունք ստանալու համար։"), [tr("An aggregation function", "Համախմբման ֆունկցիա"), tr("Nothing", "Ոչինչ"), tr("Renaming", "Վերանվանում"), tr("Sorting", "Տեսակավորում")], [0], 1],
    ]),
  },
  {
    id: 'q-sql-joins',
    courseId: 'sql',
    title: tr("Types of JOIN", "JOIN-երի տեսակները"),
    description: tr("INNER, LEFT, RIGHT, and FULL joins.", "INNER, LEFT, RIGHT և FULL միացումներ։"),
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-28T23:59',
    status: 'draft',
    questions: qs('sqlj', [
      ['single', tr("Which JOIN returns only matching rows?", "Ո՞ր JOIN-ն է վերադարձնում միայն համընկնող տողերը։"), ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'], [1], 1],
      ['single', tr("With a LEFT JOIN, unmatched rows from the left table are:", "LEFT JOIN-ի դեպքում ձախ աղյուսակի չհամընկնող տողերը՝"), [tr("Omitted", "Բաց են թողնվում"), tr("Returned with NULL values for the right table", "Վերադարձվում են՝ աջ աղյուսակի սյունակներում NULL արժեքներով"), tr("Reported as an error", "Առաջացնում են սխալ"), tr("Duplicated", "Կրկնապատկվում են")], [1], 1],
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

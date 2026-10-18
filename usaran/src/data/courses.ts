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
  { id: 'programming', name: 'Ծրագրավորում', description: 'Վեբ, հավելվածներ և ալգորիթմներ', courseCount: 48 },
  { id: 'design', name: 'Դիզայն', description: 'UX հետազոտություն և ինտերֆեյսներ', courseCount: 21 },
  { id: 'math', name: 'Մաթեմատիկա', description: 'Անալիզ, հանրահաշիվ, վիճակագրություն', courseCount: 26 },
  { id: 'ai', name: 'Արհեստական բանականություն', description: 'Մեքենայական և խորը ուսուցում', courseCount: 17 },
  { id: 'data', name: 'Տվյալների վերլուծություն', description: 'Python, SQL, վիզուալիզացիա', courseCount: 19 },
  { id: 'languages', name: 'Լեզուներ', description: 'Ակադեմիական և գործնական հաղորդակցություն', courseCount: 14 },
  { id: 'science', name: 'Բնական գիտություններ', description: 'Ֆիզիկա, քիմիա, կենսաբանություն', courseCount: 12 },
  { id: 'business', name: 'Բիզնես և կառավարում', description: 'Նախագծեր, թիմեր, ֆինանսներ', courseCount: 16 },
];

export const difficultyLabel = {
  beginner: 'Սկսնակ',
  intermediate: 'Միջին',
  advanced: 'Առաջադեմ',
} as const;

export function categoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? 'Այլ';
}

export const courses: Course[] = [
  {
    id: 'react',
    title: 'React. ժամանակակից ինտերֆեյսների մշակում',
    shortDescription: 'Կոմպոնենտներ, վիճակ, hook-եր և բազմաէջ հավելվածներ իրական նախագծի օրինակով։',
    description:
      'Դասընթացը ձեզ կուղեկցի React-ի հիմնական գաղափարներից մինչև ամբողջական բազմաէջ հավելվածի ստեղծում։ Յուրաքանչյուր մոդուլ ավարտվում է գործնական առաջադրանքով, իսկ դասընթացի ընթացքում դուք կկառուցեք ուսումնական նախագծերի կառավարման ինտերֆեյս։',
    category: 'programming',
    difficulty: 'intermediate',
    durationHours: 32,
    enrolled: 1284,
    rating: 4.8,
    teacherId: 't1',
    image: img('1633356122544-f134324a6cee'),
    status: 'published',
    featured: true,
    language: 'Հայերեն',
    updatedAt: '2026-09-28',
    objectives: [
      'Կառուցել վերօգտագործվող կոմպոնենտներ և կազմակերպել դրանց հիերարխիան',
      'Կառավարել վիճակը useState, useReducer և Context-ի միջոցով',
      'Աշխատել կողմնակի էֆեկտների և ասինխրոն տվյալների հետ',
      'Ստեղծել բազմաէջ հավելված React Router-ով',
      'Գրել ընթեռնելի, թեստավորվող և մատչելի ինտերֆեյսի կոդ',
    ],
    modules: mods('react', [
      ['React-ի հիմունքներ', [
        ['Ինչու React. դեկլարատիվ մոտեցում', 'video', 14, true],
        ['JSX-ի շարահյուսությունը', 'text', 10, true],
        ['Առաջին կոմպոնենտը', 'video', 18],
        ['Props և տվյալների փոխանցում', 'video', 16],
        ['Ստուգողական թեստ. հիմնական գաղափարներ', 'quiz', 15],
      ]],
      ['Վիճակ և իրադարձություններ', [
        ['useState hook-ը', 'video', 20],
        ['Իրադարձությունների մշակում', 'text', 12],
        ['Վերահսկվող ձևաթղթեր', 'video', 22],
        ['Ցուցակներ և key հատկանիշ', 'video', 15],
        ['Գործնական առաջադրանք. կոմպոնենտների գրադարան', 'assignment', 90],
      ]],
      ['Էֆեկտներ և տվյալներ', [
        ['useEffect-ի կյանքի ցիկլը', 'video', 24],
        ['Ասինխրոն տվյալների բեռնում', 'video', 21],
        ['Սեփական hook-երի ստեղծում', 'text', 16],
        ['Լրացուցիչ նյութեր և օրինակներ', 'resource', 10],
        ['Առաջադրանք. ձևաթղթի վալիդացիա hook-երով', 'assignment', 75],
      ]],
      ['Երթուղավորում և ճարտարապետություն', [
        ['React Router. երթուղիներ և դասավորություններ', 'video', 26],
        ['Context API և գլոբալ վիճակ', 'video', 19],
        ['Թղթապանակների կառուցվածք մեծ նախագծում', 'text', 14],
        ['Եզրափակիչ նախագիծ', 'assignment', 180],
      ]],
    ]),
  },
  {
    id: 'js',
    title: 'JavaScript-ի հիմունքներ',
    shortDescription: 'Լեզվի հիմքերը զրոյից. փոփոխականներ, ֆունկցիաներ, DOM և ասինխրոն կոդ։',
    description:
      'Սկսնակների համար նախատեսված դասընթաց, որը քայլ առ քայլ բացատրում է JavaScript լեզուն և բրաուզերում դրա կիրառությունը։ Դասերը կարճ են, իսկ յուրաքանչյուր թեմա ամրապնդվում է ինտերակտիվ վարժություններով։',
    category: 'programming',
    difficulty: 'beginner',
    durationHours: 24,
    enrolled: 3410,
    rating: 4.9,
    teacherId: 't1',
    image: img('1579468118864-1b9ea3c0db4a'),
    status: 'published',
    featured: true,
    language: 'Հայերեն',
    updatedAt: '2026-08-14',
    objectives: [
      'Հասկանալ տվյալների տիպերը և օպերատորները',
      'Գրել ֆունկցիաներ և աշխատել զանգվածների հետ',
      'Փոփոխել էջի բովանդակությունը DOM-ի միջոցով',
      'Կիրառել Promise և async/await',
    ],
    modules: mods('js', [
      ['Լեզվի հիմքերը', [
        ['Ներածություն և միջավայրի կարգավորում', 'video', 12, true],
        ['Փոփոխականներ և տիպեր', 'video', 18, true],
        ['Օպերատորներ և պայմաններ', 'text', 14],
      ]],
      ['Ֆունկցիաներ և զանգվածներ', [
        ['Ֆունկցիաների հայտարարում', 'video', 20],
        ['Զանգվածների մեթոդներ', 'video', 22],
        ['Թեստ. տիպեր և ֆունկցիաներ', 'quiz', 15],
      ]],
      ['DOM և իրադարձություններ', [
        ['DOM ծառը', 'video', 16],
        ['Իրադարձությունների մշակում', 'video', 18],
        ['Առաջադրանք. խնդիրների ցուցակ', 'assignment', 60],
      ]],
      ['Ասինխրոն JavaScript', [
        ['Callback և Promise', 'video', 22],
        ['async/await', 'text', 15],
        ['Թեստ. ասինխրոն ծրագրավորում', 'quiz', 15],
        ['Առաջադրանք. եղանակի վիդջեթ', 'assignment', 75],
      ]],
    ]),
  },
  {
    id: 'python-data',
    title: 'Python տվյալների վերլուծության համար',
    shortDescription: 'NumPy, pandas և վիզուալիզացիա. իրական տվյալներից մինչև եզրակացություն։',
    description:
      'Դասընթացը նախատեսված է նրանց համար, ովքեր ցանկանում են Python-ով մաքրել, վերլուծել և ներկայացնել տվյալներ։ Աշխատանքը կատարվում է բաց տվյալների հավաքածուներով։',
    category: 'data',
    difficulty: 'intermediate',
    durationHours: 28,
    enrolled: 1976,
    rating: 4.7,
    teacherId: 't1',
    image: img('1551288049-bebda4e38f71'),
    status: 'published',
    featured: true,
    language: 'Հայերեն',
    updatedAt: '2026-07-30',
    objectives: [
      'Ներմուծել և մաքրել աղյուսակային տվյալներ pandas-ով',
      'Կատարել խմբավորում, միավորում և ամփոփում',
      'Կառուցել տեղեկատվական գրաֆիկներ',
      'Պատրաստել վերլուծական զեկույց',
    ],
    modules: mods('python-data', [
      ['Python-ի արագ կրկնություն', [
        ['Աշխատանքային միջավայր և Jupyter', 'video', 15, true],
        ['Տվյալների կառուցվածքներ Python-ում', 'text', 18],
      ]],
      ['NumPy և pandas', [
        ['NumPy զանգվածներ', 'video', 20],
        ['DataFrame-ի հիմունքներ', 'video', 24],
        ['Թեստ. pandas հիմունքներ', 'quiz', 15],
        ['Առաջադրանք. տվյալների մաքրում', 'assignment', 90],
      ]],
      ['Վիզուալիզացիա', [
        ['Matplotlib և գրաֆիկների տեսակներ', 'video', 22],
        ['Ինչպես ընտրել ճիշտ գրաֆիկը', 'text', 12],
        ['Առաջադրանք. վիզուալիզացիայի զեկույց', 'assignment', 120],
      ]],
    ]),
  },
  {
    id: 'sql',
    title: 'SQL և տվյալների բազաների նախագծում',
    shortDescription: 'Հարցումներ, միացումներ և նորմալացում հարաբերական բազաներում։',
    description:
      'Կսովորեք գրել արդյունավետ SQL հարցումներ, նախագծել աղյուսակներ և հասկանալ, թե ինչպես են տվյալները կազմակերպվում իրական հավելվածներում։',
    category: 'data',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 842,
    rating: 4.6,
    teacherId: 't1',
    image: img('1544383835-bda2bc66a55d'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-10-02',
    objectives: ['Գրել SELECT հարցումներ զտիչներով', 'Կիրառել JOIN-եր և ագրեգատ ֆունկցիաներ', 'Նախագծել նորմալացված սխեմա'],
    modules: mods('sql', [
      ['Ներածություն', [
        ['Հարաբերական մոդելը', 'video', 14, true],
        ['Առաջին հարցումը', 'video', 16],
      ]],
      ['Հարցումներ', [
        ['WHERE, ORDER BY, LIMIT', 'video', 18],
        ['JOIN-երի տեսակները', 'video', 24],
        ['Առաջադրանք. հարցումների հավաքածու', 'assignment', 60],
      ]],
    ]),
  },
  {
    id: 'algorithms',
    title: 'Ալգորիթմներ և տվյալների կառուցվածքներ',
    shortDescription: 'Բարդության վերլուծություն, դասավորում, գրաֆներ և դինամիկ ծրագրավորում։',
    description: 'Խորացված դասընթաց՝ տեխնիկական հարցազրույցներին և մրցութային ծրագրավորմանը նախապատրաստվողների համար։',
    category: 'programming',
    difficulty: 'advanced',
    durationHours: 40,
    enrolled: 0,
    rating: 0,
    teacherId: 't1',
    image: img('1509228468518-180dd4864904'),
    status: 'draft',
    language: 'Հայերեն',
    updatedAt: '2026-10-11',
    objectives: ['Գնահատել ալգորիթմի բարդությունը', 'Կիրառել գրաֆների ալգորիթմներ', 'Լուծել խնդիրներ դինամիկ ծրագրավորմամբ'],
    modules: mods('algorithms', [
      ['Բարդության վերլուծություն', [
        ['Big-O նշագրում', 'video', 18],
        ['Ռեկուրսիա', 'text', 20],
      ]],
    ]),
  },
  {
    id: 'ux',
    title: 'UX/UI դիզայնի հիմունքներ',
    shortDescription: 'Օգտատիրոջ հետազոտություն, տեղեկատվական ճարտարապետություն և նախատիպեր։',
    description:
      'Դասընթացը ներկայացնում է օգտատիրոջ փորձի նախագծման ամբողջական գործընթացը՝ հետազոտությունից մինչև թեստավորված նախատիպ։',
    category: 'design',
    difficulty: 'beginner',
    durationHours: 20,
    enrolled: 2207,
    rating: 4.8,
    teacherId: 't2',
    image: img('1581291518857-4e27b48ff24e'),
    status: 'published',
    featured: true,
    language: 'Հայերեն',
    updatedAt: '2026-09-12',
    objectives: ['Անցկացնել օգտատիրոջ հարցազրույցներ', 'Կառուցել պերսոնաներ և օգտատիրոջ ճանապարհ', 'Ստեղծել և թեստավորել նախատիպեր'],
    modules: mods('ux', [
      ['Ի՞նչ է UX-ը', [
        ['Դիզայնի մտածողություն', 'video', 15, true],
        ['UX և UI. տարբերությունները', 'text', 10, true],
      ]],
      ['Հետազոտություն', [
        ['Հարցազրույցի պլանավորում', 'video', 18],
        ['Արդյունքների սինթեզ', 'video', 20],
        ['Առաջադրանք. հարցազրույցների վերլուծություն', 'assignment', 90],
      ]],
      ['Նախագծում', [
        ['Օգտատիրոջ ճանապարհի քարտեզ', 'video', 16],
        ['Առաջադրանք. ճանապարհի քարտեզ', 'assignment', 90],
        ['Թեստ. օգտագործելիության սկզբունքներ', 'quiz', 12],
      ]],
      ['Նախատիպեր', [
        ['Ցածր և բարձր մանրամասնության նախատիպեր', 'video', 22],
        ['Օգտագործելիության թեստավորում', 'video', 20],
      ]],
    ]),
  },
  {
    id: 'figma',
    title: 'Ինտերֆեյսի նախագծում Figma-ում',
    shortDescription: 'Ավտոդասավորություն, կոմպոնենտներ և դիզայն համակարգեր։',
    description: 'Գործնական դասընթաց՝ Figma-ում արագ և հետևողական ինտերֆեյսներ ստեղծելու համար։',
    category: 'design',
    difficulty: 'intermediate',
    durationHours: 16,
    enrolled: 1530,
    rating: 4.7,
    teacherId: 't2',
    image: img('1561070791-2526d30994b5'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-06-20',
    objectives: ['Օգտագործել Auto Layout', 'Կառուցել կոմպոնենտների գրադարան', 'Պատրաստել դիզայնը մշակողներին փոխանցելու համար'],
    modules: mods('figma', [
      ['Միջավայր', [['Ինտերֆեյսի ակնարկ', 'video', 12, true], ['Շրջանակներ և ցանցեր', 'video', 15]]],
      ['Կոմպոնենտներ', [['Տարբերակներ և հատկություններ', 'video', 20], ['Դիզայն տոկեններ', 'text', 14]]],
    ]),
  },
  {
    id: 'ml',
    title: 'Մեքենայական ուսուցման ներածություն',
    shortDescription: 'Ռեգրեսիա, դասակարգում և մոդելի գնահատում Python-ով։',
    description:
      'Դասընթացը տալիս է մեքենայական ուսուցման հիմնարար գաղափարների հստակ պատկերացում և գործնական հմտություններ scikit-learn գրադարանով։',
    category: 'ai',
    difficulty: 'intermediate',
    durationHours: 36,
    enrolled: 2894,
    rating: 4.9,
    teacherId: 't4',
    image: img('1677442136019-21780ecad995'),
    status: 'published',
    featured: true,
    language: 'Հայերեն',
    updatedAt: '2026-09-30',
    objectives: ['Տարբերակել վերահսկվող և չվերահսկվող ուսուցումը', 'Կառուցել ռեգրեսիայի և դասակարգման մոդելներ', 'Գնահատել մոդելը ճիշտ մետրիկաներով'],
    modules: mods('ml', [
      ['Հիմնական գաղափարներ', [
        ['Ի՞նչ է մեքենայական ուսուցումը', 'video', 16, true],
        ['Տվյալներ, հատկանիշներ, պիտակներ', 'text', 12, true],
        ['Թեստ. տերմինաբանություն', 'quiz', 12],
      ]],
      ['Տվյալների նախապատրաստում', [
        ['Բացակայող արժեքներ', 'video', 18],
        ['Նորմալացում և կոդավորում', 'video', 20],
        ['Առաջադրանք. տվյալների նախապատրաստում', 'assignment', 80],
      ]],
      ['Ռեգրեսիա', [
        ['Գծային ռեգրեսիա', 'video', 24],
        ['Կորստի ֆունկցիա և գրադիենտային վայրէջք', 'text', 18],
        ['Առաջադրանք. գծային ռեգրեսիայի մոդել', 'assignment', 120],
      ]],
      ['Դասակարգում', [
        ['Լոգիստիկ ռեգրեսիա', 'video', 22],
        ['Որոշումների ծառեր', 'video', 20],
        ['Մոդելի գնահատման մետրիկաներ', 'text', 16],
      ]],
    ]),
  },
  {
    id: 'deep-learning',
    title: 'Խորը ուսուցում և նեյրոնային ցանցեր',
    shortDescription: 'Բազմաշերտ ցանցեր, կոնվոլյուցիոն և ռեկուրենտ մոդելներ։',
    description: 'Խորացված դասընթաց՝ նեյրոնային ցանցերի տեսության և PyTorch-ով կիրառության մասին։',
    category: 'ai',
    difficulty: 'advanced',
    durationHours: 44,
    enrolled: 1120,
    rating: 4.8,
    teacherId: 't4',
    image: img('1555255707-c07966088b7b'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-05-18',
    objectives: ['Հասկանալ հետադարձ տարածումը', 'Ուսուցանել CNN մոդելներ', 'Աշխատել հաջորդականությունների հետ'],
    modules: mods('deep-learning', [
      ['Նեյրոնային ցանցեր', [['Պերցեպտրոն', 'video', 18, true], ['Ակտիվացման ֆունկցիաներ', 'text', 12]]],
      ['CNN', [['Կոնվոլյուցիա', 'video', 24], ['Պատկերների դասակարգում', 'video', 26]]],
    ]),
  },
  {
    id: 'ai-tools',
    title: 'Արհեստական բանականության գործիքները աշխատանքում',
    shortDescription: 'Ինչպես պատասխանատու և արդյունավետ կիրառել AI գործիքները ամենօրյա աշխատանքում։',
    description: 'Գործնական դասընթաց՝ առանց ծրագրավորման նախնական գիտելիքների։',
    category: 'ai',
    difficulty: 'beginner',
    durationHours: 8,
    enrolled: 4120,
    rating: 4.6,
    teacherId: 't4',
    image: img('1620712943543-bcc4688e7485'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-10-05',
    objectives: ['Ձևակերպել հստակ հարցումներ', 'Ստուգել արդյունքների ճշգրտությունը', 'Հասկանալ էթիկական սահմանները'],
    modules: mods('ai-tools', [
      ['Ներածություն', [['Ինչպես են աշխատում լեզվական մոդելները', 'video', 14, true], ['Հարցումների ձևակերպում', 'text', 12]]],
    ]),
  },
  {
    id: 'linear-algebra',
    title: 'Գծային հանրահաշիվ',
    shortDescription: 'Վեկտորներ, մատրիցներ, սեփական արժեքներ և դրանց կիրառությունները։',
    description: 'Դասընթացը համատեղում է խիստ տեսությունը և երկրաչափական ինտուիցիան՝ տվյալագիտության և ինժեներիայի կիրառություններով։',
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 30,
    enrolled: 1648,
    rating: 4.7,
    teacherId: 't3',
    image: img('1635070041078-e363dbe005cb'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-08-01',
    objectives: ['Կատարել գործողություններ մատրիցների հետ', 'Լուծել գծային հավասարումների համակարգեր', 'Գտնել սեփական արժեքներ և վեկտորներ'],
    modules: mods('linear-algebra', [
      ['Վեկտորներ', [['Վեկտորներ և գործողություններ', 'video', 18, true], ['Սկալյար արտադրյալ', 'text', 14], ['Թեստ. վեկտորներ և մատրիցներ', 'quiz', 15]]],
      ['Մատրիցներ', [['Մատրիցների բազմապատկում', 'video', 20], ['Որոշիչ', 'video', 18]]],
      ['Սեփական արժեքներ', [['Սեփական վեկտորներ', 'video', 22], ['Կիրառություններ', 'text', 15]]],
    ]),
  },
  {
    id: 'calculus',
    title: 'Մաթեմատիկական անալիզ I',
    shortDescription: 'Սահմաններ, ածանցյալներ և ինտեգրալներ՝ պարզ բացատրություններով։',
    description: 'Բուհական առաջին կուրսի ծրագրին համապատասխան դասընթաց՝ լուծված օրինակներով։',
    category: 'math',
    difficulty: 'beginner',
    durationHours: 26,
    enrolled: 2380,
    rating: 4.6,
    teacherId: 't3',
    image: img('1596495578065-6e0763fa1178'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-04-11',
    objectives: ['Հաշվել սահմաններ', 'Ածանցել և ուսումնասիրել ֆունկցիաներ', 'Հաշվել որոշյալ ինտեգրալներ'],
    modules: mods('calculus', [
      ['Սահմաններ', [['Հաջորդականության սահման', 'video', 20, true], ['Ֆունկցիայի սահման', 'video', 22]]],
      ['Ածանցյալ', [['Ածանցյալի սահմանումը', 'video', 18], ['Ածանցման կանոններ', 'text', 16]]],
    ]),
  },
  {
    id: 'statistics',
    title: 'Հավանականություն և վիճակագրություն',
    shortDescription: 'Բաշխումներ, վարկածների ստուգում և վստահության միջակայքեր։',
    description: 'Կիրառական վիճակագրություն՝ տվյալների վերլուծության և հետազոտությունների համար։',
    category: 'math',
    difficulty: 'intermediate',
    durationHours: 22,
    enrolled: 1310,
    rating: 4.5,
    teacherId: 't3',
    image: img('1543286386-713bdd548da4'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-07-07',
    objectives: ['Աշխատել պատահական մեծությունների հետ', 'Ստուգել վիճակագրական վարկածներ'],
    modules: mods('statistics', [
      ['Հավանականություն', [['Պատահույթներ', 'video', 16, true], ['Պայմանական հավանականություն', 'video', 18]]],
    ]),
  },
  {
    id: 'academic-english',
    title: 'Ակադեմիական անգլերեն',
    shortDescription: 'Գիտական տեքստերի ընթերցում, էսսեների գրում և ներկայացումներ։',
    description: 'B1–B2 մակարդակի ուսանողների համար՝ ակադեմիական միջավայրում վստահ հաղորդակցվելու նպատակով։',
    category: 'languages',
    difficulty: 'intermediate',
    durationHours: 20,
    enrolled: 1870,
    rating: 4.7,
    teacherId: 't5',
    image: img('1456513080510-7bf3a84b82f8'),
    status: 'published',
    language: 'Հայերեն / անգլերեն',
    updatedAt: '2026-09-02',
    objectives: ['Կառուցել ակադեմիական էսսե', 'Ճիշտ հղումներ կատարել աղբյուրներին', 'Ներկայացնել հետազոտություն բանավոր'],
    modules: mods('academic-english', [
      ['Ընթերցում', [['Գիտական հոդվածի կառուցվածքը', 'video', 15, true], ['Արագ ընթերցման տեխնիկաներ', 'text', 12]]],
    ]),
  },
  {
    id: 'physics',
    title: 'Ֆիզիկա. մեխանիկայի հիմունքներ',
    shortDescription: 'Կինեմատիկա, Նյուտոնի օրենքներ և էներգիա՝ փորձերով և խնդիրներով։',
    description: 'Դպրոցական և բուհական ծրագրերի միջև կամուրջ հանդիսացող դասընթաց։',
    category: 'science',
    difficulty: 'beginner',
    durationHours: 18,
    enrolled: 960,
    rating: 4.5,
    teacherId: 't3',
    image: img('1636466497217-26a8cbeaf0aa'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-03-15',
    objectives: ['Լուծել կինեմատիկայի խնդիրներ', 'Կիրառել Նյուտոնի օրենքները'],
    modules: mods('physics', [
      ['Կինեմատիկա', [['Շարժման նկարագրությունը', 'video', 16, true], ['Արագացում', 'video', 18]]],
    ]),
  },
  {
    id: 'project-management',
    title: 'Նախագծերի կառավարում',
    shortDescription: 'Պլանավորում, ռիսկեր, Agile մեթոդներ և թիմային աշխատանք։',
    description: 'Գործնական գործիքներ՝ փոքր և միջին նախագծերը ժամանակին և բյուջեի սահմաններում ավարտելու համար։',
    category: 'business',
    difficulty: 'beginner',
    durationHours: 14,
    enrolled: 1440,
    rating: 4.6,
    teacherId: 't5',
    image: img('1552664730-d307ca884978'),
    status: 'published',
    language: 'Հայերեն',
    updatedAt: '2026-08-25',
    objectives: ['Կազմել նախագծի պլան', 'Կառավարել ռիսկերը', 'Կիրառել Scrum-ի հիմնական պրակտիկաները'],
    modules: mods('project-management', [
      ['Պլանավորում', [['Նախագծի կյանքի ցիկլը', 'video', 14, true], ['Աշխատանքների բաշխման կառուցվածք', 'text', 12]]],
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

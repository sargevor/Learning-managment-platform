import type { Course, Lesson, Module } from '../types';

export interface LessonSection {
  heading: string;
  paragraphs: string[];
  code?: string;
}

export interface LessonResource {
  name: string;
  kind: 'pdf' | 'zip' | 'link' | 'code';
  size?: string;
}

export interface LessonContent {
  intro: string;
  sections: LessonSection[];
  keyPoints: string[];
  resources: LessonResource[];
}

const specific: Record<string, Partial<LessonContent>> = {
  'react-m2-l4': {
    intro: 'Իրական հավելվածներում տվյալները հաճախ ցուցադրվում են ցուցակներով՝ դասընթացներ, առաջադրանքներ, հաղորդագրություններ։ Այս դասում կտեսնենք, թե ինչպես է React-ը ռենդերում ցուցակները և ինչու է key հատկանիշը կարևոր։',
    sections: [
      {
        heading: 'Զանգվածից՝ տարրերի ցուցակ',
        paragraphs: [
          'React-ում ցուցակը ստեղծվում է զանգվածի map մեթոդով։ Յուրաքանչյուր տարր վերածվում է JSX տարրի, և React-ը ռենդերում է ստացված զանգվածը։',
        ],
        code: `function CourseList({ courses }) {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  );
}`,
      },
      {
        heading: 'Ինչու է key-ը կարևոր',
        paragraphs: [
          'key-ը օգնում է React-ին հասկանալ, թե որ տարրն է փոխվել, ավելացվել կամ հեռացվել։ Առանց կայուն key-ի React-ը կարող է սխալ վերօգտագործել կոմպոնենտի վիճակը։',
          'Որպես key օգտագործեք տվյալի եզակի նույնացուցիչը։ Զանգվածի ինդեքսը հարմար է միայն այն դեպքում, երբ ցուցակի հերթականությունը երբեք չի փոխվում։',
        ],
      },
    ],
    keyPoints: ['Ցուցակները ստեղծվում են map մեթոդով', 'key-ը պետք է լինի կայուն և եզակի', 'Մի օգտագործեք ինդեքսը փոփոխվող ցուցակներում'],
  },
};

export function getLessonContent(course: Course, module: Module, lesson: Lesson): LessonContent {
  const custom = specific[lesson.id] ?? {};
  return {
    intro:
      custom.intro ??
      `Այս դասը «${module.title}» մոդուլի մաս է։ Կծանոթանաք «${lesson.title}» թեմայի հիմնական գաղափարներին, կտեսնեք կիրառական օրինակներ և կստանաք առաջարկներ ինքնուրույն աշխատանքի համար։`,
    sections: custom.sections ?? [
      {
        heading: 'Հիմնական գաղափարը',
        paragraphs: [
          `«${lesson.title}» թեման կարևոր քայլ է «${course.title}» դասընթացում։ Սկզբում ձևակերպում ենք խնդիրը, ապա քննարկում ենք այն լուծելու մոտեցումները և դրանց սահմանափակումները։`,
          'Դասի վերջում վերադարձեք հիմնական մտքերին և փորձեք դրանք բացատրել ձեր բառերով․ դա ամենաարդյունավետ ձևն է ստուգելու, թե որքան լավ եք յուրացրել նյութը։',
        ],
      },
      {
        heading: 'Գործնական օրինակ',
        paragraphs: [
          'Ստորև բերված օրինակը ցույց է տալիս, թե ինչպես է թեման կիրառվում իրական աշխատանքում։ Կրկնեք քայլերը ձեր միջավայրում և փոփոխեք պարամետրերը՝ արդյունքը համեմատելու համար։',
        ],
      },
    ],
    keyPoints: custom.keyPoints ?? ['Ձևակերպեք խնդիրը նախքան լուծում ընտրելը', 'Համեմատեք մի քանի մոտեցում', 'Ամրապնդեք նյութը գործնական վարժությամբ'],
    resources: [
      { name: `${lesson.title} — ամփոփագիր.pdf`, kind: 'pdf', size: '420 ԿԲ' },
      { name: 'Օրինակների կոդ.zip', kind: 'zip', size: '86 ԿԲ' },
      { name: 'Լրացուցիչ ընթերցանություն', kind: 'link' },
    ],
  };
}

export const testimonials = [
  { name: 'Մարիամ Ղ.', role: 'Բիզնես վերլուծության ուսանող', text: 'Առաջադրանքների մեկնաբանությունները շատ կոնկրետ են․ ամեն անգամ հստակ գիտեմ, թե ինչ բարելավել։', course: 'Python տվյալների վերլուծության համար' },
  { name: 'Հայկ Վ.', role: 'Ծրագրային ճարտարագիտության ուսանող', text: 'Հարմար է, որ բոլոր վերջնաժամկետները և արդյունքները մեկ տեղում են։ Կիսամյակը պլանավորելը շատ ավելի հեշտ դարձավ։', course: 'React. ժամանակակից ինտերֆեյսների մշակում' },
  { name: 'Էլեն Ա.', role: 'Մաթեմատիկայի ուսանող', text: 'Կարճ տեսադասերն ու թեստերը թույլ են տալիս սովորել նույնիսկ ճանապարհին՝ հեռախոսից։', course: 'Գծային հանրահաշիվ' },
];

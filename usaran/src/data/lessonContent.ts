import type { Course, Lesson, Module } from '../types';
import { tr } from '../i18n';

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
    intro: tr("Real applications often display data as lists: courses, assignments, or messages. In this lesson, we explore how React renders lists and why the key attribute matters.", "Իրական հավելվածներում տվյալները հաճախ ցուցադրվում են ցուցակներով՝ դասընթացներ, առաջադրանքներ, հաղորդագրություններ։ Այս դասում կտեսնենք, թե ինչպես է React-ն արտապատկերում ցուցակները և ինչո՞ւ է key հատկանիշը կարևոր։"),
    sections: [
      {
        heading: tr("From an Array to a List", "Զանգվածից՝ ցուցակ"),
        paragraphs: [
          tr("In React, you can create a list with the array map method. Each item becomes a JSX element, and React renders the resulting array.", "React-ում ցուցակը ստեղծվում է զանգվածի map մեթոդով։ Յուրաքանչյուր տարր վերածվում է JSX տարրի, և React-ն արտապատկերում է ստացված զանգվածը։"),
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
        heading: tr("Why Keys Matter", "Ինչո՞ւ է key-ը կարևոր"),
        paragraphs: [
          tr("Keys help React identify which items have changed, been added, or been removed. Without stable keys, React may reuse component state incorrectly.", "key-ն օգնում է React-ին հասկանալ, թե որ տարրն է փոխվել, ավելացվել կամ հեռացվել։ Առանց կայուն key-ի React-ը կարող է սխալմամբ վերօգտագործել բաղադրիչի վիճակը։"),
          tr("Use a unique data identifier as the key. An array index is only suitable when the list order never changes.", "Որպես key օգտագործեք տվյալի եզակի նույնացուցիչը։ Զանգվածի ինդեքսը հարմար է միայն այն դեպքում, երբ ցուցակի հերթականությունն երբեք չի փոխվում։"),
        ],
      },
    ],
    keyPoints: [tr("Create lists with the map method", "Ցուցակները ստեղծվում են map մեթոդով"), tr("Keys should be stable and unique", "key-ը պետք է լինի կայուն և եզակի"), tr("Avoid using indices in lists that can change", "Մի օգտագործեք ինդեքսը փոփոխվող ցուցակներում")],
  },
};

export function getLessonContent(course: Course, module: Module, lesson: Lesson): LessonContent {
  const custom = specific[lesson.id] ?? {};
  return {
    intro:
      custom.intro ??
      tr(`This lesson is part of the ${module.title} module. You will explore the key ideas behind ${lesson.title}, see practical examples, and get suggestions for independent practice.`, `Այս դասը «${module.title}» մոդուլի մաս է։ Կծանոթանաք «${lesson.title}» թեմայի հիմնական գաղափարներին, կտեսնեք կիրառական օրինակներ և կստանաք առաջարկներ ինքնուրույն աշխատանքի համար։`),
    sections: custom.sections ?? [
      {
        heading: tr("The Main Idea", "Հիմնական գաղափարը"),
        paragraphs: [
          tr(`${lesson.title} is an important topic in ${course.title}. We start by defining the problem, then discuss possible approaches and their limitations.`, `«${lesson.title}» թեման կարևոր քայլ է «${course.title}» դասընթացում։ Սկզբում ձևակերպում ենք խնդիրը, ապա քննարկում ենք այն լուծելու մոտեցումները և դրանց սահմանափակումները։`),
          tr("At the end of the lesson, revisit the key ideas and explain them in your own words to check your understanding.", "Դասի վերջում վերադարձեք հիմնական մտքերին և փորձեք դրանք բացատրել ձեր բառերով․ դա ամենաարդյունավետ ձևն է ստուգելու, թե որքան լավ եք յուրացրել նյութը։"),
        ],
      },
      {
        heading: tr("Practical Example", "Գործնական օրինակ"),
        paragraphs: [
          tr("The example below shows how this topic applies in practice. Follow the steps in your own environment and change the parameters to compare the results.", "Ստորև բերված օրինակը ցույց է տալիս, թե ինչպես է թեման կիրառվում իրական աշխատանքում։ Կրկնեք քայլերը ձեր միջավայրում և փոփոխեք պարամետրերը՝ արդյունքը համեմատելու համար։"),
        ],
      },
    ],
    keyPoints: custom.keyPoints ?? [tr("Define the problem before choosing a solution", "Ձևակերպեք խնդիրը նախքան լուծում ընտրելը"), tr("Compare several approaches", "Համեմատեք մի քանի մոտեցում"), tr("Reinforce your learning with a practical exercise", "Ամրապնդեք նյութը գործնական վարժությամբ")],
    resources: [
      { name: tr(`${lesson.title} — Summary.pdf`, `${lesson.title} — ամփոփագիր.pdf`), kind: 'pdf', size: tr("420 KB", "420 ԿԲ") },
      { name: tr("Sample Code.zip", "Օրինակների կոդ.zip"), kind: 'zip', size: tr("86 KB", "86 ԿԲ") },
      { name: tr("Further Reading", "Լրացուցիչ ընթերցանություն"), kind: 'link' },
    ],
  };
}

export const testimonials = [
  { name: tr("Mariam G.", "Մարիամ Ղ."), role: tr("Business Analytics Student", "Բիզնես վերլուծության ուսանող"), text: tr("The assignment feedback is specific and helpful. I always know exactly what to improve next.", "Առաջադրանքների մեկնաբանությունները շատ կոնկրետ են․ ամեն անգամ հստակ գիտեմ, թե ինչ բարելավել։"), course: tr("Python for Data Analysis", "Python տվյալների վերլուծության համար") },
  { name: tr("Hayk V.", "Հայկ Վ."), role: tr("Software Engineering Student", "Ծրագրային ճարտարագիտության ուսանող"), text: tr("Having all my deadlines and results in one place makes planning the semester much easier.", "Հարմար է, որ բոլոր վերջնաժամկետները և արդյունքները մեկ տեղում են։ Կիսամյակը պլանավորելը շատ ավելի հեշտ դարձավ։"), course: tr("React: Building Modern Interfaces", "React․ ժամանակակից միջերեսների մշակում") },
  { name: tr("Elen A.", "Էլեն Ա."), role: tr("Mathematics Student", "Մաթեմատիկայի ուսանող"), text: tr("Short video lessons and quizzes let me keep learning on my phone, even when I am on the go.", "Կարճ տեսադասերն ու թեստերը թույլ են տալիս սովորել նույնիսկ ճանապարհին՝ հեռախոսից։"), course: tr("Linear Algebra", "Գծային հանրահաշիվ") },
];

import type { User } from '../types';
import { tr } from '../i18n';

export const DEMO_STUDENT_ID = 's1';
export const DEMO_TEACHER_ID = 't1';

export const teachers: User[] = [
  {
    id: 't1',
    firstName: tr("Armen", "Արմեն"),
    lastName: tr("Sargsyan", "Սարգսյան"),
    email: 'armen.sargsyan@learnspace.example',
    role: 'teacher',
    title: tr("Software Engineer and Instructor", "Ծրագրային ինժեներ, դասավանդող"),
    bio: tr("Has 12 years of experience in web development. Teaches JavaScript, React, and data analysis through practical projects.", "Վեբ մշակման ոլորտում ունի 12 տարվա փորձ։ Դասավանդում է JavaScript, React և տվյալների վերլուծություն՝ շեշտը դնելով իրական նախագծերի վրա։"),
    institution: tr("LearnSpace", "LearnSpace"),
    city: tr("Yerevan", "Երևան"),
    phone: '+374 91 000 101',
    joinedAt: '2023-02-10',
  },
  {
    id: 't2',
    firstName: tr("Lilit", "Լիլիթ"),
    lastName: tr("Grigoryan", "Գրիգորյան"),
    email: 'lilit.grigoryan@learnspace.example',
    role: 'teacher',
    title: tr("UX/UI Designer", "UX/UI դիզայներ"),
    bio: tr("Has worked with international teams to research user needs and design application interfaces.", "Աշխատել է միջազգային թիմերում որպես UX հետազոտող և միջերեսի դիզայներ։"),
    joinedAt: '2023-05-04',
  },
  {
    id: 't3',
    firstName: tr("Davit", "Դավիթ"),
    lastName: tr("Petrosyan", "Պետրոսյան"),
    email: 'davit.petrosyan@learnspace.example',
    role: 'teacher',
    title: tr("PhD in Physics and Mathematics", "Ֆիզիկամաթեմատիկական գիտությունների թեկնածու"),
    bio: tr("Has taught advanced mathematics for 15 years and authored two textbooks.", "Բարձրագույն մաթեմատիկա է դասավանդում 15 տարի և հեղինակ է երկու ուսումնական ձեռնարկի։"),
    joinedAt: '2023-01-18',
  },
  {
    id: 't4',
    firstName: tr("Narine", "Նարինե"),
    lastName: tr("Martirosyan", "Մարտիրոսյան"),
    email: 'narine.martirosyan@learnspace.example',
    role: 'teacher',
    title: tr("Machine Learning Researcher", "Մեքենայական ուսուցման հետազոտող"),
    bio: tr("Works in natural language processing and applied machine learning.", "Զբաղվում է բնական լեզվի մշակմամբ և կիրառական մեքենայական ուսուցմամբ։"),
    joinedAt: '2024-03-01',
  },
  {
    id: 't5',
    firstName: tr("Gor", "Գոռ"),
    lastName: tr("Avetisyan", "Ավետիսյան"),
    email: 'gor.avetisyan@learnspace.example',
    role: 'teacher',
    title: tr("Project Management Specialist", "Նախագծերի կառավարման մասնագետ"),
    bio: tr("A PMP-certified professional with experience leading educational and technology projects.", "PMP հավաստագիր ունեցող մասնագետ, որը ղեկավարել է կրթական և տեխնոլոգիական նախագծեր։"),
    joinedAt: '2024-06-12',
  },
];

export const students: User[] = [
  {
    id: 's1',
    firstName: tr("Ani", "Անի"),
    lastName: tr("Hakobyan", "Հակոբյան"),
    email: 'ani.hakobyan@example.am',
    role: 'student',
    institution: tr("Yerevan State University", "Երևանի պետական համալսարան"),
    program: tr("Informatics and Applied Mathematics", "Ինֆորմատիկա և կիրառական մաթեմատիկա"),
    year: tr("Third year", "3-րդ կուրս"),
    city: tr("Yerevan", "Երևան"),
    phone: '+374 94 000 202',
    bio: tr("I am interested in web development and machine learning.", "Հետաքրքրված եմ վեբ մշակմամբ և մեքենայական ուսուցմամբ։"),
    joinedAt: '2025-09-01',
  },
  { id: 's2', firstName: tr("Tigran", "Տիգրան"), lastName: tr("Melkonyan", "Մելքոնյան"), email: 'tigran.melkonyan@example.am', role: 'student', institution: tr("American University of Armenia", "Հայաստանի ամերիկյան համալսարան"), program: tr("Computer Science", "Համակարգչային գիտություն"), year: tr("Second year", "2-րդ կուրս"), joinedAt: '2025-09-10' },
  { id: 's3', firstName: tr("Mariam", "Մարիամ"), lastName: tr("Ghazaryan", "Ղազարյան"), email: 'mariam.ghazaryan@example.am', role: 'student', institution: tr("Armenian State University of Economics", "Հայաստանի պետական տնտեսագիտական համալսարան"), program: tr("Business Analytics", "Բիզնես վերլուծություն"), year: tr("Fourth year", "4-րդ կուրս"), joinedAt: '2025-08-22' },
  { id: 's4', firstName: tr("Hayk", "Հայկ"), lastName: tr("Vardanyan", "Վարդանյան"), email: 'hayk.vardanyan@example.am', role: 'student', institution: tr("National Polytechnic University of Armenia", "Ազգային պոլիտեխնիկական համալսարան"), program: tr("Software Engineering", "Ծրագրային ճարտարագիտություն"), year: tr("Third year", "3-րդ կուրս"), joinedAt: '2025-09-03' },
  { id: 's5', firstName: tr("Elen", "Էլեն"), lastName: tr("Abrahamyan", "Աբրահամյան"), email: 'elen.abrahamyan@example.am', role: 'student', institution: tr("Yerevan State University", "Երևանի պետական համալսարան"), program: tr("Mathematics", "Մաթեմատիկա"), year: tr("Second year", "2-րդ կուրս"), joinedAt: '2025-10-01' },
  { id: 's6', firstName: tr("Arsen", "Արսեն"), lastName: tr("Khachatryan", "Խաչատրյան"), email: 'arsen.khachatryan@example.am', role: 'student', institution: tr("Independent Learner", "Ազատ ունկնդիր"), program: tr("Professional Development", "Մասնագիտական վերապատրաստում"), year: '—', joinedAt: '2025-07-15' },
  { id: 's7', firstName: tr("Sona", "Սոնա"), lastName: tr("Mikayelyan", "Միքայելյան"), email: 'sona.mikayelyan@example.am', role: 'student', institution: tr("Russian-Armenian University", "Հայ-ռուսական համալսարան"), program: tr("Applied Informatics", "Կիրառական ինֆորմատիկա"), year: tr("First year", "1-ին կուրս"), joinedAt: '2025-09-12' },
  { id: 's8', firstName: tr("Narek", "Նարեկ"), lastName: tr("Hovhannisyan", "Հովհաննիսյան"), email: 'narek.hovhannisyan@example.am', role: 'student', institution: tr("National Polytechnic University of Armenia", "Ազգային պոլիտեխնիկական համալսարան"), program: tr("Information Systems", "Տեղեկատվական համակարգեր"), year: tr("Fourth year", "4-րդ կուրս"), joinedAt: '2025-08-30' },
  { id: 's9', firstName: tr("Lusine", "Լուսինե"), lastName: tr("Sahakyan", "Սահակյան"), email: 'lusine.sahakyan@example.am', role: 'student', institution: tr("Yerevan State University", "Երևանի պետական համալսարան"), program: tr("Physics", "Ֆիզիկա"), year: tr("Third year", "3-րդ կուրս"), joinedAt: '2025-09-05' },
  { id: 's10', firstName: tr("Gevorg", "Գևորգ"), lastName: tr("Manukyan", "Մանուկյան"), email: 'gevorg.manukyan@example.am', role: 'student', institution: tr("Independent Learner", "Ազատ ունկնդիր"), program: tr("Professional Development", "Մասնագիտական վերապատրաստում"), year: '—', joinedAt: '2025-06-20' },
  { id: 's11', firstName: tr("Anna", "Աննա"), lastName: tr("Poghosyan", "Պողոսյան"), email: 'anna.poghosyan@example.am', role: 'student', institution: tr("American University of Armenia", "Հայաստանի ամերիկյան համալսարան"), program: tr("Data Science", "Տվյալագիտություն"), year: tr("Second year", "2-րդ կուրս"), joinedAt: '2025-09-14' },
  { id: 's12', firstName: tr("Vahe", "Վահե"), lastName: tr("Davtyan", "Դավթյան"), email: 'vahe.davtyan@example.am', role: 'student', institution: tr("Russian-Armenian University", "Հայ-ռուսական համալսարան"), program: tr("Computer Science", "Համակարգչային գիտություն"), year: tr("Third year", "3-րդ կուրս"), joinedAt: '2025-09-09' },
  { id: 's13', firstName: tr("Mane", "Մանե"), lastName: tr("Zakaryan", "Զաքարյան"), email: 'mane.zakaryan@example.am', role: 'student', institution: tr("Yerevan State University", "Երևանի պետական համալսարան"), program: tr("Informatics", "Ինֆորմատիկա"), year: tr("First year", "1-ին կուրս"), joinedAt: '2025-10-02' },
  { id: 's14', firstName: tr("Ruben", "Ռուբեն"), lastName: tr("Baghdasaryan", "Բաղդասարյան"), email: 'ruben.baghdasaryan@example.am', role: 'student', institution: tr("National Polytechnic University of Armenia", "Ազգային պոլիտեխնիկական համալսարան"), program: tr("Automation", "Ավտոմատացում"), year: tr("Fourth year", "4-րդ կուրս"), joinedAt: '2025-08-18' },
];

export const allUsers: User[] = [...teachers, ...students];

export function getUser(id: string | undefined): User | undefined {
  return allUsers.find((u) => u.id === id);
}

export function fullName(u: User | undefined): string {
  return u ? `${u.firstName} ${u.lastName}` : tr("Unknown user", "Անհայտ օգտատեր");
}

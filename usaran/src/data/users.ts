import type { User } from '../types';

export const DEMO_STUDENT_ID = 's1';
export const DEMO_TEACHER_ID = 't1';

export const teachers: User[] = [
  {
    id: 't1',
    firstName: 'Արմեն',
    lastName: 'Սարգսյան',
    email: 'armen.sargsyan@usaran.am',
    role: 'teacher',
    title: 'Ծրագրային ինժեներ, դասավանդող',
    bio: 'Վեբ մշակման ոլորտում ունի 12 տարվա փորձ։ Դասավանդում է JavaScript, React և տվյալների վերլուծություն՝ շեշտը դնելով իրական նախագծերի վրա։',
    institution: 'Ուսարան',
    city: 'Երևան',
    phone: '+374 91 000 101',
    joinedAt: '2023-02-10',
  },
  {
    id: 't2',
    firstName: 'Լիլիթ',
    lastName: 'Գրիգորյան',
    email: 'lilit.grigoryan@usaran.am',
    role: 'teacher',
    title: 'Արտադրանքի դիզայներ',
    bio: 'Աշխատել է միջազգային թիմերում որպես UX հետազոտող և ինտերֆեյսի դիզայներ։',
    joinedAt: '2023-05-04',
  },
  {
    id: 't3',
    firstName: 'Դավիթ',
    lastName: 'Պետրոսյան',
    email: 'davit.petrosyan@usaran.am',
    role: 'teacher',
    title: 'Ֆիզմաթ գիտությունների թեկնածու',
    bio: 'Բարձրագույն մաթեմատիկա է դասավանդում 15 տարի և հեղինակ է երկու ուսումնական ձեռնարկի։',
    joinedAt: '2023-01-18',
  },
  {
    id: 't4',
    firstName: 'Նարինե',
    lastName: 'Մարտիրոսյան',
    email: 'narine.martirosyan@usaran.am',
    role: 'teacher',
    title: 'Մեքենայական ուսուցման հետազոտող',
    bio: 'Զբաղվում է բնական լեզվի մշակմամբ և կիրառական մեքենայական ուսուցմամբ։',
    joinedAt: '2024-03-01',
  },
  {
    id: 't5',
    firstName: 'Գոռ',
    lastName: 'Ավետիսյան',
    email: 'gor.avetisyan@usaran.am',
    role: 'teacher',
    title: 'Նախագծերի կառավարման մասնագետ',
    bio: 'PMP հավաստագրված մասնագետ, ղեկավարել է կրթական և տեխնոլոգիական նախագծեր։',
    joinedAt: '2024-06-12',
  },
];

export const students: User[] = [
  {
    id: 's1',
    firstName: 'Անի',
    lastName: 'Հակոբյան',
    email: 'ani.hakobyan@example.am',
    role: 'student',
    institution: 'Երևանի պետական համալսարան',
    program: 'Ինֆորմատիկա և կիրառական մաթեմատիկա',
    year: '3-րդ կուրս',
    city: 'Երևան',
    phone: '+374 94 000 202',
    bio: 'Հետաքրքրված եմ վեբ մշակմամբ և մեքենայական ուսուցմամբ։',
    joinedAt: '2025-09-01',
  },
  { id: 's2', firstName: 'Տիգրան', lastName: 'Մելքոնյան', email: 'tigran.melkonyan@example.am', role: 'student', institution: 'Հայաստանի ամերիկյան համալսարան', program: 'Համակարգչային գիտություն', year: '2-րդ կուրս', joinedAt: '2025-09-10' },
  { id: 's3', firstName: 'Մարիամ', lastName: 'Ղազարյան', email: 'mariam.ghazaryan@example.am', role: 'student', institution: 'Հայաստանի պետական տնտեսագիտական համալսարան', program: 'Բիզնես վերլուծություն', year: '4-րդ կուրս', joinedAt: '2025-08-22' },
  { id: 's4', firstName: 'Հայկ', lastName: 'Վարդանյան', email: 'hayk.vardanyan@example.am', role: 'student', institution: 'Ազգային պոլիտեխնիկական համալսարան', program: 'Ծրագրային ճարտարագիտություն', year: '3-րդ կուրս', joinedAt: '2025-09-03' },
  { id: 's5', firstName: 'Էլեն', lastName: 'Աբրահամյան', email: 'elen.abrahamyan@example.am', role: 'student', institution: 'Երևանի պետական համալսարան', program: 'Մաթեմատիկա', year: '2-րդ կուրս', joinedAt: '2025-10-01' },
  { id: 's6', firstName: 'Արսեն', lastName: 'Խաչատրյան', email: 'arsen.khachatryan@example.am', role: 'student', institution: 'Ազատ ունկնդիր', program: 'Մասնագիտական վերապատրաստում', year: '—', joinedAt: '2025-07-15' },
  { id: 's7', firstName: 'Սոնա', lastName: 'Միքայելյան', email: 'sona.mikayelyan@example.am', role: 'student', institution: 'Հայ-ռուսական համալսարան', program: 'Կիրառական ինֆորմատիկա', year: '1-ին կուրս', joinedAt: '2025-09-12' },
  { id: 's8', firstName: 'Նարեկ', lastName: 'Հովհաննիսյան', email: 'narek.hovhannisyan@example.am', role: 'student', institution: 'Ազգային պոլիտեխնիկական համալսարան', program: 'Տեղեկատվական համակարգեր', year: '4-րդ կուրս', joinedAt: '2025-08-30' },
  { id: 's9', firstName: 'Լուսինե', lastName: 'Սահակյան', email: 'lusine.sahakyan@example.am', role: 'student', institution: 'Երևանի պետական համալսարան', program: 'Ֆիզիկա', year: '3-րդ կուրս', joinedAt: '2025-09-05' },
  { id: 's10', firstName: 'Գևորգ', lastName: 'Մանուկյան', email: 'gevorg.manukyan@example.am', role: 'student', institution: 'Ազատ ունկնդիր', program: 'Մասնագիտական վերապատրաստում', year: '—', joinedAt: '2025-06-20' },
  { id: 's11', firstName: 'Աննա', lastName: 'Պողոսյան', email: 'anna.poghosyan@example.am', role: 'student', institution: 'Հայաստանի ամերիկյան համալսարան', program: 'Տվյալագիտություն', year: '2-րդ կուրս', joinedAt: '2025-09-14' },
  { id: 's12', firstName: 'Վահե', lastName: 'Դավթյան', email: 'vahe.davtyan@example.am', role: 'student', institution: 'Հայ-ռուսական համալսարան', program: 'Համակարգչային գիտություն', year: '3-րդ կուրս', joinedAt: '2025-09-09' },
  { id: 's13', firstName: 'Մանե', lastName: 'Զաքարյան', email: 'mane.zakaryan@example.am', role: 'student', institution: 'Երևանի պետական համալսարան', program: 'Ինֆորմատիկա', year: '1-ին կուրս', joinedAt: '2025-10-02' },
  { id: 's14', firstName: 'Ռուբեն', lastName: 'Բաղդասարյան', email: 'ruben.baghdasaryan@example.am', role: 'student', institution: 'Ազգային պոլիտեխնիկական համալսարան', program: 'Ավտոմատացում', year: '4-րդ կուրս', joinedAt: '2025-08-18' },
];

export const allUsers: User[] = [...teachers, ...students];

export function getUser(id: string | undefined): User | undefined {
  return allUsers.find((u) => u.id === id);
}

export function fullName(u: User | undefined): string {
  return u ? `${u.firstName} ${u.lastName}` : 'Անհայտ օգտատեր';
}

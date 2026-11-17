import type { User } from '../types';

export const DEMO_STUDENT_ID = 's1';
export const DEMO_TEACHER_ID = 't1';

export const teachers: User[] = [
  {
    id: 't1',
    firstName: 'Armen',
    lastName: 'Sargsyan',
    email: 'armen.sargsyan@usaran.am',
    role: 'teacher',
    title: 'Software engineer, instructor',
    bio: '12 years in web development. Teaches JavaScript, React and data analysis through real projects.',
    institution: 'Usaran',
    city: 'Yerevan',
    phone: '+374 91 000 101',
    joinedAt: '2023-02-10',
  },
  {
    id: 't2',
    firstName: 'Lilit',
    lastName: 'Grigoryan',
    email: 'lilit.grigoryan@usaran.am',
    role: 'teacher',
    title: 'Product designer',
    bio: 'UX researcher and interface designer with international teams.',
    joinedAt: '2023-05-04',
  },
  {
    id: 't3',
    firstName: 'Davit',
    lastName: 'Petrosyan',
    email: 'davit.petrosyan@usaran.am',
    role: 'teacher',
    title: 'PhD in physics and mathematics',
    bio: 'Has taught higher mathematics for 15 years. Author of two textbooks.',
    joinedAt: '2023-01-18',
  },
  {
    id: 't4',
    firstName: 'Narine',
    lastName: 'Martirosyan',
    email: 'narine.martirosyan@usaran.am',
    role: 'teacher',
    title: 'Machine learning researcher',
    bio: 'Works on natural language processing and applied machine learning.',
    joinedAt: '2024-03-01',
  },
  {
    id: 't5',
    firstName: 'Gor',
    lastName: 'Avetisyan',
    email: 'gor.avetisyan@usaran.am',
    role: 'teacher',
    title: 'Project management specialist',
    bio: 'PMP certified. Has led education and technology projects.',
    joinedAt: '2024-06-12',
  },
];

export const students: User[] = [
  {
    id: 's1',
    firstName: 'Ani',
    lastName: 'Hakobyan',
    email: 'ani.hakobyan@example.am',
    role: 'student',
    institution: 'Yerevan State University',
    program: 'Informatics and applied mathematics',
    year: 'Year 3',
    city: 'Yerevan',
    phone: '+374 94 000 202',
    bio: 'Interested in web development and machine learning.',
    joinedAt: '2025-09-01',
  },
  { id: 's2', firstName: 'Tigran', lastName: 'Melkonyan', email: 'tigran.melkonyan@example.am', role: 'student', institution: 'American University of Armenia', program: 'Computer science', year: 'Year 2', joinedAt: '2025-09-10' },
  { id: 's3', firstName: 'Mariam', lastName: 'Ghazaryan', email: 'mariam.ghazaryan@example.am', role: 'student', institution: 'Armenian State University of Economics', program: 'Business analytics', year: 'Year 4', joinedAt: '2025-08-22' },
  { id: 's4', firstName: 'Hayk', lastName: 'Vardanyan', email: 'hayk.vardanyan@example.am', role: 'student', institution: 'National Polytechnic University', program: 'Software engineering', year: 'Year 3', joinedAt: '2025-09-03' },
  { id: 's5', firstName: 'Elen', lastName: 'Abrahamyan', email: 'elen.abrahamyan@example.am', role: 'student', institution: 'Yerevan State University', program: 'Mathematics', year: 'Year 2', joinedAt: '2025-10-01' },
  { id: 's6', firstName: 'Arsen', lastName: 'Khachatryan', email: 'arsen.khachatryan@example.am', role: 'student', institution: 'Independent learner', program: 'Professional training', year: '—', joinedAt: '2025-07-15' },
  { id: 's7', firstName: 'Sona', lastName: 'Mikayelyan', email: 'sona.mikayelyan@example.am', role: 'student', institution: 'Russian-Armenian University', program: 'Applied informatics', year: 'Year 1', joinedAt: '2025-09-12' },
  { id: 's8', firstName: 'Narek', lastName: 'Hovhannisyan', email: 'narek.hovhannisyan@example.am', role: 'student', institution: 'National Polytechnic University', program: 'Information systems', year: 'Year 4', joinedAt: '2025-08-30' },
  { id: 's9', firstName: 'Lusine', lastName: 'Sahakyan', email: 'lusine.sahakyan@example.am', role: 'student', institution: 'Yerevan State University', program: 'Physics', year: 'Year 3', joinedAt: '2025-09-05' },
  { id: 's10', firstName: 'Gevorg', lastName: 'Manukyan', email: 'gevorg.manukyan@example.am', role: 'student', institution: 'Independent learner', program: 'Professional training', year: '—', joinedAt: '2025-06-20' },
  { id: 's11', firstName: 'Anna', lastName: 'Poghosyan', email: 'anna.poghosyan@example.am', role: 'student', institution: 'American University of Armenia', program: 'Data science', year: 'Year 2', joinedAt: '2025-09-14' },
  { id: 's12', firstName: 'Vahe', lastName: 'Davtyan', email: 'vahe.davtyan@example.am', role: 'student', institution: 'Russian-Armenian University', program: 'Computer science', year: 'Year 3', joinedAt: '2025-09-09' },
  { id: 's13', firstName: 'Mane', lastName: 'Zakaryan', email: 'mane.zakaryan@example.am', role: 'student', institution: 'Yerevan State University', program: 'Informatics', year: 'Year 1', joinedAt: '2025-10-02' },
  { id: 's14', firstName: 'Ruben', lastName: 'Baghdasaryan', email: 'ruben.baghdasaryan@example.am', role: 'student', institution: 'National Polytechnic University', program: 'Automation', year: 'Year 4', joinedAt: '2025-08-18' },
];

export const allUsers: User[] = [...teachers, ...students];

export function getUser(id: string | undefined): User | undefined {
  return allUsers.find((u) => u.id === id);
}

export function fullName(u: User | undefined): string {
  return u ? `${u.firstName} ${u.lastName}` : 'Unknown user';
}

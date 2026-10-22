import type { User } from '../types';

export const DEMO_STUDENT_ID = 's1';
export const DEMO_TEACHER_ID = 't1';

export const teachers: User[] = [
  {
    id: 't1',
    firstName: "Armen",
    lastName: "Sargsyan",
    email: 'armen.sargsyan@learnspace.example',
    role: 'teacher',
    title: "Software Engineer and Instructor",
    bio: "Has 12 years of experience in web development. Teaches JavaScript, React, and data analysis through practical projects.",
    institution: "LearnSpace",
    city: "Yerevan",
    phone: '+374 91 000 101',
    joinedAt: '2023-02-10',
  },
  {
    id: 't2',
    firstName: "Lilit",
    lastName: "Grigoryan",
    email: 'lilit.grigoryan@learnspace.example',
    role: 'teacher',
    title: "UX/UI Designer",
    bio: "Has worked with international teams to research user needs and design application interfaces.",
    joinedAt: '2023-05-04',
  },
  {
    id: 't3',
    firstName: "Davit",
    lastName: "Petrosyan",
    email: 'davit.petrosyan@learnspace.example',
    role: 'teacher',
    title: "PhD in Physics and Mathematics",
    bio: "Has taught advanced mathematics for 15 years and authored two textbooks.",
    joinedAt: '2023-01-18',
  },
  {
    id: 't4',
    firstName: "Narine",
    lastName: "Martirosyan",
    email: 'narine.martirosyan@learnspace.example',
    role: 'teacher',
    title: "Machine Learning Researcher",
    bio: "Works in natural language processing and applied machine learning.",
    joinedAt: '2024-03-01',
  },
  {
    id: 't5',
    firstName: "Gor",
    lastName: "Avetisyan",
    email: 'gor.avetisyan@learnspace.example',
    role: 'teacher',
    title: "Project Management Specialist",
    bio: "A PMP-certified professional with experience leading educational and technology projects.",
    joinedAt: '2024-06-12',
  },
];

export const students: User[] = [
  {
    id: 's1',
    firstName: "Ani",
    lastName: "Hakobyan",
    email: 'ani.hakobyan@example.am',
    role: 'student',
    institution: "Yerevan State University",
    program: "Informatics and Applied Mathematics",
    year: "Third year",
    city: "Yerevan",
    phone: '+374 94 000 202',
    bio: "I am interested in web development and machine learning.",
    joinedAt: '2025-09-01',
  },
  { id: 's2', firstName: "Tigran", lastName: "Melkonyan", email: 'tigran.melkonyan@example.am', role: 'student', institution: "American University of Armenia", program: "Computer Science", year: "Second year", joinedAt: '2025-09-10' },
  { id: 's3', firstName: "Mariam", lastName: "Ghazaryan", email: 'mariam.ghazaryan@example.am', role: 'student', institution: "Armenian State University of Economics", program: "Business Analytics", year: "Fourth year", joinedAt: '2025-08-22' },
  { id: 's4', firstName: "Hayk", lastName: "Vardanyan", email: 'hayk.vardanyan@example.am', role: 'student', institution: "National Polytechnic University of Armenia", program: "Software Engineering", year: "Third year", joinedAt: '2025-09-03' },
  { id: 's5', firstName: "Elen", lastName: "Abrahamyan", email: 'elen.abrahamyan@example.am', role: 'student', institution: "Yerevan State University", program: "Mathematics", year: "Second year", joinedAt: '2025-10-01' },
  { id: 's6', firstName: "Arsen", lastName: "Khachatryan", email: 'arsen.khachatryan@example.am', role: 'student', institution: "Independent Learner", program: "Professional Development", year: '—', joinedAt: '2025-07-15' },
  { id: 's7', firstName: "Sona", lastName: "Mikayelyan", email: 'sona.mikayelyan@example.am', role: 'student', institution: "Russian-Armenian University", program: "Applied Informatics", year: "First year", joinedAt: '2025-09-12' },
  { id: 's8', firstName: "Narek", lastName: "Hovhannisyan", email: 'narek.hovhannisyan@example.am', role: 'student', institution: "National Polytechnic University of Armenia", program: "Information Systems", year: "Fourth year", joinedAt: '2025-08-30' },
  { id: 's9', firstName: "Lusine", lastName: "Sahakyan", email: 'lusine.sahakyan@example.am', role: 'student', institution: "Yerevan State University", program: "Physics", year: "Third year", joinedAt: '2025-09-05' },
  { id: 's10', firstName: "Gevorg", lastName: "Manukyan", email: 'gevorg.manukyan@example.am', role: 'student', institution: "Independent Learner", program: "Professional Development", year: '—', joinedAt: '2025-06-20' },
  { id: 's11', firstName: "Anna", lastName: "Poghosyan", email: 'anna.poghosyan@example.am', role: 'student', institution: "American University of Armenia", program: "Data Science", year: "Second year", joinedAt: '2025-09-14' },
  { id: 's12', firstName: "Vahe", lastName: "Davtyan", email: 'vahe.davtyan@example.am', role: 'student', institution: "Russian-Armenian University", program: "Computer Science", year: "Third year", joinedAt: '2025-09-09' },
  { id: 's13', firstName: "Mane", lastName: "Zakaryan", email: 'mane.zakaryan@example.am', role: 'student', institution: "Yerevan State University", program: "Informatics", year: "First year", joinedAt: '2025-10-02' },
  { id: 's14', firstName: "Ruben", lastName: "Baghdasaryan", email: 'ruben.baghdasaryan@example.am', role: 'student', institution: "National Polytechnic University of Armenia", program: "Automation", year: "Fourth year", joinedAt: '2025-08-18' },
];

export const allUsers: User[] = [...teachers, ...students];

export function getUser(id: string | undefined): User | undefined {
  return allUsers.find((u) => u.id === id);
}

export function fullName(u: User | undefined): string {
  return u ? `${u.firstName} ${u.lastName}` : "Unknown user";
}

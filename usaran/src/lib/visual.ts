import { Atom, Brain, Briefcase, Code2, Database, Languages, Palette, Sigma } from 'lucide-react';
import type { CategoryId, LessonType } from '../types';

/** Public assets resolve against Vite's base so the relative static build works from any folder. */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/** Pastel tint class per category (see `.t-*` in base.css). */
export const CATEGORY_TINT: Record<CategoryId, string> = {
  programming: 't-sky',
  design: 't-rose',
  ai: 't-lilac',
  data: 't-mint',
  math: 't-sun',
  languages: 't-peach',
  science: 't-sky',
  business: 't-mint',
};

export const CATEGORY_ICONS: Record<CategoryId, typeof Code2> = {
  programming: Code2,
  design: Palette,
  math: Sigma,
  ai: Brain,
  data: Database,
  languages: Languages,
  science: Atom,
  business: Briefcase,
};

/** Photo shown for each category on the home page explorer. */
export const categoryImage = (id: CategoryId) => asset(`images/categories/${id}.jpg`);

export const LESSON_TINT: Record<LessonType, string> = {
  video: 't-sky',
  text: 't-lilac',
  resource: 't-mint',
  assignment: 't-peach',
  quiz: 't-sun',
};

/** Portraits for the demo people; everyone else gets tinted initials. */
const PHOTOS: Record<string, string> = {
  "Armen Sargsyan": 'p4',
  "Lilit Grigoryan": 'p1',
  "Davit Petrosyan": 'p6',
  "Narine Martirosyan": 'p5',
  "Ani Hakobyan": 'p3',
  "Tigran Melkonyan": 'p2',
  "Hayk Vardanyan": 'p8',
  "Sona Mikayelyan": 'p7',
};

export function photoFor(name: string): string | undefined {
  const p = PHOTOS[name.trim()];
  return p ? asset(`images/people/${p}.jpg`) : undefined;
}

const AVATAR_TINTS = ['t-sky', 't-rose', 't-lilac', 't-mint', 't-sun', 't-peach'];

export function avatarTint(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export const SCENES = {
  hero: asset('images/scenes/hero.jpg'),
  study: asset('images/scenes/study.jpg'),
  cta: asset('images/scenes/cta.jpg'),
  video: asset('images/scenes/video.jpg'),
  teacher: asset('images/scenes/teacher.jpg'),
};

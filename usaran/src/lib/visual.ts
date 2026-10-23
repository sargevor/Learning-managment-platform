import { Atom, Brain, Briefcase, Code2, Database, Languages, Palette, Sigma } from 'lucide-react';
import type { CategoryId, LessonType } from '../types';
import { tr } from '../i18n';

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
  [tr("Armen Sargsyan", "Արմեն Սարգսյան")]: 'p4',
  [tr("Lilit Grigoryan", "Լիլիթ Գրիգորյան")]: 'p1',
  [tr("Davit Petrosyan", "Դավիթ Պետրոսյան")]: 'p6',
  [tr("Narine Martirosyan", "Նարինե Մարտիրոսյան")]: 'p5',
  [tr("Ani Hakobyan", "Անի Հակոբյան")]: 'p3',
  [tr("Tigran Melkonyan", "Տիգրան Մելքոնյան")]: 'p2',
  [tr("Hayk Vardanyan", "Հայկ Վարդանյան")]: 'p8',
  [tr("Sona Mikayelyan", "Սոնա Միքայելյան")]: 'p7',
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

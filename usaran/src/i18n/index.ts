/**
 * Bilingual (Armenian / English) text support.
 *
 * Every user-facing string is written as `tr(english, armenian)` right where it is used,
 * so both versions stay side by side in the code. The language is read once on page load;
 * switching languages saves the choice and reloads the page, which also re-renders the mock
 * data (course titles, quiz questions, names) in the chosen language.
 */
export type Lang = 'hy' | 'en';

const STORAGE_KEY = 'learnspace.lang';
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'hy', label: 'Հայերեն', short: 'ՀԱՅ' },
  { code: 'en', label: 'English', short: 'ENG' },
];

function detect(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'hy' || fromUrl === 'en') return fromUrl;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'hy' || saved === 'en') return saved;
  } catch {
    /* storage can be blocked; fall back to the default */
  }
  return 'hy';
}

export const lang: Lang = typeof window === 'undefined' ? 'hy' : detect();

if (typeof document !== 'undefined') document.documentElement.lang = lang;

/** Returns the text for the current language. */
export function tr(en: string, hy: string): string {
  return lang === 'hy' ? hy : en;
}

/** Locale tag for Intl APIs and sorting. */
export const locale = lang === 'hy' ? 'hy-AM' : 'en-US';

export function setLang(next: Lang) {
  if (next === lang) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.delete('lang');
  window.location.replace(url.toString());
}

if (typeof document !== 'undefined') {
  document.title = lang === 'hy' ? 'LearnSpace — առցանց ուսուցման հարթակ' : 'LearnSpace — Online Learning Platform';
}

import { lang, locale, tr } from '../i18n';

/** Fixed "today" so the demo data always reads consistently. */
export const TODAY = new Date('2026-10-15T12:00:00');

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Armenian month names in the genitive case, as used in dates: «15 հոկտեմբերի». */
const MONTHS_HY = ['հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'];
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT_HY = ['հնվ', 'փտր', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ', 'հոկ', 'նոյ', 'դեկ'];

/** Monday-first short weekday names. */
export const WEEKDAYS_SHORT = lang === 'hy' ? ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDate(v: string | Date): Date {
  return typeof v === 'string' ? new Date(v) : v;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** English plural helper: plural(3, 'day') → "3 days". */
function plural(n: number, word: string, many = `${word}s`): string {
  return `${n} ${n === 1 ? word : many}`;
}

/** "October 15" / «15 հոկտեմբերի»; adds the year when it is not the current one. */
export function formatDate(v: string | Date, withYear = true): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return '—';
  const showYear = withYear && d.getFullYear() !== TODAY.getFullYear();
  if (lang === 'hy') return `${d.getDate()} ${MONTHS_HY[d.getMonth()]}${showYear ? `, ${d.getFullYear()} թ.` : ''}`;
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}${showYear ? `, ${d.getFullYear()}` : ''}`;
}

/** "Oct 15" / «15 հոկ.» */
export function formatShortDate(v: string | Date): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return '—';
  return lang === 'hy' ? `${d.getDate()} ${MONTHS_SHORT_HY[d.getMonth()]}.` : `${MONTHS_SHORT_EN[d.getMonth()]} ${d.getDate()}`;
}

/** Day number and short month as separate parts, for calendar-style date chips. */
export function dateParts(v: string | Date): { day: string; month: string } {
  const d = toDate(v);
  return { day: String(d.getDate()), month: lang === 'hy' ? `${MONTHS_SHORT_HY[d.getMonth()]}.` : MONTHS_SHORT_EN[d.getMonth()] };
}

export function formatDateTime(v: string | Date): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Whole days between today and the given date (negative = in the past). */
export function daysUntil(v: string | Date): number {
  const d = toDate(v);
  const a = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** How far away a deadline is: "tomorrow", "3 days left", "2 days ago". */
export function relativeDue(v: string | Date): string {
  const n = daysUntil(v);
  if (n === 0) return tr('today', 'այսօր');
  if (n === 1) return tr('tomorrow', 'վաղը');
  if (n > 1) return tr(`${plural(n, 'day')} left`, `${n} օրից`);
  if (n === -1) return tr('yesterday', 'երեկ');
  return tr(`${plural(-n, 'day')} ago`, `${-n} օր առաջ`);
}

export function relativeTime(v: string | Date): string {
  const d = toDate(v);
  const diffMin = Math.round((TODAY.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return tr('just now', 'հենց հիմա');
  if (diffMin < 60) return tr(`${plural(diffMin, 'minute')} ago`, `${diffMin} րոպե առաջ`);
  const h = Math.round(diffMin / 60);
  if (h < 24) return tr(`${plural(h, 'hour')} ago`, `${h} ժամ առաջ`);
  const days = Math.round(h / 24);
  if (days === 1) return tr('yesterday', 'երեկ');
  if (days < 30) return tr(`${plural(days, 'day')} ago`, `${days} օր առաջ`);
  return formatDate(d);
}

/** Thousands separated by a comma in English ("1,284") and by a space in Armenian («1 284»). */
export function formatNumber(n: number): string {
  const s = n.toLocaleString('en-US');
  return lang === 'hy' ? s.replace(/,/g, ' ') : s;
}

export function formatMinutes(min: number): string {
  if (min < 60) return tr(`${min} min`, `${min} րոպե`);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? tr(`${h} hr ${m} min`, `${h} ժ ${m} ր`) : tr(`${h} hr`, `${h} ժամ`);
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function average(values: number[]): number {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatFileSize(kb: number): string {
  return kb >= 1024 ? tr(`${(kb / 1024).toFixed(1)} MB`, `${(kb / 1024).toFixed(1)} ՄԲ`) : tr(`${kb} KB`, `${kb} ԿԲ`);
}

/** Compares display text in the current language's alphabetical order. */
export function compareText(a: string, b: string): number {
  return a.localeCompare(b, locale);
}

export function letterGrade(p: number): string {
  if (p >= 93) return 'A';
  if (p >= 85) return 'B+';
  if (p >= 77) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  return 'F';
}

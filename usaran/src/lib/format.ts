/** Fixed "today" so the demo data always reads consistently. */
export const TODAY = new Date('2026-10-15T12:00:00');

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDate(v: string | Date): Date {
  return typeof v === 'string' ? new Date(v) : v;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatDate(v: string | Date, withYear = true): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return '—';
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return withYear && d.getFullYear() !== TODAY.getFullYear() ? `${base}, ${d.getFullYear()}` : base;
}

export function formatShortDate(v: string | Date): string {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return '—';
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
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

export function relativeDue(v: string | Date): string {
  const n = daysUntil(v);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n > 1) return `${n} days remaining`;
  if (n === -1) return "yesterday";
  return `${Math.abs(n)} days ago`;
}

export function relativeTime(v: string | Date): string {
  const d = toDate(v);
  const diffMin = Math.round((TODAY.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.round(h / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(d);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US').replace(/,/g, ' ');
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
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
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function letterGrade(p: number): string {
  if (p >= 93) return 'A';
  if (p >= 85) return 'B+';
  if (p >= 77) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  return 'F';
}

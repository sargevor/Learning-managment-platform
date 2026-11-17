import { useEffect, useState } from 'react';
import { ArrowRight, Atom, ChartLine, Check, ClipboardList, Clock, CodeXml, Database, Download, FileText, MessageSquare, Network, RotateCcw, Save, Sigma, Target, type LucideIcon } from 'lucide-react';
import type { SubmissionStatus } from '../../types';
import type { SubmissionRow } from '../../data/teacherView';
import { getCourse } from '../../data/courses';
import { fullName } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Misc';
import { cx, formatFileSize, percent, TODAY } from '../../lib/format';

/* ---------- Small helpers shared by the teacher-work pages (tw- prefix) ---------- */

const COURSE_ICON: Record<string, LucideIcon> = { react: Atom, js: CodeXml, 'python-data': ChartLine, sql: Database, algorithms: Network };
const COURSE_SHORT: Record<string, string> = { react: 'React', js: 'JavaScript', 'python-data': 'Python', sql: 'SQL', algorithms: 'Algorithms' };

/** Icon for a teacher course (falls back to a generic list icon). */
export function CourseIcon({ id, size = 16 }: { id: string; size?: number }) {
  const Icon = COURSE_ICON[id] ?? ClipboardList;
  return <Icon size={size} aria-hidden="true" />;
}

/** Compact English course label: "React", "SQL". */
export function courseShort(id: string): string {
  return COURSE_SHORT[id] ?? getCourse(id)?.title ?? id;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n: number) => String(n).padStart(2, '0');

/** "18 Oct, 23:59" */
export function shortDateTime(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MON[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Thursday, 15 October" for the demo's fixed today. */
export function todayLabel(): string {
  return `${DAY[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTH[TODAY.getMonth()]}`;
}

/** Age chip text: "40 min", "4 h", "47 d". */
export function ageShort(v: string): string {
  const min = Math.max(0, Math.round((TODAY.getTime() - new Date(v).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

/* ---------- Grading panel ---------- */

export interface GradeOverride {
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
}

interface Props {
  row: SubmissionRow;
  override?: GradeOverride;
  onSave: (id: string, g: GradeOverride) => void;
  /** Optional: shows a "Next" button that moves to the next submission in the queue. */
  onNext?: () => void;
}

/** Student work + grading form. All grading happens in local state only. */
export function GradingPanel({ row, override, onSave, onNext }: Props) {
  const toast = useToast();
  const { submission, assignment, student, course } = row;
  const status = override?.status ?? submission.status;
  const initialScore = override?.score ?? submission.score;
  const [score, setScore] = useState<string>(initialScore !== undefined ? String(initialScore) : '');
  const [feedback, setFeedback] = useState(override?.feedback ?? submission.feedback ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    const s = override?.score ?? submission.score;
    setScore(s !== undefined ? String(s) : '');
    setFeedback(override?.feedback ?? submission.feedback ?? '');
    setError('');
  }, [submission.id, override, submission.score, submission.feedback]);

  const validate = () => {
    const n = Number(score);
    if (score === '' || Number.isNaN(n)) {
      setError('Enter a score');
      return false;
    }
    if (n < 0 || n > assignment.maxScore) {
      setError(`Score must be 0–${assignment.maxScore}`);
      return false;
    }
    setError('');
    return true;
  };

  const save = (final: boolean) => {
    if (!validate()) return;
    if (final && feedback.trim().length < 10) {
      setError('Add a short comment before sending');
      return;
    }
    onSave(submission.id, { score: Number(score), feedback, status: final ? 'graded' : 'submitted' });
    toast.success(final ? 'Grade sent' : 'Draft saved', 'Demo only. The student is not notified.');
  };

  const quick = [1, 0.9, 0.8, 0.7, 0.6].map((k) => Math.round(assignment.maxScore * k));
  const num = Number(score);
  const valid = score !== '' && !Number.isNaN(num) && num >= 0 && num <= assignment.maxScore;
  const pct = valid ? percent(num, assignment.maxScore) : 0;
  const name = fullName(student);

  return (
    <section className="tw-gp" aria-label={`Submission by ${name}`}>
      <div className="tw-gp__head">
        <Avatar name={name} size={60} />
        <div className="tw-gp__who">
          <h2>{name}</h2>
          <div className="tw-chips">
            <span className="tw-chip"><ClipboardList aria-hidden="true" />{assignment.title}</span>
            <span className="tw-chip"><CourseIcon id={course.id} size={14} />{courseShort(course.id)}</span>
            <span className="tw-chip tw-chip--soft"><Clock aria-hidden="true" />{submission.submittedAt ? shortDateTime(submission.submittedAt) : '—'}</span>
            {submission.late && <span className="tw-chip tw-chip--red">Late</span>}
            <StatusBadge status={status} />
          </div>
        </div>
        {onNext && (
          <button type="button" className="tw-next" onClick={onNext} aria-label="Next submission">
            Next
            <span className="tw-next__dot"><ArrowRight aria-hidden="true" /></span>
          </button>
        )}
      </div>

      <div className="tw-gp__work">
        {submission.attachments.length === 0 ? (
          <div className="tw-tile">
            <span className="tw-tile__icon"><FileText aria-hidden="true" /></span>
            <span className="tw-tile__text tw-muted">No files</span>
          </div>
        ) : (
          submission.attachments.map((f) => (
            <div key={f.name} className="tw-tile">
              <span className="tw-file">
                <FileText aria-hidden="true" />
                <span className="tw-file__ext">{(f.name.split('.').pop() ?? 'file').toUpperCase().slice(0, 4)}</span>
              </span>
              <span className="tw-tile__text">
                <b>{f.name}</b>
                <span>{formatFileSize(f.sizeKb)}</span>
              </span>
              <button type="button" className="tw-btn tw-btn--secondary" onClick={() => toast.info('File unavailable', 'Files are not stored in this demo.')}>
                <Download aria-hidden="true" />Open
              </button>
            </div>
          ))
        )}
        <div className="tw-tile tw-tile--top">
          <span className="tw-tile__icon tw-tile__icon--white"><MessageSquare aria-hidden="true" /></span>
          <p className="tw-gp__answer">{submission.answer || <span className="tw-muted">No written answer</span>}</p>
        </div>
      </div>

      <div className="tw-gp__score">
        <h3><Target aria-hidden="true" />Score</h3>
        <div className="tw-gp__scorerow">
          <div className="tw-seg tw-seg--grey" role="group" aria-label="Quick score">
            {quick.map((v) => (
              <button key={v} type="button" aria-pressed={valid && num === v} onClick={() => { setScore(String(v)); setError(''); }}>{v}</button>
            ))}
          </div>
          <label className="tw-numbox" htmlFor={`score-${submission.id}`}>
            <span className="tw-sr">Score</span>
            <input id={`score-${submission.id}`} type="number" min={0} max={assignment.maxScore} value={score} onChange={(e) => { setScore(e.target.value); setError(''); }} aria-invalid={error ? true : undefined} />
            <span>/ {assignment.maxScore}</span>
          </label>
        </div>
      </div>

      <div className="tw-gp__total">
        <div className="tw-total">
          <span className="tw-total__ring" role="img" aria-label={`Total ${valid ? num : 0} of ${assignment.maxScore}`} style={{ background: `conic-gradient(var(--periwinkle) 0 ${pct}%, var(--navy-700) 0)` }}>
            <span className="tw-total__inner">
              <b>{valid ? num : '–'}</b>
              <span>/{assignment.maxScore}</span>
            </span>
          </span>
          <span className="tw-total__label"><Sigma aria-hidden="true" />Total</span>
        </div>
        <div className="tw-gp__fb">
          <label htmlFor={`fb-${submission.id}`}><MessageSquare aria-hidden="true" />Feedback</label>
          <textarea id={`fb-${submission.id}`} rows={5} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well? What to improve?" />
        </div>
      </div>

      {error && <p className="tw-error" role="alert">{error}</p>}

      <div className="tw-gp__actions">
        <button type="button" className="tw-btn tw-btn--secondary tw-btn--lg" onClick={() => save(false)}>
          <Save aria-hidden="true" />Save draft
        </button>
        <button type="button" className={cx('tw-btn', 'tw-btn--primary', 'tw-btn--lg')} onClick={() => save(true)}>
          {status === 'graded' ? <RotateCcw aria-hidden="true" /> : <Check aria-hidden="true" />}
          {status === 'graded' ? 'Update grade' : 'Send grade'}
        </button>
      </div>
    </section>
  );
}

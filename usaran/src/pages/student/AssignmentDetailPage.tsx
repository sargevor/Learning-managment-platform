import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, Calendar, Check, CircleAlert, Clock, CloudUpload, Database, Eye, FileText, Layers, Link2, ListChecks, MessageSquare,
  Paperclip, Presentation, Save, Send, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Trophy, Undo2,
} from 'lucide-react';
import type { AssignmentStatus, Attachment } from '../../types';
import { getAssignment, studentSubmission, assignmentStatusFor } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { isEnrolled } from '../../data/enrollments';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { Chip, Ring } from '../../components/ui/Visual';
import { cx, daysUntil, formatDateTime, formatFileSize, formatShortDate, TODAY } from '../../lib/format';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const dueLabel = (v: string) => {
  const d = new Date(v);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STATUS: Record<AssignmentStatus, { label: string; icon: typeof Check; tone: 'grey' | 'blue' | 'red' }> = {
  'not-started': { label: 'New', icon: Sparkles, tone: 'blue' },
  draft: { label: 'Draft', icon: FileText, tone: 'blue' },
  submitted: { label: 'Submitted', icon: Send, tone: 'blue' },
  graded: { label: 'Graded', icon: Check, tone: 'blue' },
  overdue: { label: 'Overdue', icon: CircleAlert, tone: 'red' },
};

/** Picks an icon for an instruction step from its words. */
function stepIcon(text: string): typeof Check {
  const t = text.toLowerCase();
  if (/link|repo|explain|decision/.test(t)) return Link2;
  if (/readme|write|document|report|describe/.test(t)) return FileText;
  if (/prop|variant|size|option|parameter/.test(t)) return SlidersHorizontal;
  if (/test|valid|error|check/.test(t)) return ShieldCheck;
  if (/chart|visual|plot|graph/.test(t)) return BarChart3;
  if (/data|csv|table|query|sql|clean/.test(t)) return Database;
  if (/create|build|component|page|form/.test(t)) return Layers;
  return ListChecks;
}

const TYPES = ['PDF', 'ZIP', 'IPYNB', 'Image', 'Up to 20 MB'];

export function AssignmentDetailPage() {
  const { id } = useParams();
  const assignment = getAssignment(id);
  const original = assignment ? studentSubmission(assignment.id) : undefined;
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [answer, setAnswer] = useState(original?.answer ?? '');
  const [files, setFiles] = useState<Attachment[]>(original?.attachments ?? []);
  const [status, setStatus] = useState<AssignmentStatus | undefined>(() => (assignment ? assignmentStatusFor(assignment, original) : undefined));
  const [submittedAt, setSubmittedAt] = useState(original?.submittedAt);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const back = (
    <Link to="/student/assignments" className="sl-back">
      <ArrowLeft aria-hidden="true" />
      Assignments
    </Link>
  );

  if (!assignment || !isEnrolled(assignment.courseId) || !status) {
    return (
      <>
        <ShellTitle title="Assignment" />
        {back}
        <div className="sl-card">
          <EmptyState title="Assignment not found" action={<ButtonLink to="/student/assignments" icon={<ArrowLeft />}>Assignments</ButtonLink>} />
        </div>
      </>
    );
  }

  const course = getCourse(assignment.courseId)!;
  const teacher = getUser(course.teacherId);
  const teacherName = fullName(teacher);
  const editable = status === 'not-started' || status === 'draft' || status === 'overdue';
  const graded = status === 'graded' && original?.score !== undefined;
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const days = daysUntil(assignment.dueDate);
  const s = STATUS[status];
  const hasDraft = Boolean(savedAt || original?.status === 'draft');

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }));
    const tooBig = next.filter((f) => f.sizeKb > 20 * 1024);
    if (tooBig.length) toast.error('File too large', 'Max 20 MB per file.');
    setFiles((cur) => [...cur, ...next.filter((f) => f.sizeKb <= 20 * 1024)]);
    setError('');
  };

  const validate = () => {
    if (answer.trim().length < 20 && files.length === 0) {
      setError('Add a file or at least 20 characters.');
      return false;
    }
    return true;
  };

  const saveDraft = () => {
    setStatus(days < 0 ? 'overdue' : 'draft');
    const now = new Date(TODAY);
    setSavedAt(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    toast.success('Draft saved', 'Kept on this page only.');
  };

  const submit = () => {
    setStatus('submitted');
    setSubmittedAt(TODAY.toISOString().slice(0, 16));
    toast.success('Submitted', 'Demo: nothing was sent.');
  };

  /* Progress timeline */
  type Step = { label: string; icon: typeof Check; when: string; state: 'done' | 'current' | 'todo' };
  const draftWhen = savedAt ? `Saved ${savedAt}` : hasDraft ? 'In progress' : 'Not yet';
  const timeline: Step[] = [
    { label: 'Opened', icon: Eye, when: formatShortDate(assignment.createdAt), state: editable && !hasDraft ? 'current' : 'done' },
    { label: 'Draft saved', icon: Save, when: editable ? draftWhen : 'Done', state: editable ? (hasDraft ? 'current' : 'todo') : 'done' },
    { label: 'Submitted', icon: Send, when: submittedAt && !editable ? formatShortDate(submittedAt) : 'Next step', state: status === 'submitted' ? 'current' : status === 'graded' ? 'done' : 'todo' },
    { label: 'Graded', icon: Trophy, when: original?.gradedAt && graded ? formatShortDate(original.gradedAt) : 'After review', state: graded ? 'done' : 'todo' },
  ];

  return (
    <>
      <ShellTitle
        title={assignment.title}
        meta={
          <span className="sl-ameta">
            <Link to={`/student/courses/${course.id}/learn`} className="sl-ameta__course">
              <img src={course.image} alt="" />
              {course.title}
            </Link>
            <Chip icon={<Calendar />}>Due {dueLabel(assignment.dueDate)}</Chip>
            {editable && <Chip tone={days < 0 || days <= 2 ? 'red' : 'grey'} icon={<Clock />}>{days < 0 ? `${-days} d late` : days === 0 ? 'Today' : `${days} d left`}</Chip>}
            <Chip icon={<Trophy />}>{assignment.maxScore} pts</Chip>
            <Chip tone={s.tone} icon={<s.icon />}>{s.label}</Chip>
          </span>
        }
      />
      {back}

      <section className="sl-detail">
        <div className="sl-detail__main">
          {graded && (
            <div className="sl-card sl-grade">
              <Ring value={(original!.score! / assignment.maxScore) * 100} size={104} thickness={12} label="Score">
                <span className="sl-grade__ring">
                  <b>{original!.score}</b>
                  <span>/ {assignment.maxScore}</span>
                </span>
              </Ring>
              <div className="sl-grade__feedback">
                <div className="sl-grade__who">
                  <Avatar name={teacherName} size={28} />
                  <b>{teacherName}</b>
                  {original!.gradedAt && <span>{formatShortDate(original!.gradedAt)}</span>}
                </div>
                <p>{original!.feedback}</p>
              </div>
            </div>
          )}

          {/* Brief */}
          <div className="sl-card sl-brief">
            <h2>Brief</h2>
            <ol className="sl-steps">
              {assignment.instructions.map((text, i) => {
                const Icon = stepIcon(text);
                return (
                  <li key={text}>
                    <span className="sl-steps__icon" aria-hidden="true">
                      <Icon />
                      <b>{i + 1}</b>
                    </span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ol>
            <div className="sl-musts">
              <span className="sl-musts__label">Must have</span>
              {assignment.requirements.map((r) => (
                <Chip key={r} tone="blue" icon={<Check />}>{r}</Chip>
              ))}
            </div>
          </div>

          {/* Submission */}
          <form
            className="sl-card sl-work"
            onSubmit={(e) => {
              e.preventDefault();
              if (editable && validate()) setConfirm(true);
            }}
          >
            <div className="sl-work__head">
              <h2>Your work</h2>
              {editable && savedAt && <Chip icon={<Save />}>Saved {savedAt}</Chip>}
              {!editable && submittedAt && <Chip icon={<Send />}>{formatDateTime(submittedAt)}</Chip>}
            </div>

            {status === 'overdue' && (
              <p className="sl-alert" role="note">
                <CircleAlert aria-hidden="true" />
                Past due: late work may lose points
              </p>
            )}

            {editable && assignment.allowFiles && (
              <>
                <input ref={fileInput} id="upload" type="file" multiple className="sr-only" tabIndex={-1} onChange={(e) => addFiles(e.target.files)} />
                <div
                  className={cx('sl-drop', dragOver && 'is-over')}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload files"
                  onClick={() => fileInput.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInput.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <span className="sl-drop__icon" aria-hidden="true"><CloudUpload /></span>
                  <span className="sl-drop__title">Drop files or <span>browse</span></span>
                  <span className="sl-drop__types">
                    {TYPES.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </div>
              </>
            )}

            {files.length > 0 && (
              <div className="sl-files">
                {files.map((f, i) => (
                  <div key={f.name + i} className="sl-file">
                    <span className="sl-file__icon sl-file__icon--blue" aria-hidden="true"><Paperclip /></span>
                    <span className="sl-file__name">{f.name}</span>
                    <Chip>{formatFileSize(f.sizeKb)}</Chip>
                    {editable && (
                      <button type="button" className="sl-icon-btn" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))}>
                        <Trash2 />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editable ? (
              <div className="sl-answer">
                <label htmlFor="answer">
                  <MessageSquare aria-hidden="true" />
                  Comment
                </label>
                <textarea
                  id="answer"
                  className="textarea"
                  rows={4}
                  value={answer}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'answer-error' : undefined}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError('');
                  }}
                  placeholder="Your solution, choices and repo link"
                />
                <div className="sl-answer__foot">
                  {error ? (
                    <span id="answer-error" className="sl-answer__error" role="alert"><CircleAlert aria-hidden="true" />{error}</span>
                  ) : (
                    <span />
                  )}
                  <Chip>{words} words</Chip>
                </div>
              </div>
            ) : (
              <div className="sl-answer-view">{answer || <span>No comment</span>}</div>
            )}

            <div className="sl-work__actions">
              {editable ? (
                <>
                  <Button variant="secondary" icon={<Save />} onClick={saveDraft}>Save draft</Button>
                  <Button type="submit" variant="primary" icon={<Send />}>Submit</Button>
                </>
              ) : status === 'submitted' ? (
                <Button
                  variant="secondary"
                  icon={<Undo2 />}
                  onClick={() => {
                    setStatus(days < 0 ? 'overdue' : 'draft');
                    toast.info('Withdrawn', 'Edit and submit again.');
                  }}
                >
                  Withdraw
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        {/* Side column */}
        <aside aria-label="Status" className="sl-detail__side">
          <div className="sl-card sl-timeline">
            <h2>Progress</h2>
            <ol>
              {timeline.map((t, i) => (
                <li key={t.label} className={cx('sl-tl', `is-${t.state}`)} aria-current={t.state === 'current' ? 'step' : undefined}>
                  <span className="sl-tl__rail">
                    <span className="sl-tl__dot"><t.icon aria-hidden="true" /></span>
                    {i < timeline.length - 1 && <span className="sl-tl__line" />}
                  </span>
                  <span className="sl-tl__text">
                    <span className="sl-tl__label">{t.label}</span>
                    <span className="sl-tl__when">{t.when}</span>
                  </span>
                  {t.state === 'current' && <span className="sl-tl__now">Now</span>}
                </li>
              ))}
            </ol>
          </div>

          <div className="sl-card sl-teacher">
            <Avatar name={teacherName} size={52} />
            <span className="sl-teacher__text">
              <b>{teacherName}</b>
              <span><Presentation aria-hidden="true" />Teacher</span>
            </span>
            <Button variant="secondary" icon={<MessageSquare />} onClick={() => toast.info('Message', 'Not sent in the demo.')}>Ask</Button>
          </div>
        </aside>
      </section>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={submit}
        tone="warning"
        title="Submit your work?"
        text={`${files.length} file(s), ${words} words. Nothing is sent in this demo.`}
        confirmLabel="Submit"
      />
    </>
  );
}

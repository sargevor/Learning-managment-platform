import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bold, CheckCircle2, Code, FileText, Italic, Link2, List, ListOrdered, MessageSquareText, Paperclip, Send, Trash2, Undo2, UploadCloud } from 'lucide-react';
import type { AssignmentStatus, Attachment } from '../../types';
import { getAssignment, studentSubmission, assignmentStatusFor } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { isEnrolled } from '../../data/enrollments';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Card, EmptyState, Notice, PageHeader, Person } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { ProgressRing } from '../../components/ui/Progress';
import { cx, daysUntil, formatDateTime, formatFileSize, relativeDue, TODAY } from '../../lib/format';
import { tr } from '../../i18n';

export function AssignmentDetailPage() {
  const { id } = useParams();
  const assignment = getAssignment(id);
  const original = assignment ? studentSubmission(assignment.id) : undefined;
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [answer, setAnswer] = useState(original?.answer ?? '');
  const [files, setFiles] = useState<Attachment[]>(original?.attachments ?? []);
  const [status, setStatus] = useState<AssignmentStatus | undefined>(() => (assignment ? assignmentStatusFor(assignment, original) : undefined));
  const [submittedAt, setSubmittedAt] = useState(original?.submittedAt);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!assignment || !isEnrolled(assignment.courseId)) {
    return (
      <div className="card">
        <EmptyState title={tr("Assignment not found", "Առաջադրանքը չի գտնվել")} text={tr("It may have been removed, or you may not be enrolled in the course.", "Հնարավոր է՝ այն հեռացվել է կամ դուք գրանցված չեք համապատասխան դասընթացին։")} action={<ButtonLink to="/student/assignments">{tr("All Assignments", "Բոլոր առաջադրանքները")}</ButtonLink>} />
      </div>
    );
  }

  const course = getCourse(assignment.courseId)!;
  const teacher = getUser(course.teacherId);
  const editable = status === 'not-started' || status === 'draft' || status === 'overdue';
  const graded = status === 'graded' && original?.score !== undefined;
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const days = daysUntil(assignment.dueDate);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }));
    const tooBig = next.filter((f) => f.sizeKb > 20 * 1024);
    if (tooBig.length) toast.error(tr("File is too large", "Ֆայլը չափազանց մեծ է"), tr("The maximum file size is 20 MB.", "Առավելագույն չափը 20 ՄԲ է։"));
    setFiles((cur) => [...cur, ...next.filter((f) => f.sizeKb <= 20 * 1024)]);
    setError('');
  };

  const wrap = (before: string, after = before) => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = answer.slice(s, e) || tr("text", "տեքստ");
    setAnswer(answer.slice(0, s) + before + selected + after + answer.slice(e));
    requestAnimationFrame(() => el.focus());
  };

  const validate = () => {
    if (answer.trim().length < 20 && files.length === 0) {
      setError(tr("Write a response of at least 20 characters or attach a file.", "Գրեք առնվազն 20 նիշանոց պատասխան կամ կցեք ֆայլ։"));
      return false;
    }
    return true;
  };

  const saveDraft = () => {
    setStatus(days < 0 ? 'overdue' : 'draft');
    const now = new Date(TODAY);
    setSavedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    toast.success(tr("Draft saved", "Սևագիրը պահվեց"), tr("Kept only on this page. No data has been sent to a server.", "Պահվել է միայն այս էջում։ Տվյալները չեն ուղարկվել սերվեր։"));
  };

  const submit = () => {
    setStatus('submitted');
    setSubmittedAt(TODAY.toISOString().slice(0, 16));
    toast.success(tr("Assignment marked as submitted", "Աշխատանքը նշվեց որպես հանձնված"), tr("Demo: your work has not been sent to a server.", "Ցուցադրական ռեժիմ։ Ձեր աշխատանքը չի ուղարկվել սերվեր։"));
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: tr("Assignments", "Առաջադրանքներ"), to: '/student/assignments' }, { label: course.title, to: `/student/courses/${course.id}/learn` }, { label: assignment.title }]}
        title={assignment.title}
        description={assignment.summary}
        actions={status && <StatusBadge status={status} />}
      />

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          {graded && (
            <Card title={tr("Grade and Feedback", "Գնահատական և մեկնաբանություն")}>
              <div className="row row--top row--wrap" style={{ ['--gap' as string]: '24px' }}>
                <ProgressRing value={(original!.score! / assignment.maxScore) * 100} size={104} color="var(--success-600)" label={tr("result", "արդյունք")} />
                <div className="stack grow" style={{ ['--gap' as string]: '10px', minWidth: 240 }}>
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--navy-900)' }}>{original!.score}</span>
                    <span className="muted">/ {assignment.maxScore}{tr(" points", " միավոր")}</span>
                  </div>
                  <div className="answer-box" style={{ background: 'var(--surface-muted)' }}>
                    <div className="row xs muted" style={{ ['--gap' as string]: '6px', marginBottom: 6 }}>
                      <MessageSquareText size={14} /> {fullName(teacher)}, {original!.gradedAt ? formatDateTime(original!.gradedAt) : ''}
                    </div>
                    {original!.feedback}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card title={tr("Instructions", "Հրահանգներ")}>
            <ol className="instructions">
              {assignment.instructions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h3 style={{ fontSize: 'var(--fs-sm)', margin: '20px 0 10px' }}>{tr("Requirements", "Պահանջներ")}</h3>
            <ul className="check-list">
              {assignment.requirements.map((r) => (
                <li key={r}><CheckCircle2 aria-hidden="true" />{r}</li>
              ))}
            </ul>
          </Card>

          <Card
            title={tr("Your Work", "Ձեր աշխատանքը")}
            subtitle={editable ? (savedAt ? tr(`Draft saved at ${savedAt}`, `Սևագիրը պահվել է ${savedAt}-ին`) : tr("You can edit your response before submitting", "Պատասխանը կարող եք խմբագրել մինչև հանձնելը")) : submittedAt ? tr(`Submitted on ${formatDateTime(submittedAt)}`, `Հանձնված է ${formatDateTime(submittedAt)}`) : undefined}
            footer={
              editable ? (
                <>
                  <Button variant="secondary" onClick={saveDraft}>{tr("Save Draft", "Պահել սևագիրը")}</Button>
                  <Button variant="primary" icon={<Send />} onClick={() => validate() && setConfirm(true)}>{tr("Submit Assignment", "Հանձնել աշխատանքը")}</Button>
                </>
              ) : status === 'submitted' ? (
                <Button
                  variant="secondary"
                  icon={<Undo2 />}
                  onClick={() => {
                    setStatus(days < 0 ? 'overdue' : 'draft');
                    toast.info(tr("Submission withdrawn", "Հանձնումը հետ կանչվեց"), tr("You can edit your work and submit it again.", "Կարող եք խմբագրել աշխատանքը և նորից հանձնել այն։"));
                  }}
                >{tr("Withdraw and Edit", "Հետ կանչել և խմբագրել")}</Button>
              ) : undefined
            }
          >
            {status === 'overdue' && <Notice tone="danger" className="mb-20">{tr("The deadline was ", "Վերջնաժամկետն անցել է ")}{relativeDue(assignment.dueDate)}{tr(". Late submissions may receive a reduced score.", "։ Ուշացած աշխատանքը կարող է գնահատվել նվազեցված միավորով։")}</Notice>}
            {status === 'submitted' && <Notice tone="warning" className="mb-20">{tr("Your work is awaiting review by your instructor.", "Աշխատանքը սպասում է դասավանդողի գնահատմանը։")}</Notice>}

            {editable ? (
              <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                <div className="field">
                  <label className="field__label" htmlFor="answer">{tr("Written Response", "Տեքստային պատասխան")}</label>
                  <div className="editor">
                    <div className="editor__toolbar" role="toolbar" aria-label={tr("Formatting", "Ձևաչափում")}>
                      <button type="button" onClick={() => wrap('**')} aria-label={tr("Bold", "Թավ")}><Bold /></button>
                      <button type="button" onClick={() => wrap('_')} aria-label={tr("Italic", "Շեղ")}><Italic /></button>
                      <button type="button" onClick={() => wrap('\n- ', '')} aria-label={tr("Bulleted List", "Կետավոր ցուցակ")}><List /></button>
                      <button type="button" onClick={() => wrap('\n1. ', '')} aria-label={tr("Numbered List", "Համարակալված ցուցակ")}><ListOrdered /></button>
                      <button type="button" onClick={() => wrap('`')} aria-label={tr("Code", "Կոդ")}><Code /></button>
                      <button type="button" onClick={() => wrap('[', '](https://)')} aria-label={tr("Link", "Հղում")}><Link2 /></button>
                    </div>
                    <textarea
                      id="answer"
                      ref={textRef}
                      className="textarea"
                      value={answer}
                      aria-invalid={error ? true : undefined}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        setError('');
                      }}
                      placeholder={tr("Describe your solution and decisions, and include a link to your project…", "Նկարագրեք ձեր լուծումը, որոշումները և հղում տվեք նախագծին…")}
                    />
                    <div className="editor__footer">
                      <span>{tr("Markdown supported", "Աջակցվում է Markdown ձևաչափը")}</span>
                      <span>{words}{tr(" words", " բառ")}</span>
                    </div>
                  </div>
                  {error && <span className="field__error" role="alert">{error}</span>}
                </div>

                {assignment.allowFiles && (
                  <div className="field">
                    <span className="field__label">{tr("Attachments", "Կցված ֆայլեր")}</span>
                    <div
                      className={cx('dropzone', dragOver && 'is-over')}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInput.current?.click()}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
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
                      <UploadCloud size={26} aria-hidden="true" />
                      <span><strong>{tr("Choose a File", "Ընտրեք ֆայլ")}</strong>{tr(" or drag it here", " կամ քաշեք այստեղ")}</span>
                      <span className="xs muted">{tr("Attach PDF, ZIP, IPYNB, or image files up to 20 MB each. Files are not uploaded; only their names are displayed.", "Կցեք PDF, ZIP, IPYNB ֆայլեր կամ պատկերներ՝ յուրաքանչյուրը մինչև 20 ՄԲ։ Ֆայլերը չեն վերբեռնվում, ցուցադրվում են միայն դրանց անունները։")}</span>
                    </div>
                    <input ref={fileInput} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
                    {files.length > 0 && (
                      <div className="stack" style={{ ['--gap' as string]: '8px', marginTop: 8 }}>
                        {files.map((f, i) => (
                          <div key={f.name + i} className="file-row">
                            <span className="file-row__icon"><Paperclip /></span>
                            <div className="grow">
                              <div className="strong">{f.name}</div>
                              <div className="xs muted">{formatFileSize(f.sizeKb)}</div>
                            </div>
                            <Button variant="ghost" size="sm" iconOnly aria-label={tr(`Remove ${f.name}`, `Հեռացնել ${f.name}`)} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} icon={<Trash2 />} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                <div className="answer-box">{answer || <span className="muted">{tr("No written answer", "Տեքստային պատասխան չկա")}</span>}</div>
                {files.map((f) => (
                  <div key={f.name} className="file-row">
                    <span className="file-row__icon"><FileText /></span>
                    <div className="grow">
                      <div className="strong">{f.name}</div>
                      <div className="xs muted">{formatFileSize(f.sizeKb)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="stack" style={{ ['--gap' as string]: '20px' }}>
          <Card title={tr("Details", "Մանրամասներ")}>
            <dl className="kv">
              <dt>{tr("Course", "Դասընթաց")}</dt>
              <dd>{course.title}</dd>
              <dt>{tr("Deadline", "Վերջնաժամկետ")}</dt>
              <dd>{formatDateTime(assignment.dueDate)}</dd>
              <dt>{tr("Time Remaining", "Մնացած ժամանակ")}</dt>
              <dd className={cx(days >= 0 && days <= 3 && editable && 'tag--urgent')}>{days < 0 ? tr("Overdue", "Ժամկետն անցել է") : relativeDue(assignment.dueDate)}</dd>
              <dt>{tr("Maximum Score", "Առավելագույն միավոր")}</dt>
              <dd>{assignment.maxScore}</dd>
              <dt>{tr("Files", "Ֆայլեր")}</dt>
              <dd>{assignment.allowFiles ? tr("Allowed", "Թույլատրված է") : tr("Not Required", "Չի պահանջվում")}</dd>
              <dt>{tr("Status", "Կարգավիճակ")}</dt>
              <dd>{status && <StatusBadge status={status} />}</dd>
            </dl>
          </Card>
          <Card title={tr("Teacher", "Դասավանդող")}>
            <Person name={fullName(teacher)} sub={teacher?.title} size={42} />
            <Button variant="secondary" block style={{ marginTop: 16 }} onClick={() => toast.info(tr("Message", "Հաղորդագրություն"), tr("Messages are not sent in this demo.", "Ցուցադրական տարբերակում հաղորդագրություններ չեն ուղարկվում։"))}>{tr("Ask Your Instructor", "Հարց տալ դասավանդողին")}</Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={submit}
        tone="warning"
        title={tr("Submit your assignment?", "Հանձնե՞լ աշխատանքը")}
        text={tr(`Your response will be marked as ready for review. Attached files: ${files.length}. Response length: ${words} words. Nothing is sent in this demo.`, `Հանձնելուց հետո պատասխանը կփոխանցվի գնահատման։ Կցված է ${files.length} ֆայլ, պատասխանը՝ ${words} բառ։ Ցուցադրական ռեժիմում ոչինչ չի ուղարկվում։`)}
        confirmLabel={tr("Submit", "Հանձնել")}
      />
    </>
  );
}

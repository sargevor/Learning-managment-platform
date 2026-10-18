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
        <EmptyState title="Առաջադրանքը չի գտնվել" text="Հնարավոր է՝ այն հեռացվել է կամ դուք գրանցված չեք համապատասխան դասընթացին։" action={<ButtonLink to="/student/assignments">Բոլոր առաջադրանքները</ButtonLink>} />
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
    if (tooBig.length) toast.error('Ֆայլը չափազանց մեծ է', 'Առավելագույն չափը 20 ՄԲ է։');
    setFiles((cur) => [...cur, ...next.filter((f) => f.sizeKb <= 20 * 1024)]);
    setError('');
  };

  const wrap = (before: string, after = before) => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = answer.slice(s, e) || 'տեքստ';
    setAnswer(answer.slice(0, s) + before + selected + after + answer.slice(e));
    requestAnimationFrame(() => el.focus());
  };

  const validate = () => {
    if (answer.trim().length < 20 && files.length === 0) {
      setError('Գրեք առնվազն 20 նիշանոց պատասխան կամ կցեք ֆայլ։');
      return false;
    }
    return true;
  };

  const saveDraft = () => {
    setStatus(days < 0 ? 'overdue' : 'draft');
    const now = new Date(TODAY);
    setSavedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    toast.success('Սևագիրը պահվեց', 'Միայն այս էջում. տվյալները չեն ուղարկվել սերվեր։');
  };

  const submit = () => {
    setStatus('submitted');
    setSubmittedAt(TODAY.toISOString().slice(0, 16));
    toast.success('Աշխատանքը նշվեց որպես հանձնված', 'Դեմո ռեժիմ. հանձնումը չի ստացվել որևէ սերվերի կողմից։');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Առաջադրանքներ', to: '/student/assignments' }, { label: course.title, to: `/student/courses/${course.id}/learn` }, { label: assignment.title }]}
        title={assignment.title}
        description={assignment.summary}
        actions={status && <StatusBadge status={status} />}
      />

      <div className="grid grid-main-aside">
        <div className="stack" style={{ ['--gap' as string]: '20px', minWidth: 0 }}>
          {graded && (
            <Card title="Գնահատական և մեկնաբանություն">
              <div className="row row--top row--wrap" style={{ ['--gap' as string]: '24px' }}>
                <ProgressRing value={(original!.score! / assignment.maxScore) * 100} size={104} color="var(--success-600)" label="արդյունք" />
                <div className="stack grow" style={{ ['--gap' as string]: '10px', minWidth: 240 }}>
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--navy-900)' }}>{original!.score}</span>
                    <span className="muted">/ {assignment.maxScore} միավոր</span>
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

          <Card title="Հրահանգներ">
            <ol className="instructions">
              {assignment.instructions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h3 style={{ fontSize: 'var(--fs-sm)', margin: '20px 0 10px' }}>Պահանջներ</h3>
            <ul className="check-list">
              {assignment.requirements.map((r) => (
                <li key={r}><CheckCircle2 aria-hidden="true" />{r}</li>
              ))}
            </ul>
          </Card>

          <Card
            title="Ձեր աշխատանքը"
            subtitle={editable ? (savedAt ? `Սևագիրը պահվել է ${savedAt}-ին` : 'Պատասխանը կարող եք խմբագրել մինչև հանձնելը') : submittedAt ? `Հանձնված է ${formatDateTime(submittedAt)}` : undefined}
            footer={
              editable ? (
                <>
                  <Button variant="secondary" onClick={saveDraft}>Պահել սևագիրը</Button>
                  <Button variant="primary" icon={<Send />} onClick={() => validate() && setConfirm(true)}>Հանձնել աշխատանքը</Button>
                </>
              ) : status === 'submitted' ? (
                <Button
                  variant="secondary"
                  icon={<Undo2 />}
                  onClick={() => {
                    setStatus(days < 0 ? 'overdue' : 'draft');
                    toast.info('Հանձնումը հետ կանչվեց', 'Կարող եք խմբագրել և նորից հանձնել։');
                  }}
                >
                  Հետ կանչել և խմբագրել
                </Button>
              ) : undefined
            }
          >
            {status === 'overdue' && <Notice tone="danger" className="mb-20">Վերջնաժամկետն անցել է {relativeDue(assignment.dueDate)}։ Ուշացած աշխատանքը կարող է գնահատվել նվազեցված միավորով։</Notice>}
            {status === 'submitted' && <Notice tone="warning" className="mb-20">Աշխատանքը սպասում է դասավանդողի գնահատմանը։</Notice>}

            {editable ? (
              <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                <div className="field">
                  <label className="field__label" htmlFor="answer">Տեքստային պատասխան</label>
                  <div className="editor">
                    <div className="editor__toolbar" role="toolbar" aria-label="Ձևաչափում">
                      <button type="button" onClick={() => wrap('**')} aria-label="Թավ"><Bold /></button>
                      <button type="button" onClick={() => wrap('_')} aria-label="Շեղ"><Italic /></button>
                      <button type="button" onClick={() => wrap('\n- ', '')} aria-label="Ցուցակ"><List /></button>
                      <button type="button" onClick={() => wrap('\n1. ', '')} aria-label="Համարակալված ցուցակ"><ListOrdered /></button>
                      <button type="button" onClick={() => wrap('`')} aria-label="Կոդ"><Code /></button>
                      <button type="button" onClick={() => wrap('[', '](https://)')} aria-label="Հղում"><Link2 /></button>
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
                      placeholder="Նկարագրեք ձեր լուծումը, որոշումները և հղում տվեք նախագծին…"
                    />
                    <div className="editor__footer">
                      <span>Աջակցվում է Markdown ձևաչափը</span>
                      <span>{words} բառ</span>
                    </div>
                  </div>
                  {error && <span className="field__error" role="alert">{error}</span>}
                </div>

                {assignment.allowFiles && (
                  <div className="field">
                    <span className="field__label">Կցված ֆայլեր</span>
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
                      <span><strong>Ընտրեք ֆայլ</strong> կամ քաշեք այստեղ</span>
                      <span className="xs muted">PDF, ZIP, IPYNB, պատկերներ, մինչև 20 ՄԲ։ Ֆայլերը չեն վերբեռնվում, ցուցադրվում է միայն անունը։</span>
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
                            <Button variant="ghost" size="sm" iconOnly aria-label={`Հեռացնել ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} icon={<Trash2 />} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="stack" style={{ ['--gap' as string]: '12px' }}>
                <div className="answer-box">{answer || <span className="muted">Տեքստային պատասխան չկա</span>}</div>
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
          <Card title="Մանրամասներ">
            <dl className="kv">
              <dt>Դասընթաց</dt>
              <dd>{course.title}</dd>
              <dt>Վերջնաժամկետ</dt>
              <dd>{formatDateTime(assignment.dueDate)}</dd>
              <dt>Մնացել է</dt>
              <dd className={cx(days >= 0 && days <= 3 && editable && 'tag--urgent')}>{days < 0 ? 'Ժամկետն անցել է' : relativeDue(assignment.dueDate)}</dd>
              <dt>Առավելագույն միավոր</dt>
              <dd>{assignment.maxScore}</dd>
              <dt>Ֆայլեր</dt>
              <dd>{assignment.allowFiles ? 'Թույլատրված է' : 'Չի պահանջվում'}</dd>
              <dt>Կարգավիճակ</dt>
              <dd>{status && <StatusBadge status={status} />}</dd>
            </dl>
          </Card>
          <Card title="Դասավանդող">
            <Person name={fullName(teacher)} sub={teacher?.title} size={42} />
            <Button variant="secondary" block style={{ marginTop: 16 }} onClick={() => toast.info('Հաղորդագրություն', 'Ցուցադրական տարբերակում հաղորդագրություններ չեն ուղարկվում։')}>
              Հարց տալ դասավանդողին
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={submit}
        tone="warning"
        title="Հանձնե՞լ աշխատանքը"
        text={`Հանձնելուց հետո պատասխանը կփոխանցվի գնահատման։ Կցված է ${files.length} ֆայլ, պատասխանը՝ ${words} բառ։ Դեմո ռեժիմում ոչինչ չի ուղարկվում։`}
        confirmLabel="Հանձնել"
      />
    </>
  );
}

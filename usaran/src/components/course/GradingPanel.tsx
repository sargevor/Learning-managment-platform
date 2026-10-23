import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Download, FileText, RotateCcw, Save, Send } from 'lucide-react';
import type { SubmissionStatus } from '../../types';
import type { SubmissionRow } from '../../data/teacherView';
import { fullName } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Badge, StatusBadge } from '../ui/Badge';
import { Notice, Person } from '../ui/Misc';
import { formatDateTime, formatFileSize, percent } from '../../lib/format';
import { tr } from '../../i18n';

export interface GradeOverride {
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
}

interface Props {
  row: SubmissionRow;
  override?: GradeOverride;
  onSave: (id: string, g: GradeOverride) => void;
}

/** Student work + grading form. All grading happens in local state only. */
export function GradingPanel({ row, override, onSave }: Props) {
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
      setError(tr("Enter a score", "Մուտքագրեք միավորը"));
      return false;
    }
    if (n < 0 || n > assignment.maxScore) {
      setError(tr(`The score must be between 0 and ${assignment.maxScore}`, `Միավորը պետք է լինի 0-ից մինչև ${assignment.maxScore}`));
      return false;
    }
    setError('');
    return true;
  };

  const save = (final: boolean) => {
    if (!validate()) return;
    if (final && feedback.trim().length < 10) {
      setError(tr("Add a short comment before sending", "Ուղարկելուց առաջ գրեք կարճ մեկնաբանություն"));
      return;
    }
    onSave(submission.id, { score: Number(score), feedback, status: final ? 'graded' : 'submitted' });
    toast.success(final ? tr("Grade sent to the student", "Գնահատականն ուղարկվեց ուսանողին") : tr("Grade saved as a draft", "Գնահատականը պահվեց որպես սևագիր"), tr("Demo only: the student will not receive a notification.", "Ցուցադրական ռեժիմ։ Ուսանողը ծանուցում չի ստանա։"));
  };

  const quick = [1, 0.9, 0.8, 0.7].map((k) => Math.round(assignment.maxScore * k));

  return (
    <div className="submission-view">
      <div className="submission-view__work stack" style={{ ['--gap' as string]: '16px' }}>
        <div className="row row--between row--top row--wrap">
          <Person name={fullName(student)} sub={student.email} size={42} />
          <div className="row row--wrap" style={{ ['--gap' as string]: '6px' }}>
            {submission.late && <Badge tone="danger">{tr("Late", "Ուշացած")}</Badge>}
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="row row--wrap xs muted" style={{ ['--gap' as string]: '6px 16px' }}>
          <span>{assignment.title}</span>
          <span>{course.title}</span>
          <span className="row" style={{ ['--gap' as string]: '4px' }}><Clock size={13} />{tr("Submitted: ", "Հանձնված՝ ")}{submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}</span>
        </div>
        <div>
          <div className="field__label" style={{ marginBottom: 6 }}>{tr("Student answer", "Ուսանողի պատասխանը")}</div>
          <div className="answer-box">{submission.answer || <span className="muted">{tr("No written answer", "Տեքստային պատասխան չկա")}</span>}</div>
        </div>
        <div>
          <div className="field__label" style={{ marginBottom: 6 }}>{tr("Attachments", "Կցված ֆայլեր")}</div>
          {submission.attachments.length === 0 ? (
            <p className="small muted">{tr("No files attached", "Ֆայլեր կցված չեն")}</p>
          ) : (
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              {submission.attachments.map((f) => (
                <div key={f.name} className="file-row">
                  <span className="file-row__icon"><FileText /></span>
                  <div className="grow">
                    <div className="strong">{f.name}</div>
                    <div className="xs muted">{formatFileSize(f.sizeKb)}</div>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Download />} onClick={() => toast.info(tr("File unavailable", "Ֆայլը հասանելի չէ"), tr("Files are not stored in this demo.", "Ցուցադրական տարբերակում ֆայլեր չեն պահվում։"))}>{tr("Open", "Բացել")}</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="submission-view__grade stack" style={{ ['--gap' as string]: '16px' }}>
        <h3 style={{ fontSize: 'var(--fs-base)' }}>{tr("Grading", "Գնահատում")}</h3>
        {status === 'graded' && <Notice tone="success">{tr("Graded: ", "Գնահատված է՝ ")}{initialScore}/{assignment.maxScore} ({percent(initialScore ?? 0, assignment.maxScore)}%)</Notice>}
        <div className="field">
          <label className="field__label" htmlFor={`score-${submission.id}`}>{tr("Score", "Միավոր")}</label>
          <div className="row" style={{ ['--gap' as string]: '8px' }}>
            <input id={`score-${submission.id}`} className="input" type="number" min={0} max={assignment.maxScore} value={score} onChange={(e) => { setScore(e.target.value); setError(''); }} aria-invalid={error ? true : undefined} style={{ width: 110 }} />
            <span className="small muted">/ {assignment.maxScore}</span>
          </div>
          <div className="row row--wrap" style={{ ['--gap' as string]: '6px', marginTop: 4 }}>
            {quick.map((v) => (
              <button key={v} type="button" className="chip" style={{ height: 28, padding: '0 10px' }} onClick={() => { setScore(String(v)); setError(''); }}>{v}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`fb-${submission.id}`}>{tr("Feedback for the student", "Մեկնաբանություն ուսանողին")}</label>
          <textarea id={`fb-${submission.id}`} className="textarea" rows={6} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={tr("What went well? What could be improved?", "Ի՞նչն է լավ ստացվել։ Ի՞նչը կարելի է բարելավել։")} />
          <span className="field__hint">{feedback.length}{tr(" characters", " նիշ")}</span>
        </div>
        {error && <span className="field__error" role="alert">{error}</span>}
        <div className="stack" style={{ ['--gap' as string]: '8px' }}>
          <Button variant="primary" block icon={status === 'graded' ? <RotateCcw /> : <Send />} onClick={() => save(true)}>{status === 'graded' ? tr("Update and send", "Թարմացնել և ուղարկել") : tr("Send grade", "Ուղարկել գնահատականը")}</Button>
          <Button variant="secondary" block icon={<Save />} onClick={() => save(false)}>{tr("Save grade", "Պահել գնահատականը")}</Button>
        </div>
        <p className="xs muted row" style={{ ['--gap' as string]: '6px' }}><CheckCircle2 size={13} />{tr("The grade is saved only on this page", "Գնահատականը պահվում է միայն այս էջում")}</p>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, CircleX, Clock, FileText, Paperclip, Pencil, SquareCheckBig, Trophy } from 'lucide-react';
import { getAssignment } from '../../data/assignments';
import { getCourse } from '../../data/courses';
import { studentsInCourse, teacherSubmissionRows, TEACHER_COURSE_IDS, type SubmissionRow } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { ageShort, CourseIcon, courseShort, GradingPanel, shortDateTime, type GradeOverride } from '../../components/course/GradingPanel';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Overlay';
import { average, daysUntil, formatFileSize } from '../../lib/format';

type Tab = 'all' | 'submitted' | 'graded';

export function AssignmentSubmissionsPage() {
  const { id } = useParams();
  const assignment = getAssignment(id);
  const [overrides, setOverrides] = useState<Record<string, GradeOverride>>({});
  const [tab, setTab] = useState<Tab>('all');
  const [open, setOpen] = useState<SubmissionRow | null>(null);

  const rows = useMemo(() => (assignment ? teacherSubmissionRows().filter((r) => r.assignment.id === assignment.id) : []), [assignment]);

  if (!assignment || !TEACHER_COURSE_IDS.includes(assignment.courseId)) {
    return <div className="tw-card"><EmptyState title="Task not found" action={<ButtonLink to="/teacher/assignments" icon={<ArrowLeft />}>Tasks</ButtonLink>} /></div>;
  }

  const course = getCourse(assignment.courseId)!;
  const statusOf = (r: SubmissionRow) => overrides[r.submission.id]?.status ?? r.submission.status;
  const scoreOf = (r: SubmissionRow) => overrides[r.submission.id]?.score ?? r.submission.score;
  const submittedIds = new Set(rows.map((r) => r.student.id));
  const missing = studentsInCourse(course.id).filter((s) => !submittedIds.has(s.userId) && s.userId !== 's1');
  const graded = rows.filter((r) => statusOf(r) === 'graded');
  const toGrade = rows.length - graded.length;
  const total = rows.length + missing.length;
  const avg = graded.length ? average(graded.map((r) => Math.round(((scoreOf(r) ?? 0) / assignment.maxScore) * 100))) : 0;
  const shown = rows.filter((r) => tab === 'all' || (tab === 'submitted' ? statusOf(r) !== 'graded' : statusOf(r) === 'graded'));
  const firstPending = rows.find((r) => statusOf(r) !== 'graded');
  const overdue = daysUntil(assignment.dueDate) < 0;

  const segs = [
    { label: 'Graded', n: graded.length, icon: <Check aria-hidden="true" />, cls: 'is-navy' },
    { label: 'To grade', n: toGrade, icon: <SquareCheckBig aria-hidden="true" />, cls: 'is-blue' },
    { label: 'Missing', n: missing.length, icon: <CircleX aria-hidden="true" />, cls: 'is-grey' },
  ];

  return (
    <div className="tw-page">
      <ShellTitle
        title={assignment.title}
        meta={
          <>
            <span className="tw-metachip"><CourseIcon id={course.id} size={15} />{courseShort(course.id)}</span>
            <Calendar aria-hidden="true" />
            <b>{shortDateTime(assignment.dueDate)}</b>
            <span className="tw-dot" aria-hidden="true" />
            {assignment.maxScore} pts
          </>
        }
      />

      <Link to="/teacher/assignments" className="tw-back"><ArrowLeft aria-hidden="true" />Tasks</Link>

      <section className="tw-card tw-status" aria-label="Status">
        <div className="tw-status__main">
          <div className="tw-status__big">
            <b>{rows.length}<span>/{total}</span></b>
            <span>handed in</span>
          </div>
          <div className="tw-segbar" role="img" aria-label={`${graded.length} graded, ${toGrade} to grade, ${missing.length} missing`}>
            {segs.filter((s) => s.n > 0).map((s) => (
              <span key={s.label} className={s.cls} style={{ flexGrow: s.n }} />
            ))}
          </div>
          <div className="tw-legend">
            {segs.map((s) => (
              <span key={s.label} className="tw-legend__item">
                <span className={`tw-legend__dot ${s.cls}`} />
                <b>{s.n}</b>
                <span className="tw-legend__label">{s.icon}{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="tw-status__side">
          <span className="tw-avg">
            <span className="tw-ring" role="img" aria-label={graded.length ? `Average ${avg}%` : 'No grades yet'} style={{ background: graded.length ? `conic-gradient(var(--accent-600) 0 ${avg}%, var(--accent-100) 0)` : 'var(--track)' }}>
              <span>{graded.length ? `${avg}%` : '–'}</span>
            </span>
            <span className="tw-avg__label"><Trophy aria-hidden="true" />Average</span>
          </span>
          <Link to={firstPending ? `/teacher/grading?submission=${firstPending.submission.id}` : '/teacher/grading'} className="tw-btn tw-btn--primary tw-btn--lg">
            <SquareCheckBig aria-hidden="true" />Start grading
          </Link>
        </div>
      </section>

      <section className="tw-card tw-students" aria-label="Students">
        <div className="tw-students__head">
          <h2 className="tw-h2">Students</h2>
          <div className="tw-seg" role="tablist" aria-label="Filter">
            {([['all', 'All', rows.length], ['submitted', 'To grade', toGrade], ['graded', 'Graded', graded.length]] as const).map(([k, label, n]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
                {label}<span className="tw-seg__n">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState compact title="No submissions here" />
        ) : (
          <div role="list" className="tw-srows">
            {shown.map((r) => {
              const name = fullName(r.student);
              const file = r.submission.attachments[0];
              const isGraded = statusOf(r) === 'graded';
              return (
                <div key={r.submission.id} role="listitem" className="tw-srow">
                  <span className="tw-srow__who">
                    <Avatar name={name} size={44} />
                    <span className="tw-ell tw-strong">{name}</span>
                  </span>
                  <span className="tw-srow__time">
                    <span className="tw-chip tw-chip--soft" title={r.submission.submittedAt ? ageShort(r.submission.submittedAt) + ' ago' : undefined}>
                      <Clock aria-hidden="true" />{r.submission.submittedAt ? shortDateTime(r.submission.submittedAt) : '—'}
                    </span>
                    {r.submission.late && <span className="tw-chip tw-chip--red">Late</span>}
                  </span>
                  <span className="tw-srow__file">
                    <span className="tw-filechip">
                      <span className="tw-filechip__icon">{file ? <Paperclip aria-hidden="true" /> : <FileText aria-hidden="true" />}</span>
                      <span className="tw-ell">{file ? file.name : 'Text answer'}</span>
                      {file && <span className="tw-filechip__size">{formatFileSize(file.sizeKb)}</span>}
                      {r.submission.attachments.length > 1 && <span className="tw-filechip__size">+{r.submission.attachments.length - 1}</span>}
                    </span>
                  </span>
                  <span className="tw-srow__act">
                    {isGraded ? (
                      <button type="button" className="tw-score" onClick={() => setOpen(r)} aria-label={`Score ${scoreOf(r)} of ${assignment.maxScore}, ${name}. Open`}>
                        <Check aria-hidden="true" />{scoreOf(r)}<small>/{assignment.maxScore}</small>
                      </button>
                    ) : (
                      <button type="button" className="tw-btn tw-btn--primary" onClick={() => setOpen(r)} aria-label={`Grade ${name}`}>
                        <Pencil aria-hidden="true" />Grade
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {missing.length > 0 && (
          <div className="tw-missing">
            <span className="tw-missing__title"><CircleX aria-hidden="true" />Missing</span>
            {overdue && <span className="tw-chip tw-chip--red">Overdue</span>}
            {missing.map((s) => {
              const name = fullName(getUser(s.userId));
              return (
                <span key={s.userId} className="tw-person-chip">
                  <Avatar name={name} size={32} />
                  {name}
                </span>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title="Submission">
        {open && (
          <div className="tw-modal-body">
            <GradingPanel row={open} override={overrides[open.submission.id]} onSave={(sid, g) => setOverrides((o) => ({ ...o, [sid]: g }))} />
          </div>
        )}
      </Modal>
    </div>
  );
}

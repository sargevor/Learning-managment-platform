import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChartColumn, Check, Ellipsis, Eye, FilePlus, FileQuestionMark, FileText, Layers, List, ListChecks, Pencil, RotateCcw, Timer, Users } from 'lucide-react';
import { quizResultSummary, teacherCourses, teacherQuizzes } from '../../data/teacherView';
import { getCourse } from '../../data/courses';
import { CourseIcon, courseShort, todayLabel } from '../../components/course/GradingPanel';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { Dropdown } from '../../components/ui/Overlay';

export function TeacherQuizzesPage() {
  const [course, setCourse] = useState('all');
  const rows = teacherQuizzes.filter((q) => course === 'all' || q.courseId === course);
  const chipCourses = teacherCourses.filter((c) => c.id === course || teacherQuizzes.some((q) => q.courseId === c.id));
  const questionCount = teacherQuizzes.reduce((n, q) => n + q.questions.length, 0);

  return (
    <div className="tw-page">
      <ShellTitle
        title="Quizzes"
        meta={
          <>
            <ListChecks aria-hidden="true" />
            <b>{questionCount} questions</b>
            <span className="tw-dot" aria-hidden="true" />
            {todayLabel()}
          </>
        }
      />

      <section className="tw-toolbar" aria-label="Filters">
        <div className="tw-chipbar" role="group" aria-label="Course">
          <button type="button" className="tw-fchip" aria-pressed={course === 'all'} onClick={() => setCourse('all')}>
            <Layers aria-hidden="true" />All<span className="tw-fchip__n">{teacherQuizzes.length}</span>
          </button>
          {chipCourses.map((c) => (
            <button key={c.id} type="button" className="tw-fchip" aria-pressed={course === c.id} title={c.title} onClick={() => setCourse(c.id)}>
              <CourseIcon id={c.id} size={17} />
              {courseShort(c.id)}
              <span className="tw-fchip__n">{teacherQuizzes.filter((q) => q.courseId === c.id).length}</span>
            </button>
          ))}
        </div>
        <Link to="/teacher/quizzes/new/edit" className="tw-btn tw-btn--primary">
          <FilePlus aria-hidden="true" />New quiz
        </Link>
      </section>

      {rows.length === 0 ? (
        <div className="tw-card">
          <EmptyState icon={<FileQuestionMark size={24} />} title="No quizzes yet" action={<ButtonLink to="/teacher/quizzes/new/edit" variant="secondary" icon={<FilePlus />}>New quiz</ButtonLink>} />
        </div>
      ) : (
        <section className="tw-qgrid" aria-label="Quizzes">
          {rows.map((q) => {
            const live = q.status === 'published';
            // Illustrative results: the app has no real attempt tracking (see quizResultSummary).
            const res = quizResultSummary(q);
            return (
              <article key={q.id} className="tw-card tw-quiz v-lift">
                <div className="tw-quiz__top">
                  <span className="tw-ibox tw-ibox--lg"><FileQuestionMark aria-hidden="true" /></span>
                  {live ? (
                    <span className="tw-pill tw-pill--soft"><Check aria-hidden="true" />Published</span>
                  ) : (
                    <span className="tw-pill tw-pill--grey"><FileText aria-hidden="true" />Draft</span>
                  )}
                </div>
                <div className="tw-quiz__head">
                  <h2><Link to={`/teacher/quizzes/${q.id}/edit`} className="tw-plainlink">{q.title}</Link></h2>
                  <span className="tw-quiz__course"><CourseIcon id={q.courseId} size={15} /><span className="tw-ell">{getCourse(q.courseId)?.title}</span></span>
                </div>
                <div className="tw-chips">
                  <span className="tw-chip tw-chip--soft"><List aria-hidden="true" />{q.questions.length} questions</span>
                  <span className="tw-chip tw-chip--soft"><Timer aria-hidden="true" />{q.timeLimitMin} min</span>
                  <span className="tw-chip tw-chip--soft"><RotateCcw aria-hidden="true" />{q.attemptsAllowed} {q.attemptsAllowed === 1 ? 'try' : 'tries'}</span>
                </div>
                <div className="tw-quiz__foot">
                  <span className="tw-ring tw-ring--sm" role="img" aria-label={live ? `Average ${res.avg}%` : 'No results yet'} style={{ background: live ? `conic-gradient(var(--accent-600) 0 ${res.avg}%, var(--accent-100) 0)` : 'var(--track)' }}>
                    <span>{live ? `${res.avg}%` : '–'}</span>
                  </span>
                  <span className="tw-quiz__stat">
                    <span className="tw-quiz__stat-label">Average</span>
                    <span className="tw-quiz__stat-val"><Users aria-hidden="true" />{live ? `${res.attempts} attempts` : 'No attempts'}</span>
                  </span>
                  <Link to={`/teacher/quizzes/${q.id}/edit`} className="tw-btn tw-btn--secondary" aria-label={`Edit ${q.title}`}>
                    <Pencil aria-hidden="true" />Edit
                  </Link>
                  <Dropdown trigger={({ toggle, open }) => <button type="button" className="tw-iconbtn" onClick={toggle} aria-expanded={open} aria-label={`More: ${q.title}`}><Ellipsis aria-hidden="true" /></button>}>
                    {(close) => (
                      <>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=preview`} onClick={close}><Eye />Preview</Link>
                        <Link className="dropdown__item" to={`/teacher/quizzes/${q.id}/edit?tab=results`} onClick={close}><ChartColumn />Results</Link>
                      </>
                    )}
                  </Dropdown>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

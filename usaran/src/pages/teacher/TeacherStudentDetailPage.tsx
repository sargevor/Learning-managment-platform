import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Check, CircleAlert, ClipboardList, Clock, FileQuestionMark, GraduationCap, LibraryBig, Mail, MessageSquare, Minus, Play, Send, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { getStudentRecord } from '../../data/analytics';
import { categoryName, getCourse } from '../../data/courses';
import { teacherSubmissionRows, teacherQuizzes } from '../../data/teacherView';
import { fullName, getUser } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Meter, Ring } from '../../components/ui/Visual';
import { CATEGORY_ICONS } from '../../lib/visual';
import { average, cx, letterGrade, percent, TODAY } from '../../lib/format';
import { shortAgo } from './TeacherStudentsPage';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function TeacherStudentDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const record = getStudentRecord(id);
  const user = getUser(id);

  if (!record || !user) {
    return (
      <>
        <ShellTitle title="Student profile" />
        <div className="tp-card"><EmptyState title="Student not found" text="Not enrolled in your courses." action={<ButtonLink to="/teacher/students" icon={<ArrowLeft />}>Students</ButtonLink>} /></div>
      </>
    );
  }

  const name = fullName(user);
  const subs = teacherSubmissionRows().filter((r) => r.student.id === user.id);
  const quizzes = teacherQuizzes.filter((q) => q.status === 'published' && record.courseIds.includes(q.courseId));
  const totalMin = record.weeklyMinutes.reduce((a, b) => a + b, 0);
  const maxMin = Math.max(1, ...record.weeklyMinutes);
  const peak = record.weeklyMinutes.indexOf(maxMin);
  const joined = new Date(user.joinedAt);
  const StatusMark = record.status === 'active' ? Check : record.status === 'at-risk' ? CircleAlert : Minus;
  const statusLabel = record.status === 'active' ? 'Active' : record.status === 'at-risk' ? 'At risk' : 'Inactive';

  // Illustrative per-course progress (no per-course tracking in the mock data), as before.
  const courseRows = record.courseIds.map((cid, i) => {
    const course = getCourse(cid);
    const p = Math.max(5, Math.min(100, record.progress + (i % 2 ? -12 : 8)));
    const graded = subs.filter((s) => s.course.id === cid && s.submission.score !== undefined).map((s) => percent(s.submission.score!, s.assignment.maxScore));
    return { cid, course, p, score: graded.length ? average(graded) : undefined };
  });

  // Quiz scores are illustrative, derived from the record's quiz average (as before).
  const quizScores = quizzes.map((q, i) => ({ q, score: Math.max(40, Math.min(100, record.quizAvg + ((i * 7) % 15) - 6)) }));
  const meta = user.program ? `${user.program}${user.year && user.year !== '—' ? `, ${user.year}` : ''}` : user.year;

  return (
    <>
      <ShellTitle
        title="Student profile"
        meta={
          <>
            <BookOpen aria-hidden="true" />
            <b>{record.courseIds.length} of your courses</b>
            <span className="tp-dot" aria-hidden="true" />
            {TODAY.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </>
        }
      />

      <Link to="/teacher/students" className="tp-back">
        <span className="tp-back__icon"><ArrowLeft aria-hidden="true" /></span>
        Students
      </Link>

      <section aria-label={name} className="tp-card tp-hero">
        <span className="tp-hero__photo">
          <Avatar name={name} size={140} />
          <span role="img" aria-label={statusLabel} className={cx('tp-hero__mark', record.status === 'at-risk' && 'tp-hero__mark--red', record.status === 'inactive' && 'tp-hero__mark--grey')}>
            <StatusMark aria-hidden="true" />
          </span>
        </span>
        <div className="tp-hero__body">
          <div>
            <h2 className="tp-hero__name">{name}</h2>
            {meta && <div className="tp-hero__sub"><GraduationCap aria-hidden="true" />{meta}</div>}
          </div>
          <div className="tp-chips">
            <span className="tp-chip tp-chip--lg tp-chip--plain"><Mail aria-hidden="true" />{user.email}</span>
            <span className="tp-chip tp-chip--lg tp-chip--plain"><Calendar aria-hidden="true" />Joined {MONTHS[joined.getMonth()]} {joined.getFullYear()}</span>
            {user.institution && <span className="tp-chip tp-chip--lg tp-chip--plain"><LibraryBig aria-hidden="true" />{user.institution}</span>}
            <span className="tp-chip tp-chip--lg tp-chip--plain"><Clock aria-hidden="true" />Active {shortAgo(record.lastActive)} ago</span>
          </div>
          <div className="tp-actions">
            <button type="button" className="tp-btn tp-btn--primary" onClick={() => toast.info('Message', 'Messages are not sent in the demo.')}>
              <MessageSquare aria-hidden="true" />Message
            </button>
            <button type="button" className="tp-btn tp-btn--secondary" onClick={() => toast.info('Email', 'Emails are not sent in the demo.')}>
              <Mail aria-hidden="true" />Email
            </button>
          </div>
        </div>
        <div className="tp-week">
          <div className="tp-week__head">
            <span>This week</span>
            <b>{Math.round((totalMin / 60) * 10) / 10}<small> h</small></b>
          </div>
          <div className="tp-week__bars" role="img" aria-label={`Minutes per day: ${record.weeklyMinutes.join(', ')}`}>
            {record.weeklyMinutes.map((m, i) => (
              <div key={i} className="tp-week__day">
                <div
                  className={cx('tp-week__bar', i === peak && m > 0 && 'tp-week__bar--peak', m === 0 && 'tp-week__bar--zero')}
                  style={{ height: `${Math.max(6, Math.round((m / maxMin) * 100))}%` }}
                />
                <span>{DAY_LETTERS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Summary" className="tp-tiles">
        <div className="stat">
          <span className="stat__icon" aria-hidden="true"><Trophy /></span>
          <span className="stat__main">
            <span className="stat__value">{record.avgScore}<small>%</small></span>
            <span className="stat__label">Average score</span>
          </span>
          <span className="tp-tag">{letterGrade(record.avgScore)}</span>
        </div>
        <div className="stat">
          <span className="stat__icon" aria-hidden="true"><BookOpen /></span>
          <span className="stat__main">
            <span className="stat__value">{record.progress}<small>%</small></span>
            <span className="stat__label">Progress</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat__icon" aria-hidden="true"><Send /></span>
          <span className="stat__main">
            <span className="stat__value">{record.assignmentsDone}<small>/{record.assignmentsTotal}</small></span>
            <span className="stat__label">Tasks handed in</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat__icon" aria-hidden="true"><FileQuestionMark /></span>
          <span className="stat__main">
            <span className="stat__value">{record.quizAvg}<small>%</small></span>
            <span className="stat__label">Quiz average</span>
          </span>
        </div>
      </section>

      <section className="tp-split">
        <div className="tp-card tp-span2">
          <h2 className="tp-h2">Courses</h2>
          <div className="tp-rows">
            {courseRows.map(({ cid, course, p, score }) => {
              const CatIcon = course ? CATEGORY_ICONS[course.category] : BookOpen;
              const state = p >= 100 ? 'Done' : p > 0 ? 'In progress' : 'Not started';
              return (
                <Link key={cid} to={`/teacher/courses/${cid}`} className="tp-course">
                  {course && <img src={course.image} alt="" className="tp-course__img" loading="lazy" />}
                  <span className="tp-course__main">
                    <span className="tp-course__title">{course?.title ?? cid}</span>
                    <span className="tp-chips">
                      {course && <span className="tp-chip"><CatIcon aria-hidden="true" />{categoryName(course.category)}</span>}
                      <span className="tp-chip tp-chip--soft">{p >= 100 ? <Check aria-hidden="true" /> : <Play aria-hidden="true" />}{state}</span>
                    </span>
                  </span>
                  <Ring value={p} size={58} thickness={7} label={`${course?.title ?? cid} progress`} />
                  <span className="tp-grade" title={score === undefined ? 'No grades yet' : undefined}>
                    <b>{score === undefined ? '—' : letterGrade(score)}</b>
                    <span>{score === undefined ? 'No grade' : `${score}%`}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="tp-card">
          <div className="tp-head">
            <h2 className="tp-h2">Recent grades</h2>
            <Link to="/teacher/grading" className="tp-more">All<ChevronRight aria-hidden="true" /></Link>
          </div>
          {subs.length === 0 && quizScores.length === 0 ? (
            <EmptyState compact icon={<Sparkles size={22} />} title="No grades yet" />
          ) : (
            <div className="tp-grades">
              {subs.map((r) => {
                const pct = r.submission.score !== undefined ? percent(r.submission.score, r.assignment.maxScore) : undefined;
                return (
                  <div key={r.submission.id} className="tp-gradeRow">
                    <span className="tp-box tp-box--sm" aria-hidden="true"><ClipboardList /></span>
                    <span className="tp-gradeRow__main">
                      <span className="tp-ellipsis">{r.assignment.title}</span>
                      {pct !== undefined && <Meter value={pct} height={6} label={`${r.assignment.title} score`} />}
                    </span>
                    {pct !== undefined ? (
                      <b className="tp-gradeRow__score">{pct}</b>
                    ) : (
                      <ButtonLink to={`/teacher/grading?submission=${r.submission.id}`} variant="secondary" size="sm">Grade</ButtonLink>
                    )}
                  </div>
                );
              })}
              {quizScores.map(({ q, score }) => (
                <div key={q.id} className="tp-gradeRow">
                  <span className={cx('tp-box tp-box--sm', score < q.passPercent && 'tp-box--red')} aria-hidden="true"><FileQuestionMark /></span>
                  <span className="tp-gradeRow__main">
                    <span className="tp-ellipsis">{q.title}</span>
                    <Meter value={score} height={6} color={score < q.passPercent ? 'var(--danger-700)' : undefined} label={`${q.title} score`} />
                  </span>
                  <b className="tp-gradeRow__score">{score}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

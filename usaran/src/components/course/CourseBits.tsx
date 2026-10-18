import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarClock, CheckCircle2, Clock, ClipboardList, FileText, HelpCircle, Lock, Paperclip, PlayCircle, Star, Timer, Users } from 'lucide-react';
import type { Assignment, AssignmentStatus, Course, Lesson, LessonType, Quiz, QuizState } from '../../types';
import { categoryName, difficultyLabel } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { cx, daysUntil, formatDate, formatNumber, relativeDue } from '../../lib/format';
import { Badge, StatusBadge } from '../ui/Badge';
import { Thumb } from '../ui/Misc';
import { ProgressBar } from '../ui/Progress';

export const LESSON_ICONS: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  resource: Paperclip,
  assignment: ClipboardList,
  quiz: HelpCircle,
};

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: 'Տեսադաս',
  text: 'Տեքստային նյութ',
  resource: 'Ռեսուրս',
  assignment: 'Առաջադրանք',
  quiz: 'Թեստ',
};

/* ---------- Course card ---------- */

export function CourseCard({ course, to, progress }: { course: Course; to?: string; progress?: number }) {
  const teacher = getUser(course.teacherId);
  return (
    <Link to={to ?? `/courses/${course.id}`} className="course-card">
      <div style={{ position: 'relative' }}>
        <Thumb src={course.image} alt="" />
        <Badge className="course-card__level">
          <BarChart3 size={12} aria-hidden="true" />
          {difficultyLabel[course.difficulty]}
        </Badge>
      </div>
      <div className="course-card__body">
        <span className="course-card__cat">{categoryName(course.category)}</span>
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__desc">{course.shortDescription}</p>
        <span className="small secondary">{fullName(teacher)}</span>
        {progress !== undefined && <ProgressBar value={progress} />}
        <div className="course-card__meta">
          <span className="tag">
            <Clock aria-hidden="true" />
            {course.durationHours} ժամ
          </span>
          <span className="tag">
            <Users aria-hidden="true" />
            {formatNumber(course.enrolled)}
          </span>
          {course.rating > 0 && (
            <span className="tag">
              <Star aria-hidden="true" style={{ color: '#d39b1a', fill: '#d39b1a' }} />
              {course.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ---------- Lesson item ---------- */

interface LessonItemProps {
  lesson: Lesson;
  done?: boolean;
  active?: boolean;
  locked?: boolean;
  onClick?: () => void;
  showType?: boolean;
  trailing?: ReactNode;
}

export function LessonItem({ lesson, done, active, locked, onClick, showType, trailing }: LessonItemProps) {
  const Icon = done ? CheckCircle2 : locked ? Lock : LESSON_ICONS[lesson.type];
  const inner = (
    <>
      <span className={cx('lesson-item__icon', done && 'lesson-item__icon--done')} aria-hidden="true">
        <Icon />
      </span>
      <span className="lesson-item__title">
        {lesson.title}
        {showType && <span className="xs muted" style={{ display: 'block' }}>{LESSON_TYPE_LABEL[lesson.type]}</span>}
      </span>
      {trailing}
      <span className="lesson-item__meta">{lesson.durationMin} ր</span>
      {done && <span className="sr-only">(ավարտված)</span>}
    </>
  );
  return onClick ? (
    <button type="button" className={cx('lesson-item', active && 'is-active')} onClick={onClick} aria-current={active ? 'step' : undefined}>
      {inner}
    </button>
  ) : (
    <div className={cx('lesson-item', active && 'is-active')}>{inner}</div>
  );
}

/* ---------- Assignment card ---------- */

export function AssignmentCard({ assignment, status, to, courseTitle, score }: { assignment: Assignment; status: AssignmentStatus; to: string; courseTitle?: string; score?: number }) {
  const days = daysUntil(assignment.dueDate);
  const urgent = status !== 'graded' && status !== 'submitted' && days >= 0 && days <= 3;
  return (
    <Link to={to} className="card card--pad assignment-card">
      <div className="row row--between row--top">
        <div className="stack grow" style={{ ['--gap' as string]: '4px' }}>
          {courseTitle && <span className="xs muted">{courseTitle}</span>}
          <h3 style={{ fontSize: 'var(--fs-base)' }}>{assignment.title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="small secondary" style={{ margin: '10px 0 14px' }}>{assignment.summary}</p>
      <div className="row row--wrap small" style={{ ['--gap' as string]: '6px 16px' }}>
        <span className={cx('tag', urgent && 'tag--urgent')}>
          <CalendarClock aria-hidden="true" />
          {formatDate(assignment.dueDate)}
          {status !== 'graded' && status !== 'submitted' && <span>({relativeDue(assignment.dueDate)})</span>}
        </span>
        <span className="tag">
          {score !== undefined ? (
            <strong style={{ color: 'var(--success-700)' }}>
              {score}/{assignment.maxScore} միավոր
            </strong>
          ) : (
            <>Առավելագույնը՝ {assignment.maxScore} միավոր</>
          )}
        </span>
      </div>
    </Link>
  );
}

/* ---------- Quiz card ---------- */

export function QuizCard({ quiz, state, to, courseTitle, bestPercent }: { quiz: Quiz; state: QuizState; to: string; courseTitle?: string; bestPercent?: number }) {
  return (
    <Link to={to} className="card card--pad assignment-card">
      <div className="row row--between row--top">
        <div className="stack grow" style={{ ['--gap' as string]: '4px' }}>
          {courseTitle && <span className="xs muted">{courseTitle}</span>}
          <h3 style={{ fontSize: 'var(--fs-base)' }}>{quiz.title}</h3>
        </div>
        <StatusBadge status={state} />
      </div>
      <p className="small secondary" style={{ margin: '10px 0 14px' }}>{quiz.description}</p>
      <div className="row row--wrap small" style={{ ['--gap' as string]: '6px 16px' }}>
        <span className="tag">
          <HelpCircle aria-hidden="true" />
          {quiz.questions.length} հարց
        </span>
        <span className="tag">
          <Timer aria-hidden="true" />
          {quiz.timeLimitMin} րոպե
        </span>
        {bestPercent !== undefined ? (
          <span className="tag">
            Լավագույն արդյունք՝ <strong style={{ color: bestPercent >= quiz.passPercent ? 'var(--success-700)' : 'var(--danger-700)' }}>{bestPercent}%</strong>
          </span>
        ) : (
          <span className="tag">
            <CalendarClock aria-hidden="true" />
            մինչև {formatDate(quiz.dueDate)}
          </span>
        )}
      </div>
    </Link>
  );
}

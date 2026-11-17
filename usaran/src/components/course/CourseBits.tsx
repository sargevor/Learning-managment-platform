import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarClock, ChartColumn, CheckCircle2, Clock, ClipboardList, FileText, HelpCircle, Lock, Paperclip, PlayCircle, Star, Timer, Users } from 'lucide-react';
import type { Assignment, AssignmentStatus, CategoryId, Course, Lesson, LessonType, Quiz, QuizState } from '../../types';
import { categoryName, difficultyLabel } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { cx, daysUntil, formatDate, formatNumber, relativeDue } from '../../lib/format';
import { StatusBadge } from '../ui/Badge';
import { CATEGORY_ICONS, LESSON_TINT, categoryImage, photoFor } from '../../lib/visual';
import { Meter } from '../ui/Visual';

export const LESSON_ICONS: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  resource: Paperclip,
  assignment: ClipboardList,
  quiz: HelpCircle,
};

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: "Video lesson",
  text: "Reading",
  resource: "Resource",
  assignment: "Assignment",
  quiz: "Quiz",
};

/* ---------- Course card ---------- */

/** Short category labels for chips on photo cards. */
export const CATEGORY_SHORT: Record<CategoryId, string> = {
  programming: 'Programming',
  design: 'Design',
  math: 'Mathematics',
  ai: 'AI',
  data: 'Data',
  languages: 'Languages',
  science: 'Science',
  business: 'Business',
};

/** Photo course card: photo with category + level chips, title, stat chips, teacher. Styles: `.cat-card` in styles/pages/catalog.css. */
export function CourseCard({ course, to, progress }: { course: Course; to?: string; progress?: number; hideDescription?: boolean }) {
  const name = fullName(getUser(course.teacherId));
  const photo = photoFor(name);
  const initials = name.split(/\s+/).map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
  const CatIcon = CATEGORY_ICONS[course.category] ?? BookOpen;
  const [img, setImg] = useState(course.image || categoryImage(course.category));
  useEffect(() => setImg(course.image || categoryImage(course.category)), [course.image, course.category]);
  const fallback = categoryImage(course.category);
  return (
    <Link to={to ?? `/courses/${course.id}`} className="cat-card v-lift">
      <div className="cat-card__media">
        <img src={img} alt="" loading="lazy" onError={() => img !== fallback && setImg(fallback)} />
        <span className="cat-card__cat">
          <CatIcon aria-hidden="true" />
          {CATEGORY_SHORT[course.category] ?? categoryName(course.category)}
        </span>
        <span className="cat-card__level">
          <ChartColumn aria-hidden="true" />
          {difficultyLabel[course.difficulty]}
        </span>
      </div>
      <div className="cat-card__body">
        <h3 className="cat-card__title">{course.title}</h3>
        {progress !== undefined ? (
          <div className="cat-card__progress">
            <Meter value={progress} label="Progress" />
            <b>{Math.round(progress)}%</b>
          </div>
        ) : (
          <div className="cat-card__stats">
            {course.rating > 0 && (
              <span className="cat-stat cat-stat--blue" aria-label={`Rating ${course.rating.toFixed(1)}`}>
                <Star aria-hidden="true" />
                {course.rating.toFixed(1)}
              </span>
            )}
            <span className="cat-stat" aria-label={`${course.durationHours} hours`}>
              <Clock aria-hidden="true" />
              {course.durationHours} h
            </span>
            <span className="cat-stat" aria-label={`${formatNumber(course.enrolled)} students`}>
              <Users aria-hidden="true" />
              {formatNumber(course.enrolled)}
            </span>
          </div>
        )}
        <div className="cat-card__foot">
          {photo ? <img className="cat-card__avatar" src={photo} alt="" /> : <span className="cat-card__avatar" aria-hidden="true">{initials}</span>}
          <span className="cat-card__teacher">{name}</span>
          <span className="cat-card__go" aria-hidden="true"><ArrowRight /></span>
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
      <span className={cx('lesson-item__icon', done ? 'lesson-item__icon--done' : !locked && LESSON_TINT[lesson.type])} aria-hidden="true">
        <Icon />
      </span>
      <span className="lesson-item__title">
        {lesson.title}
        {showType && <span className="xs muted" style={{ display: 'block' }}>{LESSON_TYPE_LABEL[lesson.type]}</span>}
      </span>
      {trailing}
      <span className="lesson-item__meta">{lesson.durationMin} min</span>
      {done && <span className="sr-only">(completed)</span>}
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
              {score}/{assignment.maxScore} points</strong>
          ) : (
            <>Maximum: {assignment.maxScore} points</>
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
          {quiz.questions.length} questions</span>
        <span className="tag">
          <Timer aria-hidden="true" />
          {quiz.timeLimitMin} minutes</span>
        {bestPercent !== undefined ? (
          <span className="tag">Best result: <strong style={{ color: bestPercent >= quiz.passPercent ? 'var(--success-700)' : 'var(--danger-700)' }}>{bestPercent}%</strong>
          </span>
        ) : (
          <span className="tag">
            <CalendarClock aria-hidden="true" />Due {formatDate(quiz.dueDate)}
          </span>
        )}
      </div>
    </Link>
  );
}

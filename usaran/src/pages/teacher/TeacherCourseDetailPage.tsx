import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, BookOpen, ChartColumn, Check, ChevronRight, CircleCheck, ClipboardList, Clock, Ellipsis, Eye, EyeOff,
  FileQuestionMark, FileText, Languages, Layers, LayoutDashboard, LibraryBig, MessageSquare, Pencil, Plus, Save, Send,
  Settings, Star, Target, Trash2, TrendingUp, UserPlus, Users,
} from 'lucide-react';
import { categoryName, difficultyLabel, getCourse, lessonCount } from '../../data/courses';
import { assignments, submissionsFor } from '../../data/assignments';
import { coursePerformance, enrollmentTrend } from '../../data/analytics';
import { studentsInCourse, teacherQuizzes, teacherSubmissionRows } from '../../data/teacherView';
import { fullName, getUser, DEMO_TEACHER_ID } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { ShellTitle } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState, Person, Tabs } from '../../components/ui/Misc';
import { ConfirmDialog, Dropdown } from '../../components/ui/Overlay';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { DateBlock, IconBox, Meter } from '../../components/ui/Visual';
import { CATEGORY_ICONS, photoFor } from '../../lib/visual';
import { cx, daysUntil, formatNumber, relativeTime, TODAY } from '../../lib/format';

type Tab = 'overview' | 'students' | 'work' | 'settings';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Labels for the 12 months of `enrollmentTrend`, ending with the current month. */
const TREND_LABELS = Array.from({ length: 12 }, (_, i) => MONTHS[(TODAY.getMonth() - 11 + i + 12) % 12].slice(0, 3));

function ago(v: string) {
  const min = Math.max(1, Math.round((TODAY.getTime() - new Date(v).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `${h} h` : `${Math.round(h / 24)} d`;
}

function Face({ name, size = 40 }: { name: string; size?: number }) {
  const photo = photoFor(name);
  const p = name.trim().split(/\s+/);
  return (
    <span className="tc-face tc-face--soft" style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }} aria-hidden="true">
      {photo ? <img src={photo} alt="" loading="lazy" /> : ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()}
    </span>
  );
}

function Switch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="tc-switch" onClick={() => onChange(!checked)}>
      <span className="tc-switch__track"><span className="tc-switch__knob" /></span>
    </button>
  );
}

/** Area + line chart of monthly new students. */
function TrendChart({ values }: { values: number[] }) {
  const peak = Math.max(...values, 1);
  const step = Math.max(20, Math.ceil(peak / 3 / 20) * 20);
  const max = step * 3;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * 100, y: (1 - v / max) * 100 }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <div className="tc-chart">
      <div className="tc-chart__y" aria-hidden="true">
        {[3, 2, 1, 0].map((k) => <span key={k}>{step * k}</span>)}
      </div>
      <div className="tc-grow">
        <div className="tc-chart__plot" role="img" aria-label={`New students per month, from ${values[0]} in ${TREND_LABELS[0]} to ${values[values.length - 1]} in ${TREND_LABELS[11]}`}>
          <div className="tc-chart__grid" aria-hidden="true"><span /><span /><span /><span /></div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={`${line} L100,100 L0,100 Z`} className="tc-chart__area" />
            <path d={line} className="tc-chart__line" vectorEffect="non-scaling-stroke" />
          </svg>
          {pts.map((p, i) => (
            <span key={i} className={cx('tc-chart__dot', i === pts.length - 1 && 'tc-chart__dot--last')} style={{ left: `${p.x}%`, top: `${p.y}%` }} />
          ))}
          <span className="tc-chart__tip" style={{ top: `${last.y}%` }}><TrendingUp aria-hidden="true" />{values[values.length - 1]}</span>
        </div>
        <div className="tc-chart__x" aria-hidden="true">
          {TREND_LABELS.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  );
}

export function TeacherCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const course = getCourse(id);
  const [tab, setTab] = useState<Tab>('overview');
  const [status, setStatus] = useState(course?.status ?? 'draft');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [settings, setSettings] = useState({ enroll: true, comments: true, certificate: true });

  if (!course || course.teacherId !== DEMO_TEACHER_ID) {
    return <div className="tc-card"><EmptyState title="Course not found" action={<ButtonLink to="/teacher/courses">My courses</ButtonLink>} /></div>;
  }

  const perf = coursePerformance.find((p) => p.courseId === course.id);
  const students = studentsInCourse(course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = teacherQuizzes.filter((q) => q.courseId === course.id);
  const trend = enrollmentTrend[course.id];
  const subs = teacherSubmissionRows().filter((r) => r.course.id === course.id).slice(0, 4);
  const top = [...students].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
  const upcoming = courseAssignments.filter((a) => daysUntil(a.dueDate) >= 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  const CatIcon = CATEGORY_ICONS[course.category];
  const live = status === 'published';
  const updated = new Date(course.updatedAt);

  return (
    <div className="tc-page">
      <ShellTitle
        title="Course overview"
        meta={<><Clock aria-hidden="true" /><b>Updated {updated.getDate()} {MONTHS[updated.getMonth()]}</b><span className="tc-dot" aria-hidden="true" />{`${WEEKDAYS[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]}`}</>}
      />

      <Link to="/teacher/courses" className="tc-back tc-back--tight"><ArrowLeft aria-hidden="true" />Courses</Link>

      <section aria-label="Course" className="tc-photohero">
        <img src={course.image} alt="" className="tc-photohero__img" />
        <span className="tc-photohero__scrim" />
        <div className="tc-photohero__body">
          <div className="tc-chips">
            <span className="tc-hchip tc-hchip--solid">{live ? <Eye aria-hidden="true" /> : <FileText aria-hidden="true" />}{live ? 'Published' : 'Draft'}</span>
            <span className="tc-hchip"><CatIcon aria-hidden="true" />{categoryName(course.category)}</span>
            <span className="tc-hchip"><ChartColumn aria-hidden="true" />{difficultyLabel[course.difficulty]}</span>
          </div>
          <div className="tc-photohero__text">
            <h2>{course.title}</h2>
            <div className="tc-photohero__facts">
              <span><Layers aria-hidden="true" />{course.modules.length} modules</span>
              <span><BookOpen aria-hidden="true" />{lessonCount(course)} lessons</span>
              <span><Clock aria-hidden="true" />{course.durationHours} h</span>
              <span><Languages aria-hidden="true" />{course.language}</span>
            </div>
          </div>
          <div className="tc-photohero__actions">
            <Link to={`/teacher/courses/${course.id}/edit`} className="tc-pill tc-pill--white"><Pencil aria-hidden="true" />Edit</Link>
            <Link to={`/teacher/courses/${course.id}/content`} className="tc-pill tc-pill--glass"><Layers aria-hidden="true" />Content</Link>
            <Dropdown
              align="left"
              trigger={({ toggle, open }) => (
                <button type="button" className="tc-pill tc-pill--glass tc-pill--round" onClick={toggle} aria-expanded={open} aria-label="More actions"><Ellipsis /></button>
              )}
            >
              {(close) => (
                <>
                  {live && <Link className="dropdown__item" to={`/courses/${course.id}`} onClick={close}><Eye />Preview</Link>}
                  <button type="button" className="dropdown__item" onClick={() => { setConfirmPublish(true); close(); }}>
                    {live ? <EyeOff /> : <Send />}
                    {live ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="dropdown__item" onClick={() => { setTab('settings'); close(); }}><Settings />Settings</button>
                  <div className="dropdown__sep" />
                  <button type="button" className="dropdown__item dropdown__item--danger" onClick={() => { setConfirmDelete(true); close(); }}><Trash2 />Delete</button>
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </section>

      <section aria-label="Summary" className="tc-stats">
        <StatCard label="Students" value={formatNumber(course.enrolled)} icon={<Users />} trend={trend ? `+${trend[trend.length - 1]}` : undefined} />
        <StatCard label="Average score" value={perf?.avgAssignment ?? '—'} unit={perf ? '%' : undefined} icon={<Target />} />
        <StatCard label="Completion" value={perf?.completionRate ?? '—'} unit={perf ? '%' : undefined} icon={<CircleCheck />} />
        <StatCard label="Rating" value={course.rating > 0 ? course.rating : '—'} icon={<Star />} />
      </section>

      <div className="tc-tabs-wrap">
        <Tabs
          label="Course sections"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
            { key: 'students', label: 'Students', count: students.length, icon: <Users /> },
            { key: 'work', label: 'Tasks', count: courseAssignments.length + courseQuizzes.length, icon: <ClipboardList /> },
            { key: 'settings', label: 'Settings', icon: <Settings /> },
          ]}
        />
      </div>

      {tab === 'overview' && (
        <section className="tc-split">
          <div className="tc-split__main">
            <div className="tc-card">
              <div className="tc-card__head">
                <h3>New students</h3>
                <span className="tc-fact"><Clock aria-hidden="true" />12 months</span>
              </div>
              {trend ? <TrendChart values={trend} /> : <EmptyState compact icon={<Users size={22} />} title="No students yet" />}
            </div>

            <div className="tc-card">
              <div className="tc-card__head">
                <h3>Recent submissions</h3>
                <Link to="/teacher/grading" className="v-more">Grade<ChevronRight aria-hidden="true" /></Link>
              </div>
              {subs.length === 0 ? (
                <EmptyState compact icon={<Send size={22} />} title="No submissions" />
              ) : (
                <div className="tc-rows">
                  {subs.map((r) => {
                    const graded = r.submission.status === 'graded' || r.submission.status === 'returned';
                    return (
                      <Link key={r.submission.id} to={`/teacher/grading?submission=${r.submission.id}`} className="tc-subrow">
                        <Face name={fullName(r.student)} size={44} />
                        <b className="tc-subrow__name tc-ellipsis">{fullName(r.student)}</b>
                        <span className="tc-subrow__task"><ClipboardList aria-hidden="true" /><span className="tc-ellipsis">{r.assignment.title}</span></span>
                        <span className="tc-tag"><Clock aria-hidden="true" />{ago(r.submission.submittedAt ?? '')}</span>
                        <span className={cx('tc-tag', graded ? 'tc-tag--blue' : 'tc-tag--grey')}>
                          {graded ? <Check aria-hidden="true" /> : <Send aria-hidden="true" />}
                          {graded ? `${r.submission.score ?? 0}/${r.assignment.maxScore}` : 'New'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="tc-split__side">
            <div className="tc-card">
              <div className="tc-card__head">
                <h3>Top students</h3>
                <button type="button" className="v-more tc-linkbtn" onClick={() => setTab('students')}>All<ChevronRight aria-hidden="true" /></button>
              </div>
              {top.length === 0 ? (
                <EmptyState compact title="No students yet" />
              ) : (
                <div className="tc-rows">
                  {top.map((t, i) => {
                    const name = fullName(getUser(t.userId));
                    return (
                      <Link key={t.userId} to={`/teacher/students/${t.userId}`} className="tc-toprow">
                        <span className="tc-toprow__rank">{i + 1}</span>
                        <Face name={name} size={40} />
                        <span className="tc-grow">
                          <b className="tc-ellipsis">{name}</b>
                          <Meter value={t.avgScore} height={6} color={i === 0 ? 'var(--navy-900)' : 'var(--accent-600)'} label={`${name}: ${t.avgScore}%`} />
                        </span>
                        <b className="tc-toprow__score">{t.avgScore}%</b>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="tc-card">
              <div className="tc-card__head">
                <h3>Tasks</h3>
                <Link to="/teacher/assignments?new=1" className="tc-iconbtn tc-iconbtn--grey" aria-label="Add task"><Plus /></Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState compact icon={<ClipboardList size={22} />} title="No upcoming tasks" />
              ) : (
                <div className="tc-rows">
                  {upcoming.map((a) => {
                    const left = daysUntil(a.dueDate);
                    return (
                      <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="tc-taskrow">
                        <DateBlock date={a.dueDate} urgent={left <= 2} />
                        <b className="tc-grow">{a.title}</b>
                        <span className={cx('tc-tag', left <= 2 ? 'tc-tag--red' : 'tc-tag--grey')}><Clock aria-hidden="true" />{left} d</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === 'students' && (
        <div className="tc-card tc-card--flush">
          <div className="tc-scroll">
            <DataTable
              caption="Course students"
              rows={students}
              rowKey={(r) => r.userId}
              onRowClick={(r) => navigate(`/teacher/students/${r.userId}`)}
              empty={<EmptyState compact icon={<Users size={22} />} title="No students yet" />}
              columns={[
                { key: 'n', header: 'Student', sortValue: (r) => fullName(getUser(r.userId)), render: (r) => <Person name={fullName(getUser(r.userId))} size={36} /> },
                { key: 'p', header: 'Progress', sortValue: (r) => r.progress, render: (r) => <span className="tc-meter-cell"><Meter value={r.progress} label={`Progress ${r.progress}%`} /><b>{r.progress}%</b></span> },
                { key: 'a', header: 'Score', align: 'right', sortValue: (r) => r.avgScore, render: (r) => <b>{r.avgScore}%</b> },
                { key: 's', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                { key: 'l', header: 'Active', sortValue: (r) => r.lastActive, render: (r) => <span className="tc-mini nowrap"><Clock aria-hidden="true" />{relativeTime(r.lastActive)}</span> },
              ]}
            />
          </div>
        </div>
      )}

      {tab === 'work' && (
        <section className="tc-two">
          <div className="tc-card">
            <div className="tc-card__head">
              <h3>Assignments</h3>
              <Link to="/teacher/assignments?new=1" className="tc-iconbtn tc-iconbtn--grey" aria-label="Add assignment"><Plus /></Link>
            </div>
            {courseAssignments.length === 0 ? (
              <EmptyState compact icon={<ClipboardList size={22} />} title="No assignments" />
            ) : (
              <div className="tc-rows">
                {courseAssignments.map((a) => {
                  const list = submissionsFor(a.id);
                  const fresh = list.filter((s) => s.status === 'submitted').length;
                  return (
                    <Link key={a.id} to={`/teacher/assignments/${a.id}/submissions`} className="tc-taskrow">
                      <DateBlock date={a.dueDate} size="sm" urgent={daysUntil(a.dueDate) >= 0 && daysUntil(a.dueDate) <= 2} />
                      <span className="tc-grow">
                        <b className="tc-ellipsis">{a.title}</b>
                        <span className="tc-mini"><Send aria-hidden="true" />{list.filter((s) => s.status !== 'draft').length}</span>
                      </span>
                      {fresh > 0 && <span className="tc-tag tc-tag--blue">{fresh} new</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <div className="tc-card">
            <div className="tc-card__head">
              <h3>Quizzes</h3>
              <Link to="/teacher/quizzes/new/edit" className="tc-iconbtn tc-iconbtn--grey" aria-label="Add quiz"><Plus /></Link>
            </div>
            {courseQuizzes.length === 0 ? (
              <EmptyState compact icon={<FileQuestionMark size={22} />} title="No quizzes" />
            ) : (
              <div className="tc-rows">
                {courseQuizzes.map((q) => (
                  <Link key={q.id} to={`/teacher/quizzes/${q.id}/edit`} className="tc-taskrow">
                    <IconBox icon={<FileQuestionMark />} size="sm" />
                    <span className="tc-grow">
                      <b className="tc-ellipsis">{q.title}</b>
                      <span className="tc-mini"><FileQuestionMark aria-hidden="true" />{q.questions.length}<Clock aria-hidden="true" />{q.timeLimitMin} min</span>
                    </span>
                    <StatusBadge status={q.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section className="tc-settings">
          <div className="tc-card">
            <div className="tc-switches">
              {([
                ['st-catalog', LibraryBig, 'In catalog', live, (v: boolean) => setStatus(v ? 'published' : 'draft')],
                ['st-enroll', UserPlus, 'Open enrolment', settings.enroll, (v: boolean) => setSettings({ ...settings, enroll: v })],
                ['st-comments', MessageSquare, 'Discussions', settings.comments, (v: boolean) => setSettings({ ...settings, comments: v })],
                ['st-cert', Award, 'Certificate', settings.certificate, (v: boolean) => setSettings({ ...settings, certificate: v })],
              ] as const).map(([sid, Icon, label, on, change]) => (
                <div key={sid} className="tc-switchrow">
                  <IconBox icon={<Icon />} size="sm" />
                  <span id={sid} className="tc-grow">{label}</span>
                  <Switch id={sid} checked={on} onChange={change} />
                </div>
              ))}
            </div>
            <div className="tc-card__foot">
              <button type="button" className="btn btn--primary" onClick={() => toast.success('Settings saved', 'Demo only.')}><Save aria-hidden="true" />Save</button>
            </div>
          </div>
          <div className="tc-card tc-alert">
            <IconBox icon={<Trash2 />} size="lg" tone="red" />
            <div className="tc-alert__text">
              <b>Delete course</b>
              <span>Removes modules, lessons and results</span>
            </div>
            <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}><Trash2 aria-hidden="true" />Delete</button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={() => {
          const next = live ? 'draft' : 'published';
          setStatus(next);
          toast.success(next === 'published' ? 'Course published' : 'Course unpublished', 'Demo: local change only.');
        }}
        tone="warning"
        title={live ? 'Unpublish this course?' : 'Publish this course?'}
        text={live ? 'It leaves the catalog. Enrolled students keep access.' : 'It appears in the catalog and opens for enrolment.'}
        confirmLabel={live ? 'Unpublish' : 'Publish'}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          toast.success('Course deleted', 'Demo: nothing was actually deleted.');
          navigate('/teacher/courses');
        }}
        title="Delete this course?"
        text={`${course.title} will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

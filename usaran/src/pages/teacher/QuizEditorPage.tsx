import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, Calendar, ChartColumn, Check, CircleAlert, CircleCheck, Copy, Eye, FileText, GripVertical, Info,
  ListChecks, Minus, Plus, RotateCcw, Save, Send, SlidersHorizontal, Target, Timer, Trash2, Type, Users, X,
} from 'lucide-react';
import type { Quiz, QuizQuestion } from '../../types';
import { getQuiz, quizMaxScore } from '../../data/quizzes';
import { quizResultSummary, teacherCourses, TEACHER_COURSE_IDS } from '../../data/teacherView';
import { students, fullName } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { CourseIcon, courseShort, shortDateTime } from '../../components/course/GradingPanel';
import { ShellTitle } from '../../components/layout/AppShell';
import { BarChart, ChartCard } from '../../components/charts/Charts';
import { ButtonLink } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { cx } from '../../lib/format';

type Tab = 'questions' | 'preview' | 'results';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

let uid = 0;
const newId = (p: string) => `${p}-${Date.now()}-${uid++}`;

function blankQuestion(): QuizQuestion {
  const qid = newId('q');
  return { id: qid, kind: 'single', text: '', options: [0, 1, 2].map(() => ({ id: newId('o'), text: '' })), correct: [], points: 1 };
}

function blankQuiz(): Quiz {
  return {
    id: 'new',
    courseId: teacherCourses[0].id,
    title: '',
    description: '',
    instructions: ['The timer cannot be paused once you start the quiz.'],
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-31T23:59',
    status: 'draft',
    questions: [blankQuestion()],
  };
}

function initialTab(v: string | null): Tab {
  return v === 'preview' || v === 'results' ? v : 'questions';
}

function Stepper({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <span className="tw-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Less: ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Minus aria-hidden="true" /></button>
      <span className="tw-stepper__val">{value}{unit && <small> {unit}</small>}</span>
      <button type="button" aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus aria-hidden="true" /></button>
    </span>
  );
}

export function QuizEditorPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const source = id === 'new' ? undefined : getQuiz(id);
  const [quiz, setQuiz] = useState<Quiz>(() => (source ? structuredClone(source) : blankQuiz()));
  const [tab, setTabState] = useState<Tab>(initialTab(params.get('tab')));
  const [active, setActive] = useState<string | undefined>(quiz.questions[0]?.id);
  const [problems, setProblems] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string[]>>({});
  const [showKey, setShowKey] = useState(false);

  if (id !== 'new' && (!source || !TEACHER_COURSE_IDS.includes(source.courseId))) {
    return <div className="tw-card"><EmptyState title="Quiz not found" action={<ButtonLink to="/teacher/quizzes" icon={<ArrowLeft />}>Quizzes</ButtonLink>} /></div>;
  }

  const setTab = (t: Tab) => {
    setTabState(t);
    setParams(t === 'questions' ? {} : { tab: t }, { replace: true });
  };
  const patch = (p: Partial<Quiz>) => setQuiz((q) => ({ ...q, ...p }));
  const patchQ = (qid: string, p: Partial<QuizQuestion>) => setQuiz((q) => ({ ...q, questions: q.questions.map((x) => (x.id === qid ? { ...x, ...p } : x)) }));
  const moveQ = (i: number, d: number) =>
    setQuiz((q) => {
      const list = [...q.questions];
      const j = i + d;
      if (j < 0 || j >= list.length) return q;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...q, questions: list };
    });
  const addQuestion = () => {
    const q = blankQuestion();
    setQuiz((s) => ({ ...s, questions: [...s.questions, q] }));
    setActive(q.id);
  };

  const validate = (): string[] => {
    const p: string[] = [];
    if (quiz.title.trim().length < 3) p.push('Add a quiz title (Settings)');
    if (quiz.questions.length === 0) p.push('Add at least one question');
    quiz.questions.forEach((x, i) => {
      if (!x.text.trim()) p.push(`Q${i + 1}: question text is empty`);
      if (x.options.filter((o) => o.text.trim()).length < 2) p.push(`Q${i + 1}: fill in at least 2 options`);
      if (x.correct.length === 0) p.push(`Q${i + 1}: mark the correct answer`);
    });
    return p;
  };

  const save = (publish: boolean) => {
    const p = validate();
    setProblems(p);
    if (p.length) {
      toast.warning('Quiz is not ready', `${p.length} issues to fix.`);
      return;
    }
    if (publish) patch({ status: 'published' });
    toast.success(publish ? 'Quiz published' : 'Quiz saved', 'Demo: changes are kept only on this page.');
    if (id === 'new') navigate('/teacher/quizzes');
  };

  const results = quizResultSummary(quiz);
  const aIndex = Math.max(0, quiz.questions.findIndex((x) => x.id === active));
  const aq = quiz.questions[aIndex];

  return (
    <div className="tw-page">
      <ShellTitle
        title={quiz.title || (id === 'new' ? 'New quiz' : 'Untitled quiz')}
        meta={
          <>
            <span className="tw-metachip"><CourseIcon id={quiz.courseId} size={15} />{courseShort(quiz.courseId)}</span>
            <ListChecks aria-hidden="true" />
            <b>{quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}</b>
            <span className="tw-dot" aria-hidden="true" />
            {quizMaxScore(quiz)} pts
            <StatusBadge status={quiz.status} />
          </>
        }
      />

      <Link to="/teacher/quizzes" className="tw-back"><ArrowLeft aria-hidden="true" />Quizzes</Link>

      {problems.length > 0 && (
        <div className="tw-problems" role="alert">
          <b><CircleAlert aria-hidden="true" />Fix before saving</b>
          <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      <section className="tw-card tw-edbar" aria-label="Quiz actions">
        <div className="tw-edbar__tabs" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={tab === 'questions'} onClick={() => setTab('questions')}><ListChecks aria-hidden="true" />Questions</button>
          <button type="button" role="tab" aria-selected={tab === 'results'} onClick={() => setTab('results')}><ChartColumn aria-hidden="true" />Results</button>
        </div>
        <button type="button" className="tw-btn tw-btn--secondary" aria-pressed={tab === 'preview'} onClick={() => setTab(tab === 'preview' ? 'questions' : 'preview')}>
          <Eye aria-hidden="true" />Preview
        </button>
        <button type="button" className="tw-btn tw-btn--secondary" onClick={() => save(false)}><Save aria-hidden="true" />Save</button>
        {quiz.status !== 'published' && (
          <button type="button" className="tw-btn tw-btn--primary" onClick={() => save(true)}><Send aria-hidden="true" />Publish</button>
        )}
      </section>

      {tab === 'questions' && (
        <div className="tw-editor">
          <section className="tw-editor__list" aria-label="Questions">
            {quiz.questions.length > 0 && (
              <ol className="tw-qlist">
                {quiz.questions.map((q, i) => {
                  const on = aq?.id === q.id;
                  return (
                    <li key={q.id}>
                      <button type="button" className={cx('tw-qcard', on && 'is-active')} aria-current={on ? 'true' : undefined} aria-label={`Question ${i + 1}, ${q.kind === 'single' ? 'single answer' : 'multiple answers'}`} onClick={() => setActive(q.id)}>
                        <GripVertical className="tw-qcard__grip" aria-hidden="true" />
                        <span className="tw-qcard__n">{i + 1}</span>
                        <span className="tw-qcard__text">{q.text || <span className="tw-muted">Empty question</span>}</span>
                        {q.correct.length === 0 ? <CircleAlert className="tw-qcard__warn" aria-label="No correct answer" /> : q.kind === 'single' ? <CircleCheck className="tw-qcard__type" aria-hidden="true" /> : <ListChecks className="tw-qcard__type" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <button type="button" className="tw-dashed" onClick={addQuestion}><Plus aria-hidden="true" />Add question</button>
          </section>

          <section className="tw-card tw-editor__main" aria-label={aq ? `Question ${aIndex + 1}` : 'Question'}>
            {!aq ? (
              <EmptyState title="No questions yet" action={<button type="button" className="tw-btn tw-btn--primary" onClick={addQuestion}><Plus aria-hidden="true" />Add question</button>} />
            ) : (
              <>
                <div className="tw-qhead">
                  <h2 className="tw-h2 tw-qhead__title"><span className="tw-numdot">{aIndex + 1}</span>Question</h2>
                  <div className="tw-seg" role="radiogroup" aria-label="Question type">
                    <button type="button" role="radio" aria-checked={aq.kind === 'single'} onClick={() => patchQ(aq.id, { kind: 'single', correct: aq.correct.slice(0, 1) })}><CircleCheck aria-hidden="true" />Single</button>
                    <button type="button" role="radio" aria-checked={aq.kind === 'multiple'} onClick={() => patchQ(aq.id, { kind: 'multiple' })}><ListChecks aria-hidden="true" />Multiple</button>
                  </div>
                  <Stepper label="Points" value={aq.points} min={1} max={20} unit="pts" onChange={(v) => patchQ(aq.id, { points: v })} />
                  <span className="tw-qhead__tools">
                    <button type="button" className="tw-iconbtn" aria-label="Move up" disabled={aIndex === 0} onClick={() => moveQ(aIndex, -1)}><ArrowUp aria-hidden="true" /></button>
                    <button type="button" className="tw-iconbtn" aria-label="Move down" disabled={aIndex === quiz.questions.length - 1} onClick={() => moveQ(aIndex, 1)}><ArrowDown aria-hidden="true" /></button>
                    <button
                      type="button"
                      className="tw-iconbtn"
                      aria-label="Duplicate"
                      onClick={() => {
                        const copyOpts = aq.options.map((o) => ({ id: newId('o'), text: o.text }));
                        const copy: QuizQuestion = { ...aq, id: newId('q'), options: copyOpts, correct: aq.correct.map((c) => copyOpts[aq.options.findIndex((o) => o.id === c)].id) };
                        setQuiz((s) => ({ ...s, questions: [...s.questions.slice(0, aIndex + 1), copy, ...s.questions.slice(aIndex + 1)] }));
                        setActive(copy.id);
                      }}
                    >
                      <Copy aria-hidden="true" />
                    </button>
                    <button type="button" className="tw-iconbtn" aria-label="Delete question" onClick={() => setToDelete(aq.id)}><Trash2 aria-hidden="true" /></button>
                  </span>
                </div>

                <div className="tw-field">
                  <label htmlFor={`qt-${aq.id}`}>Question text</label>
                  <textarea id={`qt-${aq.id}`} className="tw-qtext" rows={2} value={aq.text} placeholder="Type the question" onChange={(e) => patchQ(aq.id, { text: e.target.value })} />
                </div>

                <fieldset className="tw-answers">
                  <legend><CircleCheck aria-hidden="true" />Answers{aq.correct.length === 0 && <span className="tw-chip tw-chip--red tw-chip--xs">Mark correct</span>}</legend>
                  {aq.options.map((o, oi) => {
                    const isCorrect = aq.correct.includes(o.id);
                    return (
                      <div key={o.id} className={cx('tw-opt', isCorrect && 'is-correct')}>
                        <label className="tw-opt__pick">
                          <input
                            type={aq.kind === 'single' ? 'radio' : 'checkbox'}
                            name={`correct-${aq.id}`}
                            checked={isCorrect}
                            aria-label={`Option ${LETTERS[oi]} is correct`}
                            onChange={() => patchQ(aq.id, { correct: aq.kind === 'single' ? [o.id] : isCorrect ? aq.correct.filter((c) => c !== o.id) : [...aq.correct, o.id] })}
                          />
                        </label>
                        <span className="tw-opt__key">{LETTERS[oi]}</span>
                        <input className="tw-opt__text" value={o.text} placeholder={`Option ${LETTERS[oi]}`} aria-label={`Option ${LETTERS[oi]}`} onChange={(e) => patchQ(aq.id, { options: aq.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
                        {isCorrect && <span className="tw-pill tw-pill--blue tw-pill--sm"><Check aria-hidden="true" />Correct</span>}
                        <button type="button" className="tw-iconbtn" aria-label={`Remove option ${LETTERS[oi]}`} disabled={aq.options.length <= 2} onClick={() => patchQ(aq.id, { options: aq.options.filter((x) => x.id !== o.id), correct: aq.correct.filter((c) => c !== o.id) })}><X aria-hidden="true" /></button>
                      </div>
                    );
                  })}
                  <button type="button" className="tw-dashed tw-dashed--pill" disabled={aq.options.length >= 6} onClick={() => patchQ(aq.id, { options: [...aq.options, { id: newId('o'), text: '' }] })}><Plus aria-hidden="true" />Add option</button>
                </fieldset>

                <div className="tw-field tw-field--sep">
                  <label htmlFor={`qx-${aq.id}`}><Info aria-hidden="true" />Explanation</label>
                  <input id={`qx-${aq.id}`} className="tw-input tw-input--soft" value={aq.explanation ?? ''} placeholder="Why is it correct?" onChange={(e) => patchQ(aq.id, { explanation: e.target.value })} />
                </div>
              </>
            )}
          </section>

          <aside className="tw-card tw-settings" aria-label="Quiz settings">
            <h2 className="tw-h2 tw-h2--sm"><SlidersHorizontal aria-hidden="true" className="tw-blue" />Settings</h2>

            <div className="tw-set tw-set--col">
              <label htmlFor="s-title"><span className="tw-ibox tw-ibox--sm"><Type aria-hidden="true" /></span>Title</label>
              <input id="s-title" className="tw-input" value={quiz.title} placeholder="e.g. Module 2 quiz" onChange={(e) => patch({ title: e.target.value })} />
            </div>
            <div className="tw-set tw-set--col">
              <label htmlFor="s-course"><span className="tw-ibox tw-ibox--sm"><BookOpen aria-hidden="true" /></span>Course</label>
              <select id="s-course" className="tw-input" value={quiz.courseId} onChange={(e) => patch({ courseId: e.target.value })}>
                {teacherCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="tw-set">
              <span className="tw-ibox tw-ibox--sm"><Timer aria-hidden="true" /></span>
              <label htmlFor="s-time" className="tw-set__label">Time limit</label>
              <span className="tw-unitbox">
                <input id="s-time" type="number" min={1} value={quiz.timeLimitMin} onChange={(e) => patch({ timeLimitMin: Number(e.target.value) })} />
                <span>min</span>
              </span>
            </div>
            <div className="tw-set">
              <span className="tw-ibox tw-ibox--sm"><RotateCcw aria-hidden="true" /></span>
              <span className="tw-set__label">Attempts</span>
              <Stepper label="Attempts" value={quiz.attemptsAllowed} min={1} max={10} onChange={(v) => patch({ attemptsAllowed: v })} />
            </div>
            <div className="tw-set">
              <span className="tw-ibox tw-ibox--sm"><Target aria-hidden="true" /></span>
              <label htmlFor="s-pass" className="tw-set__label">Pass mark</label>
              <span className="tw-unitbox">
                <input id="s-pass" type="number" min={1} max={100} value={quiz.passPercent} onChange={(e) => patch({ passPercent: Number(e.target.value) })} />
                <span>%</span>
              </span>
            </div>
            <div className="tw-set tw-set--col">
              <label htmlFor="s-due"><span className="tw-ibox tw-ibox--sm"><Calendar aria-hidden="true" /></span>Open until</label>
              <input id="s-due" className="tw-input" type="datetime-local" value={quiz.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
            </div>
            <div className="tw-set tw-set--col">
              <label htmlFor="s-desc"><span className="tw-ibox tw-ibox--sm"><FileText aria-hidden="true" /></span>Description</label>
              <textarea id="s-desc" className="tw-input tw-input--area" rows={2} value={quiz.description} onChange={(e) => patch({ description: e.target.value })} />
            </div>
            <div className="tw-set tw-set--col">
              <label htmlFor="s-rules"><span className="tw-ibox tw-ibox--sm"><ListChecks aria-hidden="true" /></span>Rules</label>
              <textarea id="s-rules" className="tw-input tw-input--area" rows={3} value={quiz.instructions.join('\n')} placeholder="One per line" onChange={(e) => patch({ instructions: e.target.value.split('\n') })} />
            </div>
          </aside>
        </div>
      )}

      {tab === 'preview' && (
        <div className="tw-preview">
          <div className="tw-preview__bar">
            <span className="tw-chip tw-chip--soft"><Eye aria-hidden="true" />Student view</span>
            <div className="tw-seg" role="group" aria-label="Correct answers">
              <button type="button" aria-pressed={!showKey} onClick={() => setShowKey(false)}>Hide answers</button>
              <button type="button" aria-pressed={showKey} onClick={() => setShowKey(true)}><Check aria-hidden="true" />Show answers</button>
            </div>
          </div>
          {quiz.questions.map((q, i) => (
            <section key={q.id} className="tw-card tw-pq" aria-label={`Question ${i + 1}`}>
              <div className="tw-pq__head">
                <span className="tw-numdot">{i + 1}</span>
                <h3>{q.text || <span className="tw-muted">Empty question</span>}</h3>
                <span className="tw-chip tw-chip--soft">{q.kind === 'single' ? <CircleCheck aria-hidden="true" /> : <ListChecks aria-hidden="true" />}{q.points} pts</span>
              </div>
              <div className="tw-pq__opts">
                {q.options.map((o, oi) => {
                  const sel = (previewAnswers[q.id] ?? []).includes(o.id);
                  const correct = showKey && q.correct.includes(o.id);
                  return (
                    <label key={o.id} className={cx('tw-opt', 'tw-opt--pick', sel && 'is-selected', correct && 'is-correct')}>
                      <span className="tw-opt__pick">
                        <input
                          type={q.kind === 'single' ? 'radio' : 'checkbox'}
                          name={`pv-${q.id}`}
                          checked={sel}
                          onChange={() =>
                            setPreviewAnswers((a) => {
                              const cur = a[q.id] ?? [];
                              return { ...a, [q.id]: q.kind === 'single' ? [o.id] : cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id] };
                            })
                          }
                        />
                      </span>
                      <span className="tw-opt__key">{LETTERS[oi]}</span>
                      <span className="tw-opt__label">{o.text || <span className="tw-muted">Empty option</span>}</span>
                      {correct && <span className="tw-pill tw-pill--blue tw-pill--sm"><Check aria-hidden="true" />Correct</span>}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'results' &&
        (quiz.status === 'draft' || id === 'new' ? (
          <div className="tw-card"><EmptyState icon={<ChartColumn size={24} />} title="No results yet" /></div>
        ) : (
          <div className="tw-results">
            {/* Illustrative numbers: the app has no real attempt tracking (quizResultSummary). */}
            <div className="tw-stats">
              <StatCard label="Attempts" value={results.attempts} icon={<Users />} />
              <StatCard label="Average" value={results.avg} unit="%" icon={<ChartColumn />} />
              <StatCard label="Pass rate" value={results.passRate} unit="%" icon={<Target />} meta={`Pass mark ${quiz.passPercent}%`} />
            </div>
            <ChartCard title="Correct by question" demo={false}>
              <BarChart labels={quiz.questions.map((_, i) => `Q${i + 1}`)} series={[{ name: 'Correct', values: quiz.questions.map((_, i) => 52 + ((i * 17 + quiz.id.length * 5) % 44)) }]} max={100} suffix="%" ariaLabel="Correct answer rate by question" />
            </ChartCard>
            <section className="tw-card tw-attempts" aria-label="Recent attempts">
              <h2 className="tw-h2 tw-h2--sm">Recent attempts</h2>
              <div role="list" className="tw-srows">
                {/* Sample attempts, as before: derived deterministically from the student list. */}
                {students.slice(1, 9).map((s, i) => {
                  const score = 55 + ((i * 13 + 7) % 44);
                  const at = `2026-10-${String(14 - i).padStart(2, '0')}T${10 + i}:15`;
                  const pass = score >= quiz.passPercent;
                  return (
                    <div key={s.id} role="listitem" className="tw-srow">
                      <span className="tw-srow__who"><Avatar name={fullName(s)} size={40} /><span className="tw-ell tw-strong">{fullName(s)}</span></span>
                      <span className="tw-srow__time">
                        <span className="tw-chip tw-chip--soft"><Calendar aria-hidden="true" />{shortDateTime(at)}</span>
                        <span className="tw-chip tw-chip--soft"><Timer aria-hidden="true" />{6 + (i % 8)} min</span>
                      </span>
                      <span className="tw-srow__act">
                        <span className={cx('tw-score', !pass && 'tw-score--red')}>{pass ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}{score}<small>%</small></span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ))}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          const rest = quiz.questions.filter((x) => x.id !== toDelete);
          setQuiz((q) => ({ ...q, questions: q.questions.filter((x) => x.id !== toDelete) }));
          if (active === toDelete || !active) setActive(rest[0]?.id);
        }}
        title="Delete this question?"
        text="The question and its options will be removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

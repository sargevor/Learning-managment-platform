import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, BarChart3, CheckCircle2, Copy, Plus, Save, Send, Trash2, Users, X } from 'lucide-react';
import type { Quiz, QuizQuestion } from '../../types';
import { getQuiz, quizMaxScore } from '../../data/quizzes';
import { quizResultSummary, teacherCourses, TEACHER_COURSE_IDS } from '../../data/teacherView';
import { getCourse } from '../../data/courses';
import { students, fullName } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { BarChart, ChartCard } from '../../components/charts/Charts';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Card, EmptyState, Notice, PageHeader, Person, Segmented, Tabs } from '../../components/ui/Misc';
import { ConfirmDialog } from '../../components/ui/Overlay';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import { cx, formatDateTime } from '../../lib/format';

type Tab = 'settings' | 'questions' | 'preview' | 'results';
const LETTERS = ["A", "B", "C", "D", "E", "F"];

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
    instructions: ["The timer cannot be paused once you start the quiz."],
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-31T23:59',
    status: 'draft',
    questions: [blankQuestion()],
  };
}

export function QuizEditorPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const source = id === 'new' ? undefined : getQuiz(id);
  const [quiz, setQuiz] = useState<Quiz>(() => (source ? structuredClone(source) : blankQuiz()));
  const [tab, setTabState] = useState<Tab>((params.get('tab') as Tab) || (id === 'new' ? 'settings' : 'questions'));
  const [active, setActive] = useState<string | undefined>(quiz.questions[0]?.id);
  const [problems, setProblems] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string[]>>({});
  const [showKey, setShowKey] = useState<'hide' | 'show'>('hide');

  if (id !== 'new' && (!source || !TEACHER_COURSE_IDS.includes(source.courseId))) {
    return <div className="card"><EmptyState title="Quiz not found" action={<ButtonLink to="/teacher/quizzes">All Quizzes</ButtonLink>} /></div>;
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

  const validate = (): string[] => {
    const p: string[] = [];
    if (quiz.title.trim().length < 3) p.push("Enter a quiz title in Settings");
    if (quiz.questions.length === 0) p.push("Add at least one question");
    quiz.questions.forEach((x, i) => {
      if (!x.text.trim()) p.push(`Question ${i + 1}. Question text is empty`);
      if (x.options.filter((o) => o.text.trim()).length < 2) p.push(`Question ${i + 1}. At least 2 completed options are required`);
      if (x.correct.length === 0) p.push(`Question ${i + 1}. Select the correct answer`);
    });
    return p;
  };

  const save = (publish: boolean) => {
    const p = validate();
    setProblems(p);
    if (p.length) {
      toast.warning("Quiz is not ready", `Found ${p.length} issues.`);
      return;
    }
    if (publish) patch({ status: 'published' });
    toast.success(publish ? "Quiz published" : "Quiz saved", "Demo: changes are kept only on this page.");
    if (id === 'new') navigate('/teacher/quizzes');
  };

  const results = quizResultSummary(quiz);
  const course = getCourse(quiz.courseId);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Quizzes", to: '/teacher/quizzes' }, { label: id === 'new' ? "New quiz" : quiz.title }]}
        title={id === 'new' ? "New quiz" : quiz.title || "Untitled Quiz"}
        description={`${course?.title ?? ''}. ${quiz.questions.length} questions, total: ${quizMaxScore(quiz)} points.`}
        actions={
          <>
            <StatusBadge status={quiz.status} />
            <Button variant="secondary" icon={<Save />} onClick={() => save(false)}>Save</Button>
            {quiz.status !== 'published' && <Button icon={<Send />} onClick={() => save(true)}>Publish</Button>}
          </>
        }
      />

      {problems.length > 0 && (
        <Notice tone="danger" className="mb-20">
          <strong>Fix the following issues before publishing:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </Notice>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'settings', label: "Settings" },
          { key: 'questions', label: "Questions", count: quiz.questions.length },
          { key: 'preview', label: "Preview" },
          { key: 'results', label: "Results" },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'settings' && (
          <div className="grid grid-main-aside">
            <Card title="Basic Details">
              <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
                  <Input label="Title" required value={quiz.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g., Module 2 Quiz" />
                  <Select label="Course" value={quiz.courseId} onChange={(e) => patch({ courseId: e.target.value })} options={teacherCourses.map((c) => ({ value: c.id, label: c.title }))} />
                </div>
                <Textarea label="Description" rows={2} value={quiz.description} onChange={(e) => patch({ description: e.target.value })} style={{ minHeight: 64 }} />
                <Textarea label="Instructions" rows={4} value={quiz.instructions.join('\n')} onChange={(e) => patch({ instructions: e.target.value.split('\n') })} hint="Put each instruction on a new line" />
              </div>
            </Card>
            <Card title="Options">
              <div className="stack" style={{ ['--gap' as string]: '14px' }}>
                <Input label="Time Limit (minutes)" type="number" min={1} value={quiz.timeLimitMin} onChange={(e) => patch({ timeLimitMin: Number(e.target.value) })} />
                <Input label="Number of Attempts" type="number" min={1} max={10} value={quiz.attemptsAllowed} onChange={(e) => patch({ attemptsAllowed: Number(e.target.value) })} />
                <Input label="Passing Score (%)" type="number" min={1} max={100} value={quiz.passPercent} onChange={(e) => patch({ passPercent: Number(e.target.value) })} />
                <Input label="Available Until" type="datetime-local" value={quiz.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'questions' && (
          <div className="stack" style={{ ['--gap' as string]: '14px', maxWidth: 900 }}>
            {quiz.questions.length === 0 && (
              <div className="card"><EmptyState title="This quiz has no questions" text="Add your first question." action={<Button icon={<Plus />} onClick={() => { const q = blankQuestion(); patch({ questions: [q] }); setActive(q.id); }}>Add Question</Button>} /></div>
            )}
            {quiz.questions.map((q, i) => (
              <section key={q.id} className={cx('question-editor', active === q.id && 'is-active')} onFocus={() => setActive(q.id)} onClick={() => setActive(q.id)} aria-label={`Question ${i + 1}`}>
                <div className="row row--between row--wrap">
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <strong className="small">Question {i + 1}</strong>
                    {q.correct.length === 0 && <Badge tone="warning">No correct answer selected</Badge>}
                  </div>
                  <div className="row" style={{ ['--gap' as string]: '2px' }}>
                    <Button variant="ghost" size="sm" iconOnly icon={<ArrowUp />} aria-label="Move up" disabled={i === 0} onClick={() => moveQ(i, -1)} />
                    <Button variant="ghost" size="sm" iconOnly icon={<ArrowDown />} aria-label="Move down" disabled={i === quiz.questions.length - 1} onClick={() => moveQ(i, 1)} />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={<Copy />}
                      aria-label="Duplicate"
                      onClick={() => {
                        const copyOpts = q.options.map((o) => ({ id: newId('o'), text: o.text }));
                        const copy: QuizQuestion = { ...q, id: newId('q'), options: copyOpts, correct: q.correct.map((c) => copyOpts[q.options.findIndex((o) => o.id === c)].id) };
                        setQuiz((s) => ({ ...s, questions: [...s.questions.slice(0, i + 1), copy, ...s.questions.slice(i + 1)] }));
                      }}
                    />
                    <Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} aria-label="Delete Question" onClick={() => setToDelete(q.id)} />
                  </div>
                </div>
                <Textarea label="Question Text" rows={2} value={q.text} onChange={(e) => patchQ(q.id, { text: e.target.value })} style={{ minHeight: 64 }} placeholder="Enter your question" />
                <div className="row row--wrap" style={{ ['--gap' as string]: '14px' }}>
                  <Segmented
                    label="Question Type"
                    value={q.kind}
                    onChange={(k) => patchQ(q.id, { kind: k, correct: k === 'single' ? q.correct.slice(0, 1) : q.correct })}
                    items={[{ key: 'single', label: "Single Answer" }, { key: 'multiple', label: "Multiple Answers" }]}
                  />
                  <label className="row small" style={{ ['--gap' as string]: '8px' }}>Points<input className="input" type="number" min={1} max={20} value={q.points} onChange={(e) => patchQ(q.id, { points: Math.max(1, Number(e.target.value)) })} style={{ width: 76 }} />
                  </label>
                </div>
                <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, ['--gap' as string]: '8px' }}>
                  <legend className="field__label" style={{ marginBottom: 8 }}>Answer Options <span className="xs muted" style={{ fontWeight: 400 }}>({q.kind === 'multiple' ? "select the correct options" : "select the correct option"})</span></legend>
                  {q.options.map((o, oi) => {
                    const isCorrect = q.correct.includes(o.id);
                    return (
                      <div key={o.id} className="answer-row">
                        <input
                          type={q.kind === 'single' ? 'radio' : 'checkbox'}
                          name={`correct-${q.id}`}
                          checked={isCorrect}
                          aria-label={`Option ${LETTERS[oi]} is correct`}
                          onChange={() => patchQ(q.id, { correct: q.kind === 'single' ? [o.id] : isCorrect ? q.correct.filter((c) => c !== o.id) : [...q.correct, o.id] })}
                        />
                        <span className="option__key">{LETTERS[oi]}</span>
                        <input className="input grow" value={o.text} placeholder={`Option ${LETTERS[oi]}`} aria-label={`Option ${LETTERS[oi]}`} onChange={(e) => patchQ(q.id, { options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} style={isCorrect ? { borderColor: 'var(--success-600)' } : undefined} />
                        <Button variant="ghost" size="sm" iconOnly icon={<X />} aria-label={`Remove option ${LETTERS[oi]}`} disabled={q.options.length <= 2} onClick={() => patchQ(q.id, { options: q.options.filter((x) => x.id !== o.id), correct: q.correct.filter((c) => c !== o.id) })} />
                      </div>
                    );
                  })}
                  <div>
                    <Button variant="ghost" size="sm" icon={<Plus />} disabled={q.options.length >= 6} onClick={() => patchQ(q.id, { options: [...q.options, { id: newId('o'), text: '' }] })}>Add Option</Button>
                  </div>
                </fieldset>
                <Input label="Explanation (shown in results)" value={q.explanation ?? ''} onChange={(e) => patchQ(q.id, { explanation: e.target.value })} placeholder="Why is this answer correct?" />
              </section>
            ))}
            {quiz.questions.length > 0 && (
              <Button variant="secondary" icon={<Plus />} style={{ alignSelf: 'flex-start' }} onClick={() => { const q = blankQuestion(); setQuiz((s) => ({ ...s, questions: [...s.questions, q] })); setActive(q.id); }}>Add Question</Button>
            )}
          </div>
        )}

        {tab === 'preview' && (
          <div className="stack" style={{ ['--gap' as string]: '16px', maxWidth: 820 }}>
            <div className="row row--between row--wrap">
              <Notice tone="neutral">This is how students will see the quiz. Selections are not saved.</Notice>
              <Segmented label="Correct Answers" value={showKey} onChange={setShowKey} items={[{ key: 'hide', label: "Hide Answers" }, { key: 'show', label: "Show Answers" }]} />
            </div>
            {quiz.questions.map((q, i) => (
              <Card key={q.id} title={`${i + 1}. ${q.text || "Question text is empty"}`} subtitle={`${q.kind === 'single' ? "Single Answer" : "Multiple Answers"}, ${q.points} points`}>
                <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                  {q.options.map((o, oi) => {
                    const sel = (previewAnswers[q.id] ?? []).includes(o.id);
                    const correct = showKey === 'show' && q.correct.includes(o.id);
                    return (
                      <label key={o.id} className={cx('option', sel && 'is-selected', correct && 'is-correct')}>
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
                        <span className="option__key">{LETTERS[oi]}</span>
                        <span className="grow">{o.text || <span className="muted">Empty option</span>}</span>
                        {correct && <CheckCircle2 size={18} color="var(--success-600)" />}
                      </label>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'results' &&
          (quiz.status === 'draft' || id === 'new' ? (
            <div className="card"><EmptyState icon={<BarChart3 size={24} />} title="No results yet" text="Results will appear once the quiz is published and students start taking it." /></div>
          ) : (
            <div className="stack" style={{ ['--gap' as string]: '20px' }}>
              <div className="grid grid-3">
                <StatCard label="Attempts" value={results.attempts} icon={<Users />} meta="sample data" />
                <StatCard label="Average Result" value={results.avg} unit="%" icon={<BarChart3 />} tone="navy" />
                <StatCard label="Pass Rate" value={results.passRate} unit="%" icon={<CheckCircle2 />} tone="success" meta={`passing score: ${quiz.passPercent}%`} />
              </div>
              <ChartCard title="Correct Answer Rate by Question" subtitle="Questions with low scores may need to be reviewed">
                <BarChart labels={quiz.questions.map((_, i) => `Q${i + 1}`)} series={[{ name: "Correct", values: quiz.questions.map((_, i) => 52 + ((i * 17 + quiz.id.length * 5) % 44)) }]} max={100} suffix="%" ariaLabel="Correct Answer Rate by Question" />
              </ChartCard>
              <Card title="Recent Attempts" padded={false}>
                <DataTable
                  caption="Recent Attempts"
                  rows={students.slice(1, 9).map((s, i) => ({ s, score: 55 + ((i * 13 + 7) % 44), at: `2026-10-${String(14 - i).padStart(2, '0')}T${10 + i}:15`, min: 6 + (i % 8) }))}
                  rowKey={(r) => r.s.id}
                  initialSort={{ key: 'at', dir: 'desc' }}
                  columns={[
                    { key: 's', header: "Student", sortValue: (r) => fullName(r.s), render: (r) => <Person name={fullName(r.s)} size={30} /> },
                    { key: 'at', header: "Completed", sortValue: (r) => r.at, render: (r) => formatDateTime(r.at) },
                    { key: 'min', header: "Duration", align: 'right', render: (r) => `${r.min} min` },
                    { key: 'score', header: "Result", align: 'right', sortValue: (r) => r.score, render: (r) => <Badge tone={r.score >= quiz.passPercent ? 'success' : 'danger'}>{r.score}%</Badge> },
                  ]}
                />
              </Card>
            </div>
          ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => setQuiz((q) => ({ ...q, questions: q.questions.filter((x) => x.id !== toDelete) }))}
        title="Delete this question?"
        text="The question and its options will be removed from the quiz."
        confirmLabel="Delete"
      />
    </>
  );
}

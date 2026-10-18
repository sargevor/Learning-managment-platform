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
const LETTERS = ['Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ'];

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
    instructions: ['Թեստը սկսելուց հետո ժամաչափը չի կանգնում։'],
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
    return <div className="card"><EmptyState title="Թեստը չի գտնվել" action={<ButtonLink to="/teacher/quizzes">Բոլոր թեստերը</ButtonLink>} /></div>;
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
    if (quiz.title.trim().length < 3) p.push('Նշեք թեստի անվանումը («Կարգավորումներ» բաժին)');
    if (quiz.questions.length === 0) p.push('Ավելացրեք առնվազն մեկ հարց');
    quiz.questions.forEach((x, i) => {
      if (!x.text.trim()) p.push(`Հարց ${i + 1}. հարցի տեքստը դատարկ է`);
      if (x.options.filter((o) => o.text.trim()).length < 2) p.push(`Հարց ${i + 1}. անհրաժեշտ է առնվազն 2 լրացված տարբերակ`);
      if (x.correct.length === 0) p.push(`Հարց ${i + 1}. նշեք ճիշտ պատասխանը`);
    });
    return p;
  };

  const save = (publish: boolean) => {
    const p = validate();
    setProblems(p);
    if (p.length) {
      toast.warning('Թեստը պատրաստ չէ', `Գտնվել է ${p.length} խնդիր։`);
      return;
    }
    if (publish) patch({ status: 'published' });
    toast.success(publish ? 'Թեստը հրապարակվեց' : 'Թեստը պահվեց', 'Դեմո ռեժիմ. փոփոխությունները պահվում են միայն այս էջում։');
    if (id === 'new') navigate('/teacher/quizzes');
  };

  const results = quizResultSummary(quiz);
  const course = getCourse(quiz.courseId);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Թեստեր', to: '/teacher/quizzes' }, { label: id === 'new' ? 'Նոր թեստ' : quiz.title }]}
        title={id === 'new' ? 'Նոր թեստ' : quiz.title || 'Անանուն թեստ'}
        description={`${course?.title ?? ''}. ${quiz.questions.length} հարց, ընդամենը ${quizMaxScore(quiz)} միավոր։`}
        actions={
          <>
            <StatusBadge status={quiz.status} />
            <Button variant="secondary" icon={<Save />} onClick={() => save(false)}>Պահել</Button>
            {quiz.status !== 'published' && <Button icon={<Send />} onClick={() => save(true)}>Հրապարակել</Button>}
          </>
        }
      />

      {problems.length > 0 && (
        <Notice tone="danger" className="mb-20">
          <strong>Հրապարակելուց առաջ ուղղեք․</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </Notice>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'settings', label: 'Կարգավորումներ' },
          { key: 'questions', label: 'Հարցեր', count: quiz.questions.length },
          { key: 'preview', label: 'Նախադիտում' },
          { key: 'results', label: 'Արդյունքներ' },
        ]}
      />
      <div style={{ paddingTop: 20 }}>
        {tab === 'settings' && (
          <div className="grid grid-main-aside">
            <Card title="Հիմնական տվյալներ">
              <div className="stack" style={{ ['--gap' as string]: '16px' }}>
                <div className="grid grid-2" style={{ ['--gap' as string]: '14px' }}>
                  <Input label="Անվանում" required value={quiz.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Օր.՝ Մոդուլ 2-ի ստուգողական թեստ" />
                  <Select label="Դասընթաց" value={quiz.courseId} onChange={(e) => patch({ courseId: e.target.value })} options={teacherCourses.map((c) => ({ value: c.id, label: c.title }))} />
                </div>
                <Textarea label="Նկարագրություն" rows={2} value={quiz.description} onChange={(e) => patch({ description: e.target.value })} style={{ minHeight: 64 }} />
                <Textarea label="Հրահանգներ" rows={4} value={quiz.instructions.join('\n')} onChange={(e) => patch({ instructions: e.target.value.split('\n') })} hint="Յուրաքանչյուր հրահանգ՝ նոր տողում" />
              </div>
            </Card>
            <Card title="Պարամետրեր">
              <div className="stack" style={{ ['--gap' as string]: '14px' }}>
                <Input label="Ժամանակ (րոպե)" type="number" min={1} value={quiz.timeLimitMin} onChange={(e) => patch({ timeLimitMin: Number(e.target.value) })} />
                <Input label="Փորձերի քանակ" type="number" min={1} max={10} value={quiz.attemptsAllowed} onChange={(e) => patch({ attemptsAllowed: Number(e.target.value) })} />
                <Input label="Անցողիկ շեմ (%)" type="number" min={1} max={100} value={quiz.passPercent} onChange={(e) => patch({ passPercent: Number(e.target.value) })} />
                <Input label="Հասանելի է մինչև" type="datetime-local" value={quiz.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'questions' && (
          <div className="stack" style={{ ['--gap' as string]: '14px', maxWidth: 900 }}>
            {quiz.questions.length === 0 && (
              <div className="card"><EmptyState title="Թեստը հարցեր չունի" text="Ավելացրեք առաջին հարցը։" action={<Button icon={<Plus />} onClick={() => { const q = blankQuestion(); patch({ questions: [q] }); setActive(q.id); }}>Ավելացնել հարց</Button>} /></div>
            )}
            {quiz.questions.map((q, i) => (
              <section key={q.id} className={cx('question-editor', active === q.id && 'is-active')} onFocus={() => setActive(q.id)} onClick={() => setActive(q.id)} aria-label={`Հարց ${i + 1}`}>
                <div className="row row--between row--wrap">
                  <div className="row" style={{ ['--gap' as string]: '8px' }}>
                    <strong className="small">Հարց {i + 1}</strong>
                    {q.correct.length === 0 && <Badge tone="warning">Ճիշտ պատասխանը նշված չէ</Badge>}
                  </div>
                  <div className="row" style={{ ['--gap' as string]: '2px' }}>
                    <Button variant="ghost" size="sm" iconOnly icon={<ArrowUp />} aria-label="Տեղափոխել վերև" disabled={i === 0} onClick={() => moveQ(i, -1)} />
                    <Button variant="ghost" size="sm" iconOnly icon={<ArrowDown />} aria-label="Տեղափոխել ներքև" disabled={i === quiz.questions.length - 1} onClick={() => moveQ(i, 1)} />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={<Copy />}
                      aria-label="Կրկնօրինակել"
                      onClick={() => {
                        const copyOpts = q.options.map((o) => ({ id: newId('o'), text: o.text }));
                        const copy: QuizQuestion = { ...q, id: newId('q'), options: copyOpts, correct: q.correct.map((c) => copyOpts[q.options.findIndex((o) => o.id === c)].id) };
                        setQuiz((s) => ({ ...s, questions: [...s.questions.slice(0, i + 1), copy, ...s.questions.slice(i + 1)] }));
                      }}
                    />
                    <Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} aria-label="Ջնջել հարցը" onClick={() => setToDelete(q.id)} />
                  </div>
                </div>
                <Textarea label="Հարցի տեքստ" rows={2} value={q.text} onChange={(e) => patchQ(q.id, { text: e.target.value })} style={{ minHeight: 64 }} placeholder="Մուտքագրեք հարցը" />
                <div className="row row--wrap" style={{ ['--gap' as string]: '14px' }}>
                  <Segmented
                    label="Հարցի տեսակ"
                    value={q.kind}
                    onChange={(k) => patchQ(q.id, { kind: k, correct: k === 'single' ? q.correct.slice(0, 1) : q.correct })}
                    items={[{ key: 'single', label: 'Մեկ պատասխան' }, { key: 'multiple', label: 'Մի քանի պատասխան' }]}
                  />
                  <label className="row small" style={{ ['--gap' as string]: '8px' }}>
                    Միավոր
                    <input className="input" type="number" min={1} max={20} value={q.points} onChange={(e) => patchQ(q.id, { points: Math.max(1, Number(e.target.value)) })} style={{ width: 76 }} />
                  </label>
                </div>
                <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, ['--gap' as string]: '8px' }}>
                  <legend className="field__label" style={{ marginBottom: 8 }}>Պատասխանի տարբերակներ <span className="xs muted" style={{ fontWeight: 400 }}>(նշեք ճիշտ{q.kind === 'multiple' ? 'երը' : ''})</span></legend>
                  {q.options.map((o, oi) => {
                    const isCorrect = q.correct.includes(o.id);
                    return (
                      <div key={o.id} className="answer-row">
                        <input
                          type={q.kind === 'single' ? 'radio' : 'checkbox'}
                          name={`correct-${q.id}`}
                          checked={isCorrect}
                          aria-label={`Տարբերակ ${LETTERS[oi]}-ն ճիշտ է`}
                          onChange={() => patchQ(q.id, { correct: q.kind === 'single' ? [o.id] : isCorrect ? q.correct.filter((c) => c !== o.id) : [...q.correct, o.id] })}
                        />
                        <span className="option__key">{LETTERS[oi]}</span>
                        <input className="input grow" value={o.text} placeholder={`Տարբերակ ${LETTERS[oi]}`} aria-label={`Տարբերակ ${LETTERS[oi]}`} onChange={(e) => patchQ(q.id, { options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} style={isCorrect ? { borderColor: 'var(--success-600)' } : undefined} />
                        <Button variant="ghost" size="sm" iconOnly icon={<X />} aria-label={`Հեռացնել տարբերակ ${LETTERS[oi]}`} disabled={q.options.length <= 2} onClick={() => patchQ(q.id, { options: q.options.filter((x) => x.id !== o.id), correct: q.correct.filter((c) => c !== o.id) })} />
                      </div>
                    );
                  })}
                  <div>
                    <Button variant="ghost" size="sm" icon={<Plus />} disabled={q.options.length >= 6} onClick={() => patchQ(q.id, { options: [...q.options, { id: newId('o'), text: '' }] })}>Ավելացնել տարբերակ</Button>
                  </div>
                </fieldset>
                <Input label="Բացատրություն (ցուցադրվում է արդյունքներում)" value={q.explanation ?? ''} onChange={(e) => patchQ(q.id, { explanation: e.target.value })} placeholder="Ինչու է այս պատասխանը ճիշտ" />
              </section>
            ))}
            {quiz.questions.length > 0 && (
              <Button variant="secondary" icon={<Plus />} style={{ alignSelf: 'flex-start' }} onClick={() => { const q = blankQuestion(); setQuiz((s) => ({ ...s, questions: [...s.questions, q] })); setActive(q.id); }}>
                Ավելացնել հարց
              </Button>
            )}
          </div>
        )}

        {tab === 'preview' && (
          <div className="stack" style={{ ['--gap' as string]: '16px', maxWidth: 820 }}>
            <div className="row row--between row--wrap">
              <Notice tone="neutral">Այսպես են թեստը տեսնում ուսանողները։ Ընտրությունները չեն պահվում։</Notice>
              <Segmented label="Ճիշտ պատասխաններ" value={showKey} onChange={setShowKey} items={[{ key: 'hide', label: 'Թաքցնել պատասխանները' }, { key: 'show', label: 'Ցույց տալ պատասխանները' }]} />
            </div>
            {quiz.questions.map((q, i) => (
              <Card key={q.id} title={`${i + 1}. ${q.text || 'Հարցի տեքստը դատարկ է'}`} subtitle={`${q.kind === 'single' ? 'Մեկ պատասխան' : 'Մի քանի պատասխան'}, ${q.points} միավոր`}>
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
                        <span className="grow">{o.text || <span className="muted">Դատարկ տարբերակ</span>}</span>
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
            <div className="card"><EmptyState icon={<BarChart3 size={24} />} title="Արդյունքներ դեռ չկան" text="Արդյունքները կհայտնվեն թեստը հրապարակելուց և ուսանողների առաջին փորձերից հետո։" /></div>
          ) : (
            <div className="stack" style={{ ['--gap' as string]: '20px' }}>
              <div className="grid grid-3">
                <StatCard label="Փորձեր" value={results.attempts} icon={<Users />} meta="ցուցադրական տվյալներ" />
                <StatCard label="Միջին արդյունք" value={results.avg} unit="%" icon={<BarChart3 />} tone="navy" />
                <StatCard label="Հանձնողների մասնաբաժին" value={results.passRate} unit="%" icon={<CheckCircle2 />} tone="success" meta={`շեմը՝ ${quiz.passPercent}%`} />
              </div>
              <ChartCard title="Ճիշտ պատասխանների տոկոսն ըստ հարցերի" subtitle="Ցածր տոկոսով հարցերը կարող են վերանայման կարիք ունենալ">
                <BarChart labels={quiz.questions.map((_, i) => `Հ${i + 1}`)} series={[{ name: 'Ճիշտ', values: quiz.questions.map((_, i) => 52 + ((i * 17 + quiz.id.length * 5) % 44)) }]} max={100} suffix="%" ariaLabel="Ճիշտ պատասխանների տոկոսը ըստ հարցերի" />
              </ChartCard>
              <Card title="Վերջին փորձերը" padded={false}>
                <DataTable
                  caption="Վերջին փորձերը"
                  rows={students.slice(1, 9).map((s, i) => ({ s, score: 55 + ((i * 13 + 7) % 44), at: `2026-10-${String(14 - i).padStart(2, '0')}T${10 + i}:15`, min: 6 + (i % 8) }))}
                  rowKey={(r) => r.s.id}
                  initialSort={{ key: 'at', dir: 'desc' }}
                  columns={[
                    { key: 's', header: 'Ուսանող', sortValue: (r) => fullName(r.s), render: (r) => <Person name={fullName(r.s)} size={30} /> },
                    { key: 'at', header: 'Ավարտված', sortValue: (r) => r.at, render: (r) => formatDateTime(r.at) },
                    { key: 'min', header: 'Տևողություն', align: 'right', render: (r) => `${r.min} ր` },
                    { key: 'score', header: 'Արդյունք', align: 'right', sortValue: (r) => r.score, render: (r) => <Badge tone={r.score >= quiz.passPercent ? 'success' : 'danger'}>{r.score}%</Badge> },
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
        title="Ջնջե՞լ հարցը"
        text="Հարցը և նրա տարբերակները կհեռացվեն թեստից։"
        confirmLabel="Ջնջել"
      />
    </>
  );
}

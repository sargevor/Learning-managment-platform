import type { Quiz, QuizAttempt, QuizQuestion } from '../types';
import { DEMO_STUDENT_ID } from './users';

type Q = [kind: 'single' | 'multiple', text: string, options: string[], correct: number[], points?: number, explanation?: string];

function qs(prefix: string, list: Q[]): QuizQuestion[] {
  return list.map(([kind, text, options, correct, points = 1, explanation], i) => ({
    id: `${prefix}-q${i + 1}`,
    kind,
    text,
    options: options.map((t, oi) => ({ id: `${prefix}-q${i + 1}-o${oi + 1}`, text: t })),
    correct: correct.map((ci) => `${prefix}-q${i + 1}-o${ci + 1}`),
    points,
    explanation,
  }));
}

const standardInstructions = [
  "The timer cannot be paused once you start the quiz.",
  "You can move between questions and change your answers before submitting.",
  "For multiple-answer questions, you must select all correct options to earn points.",
  "Before submitting, you will see a summary highlighting any unanswered questions.",
];

export const quizzes: Quiz[] = [
  {
    id: 'q-react-basics',
    courseId: 'react',
    title: "React Core Concepts",
    description: "Test your understanding of JSX, components, props, and state.",
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-20T23:59',
    status: 'published',
    questions: qs('react', [
      ['single', "What does a React function component return?", ["An HTML string", "A React element (JSX)", "A DOM node", "A CSS class"], [1], 2, "A component returns React elements, which React then reconciles with the DOM."],
      ['single', "Which hook stores a component's local state?", ['useEffect', 'useMemo', 'useState', 'useRef'], [2], 1],
      ['multiple', "Select the correct statements about props.", ["Props are passed from parent to child", "A component can directly modify its props", "Functions can be passed as props", "Props can only be strings"], [0, 2], 2, "Props are read-only and can hold values of any type."],
      ['single', "Why do list items need a key attribute?", ["For styling", "To help React identify items during updates", "For search engines", "It is not required"], [1], 1],
      ['single', "When does useEffect run with an empty dependency array?", ["After every render", "After the initial render", "Never", "Only when the component unmounts"], [1], 1],
      ['multiple', "Which statements about JSX are correct?", ["Use className instead of class", "Expressions go inside curly braces", "You can return multiple elements without a parent or Fragment", "Self-closing tags must end with />"], [0, 1, 3], 2],
      ['single', "What is a controlled form input in React?", ["An input whose value is stored in React state", "An input with the disabled attribute", "An input whose value is validated on the server", "An input without onChange"], [0], 1],
      ['single', "Which approach is preferred for sharing data with deeply nested components?", ["A global variable on window", 'Context API', 'localStorage', "Duplicating props at every level"], [1], 1],
    ]),
  },
  {
    id: 'q-js-types',
    courseId: 'js',
    title: "JavaScript: Types and Functions",
    description: "Primitive types, comparisons, and function declarations.",
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-15T23:59',
    status: 'published',
    questions: qs('jst', [
      ['single', "What does typeof null return?", ['"null"', '"object"', '"undefined"', '"number"'], [1], 1],
      ['single', "Which operator compares both value and type?", ['==', '=', '===', '!='], [2], 1],
      ['multiple', "Select the primitive types.", ['string', 'array', 'boolean', 'symbol'], [0, 2, 3], 2],
      ['single', "What is a distinctive feature of arrow functions?", ["They do not have their own this", "They cannot return a value", "They are always asynchronous", "They do not accept parameters"], [0], 1],
    ]),
  },
  {
    id: 'q-js-async',
    courseId: 'js',
    title: "Asynchronous Programming",
    description: "Promises, async/await, and error handling.",
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 1,
    passPercent: 70,
    dueDate: '2026-09-05T23:59',
    status: 'published',
    questions: qs('jsa', [
      ['single', "What does an async function return?", ["Always undefined", 'Promise', 'Callback', "A generator"], [1], 1],
      ['multiple', "What are the possible states of a Promise?", ['pending', 'fulfilled', 'rejected', 'paused'], [0, 1, 2], 2],
      ['single', "How do you handle an error from an awaited operation?", ['if/else', 'try/catch', 'switch', "You cannot"], [1], 1],
      ['single', "When does Promise.all reject?", ["When all promises reject", "When the first promise rejects", "Never", "Only on a timeout"], [1], 1],
    ]),
  },
  {
    id: 'q-ml-terms',
    courseId: 'ml',
    title: "Machine Learning Terminology",
    description: "Key concepts: data, models, training, and evaluation.",
    instructions: standardInstructions,
    timeLimitMin: 12,
    attemptsAllowed: 2,
    passPercent: 60,
    dueDate: '2026-10-19T23:59',
    status: 'published',
    questions: qs('mlt', [
      ['single', "Which task is an example of regression?", ["Classifying an email as spam or not spam", "Predicting a house price", "Grouping customers", "Detecting a cat in an image"], [1], 1],
      ['multiple', "Which algorithms use supervised learning?", ["Linear Regression", 'K-means', "Decision tree", "Logistic Regression"], [0, 2, 3], 2],
      ['single', "What is overfitting?", ["The model performs poorly on the training data", "The model memorizes the training data and generalizes poorly", "There is too little data", "Training is too fast"], [1], 1],
      ['single', "Why split data into training and test sets?", ["To speed up training", "To evaluate the model on unseen data", "To save memory", "It is not necessary"], [1], 1],
      ['single', "Which metric is useful for classification with imbalanced classes?", ["Accuracy", "F1 score", 'MAE', 'R²'], [1], 1],
    ]),
  },
  {
    id: 'q-ux-usability',
    courseId: 'ux',
    title: "Usability Principles",
    description: "Heuristics and the fundamentals of interface evaluation.",
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-08T23:59',
    status: 'published',
    questions: qs('uxu', [
      ['single', "What does visibility of system status mean?", ["The system keeps users informed about what is happening", "All settings are visible", "The interface is transparent", "The source code is open"], [0], 1],
      ['multiple', "Which are good examples of error prevention?", ["A confirmation dialog before deleting", "A date picker instead of a free-text field", "Hidden buttons", "Disabling unavailable actions"], [0, 1, 3], 2],
      ['single', "How many participants are typically enough for one round of qualitative usability testing?", ['1', '5', '50', '500'], [1], 1],
      ['single', "Which is a good example of recognition rather than recall?", ["Requiring users to memorize commands", "Showing recently used items", "Hiding the menu", "Using only icons"], [1], 1],
    ]),
  },
  {
    id: 'q-linalg-vectors',
    courseId: 'linear-algebra',
    title: "Vectors and Matrices",
    description: "Vector operations and matrix dimensions.",
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 65,
    dueDate: '2026-11-02T23:59',
    status: 'published',
    questions: qs('lav', [
      ['single', "What is the dot product of (1, 2) and (3, 4)?", ['10', '11', '14', '7'], [1], 1],
      ['single', "What is the size of the product of a 2×3 matrix and a 3×4 matrix?", ['2×4', '3×3', '4×2', "The matrices cannot be multiplied"], [0], 1],
      ['multiple', "Which are properties of an identity matrix?", ["It is square", "Its main diagonal contains ones", "Every element is one", "AI = A for every compatible matrix A"], [0, 1, 3], 2],
      ['single', "Two vectors are perpendicular when their dot product is:", ["1", "0", "Negative", "Equal to the product of their lengths"], [1], 1],
    ]),
  },
  {
    id: 'q-pandas',
    courseId: 'python-data',
    title: "pandas Fundamentals",
    description: "Creating, selecting, and grouping DataFrames.",
    instructions: standardInstructions,
    timeLimitMin: 15,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-07-05T23:59',
    status: 'published',
    questions: qs('pd', [
      ['single', "Which method displays the first rows of a DataFrame?", ['first()', 'head()', 'top()', 'start()'], [1], 1],
      ['single', "How do you select rows by label?", ['iloc', 'loc', 'at_index', 'select'], [1], 1],
      ['multiple', "Which methods help you handle missing values?", ['isna()', 'fillna()', 'dropna()', 'missing()'], [0, 1, 2], 2],
      ['single', "What is needed after groupby to produce a summarized result?", ["An aggregation function", "Nothing", "Renaming", "Sorting"], [0], 1],
    ]),
  },
  {
    id: 'q-sql-joins',
    courseId: 'sql',
    title: "Types of JOIN",
    description: "INNER, LEFT, RIGHT, and FULL joins.",
    instructions: standardInstructions,
    timeLimitMin: 10,
    attemptsAllowed: 2,
    passPercent: 70,
    dueDate: '2026-10-28T23:59',
    status: 'draft',
    questions: qs('sqlj', [
      ['single', "Which JOIN returns only matching rows?", ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'], [1], 1],
      ['single', "With a LEFT JOIN, unmatched rows from the left table are:", ["Omitted", "Returned with NULL values for the right table", "Reported as an error", "Duplicated"], [1], 1],
    ]),
  },
];

export function getQuiz(id: string | undefined): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}

export function quizMaxScore(q: Quiz): number {
  return q.questions.reduce((n, x) => n + x.points, 0);
}

export function scoreAnswers(q: Quiz, answers: Record<string, string[]>): number {
  return q.questions.reduce((sum, question) => {
    const given = [...(answers[question.id] ?? [])].sort().join('|');
    const correct = [...question.correct].sort().join('|');
    return sum + (given === correct ? question.points : 0);
  }, 0);
}

function attempt(id: string, quizId: string, pickWrong: string[], completedAt: string, durationMin: number): QuizAttempt {
  const q = getQuiz(quizId)!;
  const answers: Record<string, string[]> = {};
  q.questions.forEach((question) => {
    answers[question.id] = pickWrong.includes(question.id)
      ? [question.options.find((o) => !question.correct.includes(o.id))!.id]
      : [...question.correct];
  });
  return { id, quizId, studentId: DEMO_STUDENT_ID, answers, score: scoreAnswers(q, answers), maxScore: quizMaxScore(q), completedAt, durationMin };
}

/** Previous attempts of the demo student (illustrative). */
export const quizAttempts: QuizAttempt[] = [
  attempt('att-1', 'q-js-types', ['jst-q4'], '2026-07-12T19:20', 11),
  attempt('att-2', 'q-js-async', [], '2026-09-03T20:05', 9),
  attempt('att-3', 'q-ux-usability', ['uxu-q3'], '2026-10-06T18:40', 8),
  attempt('att-4', 'q-pandas', ['pd-q2'], '2026-07-02T16:30', 12),
];

export function attemptsFor(quizId: string): QuizAttempt[] {
  return quizAttempts.filter((a) => a.quizId === quizId);
}

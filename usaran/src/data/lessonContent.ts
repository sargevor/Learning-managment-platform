import type { Course, Lesson, Module } from '../types';

export interface LessonSection {
  heading: string;
  paragraphs: string[];
  code?: string;
}

export interface LessonResource {
  name: string;
  kind: 'pdf' | 'zip' | 'link' | 'code';
  size?: string;
}

export interface LessonContent {
  intro: string;
  sections: LessonSection[];
  keyPoints: string[];
  resources: LessonResource[];
}

const specific: Record<string, Partial<LessonContent>> = {
  'react-m2-l4': {
    intro: "Real applications often display data as lists: courses, assignments, or messages. In this lesson, we explore how React renders lists and why the key attribute matters.",
    sections: [
      {
        heading: "From an Array to a List",
        paragraphs: [
          "In React, you can create a list with the array map method. Each item becomes a JSX element, and React renders the resulting array.",
        ],
        code: `function CourseList({ courses }) {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  );
}`,
      },
      {
        heading: "Why Keys Matter",
        paragraphs: [
          "Keys help React identify which items have changed, been added, or been removed. Without stable keys, React may reuse component state incorrectly.",
          "Use a unique data identifier as the key. An array index is only suitable when the list order never changes.",
        ],
      },
    ],
    keyPoints: ["Create lists with the map method", "Keys should be stable and unique", "Avoid using indices in lists that can change"],
  },
};

export function getLessonContent(course: Course, module: Module, lesson: Lesson): LessonContent {
  const custom = specific[lesson.id] ?? {};
  return {
    intro:
      custom.intro ??
      `This lesson is part of the ${module.title} module. You will explore the key ideas behind ${lesson.title}, see practical examples, and get suggestions for independent practice.`,
    sections: custom.sections ?? [
      {
        heading: "The Main Idea",
        paragraphs: [
          `${lesson.title} is an important topic in ${course.title}. We start by defining the problem, then discuss possible approaches and their limitations.`,
          "At the end of the lesson, revisit the key ideas and explain them in your own words to check your understanding.",
        ],
      },
      {
        heading: "Practical Example",
        paragraphs: [
          "The example below shows how this topic applies in practice. Follow the steps in your own environment and change the parameters to compare the results.",
        ],
      },
    ],
    keyPoints: custom.keyPoints ?? ["Define the problem before choosing a solution", "Compare several approaches", "Reinforce your learning with a practical exercise"],
    resources: [
      { name: `${lesson.title} — Summary.pdf`, kind: 'pdf', size: "420 KB" },
      { name: "Sample Code.zip", kind: 'zip', size: "86 KB" },
      { name: "Further Reading", kind: 'link' },
    ],
  };
}

export const testimonials = [
  { name: "Mariam G.", role: "Business Analytics Student", text: "The assignment feedback is specific and helpful. I always know exactly what to improve next.", course: "Python for Data Analysis" },
  { name: "Hayk V.", role: "Software Engineering Student", text: "Having all my deadlines and results in one place makes planning the semester much easier.", course: "React: Building Modern Interfaces" },
  { name: "Elen A.", role: "Mathematics Student", text: "Short video lessons and quizzes let me keep learning on my phone, even when I am on the go.", course: "Linear Algebra" },
];

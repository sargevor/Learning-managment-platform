import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookMarked, Check, ChartColumn, ChartLine, CirclePlay, ClipboardList, Clock, FileQuestionMark, Globe, GraduationCap, Heart,
  Layers, LayoutDashboard, LibraryBig, ListChecks, MessageSquare, Paperclip, Play, Presentation, ShieldCheck, Sparkles, Timer, Users,
} from 'lucide-react';
import { categories, publishedCourses } from '../../data/courses';
import { fullName, teachers } from '../../data/users';
import { CATEGORY_ICONS, SCENES, photoFor } from '../../lib/visual';

const HERO_CHIPS = [
  { label: 'Lessons', icon: CirclePlay },
  { label: 'Tasks', icon: ClipboardList },
  { label: 'Quizzes', icon: FileQuestionMark },
  { label: 'Grades', icon: GraduationCap },
];

const VALUES = [
  { tag: 'Mission', title: 'Learn from anywhere', icon: Globe },
  { tag: 'Transparency', title: 'Clear deadlines and grading', icon: ShieldCheck },
  { tag: 'Support', title: 'Help right on time', icon: Heart },
];

const SIDES = [
  {
    id: 'students',
    title: 'For students',
    icon: GraduationCap,
    img: SCENES.study,
    items: [
      { label: 'Modules and short lessons', icon: BookMarked },
      { label: 'Tasks with files', icon: Paperclip },
      { label: 'Grades and progress charts', icon: ChartLine },
    ],
    btn: 'Student demo',
    to: '/student/dashboard',
  },
  {
    id: 'teachers',
    title: 'For teachers',
    icon: Presentation,
    img: SCENES.video,
    items: [
      { label: 'Course builder', icon: Layers },
      { label: 'One grading center', icon: ListChecks },
      { label: 'Reports by course and date', icon: ChartColumn },
    ],
    btn: 'Teacher demo',
    to: '/teacher/dashboard',
  },
];

const FAQ = [
  { title: 'Demo with sample data', icon: Sparkles },
  { title: 'Switch roles anytime', icon: Users },
  { title: 'Quiz results instantly', icon: Timer },
  { title: 'Teacher feedback on tasks', icon: MessageSquare },
  { title: 'Works on any screen', icon: LayoutDashboard },
];

export function AboutPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const hours = publishedCourses.map((c) => c.durationHours);
  const minH = hours.length ? Math.min(...hours) : 0;
  const maxH = hours.length ? Math.max(...hours) : 0;
  const stats = [
    { value: String(publishedCourses.length), unit: '', label: 'Courses', icon: LibraryBig },
    { value: String(categories.length), unit: '', label: 'Subjects', icon: Layers },
    { value: String(teachers.length), unit: '', label: 'Teachers', icon: Presentation },
    { value: minH === maxH ? String(minH) : `${minH}–${maxH}`, unit: ' h', label: 'Per course', icon: Clock },
  ];

  return (
    <div className="pub-page">
      <div className="pub-wrap pub-about">
        {/* Photo hero */}
        <section className="pub-ahero">
          <img src={SCENES.teacher} alt="An instructor teaching in a lecture hall" />
          <div className="pub-ahero__scrim" aria-hidden="true" />
          <div className="pub-ahero__inner">
            <Link to="/" className="pub-glass pub-glass--link"><ArrowLeft aria-hidden="true" />Home</Link>
            <div className="pub-ahero__copy">
              <h1>Learn and teach</h1>
              <div className="pub-chips">
                {HERO_CHIPS.map((h) => (
                  <span key={h.label} className="pub-glass pub-glass--lg"><h.icon aria-hidden="true" />{h.label}</span>
                ))}
              </div>
            </div>
            <Link to="/courses" className="pub-btn pub-btn--light pub-btn--md">Browse courses<ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>

        {/* Big numbers */}
        <section aria-label="LearnSpace in numbers" className="pub-grid pub-grid--230">
          {stats.map((s) => (
            <div key={s.label} className="pub-stat">
              <span className="pub-ibox pub-ibox--56" aria-hidden="true"><s.icon /></span>
              <span className="pub-stat__text">
                <span className="pub-stat__value tabular">{s.value}{s.unit && <span>{s.unit}</span>}</span>
                <span className="pub-stat__label">{s.label}</span>
              </span>
            </div>
          ))}
        </section>

        {/* Values */}
        <section aria-labelledby="values-h" className="pub-section">
          <h2 id="values-h" className="pub-h2 pub-h2--sm">What we stand for</h2>
          <div className="pub-grid pub-grid--300">
            {VALUES.map((v) => (
              <div key={v.tag} className="pub-value">
                <span className="pub-ibox pub-ibox--72" aria-hidden="true"><v.icon /></span>
                <span className="pub-value__text">
                  <span className="pub-value__tag">{v.tag}</span>
                  <b>{v.title}</b>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* For students / For teachers */}
        <section className="pub-grid pub-grid--420 pub-sides">
          {SIDES.map((g) => (
            <div key={g.id} id={g.id} className="pub-side">
              <div className="pub-side__media">
                <img src={g.img} alt="" loading="lazy" />
                <span className="pub-tile__scrim" aria-hidden="true" />
                <span className="pub-side__title">
                  <span className="pub-ibox pub-ibox--white" aria-hidden="true"><g.icon /></span>
                  <b>{g.title}</b>
                </span>
              </div>
              <div className="pub-side__body">
                {g.items.map((it) => (
                  <div key={it.label} className="pub-side__item">
                    <span className="pub-ibox pub-ibox--white pub-ibox--44" aria-hidden="true"><it.icon /></span>
                    <b>{it.label}</b>
                    <Check className="pub-side__check" aria-hidden="true" />
                  </div>
                ))}
                <Link to={g.to} className="pub-btn pub-btn--dark pub-btn--sm"><Play aria-hidden="true" />{g.btn}</Link>
              </div>
            </div>
          ))}
        </section>

        {/* Team */}
        <section aria-labelledby="team-h" className="pub-section">
          <h2 id="team-h" className="pub-h2 pub-h2--sm">Our teachers</h2>
          <div className="pub-grid pub-grid--190">
            {teachers.map((t) => {
              const name = fullName(t);
              const photo = photoFor(name);
              const first = publishedCourses.find((c) => c.teacherId === t.id);
              const RoleIcon = first ? CATEGORY_ICONS[first.category] : GraduationCap;
              return (
                <div key={t.id} className="pub-member">
                  {photo ? (
                    <img src={photo} alt={name} loading="lazy" className="pub-member__photo" />
                  ) : (
                    <span className="pub-member__photo pub-initials" role="img" aria-label={name}>{t.firstName[0]}{t.lastName[0]}</span>
                  )}
                  <span className="pub-member__text">
                    <b>{name}</b>
                    <span className="pub-chip pub-chip--sm"><RoleIcon aria-hidden="true" />{(t.title ?? 'Teacher').split(',')[0]}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Good to know */}
        <section id="faq" aria-labelledby="faq-h" className="pub-section">
          <h2 id="faq-h" className="pub-h2 pub-h2--sm">Good to know</h2>
          <div className="pub-grid pub-grid--200 pub-faq">
            {FAQ.map((f) => (
              <div key={f.title} className="pub-fact">
                <span className="pub-ibox pub-ibox--48" aria-hidden="true"><f.icon /></span>
                <b>{f.title}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

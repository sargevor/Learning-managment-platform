import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookMarked, CheckSquare, ChevronDown, Compass, GraduationCap, HeartHandshake, LineChart, ShieldCheck, Users } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Misc';
import { cx } from '../../lib/format';

const FAQ = [
  ["Is this a live learning platform?", "This is a demo interface with sample data. Registrations, sign-ins, submissions, and grades are not saved or sent to a server."],
  ["How can I explore the student and instructor areas?", "Choose Student or Instructor on the sign-in page, or use the Student / Instructor switch at the top of any dashboard page."],
  ["How long does a course take?", "Courses range from 8 to 44 hours. You can learn at your own pace, although assignments have deadlines."],
  ["How is work graded?", "Instructors grade practical assignments and provide feedback. Quizzes are graded automatically, with results available immediately."],
  ["Can I learn on my phone?", "Yes. The interface adapts to screens of all sizes."],
];

export function AboutPage() {
  const { hash } = useLocation();
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <section className="page-band">
        <div className="container">
        <Breadcrumbs items={[{ label: "Home", to: '/' }, { label: "About" }]} />
        <h1 style={{ maxWidth: 860 }}>One place to <span className="hl">learn and teach</span></h1>
        <p className="page-band__lead" style={{ maxWidth: 680 }}>We bring course materials, assignments, quizzes, and grades together so students can focus on learning and instructors can focus on supporting them.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          {[
            [Compass, "Our Mission", "Make quality learning accessible, wherever you are and whatever your schedule.", 't-sky'],
            [ShieldCheck, "Transparency", "Students always know what is expected, when work is due, and how it will be graded.", 't-mint'],
            [HeartHandshake, "Support", "Instructors can spot students who need help and offer support in time.", 't-rose'],
          ].map(([Icon, t, d, tint]) => {
            const I = Icon as typeof Compass;
            return (
              <div key={t as string} className={`value-card ${tint as string}`}>
                <span className="tint-box" style={{ ['--box' as string]: '52px' }}><I aria-hidden="true" /></span>
                <h2 style={{ fontSize: 'var(--fs-md)', margin: '14px 0 6px' }}>{t as string}</h2>
                <p className="small secondary">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2" style={{ ['--gap' as string]: '22px' }}>
          <div className="card card--pad">
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="tint-box t-sky"><GraduationCap /></span>
              <h2>For Students</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />Courses organized into modules and short lessons</li>
              <li><CheckSquare aria-hidden="true" />Assignments with text responses and file attachments</li>
              <li><LineChart aria-hidden="true" />Grades, quiz results, and progress charts</li>
            </ul>
            <ButtonLink to="/student/dashboard" variant="secondary" style={{ marginTop: 18 }}>Try the Student Experience</ButtonLink>
          </div>
          <div className="card card--pad" id="teachers">
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="tint-box t-lilac"><Users /></span>
              <h2>For teachers</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />Manage course structure and content</li>
              <li><CheckSquare aria-hidden="true" />Review all submissions in one grading center</li>
              <li><LineChart aria-hidden="true" />View reports by course, student, and date range</li>
            </ul>
            <ButtonLink to="/teacher/dashboard" variant="secondary" style={{ marginTop: 18 }}>Try the Instructor Experience</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section section--muted" id="faq">
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="kicker">Questions</span>
          <h2 className="section-head__title" style={{ margin: '10px 0 24px' }}>Frequently Asked <span className="hl">Questions</span></h2>
          <div className="card faq">
            {FAQ.map(([q, a], i) => (
              <div key={q} className="faq__item">
                <button type="button" className="faq__q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {q}
                  <ChevronDown className={cx('chev', openFaq === i && 'is-open')} aria-hidden="true" />
                </button>
                {openFaq === i && <p className="faq__a">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

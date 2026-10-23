import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookMarked, CheckSquare, ChevronDown, Compass, GraduationCap, HeartHandshake, LineChart, ShieldCheck, Users } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Misc';
import { cx } from '../../lib/format';
import { tr } from '../../i18n';

const FAQ = [
  [tr("Is this a live learning platform?", "Արդյո՞ք սա իրական հարթակ է։"), tr("This is a demo interface with sample data. Registrations, sign-ins, submissions, and grades are not saved or sent to a server.", "Սա ցուցադրական միջերես է՝ նմուշային տվյալներով։ Գրանցումները, մուտքը, հանձնումները և գնահատականները չեն պահպանվում և չեն ուղարկվում սերվեր։")],
  [tr("How can I explore the student and teacher areas?", "Ինչպե՞ս տեսնել ուսանողի և դասավանդողի միջավայրերը։"), tr("Choose Student or Teacher on the sign-in page, or use the Student / Teacher switch at the top of any dashboard page.", "Մուտքի էջում ընտրեք «Ուսանող» կամ «Դասավանդող» դերը, կամ օգտագործեք «Ուսանող / Դասավանդող» փոխարկիչը ցանկացած վահանակի վերևում։")],
  [tr("How long does a course take?", "Որքա՞ն է տևում մեկ դասընթացը։"), tr("Courses range from 8 to 44 hours. You can learn at your own pace, although assignments have deadlines.", "Դասընթացները տևում են 8-ից մինչև 44 ժամ։ Կարող եք սովորել ձեզ հարմար տեմպով, սակայն առաջադրանքներն ունեն վերջնաժամկետներ։")],
  [tr("How is work graded?", "Ինչպե՞ս են գնահատվում աշխատանքները։"), tr("Instructors grade practical assignments and provide feedback. Quizzes are graded automatically, with results available immediately.", "Գործնական առաջադրանքները գնահատում է դասավանդողը՝ մեկնաբանությամբ, իսկ թեստերը ստուգվում են ավտոմատ և արդյունքն երևում է անմիջապես։")],
  [tr("Can I learn on my phone?", "Կարո՞ղ եմ սովորել հեռախոսից։"), tr("Yes. The interface adapts to screens of all sizes.", "Այո։ Միջերեսը հարմարեցված է բոլոր չափերի էկրանների համար։")],
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
        <Breadcrumbs items={[{ label: tr("Home", "Գլխավոր"), to: '/' }, { label: tr("About", "Հարթակի մասին") }]} />
        <h1 style={{ maxWidth: 860 }}>{tr("One place to ", "Մեկ միջավայր՝ ")}<span className="hl">{tr("learn and teach", "սովորելու և դասավանդելու համար")}</span></h1>
        <p className="page-band__lead" style={{ maxWidth: 680 }}>{tr("We bring course materials, assignments, quizzes, and grades together so students can focus on learning and instructors can focus on supporting them.", "Մենք միավորել ենք դասընթացների նյութերը, առաջադրանքները, թեստերը և գնահատականները մեկ հստակ միջավայրում, որպեսզի ուսանողները կենտրոնանան սովորելու, իսկ դասավանդողները՝ ուսանողներին օգնելու վրա։")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          {[
            [Compass, tr("Our Mission", "Մեր առաքելությունը"), tr("Make quality learning accessible, wherever you are and whatever your schedule.", "Հասանելի դարձնել որակյալ ուսուցումը՝ անկախ գտնվելու վայրից և ժամանակացույցից։"), 't-sky'],
            [ShieldCheck, tr("Transparency", "Թափանցիկություն"), tr("Students always know what is expected, when work is due, and how it will be graded.", "Ուսանողը միշտ գիտի, թե ինչ է սպասվում իրենից, մինչև երբ պետք է հանձնել աշխատանքը և ինչպես այն կգնահատվի։"), 't-mint'],
            [HeartHandshake, tr("Support", "Աջակցություն"), tr("Instructors can spot students who need help and offer support in time.", "Դասավանդողը ժամանակին տեսնում է, թե ով է դժվարանում, և կարող է օգնել։"), 't-rose'],
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
              <h2>{tr("For Students", "Ուսանողների համար")}</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />{tr("Courses organized into modules and short lessons", "Դասընթացներ՝ բաժանված մոդուլների և կարճ դասերի")}</li>
              <li><CheckSquare aria-hidden="true" />{tr("Assignments with text responses and file attachments", "Առաջադրանքներ՝ տեքստային պատասխանով և ֆայլերով")}</li>
              <li><LineChart aria-hidden="true" />{tr("Grades, quiz results, and progress charts", "Գնահատականներ, թեստերի արդյունքներ և առաջընթացի գրաֆիկներ")}</li>
            </ul>
            <ButtonLink to="/student/dashboard" variant="secondary" style={{ marginTop: 18 }}>{tr("Try the Student Experience", "Փորձել ուսանողի միջավայրը")}</ButtonLink>
          </div>
          <div className="card card--pad" id="teachers">
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="tint-box t-lilac"><Users /></span>
              <h2>{tr("For teachers", "Դասավանդողների համար")}</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />{tr("Manage course structure and content", "Դասընթացի կառուցվածքի և բովանդակության կառավարում")}</li>
              <li><CheckSquare aria-hidden="true" />{tr("Review all submissions in one grading center", "Գնահատման կենտրոն՝ բոլոր հանձնումներով մեկ տեղում")}</li>
              <li><LineChart aria-hidden="true" />{tr("View reports by course, student, and date range", "Հաշվետվություններ ըստ դասընթացի, ուսանողի և ժամանակահատվածի")}</li>
            </ul>
            <ButtonLink to="/teacher/dashboard" variant="secondary" style={{ marginTop: 18 }}>{tr("Try the Instructor Experience", "Փորձել դասավանդողի միջավայրը")}</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section section--muted" id="faq">
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="kicker">{tr("Questions", "Հարցեր")}</span>
          <h2 className="section-head__title" style={{ margin: '10px 0 24px' }}>{tr("Frequently Asked ", "Հաճախ տրվող ")}<span className="hl">{tr("Questions", "հարցեր")}</span></h2>
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

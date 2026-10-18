import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Atom, BarChart3, Bell, BookOpenCheck, Brain, Briefcase, CalendarClock, CheckCircle2, ClipboardCheck, Code2, Database,
  Languages, LayoutList, MessageSquareText, Palette, Search, Sigma, Smartphone, Users,
} from 'lucide-react';
import type { CategoryId } from '../../types';
import { categories, courses, publishedCourses } from '../../data/courses';
import { testimonials } from '../../data/lessonContent';
import { CourseCard } from '../../components/course/CourseBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Avatar, DemoFlag } from '../../components/ui/Misc';
import { ProgressBar } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';

export const CATEGORY_ICONS: Record<CategoryId, typeof Code2> = {
  programming: Code2,
  design: Palette,
  math: Sigma,
  ai: Brain,
  data: Database,
  languages: Languages,
  science: Atom,
  business: Briefcase,
};

const POPULAR = ['React', 'Python', 'UX դիզայն', 'Գծային հանրահաշիվ'];

export function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const featured = publishedCourses.filter((c) => c.featured).slice(0, 4);
  const go = (term: string) => navigate(`/courses${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ''}`);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            <h1 className="hero__title">Դասընթացներ, առաջադրանքներ և գնահատականներ՝ մեկ ուսումնական միջավայրում</h1>
            <p className="hero__lead">
              Ուսարանում դասավանդողները կառուցում են դասընթացներ և հետևում ուսանողների առաջընթացին, իսկ ուսանողները սովորում են, հանձնում աշխատանքներ և տեսնում իրենց արդյունքները՝ առանց տարբեր գործիքների միջև կորչելու։
            </p>
            <form
              className="hero__search"
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              role="search"
            >
              <Search aria-hidden="true" />
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ի՞նչ եք ուզում սովորել" aria-label="Դասընթացների որոնում" />
              <Button type="submit" variant="primary">Որոնել</Button>
            </form>
            <div className="row row--wrap small" style={{ ['--gap' as string]: '8px' }}>
              <span className="muted">Հաճախ որոնվող՝</span>
              {POPULAR.map((p) => (
                <button key={p} type="button" className="chip" style={{ height: 30 }} onClick={() => go(p)}>
                  {p}
                </button>
              ))}
            </div>
            <div className="row row--wrap" style={{ ['--gap' as string]: '10px', marginTop: 8 }}>
              <ButtonLink to="/courses" variant="primary" size="lg">Դիտել դասընթացները</ButtonLink>
              <ButtonLink to="/login" variant="secondary" size="lg">Փորձել դեմո տարբերակը</ButtonLink>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-strip" aria-label="Հարթակի ցուցանիշներ">
        <div className="container">
          <div className="stats-strip__grid">
            {[
              ['180+', 'դասընթաց 8 ուղղությամբ'],
              ['24 000', 'ակտիվ ուսանող'],
              ['320', 'դասավանդող և մենթոր'],
              ['92%', 'ուսանողների բավարարվածություն'],
            ].map(([v, l]) => (
              <div key={l} className="stats-strip__item">
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div className="stats-strip__note">
            <DemoFlag text="Ցուցադրական արժեքներ" />
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-head__title">Առաջարկվող դասընթացներ</h2>
              <p className="section-head__desc">Ամենաբարձր գնահատված դասընթացները՝ կառուցված գործնական առաջադրանքների շուրջ։</p>
            </div>
            <ButtonLink to="/courses" variant="secondary">Ամբողջ կատալոգը</ButtonLink>
          </div>
          <div className="grid grid-4 course-grid">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-head__title">Ուսումնական ուղղություններ</h2>
              <p className="section-head__desc">Ընտրեք ոլորտը և դիտեք համապատասխան դասընթացները։</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              return (
                <Link key={c.id} to={`/courses?category=${c.id}`} className="category-tile">
                  <span className="category-tile__icon"><Icon aria-hidden="true" /></span>
                  <span className="grow">
                    <span className="category-tile__name">{c.name}</span>
                    <span className="category-tile__desc">{c.description}</span>
                  </span>
                  <span className="category-tile__count">{c.courseCount}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-head__title">Ինչպես է աշխատում հարթակը</h2>
            <p className="section-head__desc">Երեք քայլ՝ դասընթացի ընտրությունից մինչև արդյունքների վերլուծություն։</p>
          </div>
          <ol className="steps">
            {[
              ['Ընտրեք դասընթաց', 'Զտեք կատալոգը ըստ ուղղության և մակարդակի, ծանոթացեք ծրագրին և դասավանդողին, ապա գրանցվեք։'],
              ['Սովորեք և կատարեք առաջադրանքներ', 'Դիտեք տեսադասեր, կարդացեք նյութեր, հանձնեք աշխատանքներ և անցեք թեստեր՝ ձեզ հարմար տեմպով։'],
              ['Հետևեք ձեր առաջընթացին', 'Տեսեք գնահատականները, դասավանդողի մեկնաբանությունները և ձեր ակտիվությունը շաբաթների կտրվածքով։'],
            ].map(([t, d], i) => (
              <li key={t} className="step">
                <span className="step__num">{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="section section--muted">
        <div className="container benefits">
          <div className="benefits__media">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=70" alt="Ուսանողները միասին աշխատում են նոութբուքերով" loading="lazy" onError={(e) => ((e.currentTarget.style.display = 'none'))} />
          </div>
          <div className="stack" style={{ ['--gap' as string]: '22px' }}>
            <div>
              <h2 className="section-head__title">Ինչու է ուսուցումն այստեղ ավելի արդյունավետ</h2>
              <p className="section-head__desc" style={{ marginTop: 8 }}>Ամեն ինչ, ինչ անհրաժեշտ է կանոնավոր ուսման համար, հավաքված է մեկ տեղում։</p>
            </div>
            {[
              [CalendarClock, 'Վերջնաժամկետները միշտ տեսանելի են', 'Վահանակը ցույց է տալիս մոտակա առաջադրանքներն ու թեստերը՝ ըստ հրատապության։'],
              [MessageSquareText, 'Մանրամասն հետադարձ կապ', 'Դասավանդողի մեկնաբանությունը կցվում է յուրաքանչյուր գնահատված աշխատանքին։'],
              [BarChart3, 'Առաջընթացի պարզ պատկեր', 'Գրաֆիկները ցույց են տալիս ավարտված դասերը, միջին միավորը և ակտիվությունը։'],
              [Smartphone, 'Ցանկացած սարքից', 'Ինտերֆեյսը հարմարեցված է համակարգչի, պլանշետի և հեռախոսի համար։'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof CalendarClock;
              return (
                <div key={t as string} className="benefit">
                  <span className="benefit__icon"><I aria-hidden="true" /></span>
                  <div>
                    <h3>{t as string}</h3>
                    <p>{d as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teacher section */}
      <section className="section teacher-band">
        <div className="container teacher-band__grid">
          <div className="stack" style={{ ['--gap' as string]: '18px' }}>
            <Badge tone="accent">Դասավանդողների համար</Badge>
            <h2 className="teacher-band__title">Կառավարեք դասընթացը, աշխատանքները և գնահատումը նույն վահանակից</h2>
            <p className="teacher-band__text">Ստեղծեք մոդուլներ և դասեր, հրապարակեք առաջադրանքներ ու թեստեր, գնահատեք հանձնված աշխատանքները մեկ կենտրոնից և տեսեք, թե որ ուսանողներին է անհրաժեշտ աջակցություն։</p>
            <ul className="check-list check-list--light">
              <li><CheckCircle2 aria-hidden="true" />Դասընթացի կառուցվածքի խմբագրիչ՝ մոդուլներով և դասերով</li>
              <li><CheckCircle2 aria-hidden="true" />Գնահատման կենտրոն՝ զտիչներով և մեկնաբանություններով</li>
              <li><CheckCircle2 aria-hidden="true" />Հաշվետվություններ՝ ըստ դասընթացի և ուսանողի</li>
            </ul>
            <div className="row row--wrap" style={{ ['--gap' as string]: '10px' }}>
              <ButtonLink to="/teacher/dashboard" variant="accent" size="lg">Դիտել դասավանդողի վահանակը</ButtonLink>
              <ButtonLink to="/about#teachers" variant="ghost" size="lg" className="on-dark">Մանրամասն</ButtonLink>
            </div>
          </div>
          <div className="teacher-preview" aria-hidden="true">
            <div className="teacher-preview__head">
              <span className="strong">Գնահատման սպասող աշխատանքներ</span>
              <span className="badge badge--warning">5 նոր</span>
            </div>
            {[
              ['Հայկ Վարդանյան', 'Կոմպոնենտների գրադարան', '2 ժամ առաջ'],
              ['Աննա Պողոսյան', 'Հարցումների հավաքածու', '5 ժամ առաջ'],
              ['Տիգրան Մելքոնյան', 'Կոմպոնենտների գրադարան', 'երեկ'],
            ].map(([n, a, t]) => (
              <div key={n} className="teacher-preview__row">
                <Avatar name={n} size={32} />
                <div className="grow">
                  <div className="small strong">{n}</div>
                  <div className="xs muted">{a}</div>
                </div>
                <span className="xs muted">{t}</span>
              </div>
            ))}
            <div className="teacher-preview__foot">
              <div className="xs muted">Դասընթացի միջին արդյունքը</div>
              <ProgressBar value={84} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-head__title">Ինչ են ասում ուսանողները</h2>
              <p className="section-head__desc">Կարծիքները օրինակային են և ներկայացված են ցուցադրական նպատակով։</p>
            </div>
            <DemoFlag text="Օրինակային կարծիքներ" />
          </div>
          <div className="grid grid-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="card card--pad testimonial">
                <blockquote>{t.text}</blockquote>
                <figcaption className="row">
                  <Avatar name={t.name} size={38} />
                  <div>
                    <div className="small strong">{t.name}</div>
                    <div className="xs muted">{t.role}</div>
                  </div>
                </figcaption>
                <div className="testimonial__course">
                  <BookOpenCheck size={14} aria-hidden="true" />
                  {t.course}
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="final-cta">
            <div>
              <h2>Սկսեք հաջորդ դասընթացը այսօր</h2>
              <p>Ստեղծեք հաշիվ կամ անմիջապես դիտեք ուսանողի և դասավանդողի դեմո միջավայրերը։</p>
            </div>
            <div className="row row--wrap" style={{ ['--gap' as string]: '10px' }}>
              <ButtonLink to="/register" variant="accent" size="lg">Ստեղծել հաշիվ</ButtonLink>
              <ButtonLink to="/student/dashboard" variant="secondary" size="lg">Բացել ուսանողի դեմոն</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Hero visual: a composed slice of the real learning interface. */
function HeroPreview() {
  const course = courses.find((c) => c.id === 'react')!;
  const lessons = course.modules[1].lessons.slice(0, 4);
  return (
    <div className="hero-preview" aria-hidden="true">
      <div className="hero-preview__window">
        <div className="hero-preview__bar">
          <span /><span /><span />
          <div className="xs muted" style={{ marginLeft: 8 }}>Իմ դասընթացները</div>
        </div>
        <div className="hero-preview__body">
          <div className="hero-preview__course">
            <div className="xs" style={{ color: 'var(--accent-700)', fontWeight: 600 }}>Ծրագրավորում</div>
            <div className="strong" style={{ color: 'var(--navy-900)' }}>{course.title}</div>
            <ProgressBar value={47} />
          </div>
          <div className="hero-preview__module">
            <div className="row row--between xs">
              <span className="strong" style={{ color: 'var(--navy-900)' }}>Մոդուլ 2. {course.modules[1].title}</span>
              <span className="muted">3 / 5</span>
            </div>
            {lessons.map((l, i) => (
              <div key={l.id} className="hero-preview__lesson">
                {i < 3 ? <CheckCircle2 size={16} color="var(--success-600)" /> : <LayoutList size={16} color="var(--accent-600)" />}
                <span className={i === 3 ? 'strong' : ''}>{l.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hero-preview__float hero-preview__float--deadline">
        <span className="stat__icon stat__icon--warning"><CalendarClock size={16} /></span>
        <div>
          <div className="xs muted">Վերջնաժամկետ՝ 3 օրից</div>
          <div className="small strong">Կոմպոնենտների գրադարան</div>
        </div>
      </div>
      <div className="hero-preview__float hero-preview__float--grade">
        <span className="stat__icon stat__icon--success"><ClipboardCheck size={16} /></span>
        <div>
          <div className="xs muted">Նոր գնահատական</div>
          <div className="small strong">88 / 100</div>
        </div>
        <Bell size={14} className="muted" style={{ marginLeft: 'auto' }} />
      </div>
      <div className="hero-preview__float hero-preview__float--people">
        <Users size={14} />
        <span className="xs strong">1 284 ուսանող դասընթացում</span>
      </div>
    </div>
  );
}

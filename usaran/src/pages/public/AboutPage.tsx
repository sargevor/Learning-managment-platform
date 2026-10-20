import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookMarked, CheckSquare, ChevronDown, Compass, GraduationCap, HeartHandshake, LineChart, ShieldCheck, Users } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Misc';
import { cx } from '../../lib/format';

const FAQ = [
  ['Արդյո՞ք սա իրական հարթակ է։', 'Ոչ։ Սա ցուցադրական ինտերֆեյս է՝ օրինակային տվյալներով։ Գրանցումը, մուտքը, հանձնումները և գնահատականները չեն պահպանվում և չեն ուղարկվում սերվեր։'],
  ['Ինչպե՞ս տեսնել ուսանողի և դասավանդողի միջավայրերը։', 'Մուտքի էջում ընտրեք դեմո դերը, կամ ցանկացած ներքին էջի վերևի մասում օգտագործեք «Ուսանող / Դասավանդող» փոխարկիչը։'],
  ['Որքա՞ն է տևում մեկ դասընթացը։', 'Դասընթացները տևում են 8-ից 44 ժամ։ Դուք կարող եք սովորել ձեզ հարմար տեմպով, սակայն առաջադրանքներն ունեն վերջնաժամկետներ։'],
  ['Ինչպե՞ս են գնահատվում աշխատանքները։', 'Գործնական առաջադրանքները գնահատում է դասավանդողը՝ մեկնաբանությամբ, իսկ թեստերը ստուգվում են ավտոմատ և արդյունքը երևում է անմիջապես։'],
  ['Կարո՞ղ եմ սովորել հեռախոսից։', 'Այո։ Ինտերֆեյսը հարմարեցված է բոլոր չափերի էկրանների համար։'],
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
        <Breadcrumbs items={[{ label: 'Գլխավոր', to: '/' }, { label: 'Հարթակի մասին' }]} />
        <h1 style={{ maxWidth: 860 }}>Ուսարանը ստեղծված է, որպեսզի ուսումը լինի <span className="hl">կանոնավոր</span>, իսկ դասավանդումը՝ թափանցիկ</h1>
        <p className="page-band__lead" style={{ maxWidth: 680 }}>
          Մենք միավորել ենք դասընթացների նյութերը, առաջադրանքները, թեստերը և գնահատականները մեկ հստակ միջավայրում, որպեսզի ուսանողները կենտրոնանան սովորելու, իսկ դասավանդողները՝ ուսանողներին օգնելու վրա։
        </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          {[
            [Compass, 'Առաքելություն', 'Հասանելի դարձնել որակյալ ուսուցումը՝ անկախ գտնվելու վայրից և ժամանակացույցից։', 't-sky'],
            [ShieldCheck, 'Թափանցիկություն', 'Ուսանողը միշտ գիտի՝ ինչ է սպասվում իրենից, երբ և ինչպես է գնահատվելու։', 't-mint'],
            [HeartHandshake, 'Աջակցություն', 'Դասավանդողը ժամանակին տեսնում է, թե ով է դժվարանում, և կարող է օգնել։', 't-rose'],
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
              <h2>Ուսանողների համար</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />Դասընթացներ՝ բաժանված մոդուլների և կարճ դասերի</li>
              <li><CheckSquare aria-hidden="true" />Առաջադրանքներ՝ տեքստային պատասխանով և ֆայլերով</li>
              <li><LineChart aria-hidden="true" />Գնահատականներ, թեստերի արդյունքներ և առաջընթացի գրաֆիկներ</li>
            </ul>
            <ButtonLink to="/student/dashboard" variant="secondary" style={{ marginTop: 18 }}>Բացել ուսանողի դեմոն</ButtonLink>
          </div>
          <div className="card card--pad" id="teachers">
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="tint-box t-lilac"><Users /></span>
              <h2>Դասավանդողների համար</h2>
            </div>
            <ul className="check-list">
              <li><BookMarked aria-hidden="true" />Դասընթացի կառուցվածքի և բովանդակության կառավարում</li>
              <li><CheckSquare aria-hidden="true" />Գնահատման կենտրոն՝ բոլոր հանձնումներով մեկ տեղում</li>
              <li><LineChart aria-hidden="true" />Հաշվետվություններ ըստ դասընթացի, ուսանողի և ժամանակահատվածի</li>
            </ul>
            <ButtonLink to="/teacher/dashboard" variant="secondary" style={{ marginTop: 18 }}>Բացել դասավանդողի դեմոն</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section section--muted" id="faq">
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="kicker">Հարցեր</span>
          <h2 className="section-head__title" style={{ margin: '10px 0 24px' }}>Հաճախ տրվող <span className="hl">հարցեր</span></h2>
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

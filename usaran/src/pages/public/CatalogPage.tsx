import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Search, SearchX } from 'lucide-react';
import type { CategoryId, Difficulty } from '../../types';
import { categories, categoryName, difficultyLabel, publishedCourses } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { CourseCard } from '../../components/course/CourseBits';
import { Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs, CardSkeleton, EmptyState, Pagination } from '../../components/ui/Misc';
import { cx } from '../../lib/format';
import { CATEGORY_ICONS, CATEGORY_TINT } from '../../lib/visual';

const PAGE_SIZE = 9;

const SORTS = [
  { value: 'popular', label: 'Ամենահայտնի' },
  { value: 'rating', label: 'Բարձր վարկանիշ' },
  { value: 'newest', label: 'Վերջին թարմացումներ' },
  { value: 'short', label: 'Ամենակարճ' },
  { value: 'title', label: 'Այբբենական կարգով' },
];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [cats, setCats] = useState<CategoryId[]>(() => (params.get('category') ? [params.get('category') as CategoryId] : []));
  const [levels, setLevels] = useState<Difficulty[]>([]);
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Short simulated loading state to demonstrate placeholders (no network request happens).
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Follow links that change the category while the page is already open (e.g. from the footer).
  useEffect(() => {
    const c = params.get('category') as CategoryId | null;
    if (c) setCats((l) => (l.includes(c) ? l : [c]));
  }, [params]);

  useEffect(() => {
    setPage(1);
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (cats.length === 1) next.set('category', cats[0]);
    setParams(next, { replace: true });
  }, [query, cats, levels, sort, setParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = publishedCourses.filter((c) => {
      const teacher = fullName(getUser(c.teacherId)).toLowerCase();
      const matchesQ = !q || c.title.toLowerCase().includes(q) || c.shortDescription.toLowerCase().includes(q) || teacher.includes(q) || categoryName(c.category).toLowerCase().includes(q);
      return matchesQ && (cats.length === 0 || cats.includes(c.category)) && (levels.length === 0 || levels.includes(c.difficulty));
    });
    const sorters: Record<string, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      popular: (a, b) => b.enrolled - a.enrolled,
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      short: (a, b) => a.durationHours - b.durationHours,
      title: (a, b) => a.title.localeCompare(b.title, 'hy'),
    };
    return [...list].sort(sorters[sort]);
  }, [query, cats, levels, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const reset = () => {
    setQuery('');
    setCats([]);
    setLevels([]);
    setSort('popular');
  };

  return (
    <>
      <section className="page-band">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Գլխավոր', to: '/' }, { label: 'Դասընթացներ' }]} />
          <h1>Գտեք ձեր <span className="hl">հաջորդ</span> դասընթացը</h1>
          <p className="page-band__lead">Ընտրեք {publishedCourses.length} դասընթացներից՝ ծրագրավորումից մինչև մաթեմատիկա և արհեստական բանականություն։</p>
          <form className="bigsearch" role="search" onSubmit={(e) => e.preventDefault()}>
            <Search aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Օրինակ՝ React, Python, դիզայն" aria-label="Որոնել ըստ անվանման, թեմայի կամ դասավանդողի" />
            <Button type="submit" variant="primary" icon={<Search />}>
              <span className="bigsearch__label">Որոնել</span>
            </Button>
          </form>
        </div>
      </section>

      <div className="container page-pad" style={{ paddingTop: 28 }}>
        <div className="fchips" role="group" aria-label="Ուղղություն">
          <button type="button" className="fchip" aria-pressed={cats.length === 0} onClick={() => setCats([])}>
            <span className="tint-box t-accent"><Layers /></span>
            Բոլորը
          </button>
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const n = publishedCourses.filter((x) => x.category === c.id).length;
            return (
              <button key={c.id} type="button" className={cx('fchip', CATEGORY_TINT[c.id])} aria-pressed={cats.includes(c.id)} onClick={() => setCats((l) => toggle(l, c.id))}>
                <span className="tint-box"><Icon /></span>
                {c.name}
                <span className="fchip__count">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="catalog-toolbar">
          <span className="catalog-toolbar__count" aria-live="polite">
            {results.length} դասընթաց
            {cats.length > 0 && <span> · {cats.map(categoryName).join(', ')}</span>}
            {query && <span> · «{query}»</span>}
          </span>
          <div className="catalog-toolbar__right">
            <div className="segmented" role="group" aria-label="Մակարդակ">
              <button type="button" aria-pressed={levels.length === 0} onClick={() => setLevels([])}>Բոլոր մակարդակները</button>
              {(Object.keys(difficultyLabel) as Difficulty[]).map((d) => (
                <button key={d} type="button" aria-pressed={levels.includes(d)} onClick={() => setLevels((l) => toggle(l, d))}>
                  {difficultyLabel[d]}
                </button>
              ))}
            </div>
            <Select aria-label="Դասավորել" options={SORTS} value={sort} onChange={(e) => setSort(e.target.value)} fieldClassName="catalog__sort" className="select--pill" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-3 course-grid">
            {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-panel">
            <EmptyState
              icon={<SearchX size={26} />}
              title="Համապատասխան դասընթաց չգտնվեց"
              text="Փորձեք այլ բանալի բառ կամ հեռացրեք որոշ զտիչներ։"
              action={<Button variant="primary" onClick={reset}>Մաքրել բոլոր զտիչները</Button>}
            />
          </div>
        ) : (
          <div className="stack" style={{ ['--gap' as string]: '28px' }}>
            <div className="grid grid-3 course-grid">
              {visible.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} onChange={(p) => { setPage(p); window.scrollTo({ top: 0 }); }} total={results.length} pageSize={PAGE_SIZE} />
          </div>
        )}
      </div>
    </>
  );
}

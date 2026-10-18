import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import type { CategoryId, Difficulty } from '../../types';
import { categories, categoryName, difficultyLabel, publishedCourses } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { CourseCard } from '../../components/course/CourseBits';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs, CardSkeleton, EmptyState, Pagination } from '../../components/ui/Misc';
import { Checkbox } from '../../components/ui/Field';

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
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Short simulated loading state to demonstrate placeholders (no network request happens).
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

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
  const activeFilters = cats.length + levels.length;
  const reset = () => {
    setQuery('');
    setCats([]);
    setLevels([]);
    setSort('popular');
  };

  return (
    <div className="container page-pad">
      <div className="catalog-head">
        <Breadcrumbs items={[{ label: 'Գլխավոր', to: '/' }, { label: 'Դասընթացներ' }]} />
        <h1>Դասընթացների կատալոգ</h1>
        <p className="secondary">Ընտրեք {publishedCourses.length} դասընթացներից՝ ծրագրավորումից մինչև մաթեմատիկա և արհեստական բանականություն։</p>
      </div>

      <div className="catalog">
        <aside className={`catalog__filters card${filtersOpen ? ' is-open' : ''}`} aria-label="Զտիչներ">
          <div className="catalog__filters-head">
            <h2 className="small">Զտիչներ</h2>
            {activeFilters > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setCats([]); setLevels([]); }}>
                Մաքրել ({activeFilters})
              </button>
            )}
          </div>
          <fieldset className="filter-group">
            <legend>Ուղղություն</legend>
            {categories.map((c) => (
              <Checkbox
                key={c.id}
                label={
                  <span className="row row--between" style={{ width: '100%' }}>
                    {c.name}
                    <span className="xs muted">{publishedCourses.filter((x) => x.category === c.id).length}</span>
                  </span>
                }
                checked={cats.includes(c.id)}
                onChange={() => setCats((l) => toggle(l, c.id))}
              />
            ))}
          </fieldset>
          <fieldset className="filter-group">
            <legend>Մակարդակ</legend>
            {(Object.keys(difficultyLabel) as Difficulty[]).map((d) => (
              <Checkbox key={d} label={difficultyLabel[d]} checked={levels.includes(d)} onChange={() => setLevels((l) => toggle(l, d))} />
            ))}
          </fieldset>
        </aside>

        <div className="stack" style={{ ['--gap' as string]: '18px', minWidth: 0 }}>
          <div className="catalog__toolbar">
            <SearchBar className="grow" value={query} onChange={setQuery} placeholder="Որոնել ըստ անվանման, թեմայի կամ դասավանդողի" />
            <Button variant="secondary" className="catalog__filter-toggle" icon={<SlidersHorizontal />} onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              Զտիչներ{activeFilters ? ` (${activeFilters})` : ''}
            </Button>
            <Select aria-label="Դասավորել" options={SORTS} value={sort} onChange={(e) => setSort(e.target.value)} fieldClassName="catalog__sort" />
          </div>

          <div className="row row--between small">
            <span className="secondary" aria-live="polite">
              Գտնվել է <strong>{results.length}</strong> դասընթաց
            </span>
            {(cats.length > 0 || levels.length > 0) && (
              <div className="row row--wrap" style={{ ['--gap' as string]: '6px' }}>
                {cats.map((c) => (
                  <button key={c} type="button" className="chip" aria-pressed="true" style={{ height: 28 }} onClick={() => setCats((l) => l.filter((x) => x !== c))} aria-label={`Հեռացնել զտիչը՝ ${categoryName(c)}`}>
                    {categoryName(c)} ×
                  </button>
                ))}
                {levels.map((d) => (
                  <button key={d} type="button" className="chip" aria-pressed="true" style={{ height: 28 }} onClick={() => setLevels((l) => l.filter((x) => x !== d))}>
                    {difficultyLabel[d]} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-3 course-grid">
              {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<SearchX size={24} />}
                title="Համապատասխան դասընթաց չգտնվեց"
                text="Փորձեք այլ բանալի բառ կամ հեռացրեք որոշ զտիչներ։"
                action={<Button variant="secondary" onClick={reset}>Մաքրել բոլոր զտիչները</Button>}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-3 course-grid">
                {visible.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
              <Pagination page={page} pageCount={pageCount} onChange={(p) => { setPage(p); window.scrollTo({ top: 0 }); }} total={results.length} pageSize={PAGE_SIZE} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

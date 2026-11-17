import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChartColumn, ChevronDown, ChevronLeft, ChevronRight, Layers, LibraryBig, RotateCcw, Search, SearchX, TrendingUp } from 'lucide-react';
import type { CategoryId, Difficulty } from '../../types';
import { categories, categoryName, difficultyLabel, publishedCourses } from '../../data/courses';
import { fullName, getUser } from '../../data/users';
import { CATEGORY_SHORT, CourseCard } from '../../components/course/CourseBits';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/Misc';
import { cx } from '../../lib/format';
import { CATEGORY_ICONS } from '../../lib/visual';

const PAGE_SIZE = 9;

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'short', label: 'Shortest' },
  { value: 'title', label: 'A to Z' },
];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [cats, setCats] = useState<CategoryId[]>(() => (params.get('category') ? [params.get('category') as CategoryId] : []));
  const [level, setLevel] = useState<Difficulty | ''>('');
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
  }, [query, cats, level, sort, setParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = publishedCourses.filter((c) => {
      const teacher = fullName(getUser(c.teacherId)).toLowerCase();
      const matchesQ = !q || c.title.toLowerCase().includes(q) || c.shortDescription.toLowerCase().includes(q) || teacher.includes(q) || categoryName(c.category).toLowerCase().includes(q);
      return matchesQ && (cats.length === 0 || cats.includes(c.category)) && (!level || c.difficulty === level);
    });
    const sorters: Record<string, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      popular: (a, b) => b.enrolled - a.enrolled,
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      short: (a, b) => a.durationHours - b.durationHours,
      title: (a, b) => a.title.localeCompare(b.title, 'en'),
    };
    return [...list].sort(sorters[sort]);
  }, [query, cats, level, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };
  const reset = () => {
    setQuery('');
    setCats([]);
    setLevel('');
    setSort('popular');
  };

  return (
    <div className="cat-page">
      <div className="cat-wrap">
        <section className="cat-hero">
          <h1 className="cat-h1">Find a course</h1>
          <form className="cat-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="catalog-q" className="cat-search__icon">
              <Search aria-hidden="true" />
              <span className="sr-only">Search courses</span>
            </label>
            <input id="catalog-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try React, Python or design" />
            <Button type="submit" variant="primary" icon={<Search />} className="cat-search__btn">
              <span className="cat-search__label">Search</span>
            </Button>
          </form>
        </section>

        <div className="cat-chips" role="group" aria-label="Category">
          <button type="button" className="cat-chip" aria-pressed={cats.length === 0} onClick={() => setCats([])}>
            <span className="cat-chip__box"><Layers aria-hidden="true" /></span>
            All
            <span className="cat-chip__count">{publishedCourses.length}</span>
          </button>
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const n = publishedCourses.filter((x) => x.category === c.id).length;
            return (
              <button key={c.id} type="button" className="cat-chip" aria-pressed={cats.includes(c.id)} onClick={() => setCats((l) => toggle(l, c.id))} title={c.name}>
                <span className="cat-chip__box"><Icon aria-hidden="true" /></span>
                {CATEGORY_SHORT[c.id] ?? c.name}
                <span className="cat-chip__count">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="cat-toolbar">
          <div className="cat-count" aria-live="polite">
            <span className="cat-count__box"><LibraryBig aria-hidden="true" /></span>
            <span><b>{results.length}</b> courses</span>
          </div>
          <div className="cat-toolbar__right">
            <label className="cat-select">
              <ChartColumn aria-hidden="true" />
              <span className="sr-only">Level</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Difficulty | '')}>
                <option value="">All levels</option>
                {(Object.keys(difficultyLabel) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>{difficultyLabel[d]}</option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="cat-select__chev" />
            </label>
            <label className="cat-select">
              <TrendingUp aria-hidden="true" />
              <span className="sr-only">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="cat-select__chev" />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="cat-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="cat-skel">
                <Skeleton height={176} radius={0} />
                <div className="cat-skel__body">
                  <Skeleton width="80%" height={18} />
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="40%" height={14} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="cat-empty">
            <EmptyState
              icon={<SearchX size={26} />}
              title="No courses found"
              action={<Button variant="primary" icon={<RotateCcw />} onClick={reset}>Clear filters</Button>}
            />
          </div>
        ) : (
          <>
            <section className="cat-grid" aria-label="Courses">
              {visible.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </section>
            {pageCount > 1 && (
              <nav className="cat-pages" aria-label="Pages">
                <button type="button" className="cat-page-btn" aria-label="Previous page" disabled={page === 1} onClick={() => goTo(page - 1)}>
                  <ChevronLeft aria-hidden="true" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" className={cx('cat-page-btn', p === page && 'is-current')} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} onClick={() => goTo(p)}>
                    {p}
                  </button>
                ))}
                <button type="button" className="cat-page-btn" aria-label="Next page" disabled={page === pageCount} onClick={() => goTo(page + 1)}>
                  <ChevronRight aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

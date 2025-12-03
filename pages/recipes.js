import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import FilterPanel from '../components/FilterPanel';
import MealPlanner from '../components/MealPlanner';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [filters, setFilters] = useState({
    ingredients: [],
    difficulty: null,
    maxTime: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const listRef = useRef(null);
  const sentinelRef = useRef(null);

  const PER_PAGE = 24;

  // ---------------------------
  // INITIAL LOAD OF ALLRECIPES
  // ---------------------------
  const initializeFilters = async () => {
    const params = new URLSearchParams();
    params.set('page', 1);
    params.set('per_page', 300);

    const res = await fetch(`/api/recipes?${params.toString()}`);
    const json = await res.json();
    const base = json.data || [];

    setAllRecipes(base);

    const maxT = Math.max(...base.map((r) => r.total_time || r.cook_time || 0));

    setFilters((f) => ({ ...f, maxTime: maxT }));
  };

  useEffect(() => {
    initializeFilters();
  }, []);

  // ---------------------------
  // BUILD QUERY STRING
  // ---------------------------
  const buildQueryString = (pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    params.set('per_page', PER_PAGE);

    if (filters.ingredients.length > 0) {
      params.set('ingredients', filters.ingredients.join(','));
    }

    if (filters.difficulty) {
      params.set('difficulty', filters.difficulty);
    }

    if (filters.maxTime) {
      params.set('max_time', filters.maxTime);
    }

    return params.toString();
  };

  // ---------------------------
  // FETCH RECIPES PAGE
  // ---------------------------
  const fetchRecipesPage = async (pageNumber, replace = false) => {
    setIsLoading(true);

    const qs = buildQueryString(pageNumber);
    const res = await fetch(`/api/recipes?${qs}`);
    const json = await res.json();
    const data = json.data || [];

    if (replace || pageNumber === 1) {
      setTotalCount(json.total_count || json.count || 0);
    }

    setRecipes((prev) => (replace ? data : [...prev, ...data]));

    if (!data.length || data.length < PER_PAGE) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }

    setPage(pageNumber);
    setIsLoading(false);
  };

  // ---------------------------
  // RESET + LOAD ON FILTER CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filters.maxTime) return;

    setRecipes([]);
    setPage(1);
    setHasMore(true);

    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    fetchRecipesPage(1, true);
  }, [filters]);

  // ---------------------------
  // INFINITE SCROLL
  // ---------------------------
  useEffect(() => {
    if (!hasMore || isLoading) return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          fetchRecipesPage(page + 1);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, page, filters]);

  return (
    <>
      <Head>
        <title>ValueRecipe — Discover delightful recipes</title>
      </Head>

      {/* MAIN LAYOUT */}
      <div className='vr-category-layout'>
        {/* LEFT FILTER SIDEBAR */}
        <aside className='vr-filter-sidebar'>
          <h3 className='vr-filter-sidebar__title'>Filter</h3>

          <FilterPanel
            allRecipes={allRecipes}
            difficultyOptions={['easy', 'medium', 'hard']}
            initialTimeRange={{ min: 0, max: 60 }}
            onFilterChange={setFilters}
          />
        </aside>

        {/* MAIN GRID */}
        <main
          className='vr-category-main'
          id='trending'
          ref={listRef}
        >
          <div className='vr-category-main__header'>
            <h3 className='vr-category__title'>All Recipes</h3>

            <span className='vr-category-main__meta'>
              {totalCount
                ? `${recipes.length} out of ${totalCount} recipes loaded`
                : `${recipes.length} recipes loaded`}
            </span>
          </div>

          <div className='vr-category-grid'>
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
              />
            ))}
          </div>

          {hasMore && (
            <div
              ref={sentinelRef}
              className='vr-infinite-sentinel'
            >
              {isLoading && <span>Loading more recipes…</span>}
            </div>
          )}

          {!hasMore && !isLoading && recipes.length > 0 && (
            <div className='vr-end-of-list'>
              <span>You've reached the end of the recipes.</span>
            </div>
          )}

          {recipes.length === 0 && !isLoading && (
            <div className='vr-empty-state'>
              <p>No recipes match these filters yet. Try adjusting them.</p>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside
          className='vr-sidebar'
          id='planner'
        >
          <MealPlanner />
          <AdSlot position='header' />
        </aside>
      </div>
    </>
  );
}

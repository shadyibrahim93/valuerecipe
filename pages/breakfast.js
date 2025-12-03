import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import Breadcrumb from '../components/Breadcrumb';
import FilterPanel from '../components/FilterPanel';
import MealPlanner from '../components/MealPlanner';

const PER_PAGE = 24;
const SERVING_TIME = 'breakfast';
const PAGE_TITLE = 'Best Breakfast Recipes & Easy Morning Ideas';
const HERO_IMAGE = '/images/categories/breakfast-category.jpg';
// ------------------------------------------

export default function BreakfastPage() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);

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

  // ----------------------------------------
  // 1. LOAD ALL RECIPES (For Filter Stats)
  // ----------------------------------------
  useEffect(() => {
    const loadBaseData = async () => {
      const params = new URLSearchParams();
      params.set('page', 1);
      params.set('per_page', 300);
      params.set('serving_time', SERVING_TIME);

      try {
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const json = await res.json();
        const base = json.data || [];

        setAllRecipes(base);

        // Calculate max time for the slider
        if (base.length > 0) {
          const maxT = Math.max(
            ...base.map((r) => r.total_time || r.cook_time || 0)
          );
          setFilters((f) => ({ ...f, maxTime: maxT || 60 }));
        } else {
          // Default if no recipes found
          setFilters((f) => ({ ...f, maxTime: 60 }));
        }
      } catch (err) {
        console.error('Failed to load base recipes', err);
        setFilters((f) => ({ ...f, maxTime: 60 }));
      }
    };

    loadBaseData();
  }, []);

  // ----------------------------------------
  // 2. BUILD QUERY STRING
  // ----------------------------------------
  const buildQueryString = (pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    params.set('per_page', PER_PAGE);
    params.set('serving_time', SERVING_TIME);

    if (filters.ingredients.length > 0)
      params.set('ingredients', filters.ingredients.join(','));

    if (filters.difficulty) params.set('difficulty', filters.difficulty);

    if (filters.maxTime) params.set('max_time', filters.maxTime);

    return params.toString();
  };

  // ----------------------------------------
  // 3. FETCH PAGINATED RECIPES
  // ----------------------------------------
  const fetchRecipesPage = async (pageNumber, replace = false) => {
    setIsLoading(true);
    const qs = buildQueryString(pageNumber);

    try {
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
    } catch (err) {
      console.error('Failed to fetch recipes', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 4. RESET + LOAD WHEN FILTERS CHANGE
  // ----------------------------------------
  useEffect(() => {
    // Wait until initial load sets the maxTime
    if (filters.maxTime === null) return;

    setPage(1);
    setHasMore(true);
    fetchRecipesPage(1, true); // replace = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ----------------------------------------
  // 5. INFINITE SCROLL
  // ----------------------------------------
  useEffect(() => {
    if (!hasMore || isLoading) return;
    if (!sentinelRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          obs.unobserve(entries[0].target);
          fetchRecipesPage(page + 1);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    obs.observe(sentinelRef.current);

    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, page, filters]);

  return (
    <>
      <Head>
        <title>{PAGE_TITLE} | ValueRecipe</title>
      </Head>

      <Breadcrumb />

      <div className='vr-category-hero'>
        <img
          src={HERO_IMAGE}
          alt={PAGE_TITLE}
          className='vr-category-hero__image'
          onError={(e) => {
            e.target.src = '/images/default-category.jpg';
          }}
        />
        <div className='vr-category-hero__overlay'>
          <h1 className='vr-category-hero__title'>{PAGE_TITLE}</h1>
        </div>
      </div>

      <div className='vr-category-layout'>
        <aside className='vr-filter-sidebar'>
          <h3 className='vr-filter-sidebar__title'>Filter</h3>
          <FilterPanel
            allRecipes={allRecipes}
            difficultyOptions={['easy', 'medium', 'hard']}
            initialTimeRange={{ min: 0, max: 60 }}
            onFilterChange={setFilters}
          />
        </aside>

        <main
          className='vr-category-main'
          ref={listRef}
        >
          <div className='vr-category-main__header'>
            <h3 className='vr-category__title'>Breakfast Recipes</h3>
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

          {!hasMore && recipes.length > 0 && (
            <div className='vr-end-message'>You've reached the end!</div>
          )}

          {!isLoading && recipes.length === 0 && (
            <div className='vr-no-results'>
              No {SERVING_TIME} recipes found.
            </div>
          )}
        </main>

        <aside className='vr-sidebar'>
          <MealPlanner />
          <AdSlot position='header' />
        </aside>
      </div>
    </>
  );
}

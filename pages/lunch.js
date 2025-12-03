import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import Breadcrumb from '../components/Breadcrumb';
import FilterPanel from '../components/FilterPanel';
import MealPlanner from '../components/MealPlanner';

const PER_PAGE = 24;
const SERVING_TIME = 'lunch';
const PAGE_TITLE = 'Quick & Healthy Lunch Recipes for Home or Work';
const HERO_IMAGE = '/images/categories/lunch-category.jpg';

// ----------------------------------------
// 1. SERVER SIDE BUILD (ISR)
// ----------------------------------------
export async function getStaticProps() {
  // --- A. Query Logic ---
  const query = supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .ilike('serving_time', SERVING_TIME); // Case-insensitive match for 'lunch'

  // --- B. Fetch First Page (Limit 24) ---
  const {
    data: initialRecipes,
    count,
    error
  } = await query.range(0, PER_PAGE - 1);

  if (error) {
    console.error('ISR Error:', error);
    return { notFound: true };
  }

  // --- C. Fetch Max Time (for initial filter state) ---
  // Lightweight query just to get time columns to set the slider range
  const { data: timeData } = await supabase
    .from('recipes')
    .select('total_time, cook_time')
    .ilike('serving_time', SERVING_TIME)
    .limit(100);

  const initialMaxTime = timeData
    ? Math.max(...timeData.map((r) => r.total_time || r.cook_time || 0))
    : 60;

  return {
    props: {
      initialRecipes: initialRecipes || [],
      initialTotalCount: count || 0,
      initialMaxTime
    },
    // 👇 Update this page in the background at most once every 60 seconds
    revalidate: 60
  };
}

// ----------------------------------------
// 2. CLIENT SIDE COMPONENT
// ----------------------------------------
export default function LunchPage({
  initialRecipes = [],
  initialTotalCount = 0,
  initialMaxTime = 60
}) {
  // Initialize state with Server Data (Instant Load!)
  const [recipes, setRecipes] = useState(initialRecipes);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // "All Recipes" is used by the FilterPanel to calculate counts/stats.
  // We load this lazily so it doesn't block the initial render.
  const [allRecipes, setAllRecipes] = useState([]);

  const [filters, setFilters] = useState({
    ingredients: [],
    difficulty: null,
    maxTime: initialMaxTime
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialRecipes.length < initialTotalCount
  );
  const [page, setPage] = useState(1);

  const listRef = useRef(null);
  const sentinelRef = useRef(null);

  // ----------------------------------------
  // 3. LAZY LOAD FILTER DATA
  // ----------------------------------------
  useEffect(() => {
    async function loadFilterData() {
      if (allRecipes.length > 0) return;

      const params = new URLSearchParams();
      params.set('page', 1);
      params.set('per_page', 300);
      params.set('serving_time', SERVING_TIME);

      try {
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const json = await res.json();
        const base = json.data || [];
        setAllRecipes(base);

        // If the full dataset has a larger max time, update the slider
        const maxT = Math.max(
          ...base.map((r) => r.total_time || r.cook_time || 0)
        );
        if (maxT > filters.maxTime) {
          setFilters((f) => ({ ...f, maxTime: maxT }));
        }
      } catch (err) {
        console.error('Failed to load filter data', err);
      }
    }

    // Small delay to let the UI paint first
    const timer = setTimeout(loadFilterData, 500);
    return () => clearTimeout(timer);
  }, []);

  // ----------------------------------------
  // 4. HELPER: BUILD QUERY STRING
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
  // 5. FETCH RECIPES PAGE (Client Logic)
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

      // Determine if there are more results
      const currentCount = replace ? data.length : recipes.length + data.length;
      const serverTotal = json.total_count || json.count || 0;

      if (
        data.length < PER_PAGE ||
        (serverTotal > 0 && currentCount >= serverTotal)
      ) {
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
  // 6. RESET + LOAD WHEN FILTERS CHANGE
  // ----------------------------------------
  const isFirstRun = useRef(true);
  useEffect(() => {
    // Skip the very first run because we already have InitialProps
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setRecipes([]);
    setPage(1);
    setHasMore(true);
    // Optional: Scroll to top of list when filtering
    // listRef.current?.scrollIntoView({ behavior: 'smooth' });
    fetchRecipesPage(1, true); // replace = true
  }, [filters]);

  // ----------------------------------------
  // 7. INFINITE SCROLL
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
  }, [hasMore, isLoading, page, filters]);

  return (
    <>
      <Head>
        <title>{PAGE_TITLE} | ValueRecipe</title>
        <meta
          name='description'
          content='Browse our collection of quick and healthy lunch recipes. Perfect for work or home.'
        />
      </Head>

      <Breadcrumb />

      <div className='vr-category-hero'>
        <img
          src={HERO_IMAGE}
          alt={PAGE_TITLE}
          className='vr-category-hero__image'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/hero-banner2.jpg';
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
            allRecipes={allRecipes} // Populates lazily
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
            <h3 className='vr-category__title'>Lunch Recipes</h3>
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

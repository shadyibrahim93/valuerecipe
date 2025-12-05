import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';
import Breadcrumb from '../components/Breadcrumb';
import FilterPanel from '../components/FilterPanel';
import { REVALIDATE_TIME, BRAND_NAME } from '../lib/constants';
import SideBar from '../components/SideBar';
import AdSlot from '../components/AdSlot';

const PER_PAGE = 24;
const SERVING_TIME = 'breakfast';
const PAGE_TITLE = 'Best Breakfast Recipes & Easy Morning Ideas';
const HERO_IMAGE = '/images/categories/breakfast-category.webp';

// ----------------------------------------
// 1. SERVER SIDE BUILD (ISR)
// ----------------------------------------
export async function getStaticProps() {
  const baseSelect =
    'id, title, slug, image_url, rating, rating_count, total_time, cook_time, difficulty, serving_time, cuisine';

  // --- A. Query Logic ---
  const baseQuery = supabase
    .from('recipes')
    .select(baseSelect, { count: 'exact' })
    .ilike('serving_time', SERVING_TIME);

  // --- B. Fetch First Page (Limit 24) ---
  const {
    data: initialRecipes,
    count,
    error
  } = await baseQuery.range(0, PER_PAGE - 1);

  if (error) {
    console.error('ISR Error:', error);
    return { notFound: true };
  }

  // --- C. Fetch Max Time (for initial filter state) ---
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
    revalidate: REVALIDATE_TIME
  };
}

// ----------------------------------------
// 2. CLIENT SIDE COMPONENT
// ----------------------------------------
export default function BreakfastPage({
  initialRecipes = [],
  initialTotalCount = 0,
  initialMaxTime = 60
}) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Used by FilterPanel for counts/stats
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
  const isFirstRun = useRef(true);

  const BASE_SELECT =
    'id, title, slug, image_url, rating, rating_count, total_time, cook_time, difficulty, serving_time, cuisine';

  // ----------------------------------------
  // 3. LAZY LOAD FILTER DATA (direct from Supabase)
  // ----------------------------------------
  useEffect(() => {
    async function loadFilterData() {
      if (allRecipes.length > 0) return;

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(BASE_SELECT)
          .eq('serving_time', SERVING_TIME)
          .limit(300);

        if (error) {
          console.error('Failed to load filter data', error);
          return;
        }

        const base = data || [];
        setAllRecipes(base);

        const maxT =
          base.length > 0
            ? Math.max(...base.map((r) => r.total_time || r.cook_time || 0))
            : filters.maxTime;

        if (maxT > filters.maxTime) {
          setFilters((f) => ({ ...f, maxTime: maxT }));
        }
      } catch (err) {
        console.error('Failed to load filter data', err);
      }
    }

    const timer = setTimeout(loadFilterData, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRecipes.length]); // we intentionally ignore supabase / filters in deps

  // ----------------------------------------
  // 4. BUILD SUPABASE QUERY FOR A PAGE
  // ----------------------------------------
  const buildSupabaseQuery = (pageNumber) => {
    let query = supabase
      .from('recipes')
      .select(BASE_SELECT, { count: 'exact' })
      .eq('serving_time', SERVING_TIME);

    // Ingredients filter (same "ALL" logic you had in API)
    if (filters.ingredients.length > 0) {
      for (const slug of filters.ingredients) {
        const jsonFilter = JSON.stringify([{ image: slug }]);
        query = query.filter('ingredients', 'cs', jsonFilter);
      }
    }

    // Difficulty
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    // Max time
    if (filters.maxTime) {
      query = query.lte('total_time', filters.maxTime);
    }

    const from = (pageNumber - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;
    query = query.range(from, to);

    return query;
  };

  // ----------------------------------------
  // 5. FETCH RECIPES PAGE (Client Logic, direct from Supabase)
  // ----------------------------------------
  const fetchRecipesPage = async (pageNumber, replace = false) => {
    setIsLoading(true);

    try {
      const query = buildSupabaseQuery(pageNumber);
      const { data, error, count } = await query;

      if (error) {
        console.error('Failed to fetch recipes', error);
        return;
      }

      const pageData = data || [];
      const serverTotal = count ?? 0;

      setTotalCount(serverTotal);

      setRecipes((prev) => {
        const next = replace ? pageData : [...prev, ...pageData];

        // Determine if there's more to load
        if (
          pageData.length < PER_PAGE ||
          (serverTotal > 0 && next.length >= serverTotal)
        ) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        return next;
      });

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
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setRecipes([]);
    setPage(1);
    setHasMore(true);
    fetchRecipesPage(1, true); // replace = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.ingredients, filters.difficulty, filters.maxTime]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, page, filters]);

  return (
    <>
      <Head>
        <title>
          {PAGE_TITLE} | {BRAND_NAME}
        </title>
        <meta
          name='description'
          content='Start your day right with our best breakfast recipes. From quick eggs to fluffy pancakes.'
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
            e.target.src = '/images/hero-banner2.webp';
          }}
        />
        <div className='vr-category-hero__overlay'>
          <h1 className='vr-category-hero__title'>{PAGE_TITLE}</h1>
        </div>
      </div>

      <div className='vr-category-layout'>
        <FilterPanel
          allRecipes={allRecipes}
          difficultyOptions={['easy', 'medium', 'hard']}
          initialTimeRange={{ min: 0, max: 60 }}
          onFilterChange={setFilters}
        />

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

          <div className='vr-category__grid'>
            {recipes.map((r, index) => (
              <>
                <RecipeCard
                  key={r.id}
                  recipe={r}
                />

                {(index + 1) % 6 === 0 && (
                  <article className='vr-card vr-recipe-card vr-ad-card-wrapper'>
                    <AdSlot
                      id='101'
                      position='in-feed'
                      height='100%'
                    />
                  </article>
                )}
              </>
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

        <SideBar />
      </div>
    </>
  );
}

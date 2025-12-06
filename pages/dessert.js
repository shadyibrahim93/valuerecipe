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
const SERVING_TIME = 'dessert';
const PAGE_TITLE = 'Best Dessert Recipes & Easy Morning Ideas';
const HERO_IMAGE = '/images/categories/dessert-category.webp';

// ----------------------------------------
// 1. SERVER SIDE BUILD (ISR)
// ----------------------------------------
export async function getStaticProps() {
  // Include `ingredients` so FilterPanel can build ingredient pills
  const SAFE_COLUMNS =
    'id, title, slug, image_url, rating, rating_count, total_time, cook_time, difficulty, serving_time, cuisine, ingredients';

  // Fetch up to 300 dessert recipes for filters + first page
  const {
    data: allDessert,
    count,
    error
  } = await supabase
    .from('recipes')
    .select(SAFE_COLUMNS, { count: 'exact' })
    .ilike('serving_time', SERVING_TIME)
    .limit(300);

  if (error) {
    console.error('ISR Error:', error);
    return { notFound: true };
  }

  const safeAll = allDessert || [];

  // First page for initial render
  const initialRecipes = safeAll.slice(0, PER_PAGE);

  // Max time for initial filter range
  const initialMaxTime =
    safeAll.length > 0
      ? Math.max(...safeAll.map((r) => r.total_time || r.cook_time || 0))
      : 60;

  return {
    props: {
      initialRecipes,
      initialTotalCount: count || safeAll.length || 0,
      initialMaxTime,
      initialAllRecipes: safeAll
    },
    revalidate: REVALIDATE_TIME
  };
}

// ----------------------------------------
// 2. CLIENT SIDE COMPONENT
// ----------------------------------------
export default function DessertPage({
  initialRecipes = [],
  initialTotalCount = 0,
  initialMaxTime = 60,
  initialAllRecipes = []
}) {
  // Initialize state with Server Data (Instant Load!)
  const [recipes, setRecipes] = useState(initialRecipes);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Used by FilterPanel to calculate counts/stats.
  const [allRecipes] = useState(initialAllRecipes);

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
  // HELPER: BUILD QUERY STRING
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
  // FETCH RECIPES PAGE (Client Logic)
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
  // RESET + LOAD WHEN FILTERS CHANGE
  // ----------------------------------------
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setRecipes([]);
    setPage(1);
    setHasMore(true);
    fetchRecipesPage(1, true); // replace = true
  }, [filters]);

  // ----------------------------------------
  // INFINITE SCROLL
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
        <title>
          {PAGE_TITLE} | {BRAND_NAME}
        </title>
        <meta
          name='description'
          content='Start your day right with our best dessert recipes. From quick eggs to fluffy pancakes.'
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
          initialTimeRange={{ min: 0, max: initialMaxTime }}
          onFilterChange={setFilters}
        />

        <main
          className='vr-category-main'
          ref={listRef}
        >
          <div className='vr-category-main__header'>
            <h3 className='vr-category__title'>Dessert Recipes</h3>
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

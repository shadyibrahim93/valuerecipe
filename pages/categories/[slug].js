import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RecipeCard from '../../components/RecipeCard';
import Breadcrumb from '../../components/Breadcrumb';
import FilterPanel from '../../components/FilterPanel';
import MealPlanner from '../../components/MealPlanner';
import AdSlot from '../../components/AdSlot';
import { REVALIDATE_TIME } from '../../lib/constants';

const PER_PAGE = 24;

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const isTrending = slug === 'trending';
  const decodedSlug = decodeURIComponent(slug); // Handle spaces e.g. "South American"

  let query = supabase.from('recipes').select('*', { count: 'exact' });

  if (isTrending) {
    query = query
      .order('rating_count', { ascending: false })
      .order('rating', { ascending: false });
  } else {
    // 👇 FIX: Reverted to matching ONLY 'cuisine' to match your working client-side logic.
    // The previous .or(..., category...) failed because the 'category' column likely doesn't exist.
    query = query.ilike('cuisine', decodedSlug);
  }

  const {
    data: initialRecipes,
    count,
    error
  } = await query.range(0, PER_PAGE - 1);

  if (error) {
    console.error(`ISR Error for slug "${decodedSlug}":`, error.message);
    return { notFound: true };
  }

  // Fetch Max Time for filters (Consistency Fix)
  let timeQuery = supabase.from('recipes').select('total_time, cook_time');
  if (!isTrending) {
    timeQuery = timeQuery.ilike('cuisine', decodedSlug);
  }
  const { data: timeData } = await timeQuery.limit(100);
  const initialMaxTime = timeData
    ? Math.max(...timeData.map((r) => r.total_time || r.cook_time || 0))
    : 60;

  return {
    props: {
      slug: decodedSlug,
      isTrending,
      initialRecipes: initialRecipes || [],
      initialTotalCount: count || 0,
      initialMaxTime
    },
    revalidate: REVALIDATE_TIME || 3600
  };
}

export default function CategoryPage({
  slug,
  isTrending,
  initialRecipes = [],
  initialTotalCount = 0,
  initialMaxTime = 60
}) {
  const router = useRouter();

  const [recipes, setRecipes] = useState(initialRecipes);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
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

  const displayTitle = isTrending
    ? 'Trending Recipes'
    : (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '') + ' Recipes';

  const heroImage = `/images/categories/${slug?.toLowerCase()}-category.jpg`;

  // ----------------------------------------
  // 0. RESET STATE ON NAVIGATION
  // ----------------------------------------
  useEffect(() => {
    setRecipes(initialRecipes);
    setTotalCount(initialTotalCount);
    setFilters((prev) => ({
      ...prev,
      maxTime: initialMaxTime,
      ingredients: [],
      difficulty: null
    }));
    setPage(1);
    setHasMore(initialRecipes.length < initialTotalCount);
    setAllRecipes([]);
  }, [slug, initialRecipes]);

  // ----------------------------------------
  // 1. LOAD "ALL" RECIPES FOR FILTERS
  // ----------------------------------------
  useEffect(() => {
    async function loadFilterData() {
      if (!slug || allRecipes.length > 0) return;

      const params = new URLSearchParams();
      params.set('page', 1);
      params.set('per_page', 300);
      if (!isTrending) params.set('cuisine', slug);

      try {
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const json = await res.json();
        const base = json.data || [];
        setAllRecipes(base);

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

    const timer = setTimeout(loadFilterData, 500);
    return () => clearTimeout(timer);
  }, [slug, isTrending]);

  // ----------------------------------------
  // 2. HELPER: BUILD QUERY STRING
  // ----------------------------------------
  const buildQueryString = (pageNumber) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber);
    params.set('per_page', PER_PAGE);

    if (!isTrending && slug) params.set('cuisine', slug);

    if (filters.ingredients.length > 0)
      params.set('ingredients', filters.ingredients.join(','));

    if (filters.difficulty) params.set('difficulty', filters.difficulty);

    if (filters.maxTime) params.set('max_time', filters.maxTime);

    return params.toString();
  };

  // ----------------------------------------
  // 3. FETCH RECIPES PAGE
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 4. TRIGGER FETCH ON FILTER CHANGE
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
    listRef.current?.scrollIntoView({ behavior: 'smooth' });
    fetchRecipesPage(1, true);
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
  }, [hasMore, isLoading, page, filters, slug]);

  if (router.isFallback) {
    return <div className='vr-container'>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{displayTitle} | ValueRecipe</title>
        <meta
          name='description'
          content={`Browse delicious ${displayTitle} at ValueRecipe. Find easy, top-rated recipes.`}
        />
      </Head>

      <Breadcrumb />

      <div className='vr-category-hero'>
        <img
          src={heroImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/hero-banner2.jpg';
          }}
          alt={displayTitle}
          className='vr-category-hero__image'
        />
        <div className='vr-category-hero__overlay'>
          <h1 className='vr-category-hero__title'>{displayTitle}</h1>
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
            <h3 className='vr-category__title'>{displayTitle}</h3>
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
            <div className='vr-infinite-sentinel'>
              <span>You've reached the end!</span>
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

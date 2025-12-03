import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import RecipeCard from '../../components/RecipeCard';
import AdSlot from '../../components/AdSlot';
import Breadcrumb from '../../components/Breadcrumb';
import FilterPanel from '../../components/FilterPanel';
import MealPlanner from '../../components/MealPlanner';

const PER_PAGE = 24;

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

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

  const isTrending = slug === 'trending';
  const categoryTitle = isTrending
    ? 'Trending Recipes'
    : `${slug?.charAt(0).toUpperCase() + slug?.slice(1)} Recipes`;

  const heroImage = `/images/categories/${slug}-category.jpg`;

  // ----------------------------------------
  // LOAD ALL RECIPES FOR THIS CATEGORY (Option A)
  // ----------------------------------------
  const loadAllCategoryRecipes = async () => {
    if (!slug) return;

    const params = new URLSearchParams();
    params.set('page', 1);
    params.set('per_page', 300);

    if (!isTrending) params.set('cuisine', slug);

    const res = await fetch(`/api/recipes?${params.toString()}`);
    const json = await res.json();
    const base = json.data || [];

    setAllRecipes(base);

    const maxT = Math.max(...base.map((r) => r.total_time || r.cook_time || 0));

    setFilters((f) => ({ ...f, maxTime: maxT }));
  };

  useEffect(() => {
    loadAllCategoryRecipes();
  }, [slug]);

  // ----------------------------------------
  // BUILD QUERY STRING
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
  // FETCH RECIPES PAGE
  // ----------------------------------------
  const fetchRecipesPage = async (pageNumber, replace = false) => {
    if (!slug) return;
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

  // ----------------------------------------
  // RESET + LOAD WHEN FILTERS CHANGE
  // ----------------------------------------
  useEffect(() => {
    if (!filters.maxTime) return;
    if (!slug) return;

    setRecipes([]);
    setPage(1);
    setHasMore(true);

    listRef.current?.scrollIntoView({ behavior: 'smooth' });
    fetchRecipesPage(1, true);
  }, [filters, slug]);

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
  }, [hasMore, isLoading, page, filters, slug]);

  return (
    <>
      <Head>
        <title>{categoryTitle} | ValueRecipe</title>
      </Head>

      <Breadcrumb />

      <div className='vr-category-hero'>
        <img
          src={heroImage}
          alt={categoryTitle}
          className='vr-category-hero__image'
        />
        <div className='vr-category-hero__overlay'>
          <h1 className='vr-category-hero__title'>{categoryTitle}</h1>
        </div>
      </div>

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

        {/* MAIN CONTENT */}
        <main
          className='vr-category-main'
          ref={listRef}
        >
          <div className='vr-category-main__header'>
            <h3 className='vr-category__title'>{categoryTitle}</h3>
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
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className='vr-sidebar'>
          <MealPlanner />
          <AdSlot position='header' />
        </aside>
      </div>
    </>
  );
}

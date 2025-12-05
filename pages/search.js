// pages/search.js
import { BRAND_NAME, BRAND_URL, REVALIDATE_TIME } from '../lib/constants';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient'; // 👈 Added for Server Side Fetching
import RecipeCard from '../components/RecipeCard';
import CreateFromIngredients from '../components/CreateFromIngredients';
import Link from 'next/link';
import AdSlot from '../components/AdSlot';
import SideBar from '../components/SideBar';

// ----------------------------------------
// 1. SERVER SIDE BUILD (ISR) for TRENDING
// ----------------------------------------
export async function getStaticProps() {
  // 👇 THE SAFE COLUMN LIST
  const safeColumns =
    'id, title, slug, image_url, rating, rating_count, total_time, cook_time, difficulty, serving_time, cuisine';

  // Fetch Top Rated / Trending Recipes for the "Empty State"
  const { data: trendingRecipes } = await supabase
    .from('recipes')
    .select(safeColumns) // 👈 Optimized Selection
    .order('rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(11);

  return {
    props: {
      initialTrending: trendingRecipes || []
    },
    revalidate: REVALIDATE_TIME // Update trending list every 60s
  };
}

// ----------------------------------------
// 2. CLIENT SIDE COMPONENT
// ----------------------------------------
export default function SearchResultsPage({ initialTrending = [] }) {
  const router = useRouter();
  const { q } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // Default to false (we have trending data)

  /* ----------------------------------------
      LOAD SEARCH RESULTS (Client Side)
  ---------------------------------------- */
  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Note: We can't optimize this API call here without editing /api/search
    // But since it's a specific search, the result set is usually small anyway.
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  /* ----------------------------------------
      SEO METADATA
  ---------------------------------------- */
  const pageTitle = q
    ? `Search results for "${q}" — ${BRAND_NAME}`
    : `Search recipes — ${BRAND_NAME}`;

  const pageDescription = q
    ? `Browse recipe results for "${q}" on ${BRAND_NAME}. Discover curated recipes by ingredients, cuisine, and more.`
    : `Search thousands of recipes on ${BRAND_NAME} by keyword, ingredients, cuisine, and more.`;

  const metaKeywords = useMemo(() => {
    if (!q) return `recipe search, search recipes, ${BRAND_NAME}`;
    return `recipe search, search recipes, ${q}, ${BRAND_NAME}`;
  }, [q]);

  const canonicalUrl = q
    ? `${BRAND_URL}/search?q=${encodeURIComponent(q)}`
    : `${BRAND_URL}/search`;

  /* ----------------------------------------
      JSON-LD SCHEMA
  ---------------------------------------- */
  const searchSchema = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BRAND_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name='description'
          content={pageDescription}
        />
        <meta
          name='keywords'
          content={metaKeywords}
        />
        <meta
          name='author'
          content={`${BRAND_NAME} Editorial Team`}
        />
        <meta
          name='publisher'
          content={BRAND_NAME}
        />
        <link
          rel='canonical'
          href={canonicalUrl}
        />

        {/* OPEN GRAPH */}
        <meta
          property='og:title'
          content={pageTitle}
        />
        <meta
          property='og:description'
          content={pageDescription}
        />
        <meta
          property='og:type'
          content='website'
        />
        <meta
          property='og:url'
          content={canonicalUrl}
        />
        <meta
          property='og:image'
          content={`${BRAND_URL}/images/og-search.webp`}
        />
        <meta
          property='og:site_name'
          content={BRAND_NAME}
        />

        {/* TWITTER */}
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          name='twitter:title'
          content={pageTitle}
        />
        <meta
          name='twitter:description'
          content={pageDescription}
        />
        <meta
          name='twitter:image'
          content={`${BRAND_URL}/images/og-search.webp`}
        />

        {/* STRUCTURED DATA */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
        />
      </Head>

      <div className='vr-home-layout'>
        <div className='vr-category__container'>
          {/* SEARCH RESULTS SECTION */}
          <div className='vr-card'>
            <h1 className='vr-category__title'>
              {q ? `Search results for "${q}"` : 'Search recipes'}
            </h1>

            {loading ? (
              <p className='vr-search-results__empty'>Searching…</p>
            ) : results.length > 0 ? (
              <div className='vr-category__grid'>
                {results.map((recipe, index) => (
                  <>
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                    />
                    {/* Insert Ad after every 6th recipe */}
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
            ) : (
              <p className='vr-search-results__empty'>
                {q
                  ? `No recipes found for "${q}". Try checking the trending recipes below.`
                  : 'Enter a keyword above to find delicious recipes.'}
              </p>
            )}
          </div>

          {/* CREATE FROM INGREDIENTS */}
          <div className='vr-card'>
            <CreateFromIngredients />
          </div>

          {/* TRENDING NOW (Always visible, pre-loaded) */}
          <div className='vr-card'>
            <div className='vr-section'>
              <div className='vr-category__header'>
                <h3 className='vr-category__title'>Trending Recipes</h3>
                <Link
                  href={`/recipes`}
                  className='vr-category__link'
                >
                  View all recipes →
                </Link>
              </div>
              <div className='vr-category__grid'>
                {initialTrending.map((recipe, index) => (
                  <>
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                    />
                    {/* Insert Ad after every 6th recipe */}
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
            </div>
          </div>
        </div>

        <SideBar />
      </div>
    </>
  );
}

// pages/search.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import RecipeCard from '../components/RecipeCard';
import CreateFromIngredients from '../components/CreateFromIngredients';
import Link from 'next/link';

export default function SearchResultsPage() {
  const router = useRouter();
  const { q } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);

  /* ----------------------------------------
     LOAD SEARCH RESULTS
  ---------------------------------------- */
  useEffect(() => {
    if (!q) return;

    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.data || []);
        setLoading(false);
      });
  }, [q]);

  /* ----------------------------------------
     LOAD TOP-RATED TRENDING RECIPES
  ---------------------------------------- */
  const loadTrending = async () => {
    const res = await fetch(`/api/recipes?page=1&per_page=50`);
    const json = await res.json();
    let all = json.data || [];

    // Sort by rating DESC
    all.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Take top 8
    setTrending(all.slice(0, 8));
  };

  useEffect(() => {
    if (results.length === 0) {
      loadTrending();
    }
  }, [results]);

  /* ----------------------------------------
     SEO TITLE / DESCRIPTION / KEYWORDS
  ---------------------------------------- */
  const pageTitle = q
    ? `Search results for "${q}" — ValueRecipe`
    : 'Search recipes — ValueRecipe';

  const pageDescription = q
    ? `Browse recipe results for "${q}" on ValueRecipe. Discover curated recipes by ingredients, cuisine, and more.`
    : 'Search thousands of recipes on ValueRecipe by keyword, ingredients, cuisine, and more.';

  const metaKeywords = useMemo(() => {
    if (!q) return 'recipe search, search recipes, ValueRecipe';
    return `recipe search, search recipes, ${q}, ValueRecipe`;
  }, [q]);

  const canonicalUrl = q
    ? `https://valuerecipekitchen.com/search?q=${encodeURIComponent(q)}`
    : 'https://valuerecipekitchen.com/search';

  /* ----------------------------------------
     JSON-LD: SearchResultsPage schema
  ---------------------------------------- */
  const searchSchema = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://valuerecipekitchen.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <Head>
        {/* TITLE */}
        <title>{pageTitle}</title>

        {/* DESCRIPTION */}
        <meta
          name='description'
          content={pageDescription}
        />

        {/* KEYWORDS */}
        <meta
          name='keywords'
          content={metaKeywords}
        />

        {/* AUTHOR / PUBLISHER */}
        <meta
          name='author'
          content='ValueRecipe Editorial Team'
        />
        <meta
          name='publisher'
          content='ValueRecipe'
        />

        {/* CANONICAL */}
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
          content='https://valuerecipekitchen.com/images/og-search.jpg'
        />
        <meta
          property='og:site_name'
          content='ValueRecipe'
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
          content='https://valuerecipekitchen.com/images/og-search.jpg'
        />

        {/* STRUCTURED DATA: SearchResultsPage */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
        />
      </Head>

      <div className='vr-search-results'>
        <h1 className='vr-search-results__title'>
          {q ? `Search results for "${q}"` : 'Search recipes'}
        </h1>

        {/* RESULTS FOUND */}
        {loading ? (
          <p className='vr-search-results__empty'>Searching…</p>
        ) : results.length > 0 ? (
          <>
            <div className='vr-search-results__grid'>
              {results.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))}
            </div>
            <p className='vr-search-results__empty'>
              Don't like what you see? Create a recipe from ingredients you
              have!
            </p>
            <div className='vr-card'>
              <CreateFromIngredients />
            </div>
          </>
        ) : (
          <>
            {/* NO RESULTS FOUND MESSAGE */}
            <p className='vr-search-results__empty'>
              No recipes found. Try another keyword, or check below for recipe
              ideas.
            </p>

            {/* CREATE FROM INGREDIENTS */}
            <div className='vr-card'>
              <CreateFromIngredients />
            </div>

            {/* TRENDING NOW (TOP RATED) */}
            <div className='vr-card'>
              <div className='vr-category'>
                <h3 className='vr-category__title'>Trending Now</h3>

                <div className='vr-category__grid'>
                  {trending.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                    />
                  ))}
                </div>

                {/* VIEW MORE BUTTON - GOES TO HOME PAGE */}
                <div className='vr-viewmore'>
                  <Link href='/recipes'>
                    <button className='vr-viewmore__btn'>View More →</button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

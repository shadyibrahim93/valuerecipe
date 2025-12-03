// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';
import { supabase } from '../lib/supabaseClient'; // Make sure to import supabase
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import MealPlanner from '../components/MealPlanner';
import { useModal } from '../components/ModalContext';

// 👇 1. THIS RUNS ON THE SERVER (ISR)
export async function getStaticProps() {
  const PROPS_REVALIDATE = 60; // Update homepage at most once every 60 seconds

  // --- A. Fetch Top Rated (Efficiently via DB sort) ---
  const { data: topRated } = await supabase
    .from('recipes')
    .select('*')
    .order('rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(8);

  // --- B. Fetch a batch to determine Cuisines & Serving Times ---
  // We fetch a larger batch to find what tags/cuisines exist
  const { data: batchRecipes } = await supabase
    .from('recipes')
    .select('*')
    .limit(300); // 300 is enough to get a good spread of categories

  const all = batchRecipes || [];

  // 1. Process Serving Time Groups
  const servingTimeRecipes = all.reduce((acc, r) => {
    const key = r.serving_time?.trim();
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    if (acc[key].length < 6) acc[key].push(r);
    return acc;
  }, {});

  // 2. Process Unique Cuisines
  const uniqueCuisines = [
    ...new Set(all.map((r) => r.cuisine?.trim()).filter(Boolean))
  ].slice(0, 8); // Limit to top 8 cuisines

  // --- C. Fetch Recipes for those Specific Cuisines ---
  // We use Promise.all to fetch them in parallel (FAST)
  const cuisineRecipes = {};

  await Promise.all(
    uniqueCuisines.map(async (cuisine) => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('cuisine', cuisine)
        .limit(6);

      cuisineRecipes[cuisine] = data || [];
    })
  );

  return {
    props: {
      topRated: topRated || [],
      servingTimeRecipes,
      cuisines: uniqueCuisines,
      cuisineRecipes
    },
    revalidate: PROPS_REVALIDATE
  };
}

// 👇 2. COMPONENT NOW JUST RENDERS (Instant Load)
export default function Home({
  topRated = [],
  servingTimeRecipes = {},
  cuisines = [],
  cuisineRecipes = {}
}) {
  const { setShowIngredientsModal } = useModal();

  /* ----------------------------------------
      SEO KEYWORDS
  ---------------------------------------- */
  const metaKeywords = useMemo(() => {
    const cuisineKeywords = cuisines.join(', ');
    return `recipes, easy recipes, quick meals, dinner ideas, ${cuisineKeywords}, ValueRecipe`;
  }, [cuisines]);

  /* ----------------------------------------
      STRUCTURED DATA
  ---------------------------------------- */
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ValueRecipe',
    url: 'https://valuerecipekitchen.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://valuerecipekitchen.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ValueRecipe',
    url: 'https://valuerecipekitchen.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://valuerecipekitchen.com/logo.png'
    },
    sameAs: [
      'https://www.facebook.com/ValueRecipe',
      'https://www.instagram.com/ValueRecipe',
      'https://www.pinterest.com/ValueRecipe'
    ]
  };

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ValueRecipe — Discover delightful recipes',
    description:
      'Discover curated, fast, and fun recipes by cuisine, category, and difficulty.',
    url: 'https://valuerecipekitchen.com',
    hasPart: [
      {
        '@type': 'Collection',
        name: 'Top Rated Recipes',
        url: 'https://valuerecipekitchen.com/recipes?sort=top-rated'
      },
      ...cuisines.map((cuisineName) => ({
        '@type': 'Collection',
        name: `${cuisineName} Recipes`,
        url: `https://valuerecipekitchen.com/categories/${encodeURIComponent(
          cuisineName
        )}`
      }))
    ]
  };

  return (
    <>
      <Head>
        {/* BASIC SEO */}
        <title>ValueRecipe — Discover delightful recipes</title>
        <meta
          name='description'
          content='Discover curated, fast, and fun recipes by cuisine and category. Plan meals, cook from your pantry, and explore top-rated dishes on ValueRecipe.'
        />
        <meta
          name='keywords'
          content={metaKeywords}
        />
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
          href='https://valuerecipekitchen.com/'
        />

        {/* OPEN GRAPH */}
        <meta
          property='og:title'
          content='ValueRecipe — Discover delightful recipes'
        />
        <meta
          property='og:description'
          content='Explore top-rated recipes, browse by cuisine, plan meals, and find kitchen tools that make cooking easier.'
        />
        <meta
          property='og:image'
          content='https://valuerecipekitchen.com/images/og-home.jpg'
        />
        <meta
          property='og:url'
          content='https://valuerecipekitchen.com/'
        />
        <meta
          property='og:type'
          content='website'
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
          content='ValueRecipe — Discover delightful recipes'
        />
        <meta
          name='twitter:description'
          content='Find curated recipes, meal ideas, and kitchen essentials.'
        />
        <meta
          name='twitter:image'
          content='https://valuerecipekitchen.com/images/og-home.jpg'
        />

        {/* STRUCTURED DATA */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
        />
      </Head>

      {/* HERO */}
      <section className='vr-hero'>
        <img
          className='vr-hero__image'
          src='/images/hero-banner2.jpg'
          alt='Assorted plated dishes from different cuisines'
        />
        <div className='vr-hero__overlay'>
          <h1 className='vr-hero__title'>
            Discover Easy, Delicious Recipes for Every Day
          </h1>
          <p className='vr-hero__desc'>
            Find quick meals, explore global cuisines, plan your week, and get
            inspired to cook.
          </p>
          <div className='vr-hero__actions'>
            <button
              className='vr-hero__badge'
              onClick={() => setShowIngredientsModal(true)}
            >
              What Can I Cook?
            </button>
          </div>
        </div>
      </section>

      {/* MAIN HOME LAYOUT */}
      <div className='vr-home-layout'>
        <div className='vr-category__container'>
          {/* TOP RATED SECTION */}
          {topRated.length > 0 && (
            <section
              className='vr-section'
              aria-labelledby='top-rated-heading'
            >
              <div className='vr-category__header'>
                <h3 className='vr-category__title'>Trending Recipes</h3>
                <Link
                  href={`/recipes`}
                  className='vr-category__link'
                >
                  View all recipes →
                </Link>
              </div>
              <div className='vr-category-grid'>
                {topRated.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SERVING TIME SECTIONS */}
          {Object.keys(servingTimeRecipes).length > 0 && (
            <section
              className='vr-section vr-section--serving-time'
              aria-labelledby='serving-time-heading'
            >
              <div className='vr-cuisines-list'>
                {Object.entries(servingTimeRecipes).map(([time, recipes]) => (
                  <div
                    key={time}
                    className='vr-category'
                    itemScope
                    itemType='https://schema.org/ItemList'
                  >
                    <div className='vr-category__header'>
                      <h3 className='vr-category__title'>
                        {time.charAt(0).toUpperCase() + time.slice(1)} Recipes
                      </h3>
                      <Link
                        href={`/${time.toLowerCase()}`}
                        className='vr-category__link'
                      >
                        View all {time} recipes →
                      </Link>
                    </div>
                    <div className='vr-category__grid'>
                      {recipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CUISINE SECTIONS */}
          {cuisines.length > 0 && (
            <section
              className='vr-section vr-section--cuisines'
              aria-labelledby='cuisines-heading'
            >
              <div className='vr-cuisines-list'>
                {cuisines.map((cuisineName) => (
                  <div
                    key={cuisineName}
                    className='vr-category'
                    itemScope
                    itemType='https://schema.org/ItemList'
                  >
                    <div className='vr-category__header'>
                      <h3 className='vr-category__title'>
                        {cuisineName} Recipes
                      </h3>
                      <Link
                        href={`/categories/${encodeURIComponent(cuisineName)}`}
                        className='vr-category__link'
                      >
                        View all {cuisineName} recipes →
                      </Link>
                    </div>
                    <div className='vr-category__grid'>
                      {(cuisineRecipes[cuisineName] || []).map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside
          className='vr-sidebar'
          id='planner'
        >
          <MealPlanner />
          <AdSlot position='home-sidebar' />
        </aside>
      </div>
    </>
  );
}

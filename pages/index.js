// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import MealPlanner from '../components/MealPlanner';
import { useModal } from '../components/ModalContext';
import VRModal from '../components/VRModal';

export default function Home() {
  const [topRated, setTopRated] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [cuisineRecipes, setCuisineRecipes] = useState({});
  const [servingTimeRecipes, setServingTimeRecipes] = useState({});
  const { setShowIngredientsModal } = useModal();

  /* ----------------------------------------
     LOAD TOP-RATED RECIPES
  ---------------------------------------- */
  const loadTopRated = async () => {
    const res = await fetch('/api/recipes?page=1&per_page=8');
    const json = await res.json();
    const all = json.data || [];

    // Sort by rating DESC, then rating_count DESC as tiebreaker
    all.sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      const ca = a.rating_count || 0;
      const cb = b.rating_count || 0;
      return cb - ca;
    });

    setTopRated(all.slice(0, 10));
  };

  /* ----------------------------------------
     LOAD ALL By Serving Time (from many recipes)
  ---------------------------------------- */

  const loadServingTimeSections = async () => {
    const res = await fetch('/api/recipes?page=1&per_page=500');
    const json = await res.json();
    const all = json.data || [];

    const groups = all.reduce((acc, r) => {
      const key = r.serving_time?.trim();
      if (!key) return acc;

      if (!acc[key]) acc[key] = [];
      if (acc[key].length < 6) acc[key].push(r);

      return acc;
    }, {});

    setServingTimeRecipes(groups);
  };

  /* ----------------------------------------
     LOAD ALL CUISINES (from many recipes)
  ---------------------------------------- */
  const loadCuisines = async () => {
    const res = await fetch('/api/recipes?page=1&per_page=500');
    const json = await res.json();
    const base = json.data || [];

    const unique = [
      ...new Set(base.map((r) => r.cuisine?.trim()).filter(Boolean))
    ];

    // You can limit how many cuisines to feature on home (e.g. 8)
    setCuisines(unique.slice(0, 8));
  };

  useEffect(() => {
    loadTopRated();
    loadCuisines();
    loadServingTimeSections();
  }, []);

  /* ----------------------------------------
     LOAD RECIPES PER CUISINE
  ---------------------------------------- */
  const loadCuisineRecipes = async (cuisineName) => {
    const res = await fetch(
      `/api/recipes?cuisine=${encodeURIComponent(
        cuisineName
      )}&page=1&per_page=6`
    );
    const json = await res.json();

    setCuisineRecipes((prev) => ({
      ...prev,
      [cuisineName]: json.data || []
    }));
  };

  useEffect(() => {
    cuisines.forEach((c) => loadCuisineRecipes(c));
  }, [cuisines]);

  /* ----------------------------------------
     SEO KEYWORDS
  ---------------------------------------- */
  const metaKeywords = useMemo(() => {
    const cuisineKeywords = cuisines.join(', ');
    return `recipes, easy recipes, quick meals, dinner ideas, ${cuisineKeywords}, ValueRecipe`;
  }, [cuisines]);

  /* ----------------------------------------
     STRUCTURED DATA (SCHEMA.ORG)
  ---------------------------------------- */

  // WebSite schema with SearchAction (for sitelinks search box)
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

  // Organization schema
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

  // CollectionPage schema for homepage
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ValueRecipe — Discover delightful recipes',
    description:
      "Discover curated, fast, and fun recipes by cuisine, category, and difficulty. Plan meals, cook with ingredients you have, and find kitchen tools you'll love.",
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
      })),
      {
        '@type': 'Collection',
        name: 'Recommended Kitchen Essentials',
        url: 'https://valuerecipekitchen.com/#kitchen-essentials'
      }
    ]
  };

  /* ----------------------------------------
     AFFILIATE PRODUCTS (STATIC LIST)
     Use your Amazon affiliate tag format
  ---------------------------------------- */
  const affiliateProducts = [
    {
      name: 'Nonstick Skillet',
      description: 'Perfect for quick weeknight sautés, eggs, and pancakes.',
      url: 'https://www.amazon.com/s?k=nonstick+skillet&tag=valuerecipeki-20'
    },
    {
      name: 'Chef’s Knife',
      description: 'A sharp, reliable knife that makes prep work faster.',
      url: 'https://www.amazon.com/s?k=chef+knife&tag=valuerecipeki-20'
    },
    {
      name: 'Cutting Board Set',
      description: 'Durable boards to handle veggies, meat, and more.',
      url: 'https://www.amazon.com/s?k=cutting+board+set&tag=valuerecipeki-20'
    },
    {
      name: 'Sheet Pans',
      description: 'Roast veggies, bake cookies, and meal prep in batches.',
      url: 'https://www.amazon.com/s?k=sheet+pan&tag=valuerecipeki-20'
    }
  ];

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */
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
          content='Find curated recipes, meal ideas, and kitchen essentials to make cooking easier.'
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

          {/* AFFILIATE PRODUCTS SECTION
          <section
            className='vr-section vr-section--affiliates'
            id='kitchen-essentials'
            aria-labelledby='kitchen-essentials-heading'
          >
            <div className='vr-section__header'>
              <h2
                id='kitchen-essentials-heading'
                className='vr-section__title'
              >
                Recommended Kitchen Essentials
              </h2>
              <p className='vr-section__subtitle'>
                Tools we love that make cooking easier, faster, and more fun.
              </p>
            </div>

            <div className='vr-affiliate-grid'>
              {affiliateProducts.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='vr-affiliate-card'
                >
                  <h3 className='vr-affiliate-card__title'>{item.name}</h3>
                  <p className='vr-affiliate-card__desc'>{item.description}</p>
                  <span className='vr-affiliate-card__cta'>Shop now →</span>
                </a>
              ))}
            </div>
          </section>
         */}
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

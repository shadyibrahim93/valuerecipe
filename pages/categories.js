import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import Breadcrumb from '../components/Breadcrumb.js';
import MealPlanner from '../components/MealPlanner.js';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [cuisineRecipes, setCuisineRecipes] = useState({});

  /* ----------------------------------------
     Load Trending Recipes (First 8)
  ---------------------------------------- */
  const loadTrending = async () => {
    const res = await fetch(`/api/recipes?page=1&per_page=8`);
    const json = await res.json();
    setRecipes(json.data || []);
  };

  /* ----------------------------------------
     Load ALL cuisines
  ---------------------------------------- */
  const loadCuisines = async () => {
    const res = await fetch(`/api/recipes?page=1&per_page=500`);
    const json = await res.json();

    const unique = [
      ...new Set(
        (json.data || []).map((r) => r.cuisine?.trim()).filter(Boolean)
      )
    ];

    setCuisines(unique);
  };

  useEffect(() => {
    loadTrending();
    loadCuisines();
  }, []);

  /* ----------------------------------------
     Load Cuisine Recipes
  ---------------------------------------- */
  const loadCuisineRecipes = async (cuisineName) => {
    const res = await fetch(
      `/api/recipes?cuisine=${encodeURIComponent(
        cuisineName
      )}&page=1&per_page=8`
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
     SEO: keywords
  ---------------------------------------- */
  const metaKeywords = useMemo(() => {
    const cuisineKeywords = cuisines.join(', ');
    return `recipes, easy recipes, quick meals, ${cuisineKeywords}, ValueRecipe`;
  }, [cuisines]);

  /* ----------------------------------------
     JSON-LD SCHEMA
  ---------------------------------------- */

  // ⭐ Site Schema (Organization + Website)
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ValueRecipe',
    url: 'https://valuerecipekitchen.com',
    sameAs: [
      'https://facebook.com/ValueRecipe',
      'https://www.pinterest.com/ValueRecipe',
      'https://www.instagram.com/ValueRecipe'
    ],
    publisher: {
      '@type': 'Organization',
      name: 'ValueRecipe',
      logo: {
        '@type': 'ImageObject',
        url: 'https://valuerecipekitchen.com/logo.png'
      }
    }
  };

  // ⭐ Home Page Collection Schema
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ValueRecipe — Discover delightful recipes',
    description:
      'Explore curated, fast, and fun recipes from all cuisines. Meal ideas for breakfast, lunch, dinner, and more.',
    url: 'https://valuerecipekitchen.com',
    hasPart: cuisines.map((cuisineName) => ({
      '@type': 'Collection',
      name: `${cuisineName} Recipes`,
      url: `https://valuerecipekitchen.com/categories/${encodeURIComponent(
        cuisineName
      )}`
    }))
  };

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */
  return (
    <>
      <Head>
        {/* TITLE */}
        <title>ValueRecipe — Discover delightful recipes</title>

        {/* DESCRIPTION */}
        <meta
          name='description'
          content='Discover premium-quality recipes, curated by cuisine and category. Fast, easy, and delicious recipes for everyday cooking.'
        />

        {/* KEYWORDS */}
        <meta
          name='keywords'
          content={metaKeywords}
        />

        {/* AUTHOR + PUBLISHER META */}
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
          content='Explore curated, fast, and fun recipes for all cuisines.'
        />
        <meta
          property='og:image'
          content='https://valuerecipekitchen.com/images/cuisine.jpg'
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
          content='Explore curated, fun, and fast recipes for all cuisines.'
        />
        <meta
          name='twitter:image'
          content='https://valuerecipekitchen.com/images/cuisine.jpg'
        />

        {/* STRUCTURED DATA */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
        />
      </Head>

      <Breadcrumb recipe={cuisines} />

      {/* HERO SECTION */}
      <div className='vr-hero'>
        <img
          className='vr-hero__image'
          src='/images/cuisine.jpg'
          alt='hero'
        />
        <div className='vr-hero__overlay'>
          <h1 className='vr-hero__title'>
            Discover Delicious Recipes by Cuisine
          </h1>
          <p className='vr-hero__desc'>
            Discover premium-quality recipes, curated by cuisine and category.
            Fast, easy, and delicious recipes for everyday cooking.
          </p>

          <div className='vr-hero__actions'>
            <a
              className='vr-hero__badge'
              href='#planner'
            >
              What Can I Cook?
            </a>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className='vr-home-layout'>
        <div className='vr-category__container'>
          {cuisines.map((cuisineName) => (
            <section
              key={cuisineName}
              className='vr-category'
              itemScope
              itemType='https://schema.org/ItemList'
            >
              <h3 className='vr-category__title'>{cuisineName} Recipes</h3>

              <meta
                itemProp='name'
                content={`${cuisineName} Recipes`}
              />

              <div className='vr-category__grid'>
                {(cuisineRecipes[cuisineName] || []).map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                  />
                ))}
              </div>

              {(cuisineRecipes[cuisineName]?.length || 0) >= 8 && (
                <div className='vr-viewmore'>
                  <Link href={`/categories/${encodeURIComponent(cuisineName)}`}>
                    <button className='vr-viewmore__btn'>View More →</button>
                  </Link>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside
          className='vr-sidebar'
          id='planner'
        >
          <MealPlanner />
          <AdSlot position='header' />
        </aside>
      </div>
    </>
  );
}

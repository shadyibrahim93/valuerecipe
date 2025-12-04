import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import RecipeCard from '../components/RecipeCard';
import AdSlot from '../components/AdSlot';
import Breadcrumb from '../components/Breadcrumb.js';
import MealPlanner from '../components/MealPlanner.js';
import { useModal } from '../components/ModalContext';
import { BRAND_NAME, BRAND_URL } from '../lib/constants'; // BRAND_URL ADDED

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [cuisineRecipes, setCuisineRecipes] = useState({});
  const { setShowIngredientsModal } = useModal();

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
    return `recipes, easy recipes, quick meals, ${cuisineKeywords}, ${BRAND_NAME}`;
  }, [cuisines]);

  /* ----------------------------------------
      JSON-LD SCHEMA
  ---------------------------------------- */

  // ⭐ Site Schema (Organization + Website)
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME, // Updated
    url: BRAND_URL, // Updated
    sameAs: [
      `https://facebook.com/${BRAND_NAME}`, // Updated
      `https://www.pinterest.com/${BRAND_NAME}`, // Updated
      `https://www.instagram.com/${BRAND_NAME}` // Updated
    ],
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME, // Updated
      logo: {
        '@type': 'ImageObject',
        url: `${BRAND_URL}/logo.png` // Updated
      }
    }
  };

  // ⭐ Home Page Collection Schema
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${BRAND_NAME} — Discover delightful recipes`, // Updated
    description:
      'Explore curated, fast, and fun recipes from all cuisines. Meal ideas for breakfast, lunch, dinner, and more.',
    url: BRAND_URL, // Updated
    hasPart: cuisines.map((cuisineName) => ({
      '@type': 'Collection',
      name: `${cuisineName} Recipes`,
      url: `${BRAND_URL}/categories/${encodeURIComponent(
        // Updated URL structure
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
        <title>{BRAND_NAME} — Discover delightful recipes</title>{' '}
        {/* Updated */}
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
          content={`${BRAND_NAME} Editorial Team`} // Updated
        />
        <meta
          name='publisher'
          content={BRAND_NAME} // Updated
        />
        {/* CANONICAL */}
        <link
          rel='canonical'
          href={BRAND_URL} // Updated
        />
        {/* OPEN GRAPH */}
        <meta
          property='og:title'
          content={`${BRAND_NAME} — Discover delightful recipes`} // Updated
        />
        <meta
          property='og:description'
          content='Explore curated, fast, and fun recipes for all cuisines.'
        />
        <meta
          property='og:image'
          content={`${BRAND_URL}/images/cuisine.jpg`} // Updated
        />
        <meta
          property='og:url'
          content={BRAND_URL} // Updated
        />
        <meta
          property='og:type'
          content='website'
        />
        <meta
          property='og:site_name'
          content={BRAND_NAME} // Updated
        />
        {/* TWITTER */}
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          name='twitter:title'
          content={`${BRAND_NAME} — Discover delightful recipes`} // Updated
        />
        <meta
          name='twitter:description'
          content='Explore curated, fun, and fast recipes for all cuisines.'
        />
        <meta
          name='twitter:image'
          content={`${BRAND_URL}/images/cuisine.jpg`} // Updated
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
            <button
              className='vr-hero__badge'
              onClick={() => setShowIngredientsModal(true)}
            >
              What Can I Cook?
            </button>
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
              <div className='vr-category__header'>
                <h3 className='vr-category__title'>{cuisineName} Recipes</h3>
                <Link
                  href={`/categories/${encodeURIComponent(cuisineName)}`} // Corrected URL structure
                  className='vr-category__link'
                >
                  View all {cuisineName} recipes →
                </Link>
                <meta
                  itemProp='name'
                  content={`${cuisineName} Recipes`}
                />
              </div>

              <div className='vr-category__grid'>
                {(cuisineRecipes[cuisineName] || []).map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                  />
                ))}
              </div>
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

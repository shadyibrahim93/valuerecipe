// pages/recipes/[id].js
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import RecipePage from '../../components/RecipePage/RecipePage';
import { REVALIDATE_TIME, BRAND_NAME, BRAND_URL } from '../../lib/constants';

// 1. Tell Next.js how to handle these dynamic paths
export async function getStaticPaths() {
  // We return an empty array to keep build times fast.
  // 'blocking' means the first visitor will wait for the page to generate (SSR-style),
  // and every subsequent visitor will get the instant cached version.
  return {
    paths: [],
    fallback: 'blocking'
  };
}

// 2. Use StaticProps instead of ServerSideProps
export async function getStaticProps({ params }) {
  const { id } = params;

  // Query logic remains exactly the same
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', id)
    .single();

  if (!recipe || error) {
    return { notFound: true };
  }

  return {
    props: { recipe },
    // 👇 The Magic Speed Boost: Cache this page!
    // It will be treated as static, but re-generated in the background
    // if a new request comes in after 60 seconds.
    revalidate: REVALIDATE_TIME
  };
}

export default function RecipePageContainer({ recipe }) {
  const metaKeywords = Array.isArray(recipe.tags)
    ? recipe.tags.join(', ')
    : typeof recipe.tags === 'string'
    ? recipe.tags
    : '';

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    image: `${BRAND_URL}/images/recipes/${recipe.image_url}.jpg`,
    author: {
      '@type': 'Organization',
      name: 'ValueRecipe Editorial Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ValueRecipe',
      logo: {
        '@type': 'ImageObject',
        url: `${BRAND_URL}/logo.png`
      }
    },
    datePublished: recipe.created_at,
    description: recipe.description,
    recipeYield: `${recipe.servings} servings`,
    recipeCuisine: recipe.cuisine,
    prepTime: `PT${recipe.prep_time}M`,
    cookTime: `PT${recipe.cook_time}M`,
    totalTime: `PT${recipe.total_time}M`,
    recipeIngredient: (recipe.ingredients || []).map(
      (i) => `${i.quantity || ''} ${i.ingredient}`
    ),
    recipeInstructions: (recipe.instructions || []).map((s) => ({
      '@type': 'HowToStep',
      text: s.text
    })),
    ...(recipe.rating && recipe.rating_count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: recipe.rating,
            ratingCount: recipe.rating_count
          }
        }
      : {})
  };

  return (
    <>
      <Head>
        <title>
          {recipe.title} — {BRAND_NAME}
        </title>

        {/* DESCRIPTION */}
        <meta
          name='description'
          content={recipe.description}
        />

        {/* KEYWORDS using recipe.tags */}
        {metaKeywords && (
          <meta
            name='keywords'
            content={metaKeywords}
          />
        )}

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
          href={`${BRAND_URL}/recipes/${recipe.slug}`}
        />

        {/* OPEN GRAPH */}
        <meta
          property='og:title'
          content={`${recipe.title} — ${BRAND_NAME}`}
        />
        <meta
          property='og:description'
          content={recipe.description}
        />
        <meta
          property='og:image'
          content={`${BRAND_URL}/images/recipes/${recipe.image_url}.jpg`}
        />
        <meta
          property='og:url'
          content={`${BRAND_URL}/recipes/${recipe.slug}`}
        />
        <meta
          property='og:type'
          content='article'
        />
        <meta
          property='og:site_name'
          content='ValueRecipe'
        />

        {/* TWITTER CARDS */}
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          name='twitter:title'
          content={`${recipe.title} — ${BRAND_NAME}`}
        />
        <meta
          name='twitter:description'
          content={recipe.description}
        />
        <meta
          name='twitter:image'
          content={`${BRAND_URL}/images/recipes/${recipe.image_url}.jpg`}
        />
        <meta
          name='twitter:site'
          content='@ValueRecipe'
        />

        {/* PINTEREST */}
        <meta
          name='pin:media'
          content={`${BRAND_URL}/images/recipes/${recipe.image_url}.jpg`}
        />
        <meta
          name='pin:description'
          content={recipe.description}
        />

        {/* STRUCTURED DATA */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <RecipePage recipe={recipe} />
    </>
  );
}

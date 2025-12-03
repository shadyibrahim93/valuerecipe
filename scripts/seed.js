/**
 * seeds Supabase with demo recipes and ad slots
 * usage: npm run seed
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE env values in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
  console.log('Seeding demo data...');

  const recipes = [
    {
      title: 'Sunset Shakshuka',
      slug: 'sunset-shakshuka',
      description:
        'A playful twist on shakshuka with roasted cherry tomatoes and feta.',
      cuisine: 'Mediterranean',
      prep_time: 10,
      cook_time: 20,
      total_time: 30,
      servings: 2,
      difficulty: 'Easy',
      ingredients: [
        { ingredient: 'eggs', quantity: '4' },
        { ingredient: 'cherry tomatoes', quantity: '400g' },
        { ingredient: 'feta', quantity: '100g' },
        { ingredient: 'olive oil', quantity: '2 tbsp' }
      ],
      instructions: [
        {
          step: 1,
          text: 'Preheat oven to 375°F (190°C). Heat olive oil in a skillet.'
        },
        {
          step: 2,
          text: 'Add onions, garlic and tomatoes. Simmer until saucy.'
        },
        {
          step: 3,
          text: 'Crack eggs into tomato sauce and sprinkle feta. Bake 8-10 minutes.'
        }
      ],
      image_url: '/images/shakshuka.jpg',
      nutrition: { calories: 380 }
    },
    {
      title: 'Crispy Lemon Chicken',
      slug: 'crispy-lemon-chicken',
      description:
        'Crispy pan-fried chicken with a tangy lemon glaze. Quick and satisfying.',
      cuisine: 'American',
      prep_time: 15,
      cook_time: 20,
      total_time: 35,
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        { ingredient: 'chicken thighs', quantity: '4' },
        { ingredient: 'lemon', quantity: '2' },
        { ingredient: 'breadcrumbs', quantity: '1 cup' }
      ],
      instructions: [
        { step: 1, text: 'Season and dredge chicken in breadcrumbs.' },
        {
          step: 2,
          text: 'Pan fry until crispy and finish in oven with lemon slices.'
        }
      ],
      image_url: '/images/lemon-chicken.jpg',
      nutrition: { calories: 560 }
    }
  ];

  const ads = [
    {
      name: 'Header Promo',
      position: 'header',
      html_content:
        '<div style="padding:12px;border-radius:8px;background:linear-gradient(90deg,#fff2cc,#ffe6e6);text-align:center;">Sponsored by <strong>CookingCo</strong> — <a href="https://example.com" target="_blank" rel="noopener">Shop now</a></div>',
      affiliate_url: 'https://affiliate.example.com'
    },
    {
      name: 'Inline Native',
      position: 'inline',
      html_content:
        '<div style="padding:16px;border-radius:8px;border:1px solid #eee;">Try <em>TasteSpice</em> — get 15% off with code <strong>TASTE15</strong></div>'
    }
  ];

  try {
    for (const r of recipes) {
      await supabase.from('recipes').upsert(r);
    }
    for (const a of ads) {
      await supabase.from('ad_slots').upsert(a);
    }
    console.log('Seed complete');
  } catch (err) {
    console.error('Seed failed:', err);
  }
}

seed();

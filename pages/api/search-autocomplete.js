// pages/api/search-suggestions.js

import { getServerSupabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supa = getServerSupabase();
  const q = (req.query.q || '').toString().trim();

  const baseSelect = `
    id, title, slug, image_url, cuisine, total_time, difficulty, serving_time
  `;

  try {
    // NO SEARCH TERM → trending + best rated
    if (!q) {
      const { data: trending } = await supa
        .from('recipes')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(5);

      let bestRated = [];
      const { data: bestRatedRaw, error: bestError } = await supa
        .from('recipes')
        .select(baseSelect + ', rating, rating_count')
        .order('rating', { ascending: false, nullsLast: true })
        .order('rating_count', { ascending: false, nullsLast: true })
        .limit(3);

      bestRated =
        !bestError && bestRatedRaw
          ? bestRatedRaw
          : (trending || []).slice(0, 3);

      return res.status(200).json({
        autocomplete: [],
        trending: trending || [],
        bestRated,
        tags: {
          breakfast: [],
          lunch: [],
          dinner: []
        }
      });
    }

    // WITH SEARCH TERM → autocomplete searches
    const term = `%${q}%`;

    const orFilterText = [
      `title.ilike.${term}`,
      `cuisine.ilike.${term}`,
      `description.ilike.${term}`,
      `difficulty.ilike.${term}`,
      `serving_time.ilike.${term}`
    ].join(',');

    const ingredientFilter = `ingredients.cs.[{"ingredient":"${q.toLowerCase()}"}]`;
    const tagFilter = `tags.cs.[{"tag":"${q.toLowerCase()}"}]`;

    const { data: autocomplete, error: autoError } = await supa
      .from('recipes')
      .select(baseSelect)
      .or(`${orFilterText},${ingredientFilter},${tagFilter}`)
      .limit(12);

    if (autoError) throw autoError;

    // TAG SECTIONS
    const tagQuery = async (tag) => {
      const filter = JSON.stringify([{ tag }]);
      const { data } = await supa
        .from('recipes')
        .select(baseSelect)
        .filter('tags', 'cs', filter)
        .limit(6);
      return data || [];
    };

    const breakfast = await tagQuery('breakfast');
    const lunch = await tagQuery('lunch');
    const dinner = await tagQuery('dinner');

    // BEST RATED for this query
    const { data: bestRatedRaw, error: bestError } = await supa
      .from('recipes')
      .select(baseSelect + ', rating, rating_count')
      .or(`${orFilterText},${ingredientFilter},${tagFilter}`)
      .order('rating', { ascending: false, nullsLast: true })
      .order('rating_count', { ascending: false, nullsLast: true })
      .limit(3);

    const bestRated = !bestError
      ? bestRatedRaw
      : (autocomplete || []).slice(0, 3);

    // GLOBAL TRENDING
    const { data: trending, error: trendingError } = await supa
      .from('recipes')
      .select(baseSelect)
      .order('created_at', { ascending: false })
      .limit(5);

    if (trendingError) throw trendingError;

    // FINAL RESPONSE
    return res.status(200).json({
      autocomplete: autocomplete || [],
      tags: { breakfast, lunch, dinner },
      trending: trending || [],
      bestRated
    });
  } catch (err) {
    console.error('search-suggestions error', err);
    return res.status(500).json({ error: 'Failed to load suggestions' });
  }
}

import { getServerSupabase } from './supabaseClient.js';

export const fetchRecipes = async ({
  page = 1,
  per_page = 12,
  q,
  cuisine,
  ingredients
} = {}) => {
  const supa = getServerSupabase();
  let query = supa.from('recipes').select('*');
  if (q) query = query.ilike('title', `%${q}%`);
  if (cuisine) query = query.eq('cuisine', cuisine);
  // simple ingredient filter (any match)
  if (ingredients) {
    const ingArr = ingredients.split(',').map((i) => i.trim());
    // note: this is naive - for production use proper full text search
    query = query.or(
      ingArr.map((i) => `ingredients::text ilike '%${i}%'`).join(',')
    );
  }
  const offset = (page - 1) * per_page;
  const { data, error } = await query.range(offset, offset + per_page - 1);
  if (error) throw error;
  return data;
};

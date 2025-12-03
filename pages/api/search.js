import { getServerSupabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const supa = getServerSupabase();
  const { q } = req.query;

  try {
    if (!q) return res.status(400).json({ error: 'Missing query' });

    const term = `%${q}%`;

    const { data, error } = await supa
      .from('recipes')
      .select('*')
      .or(
        `title.ilike.${term},cuisine.ilike.${term},description.ilike.${term},difficulty.ilike.${term},serving_time.ilike.${term}`
      )
      .limit(40);

    if (error) {
      console.error('SEARCH ERROR:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('SERVER ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}

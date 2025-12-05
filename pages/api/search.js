import { getServerSupabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const supa = getServerSupabase();
  const { q } = req.query;

  try {
    if (!q) return res.status(400).json({ error: 'Missing query' });

    // 1. THE LOGIC TRICK
    // We replace spaces with " or " to broaden the search.
    // User types: "chicken pasta"
    // We send: "chicken or pasta"
    // The database finds ALL of them, but ranks the "Both" matches highest.
    const processedQuery = q.trim().split(/\s+/).join(' or ');

    // 2. Call the RPC function
    const { data, error } = await supa
      .rpc('search_recipes_ranked', { search_query: processedQuery })
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

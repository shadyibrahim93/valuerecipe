// pages/api/recipes/[id].js
import { getServerSupabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const supabase = getServerSupabase();
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data?.[0] || null });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const host = req.headers.host || '';
    const isLocalhost = host.startsWith('localhost');

    if (process.env.NODE_ENV === 'production' || !isLocalhost) {
      return res.status(403).json({
        error: 'Updates are only allowed from localhost in non-production.'
      });
    }

    try {
      // 1. 💡 Destructure to explicitly remove non-updatable columns
      const {
        ingredients_text, // Non-updatable/generated column
        search_vector,
        ...updatablePayload // Collect all remaining fields
      } = req.body || {};

      // 2. 💡 Use the sanitized payload for the database update
      const { data, error } = await supabase
        .from('recipes')
        .update(updatablePayload) // Pass the cleaned object
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE', 'PUT', 'PATCH']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

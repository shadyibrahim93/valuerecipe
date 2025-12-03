// pages/api/recipes/[id].js
import { getServerSupabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const supa = getServerSupabase();
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supa
      .from('recipes')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data?.[0] || null });
  }

  if (req.method === 'DELETE') {
    // protect - only service role allowed
    const { error } = await supa.from('recipes').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // 🔒 Only allow updates from localhost in non-production
    const host = req.headers.host || '';
    const isLocalhost = host.startsWith('localhost');

    if (process.env.NODE_ENV === 'production' || !isLocalhost) {
      return res.status(403).json({
        error: 'Updates are only allowed from localhost in non-production.'
      });
    }

    try {
      const payload = req.body || {};

      // Never let the client change these directly
      delete payload.id;
      delete payload.created_at;

      const { data, error } = await supa
        .from('recipes')
        .update(payload)
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

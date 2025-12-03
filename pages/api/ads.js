import { getServerSupabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const supa = getServerSupabase();
  const { data, error } = await supa
    .from('ad_slots')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ data });
}

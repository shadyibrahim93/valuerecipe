import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }]);

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ success: true });
}

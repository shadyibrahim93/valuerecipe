// pages/api/newsletter-unsubscribe.js
import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to unsubscribe' });
  }

  return res.status(200).json({ success: true });
}

// pages/api/newsletter-subscribe.js
import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  // Upsert (subscribe again if previously unsubscribed)
  const { error } = await supabase.from('newsletter_subscribers').upsert({
    email,
    unsubscribed: false
  });

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ success: true });
}

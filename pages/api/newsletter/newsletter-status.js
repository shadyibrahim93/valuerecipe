// pages/api/newsletter-status.js
import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ subscribed: false });

  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('email', email)
    .single();

  if (!data || data.unsubscribed) {
    return res.status(200).json({ subscribed: false });
  }

  return res.status(200).json({ subscribed: true });
}

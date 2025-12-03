import { getServerSupabase } from '../../lib/supabaseClient.js';
import cookie from 'cookie';
import { v4 as uuid } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { recipeId, rating } = req.body;

  if (!recipeId || !rating)
    return res.status(400).json({ error: 'Missing fields' });

  // ⭐ Ensure session cookie exists
  let cookies = cookie.parse(req.headers.cookie || '');
  let sessionId = cookies.vr_session;

  if (!sessionId) {
    sessionId = uuid();
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('vr_session', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    );
  }

  const supa = getServerSupabase();

  // Fetch existing rating
  const { data: recipe, error: fetchErr } = await supa
    .from('recipes')
    .select('rating, rating_count')
    .eq('id', recipeId)
    .single();

  if (fetchErr)
    return res.status(500).json({ error: 'Failed to fetch recipe' });

  const oldRating = recipe.rating || 0;
  const oldCount = recipe.rating_count || 0;

  const newCount = oldCount + 1;
  const newRating = (oldRating * oldCount + Number(rating)) / newCount;

  // Update DB
  const { error: updateErr } = await supa
    .from('recipes')
    .update({
      rating: newRating,
      rating_count: newCount
    })
    .eq('id', recipeId);

  if (updateErr)
    return res.status(500).json({ error: 'Failed to save rating' });

  return res.status(200).json({
    success: true,
    rating: newRating,
    rating_count: newCount
  });
}

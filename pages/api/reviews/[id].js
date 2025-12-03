// pages/api/rate.js
import { getServerSupabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supa = getServerSupabase();
    const { recipe_id, rating } = req.body;

    if (!recipe_id || !rating) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 1️⃣ Get current rating + count
    const { data: recipe, error: fetchError } = await supa
      .from('recipes')
      .select('rating, rating_count')
      .eq('id', recipe_id)
      .single();

    if (fetchError) throw fetchError;

    const oldRating = recipe.rating || 0;
    const oldCount = recipe.rating_count || 0;

    // 2️⃣ Calculate the new weighted average
    const newCount = oldCount + 1;
    const newRating = (oldRating * oldCount + rating) / newCount;

    // 3️⃣ Update in DB
    const { error: updateError } = await supa
      .from('recipes')
      .update({
        rating: newRating,
        rating_count: newCount
      })
      .eq('id', recipe_id);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      rating: newRating,
      rating_count: newCount
    });
  } catch (err) {
    console.error('RATE API ERROR:', err);
    return res.status(500).json({ error: 'Failed to update rating' });
  }
}

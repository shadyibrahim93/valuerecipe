import { supabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const { user_id, recipe_id } = req.body;

  if (!user_id || !recipe_id)
    return res.status(400).json({ error: 'Missing user_id or recipe_id' });

  // 1. Load the user’s favorites row
  const { data, error } = await supabase
    .from('user_collections')
    .select('*')
    .eq('user_id', user_id)
    .eq('name', 'favorites')
    .single();

  if (error && error.code !== 'PGRST116') {
    // error other than "no rows found"
    return res.status(500).json({ error: error.message });
  }

  // If no collection exists, create it
  if (!data) {
    const { error: insertError } = await supabase
      .from('user_collections')
      .insert({
        user_id,
        name: 'favorites',
        recipes: [recipe_id]
      });

    if (insertError)
      return res.status(500).json({ error: insertError.message });
    return res.status(200).json({ favorited: true });
  }

  // Collection exists → toggle recipe inside array
  const alreadyFav = data.recipes?.includes(recipe_id);

  const updatedRecipes = alreadyFav
    ? data.recipes.filter((id) => id !== recipe_id)
    : [...data.recipes, recipe_id];

  const { error: updateError } = await supabase
    .from('user_collections')
    .update({ recipes: updatedRecipes })
    .eq('id', data.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ favorited: !alreadyFav });
}

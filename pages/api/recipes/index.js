// pages/api/recipes/index.js
import { getServerSupabase } from '../../../lib/supabaseClient.js';

export default async function handler(req, res) {
  const service = getServerSupabase();

  if (req.method === 'GET') {
    try {
      // query params come in as strings
      const {
        page = '1',
        per_page = '12',
        cuisine,
        ingredients,
        difficulty,
        max_time,
        match_type = 'all'
      } = req.query;

      const pageNum = Number(page) || 1;
      const perPageNum = Number(per_page) || 12;

      let query = service.from('recipes').select('*', { count: 'exact' });

      /* ----------------------------------------
         CUISINE FILTER
      ---------------------------------------- */
      if (cuisine && cuisine !== 'trending') {
        query = query.ilike('cuisine', `%${cuisine}%`);
      }

      /* ----------------------------------------
         INGREDIENT SIMILARITY FILTER (JSONB)
      ---------------------------------------- */
      if (req.query.ingredients) {
        const list = req.query.ingredients
          .split(',')
          .map((str) => str.trim())
          .filter(Boolean);

        if (list.length > 0) {
          // MODE A: "ANY" (OR Logic) - Used for Similar Recipes
          if (match_type === 'any') {
            const orConditions = list
              .map(
                (slug) => `ingredients.cs.${JSON.stringify([{ image: slug }])}`
              )
              .join(',');

            query = query.or(orConditions);
          }
          // MODE B: "ALL" (AND Logic) - Default for Search/FilterPanel
          else {
            for (const slug of list) {
              const jsonFilter = JSON.stringify([{ image: slug }]);
              query = query.filter('ingredients', 'cs', jsonFilter);
            }
          }
        }
      }

      /* ----------------------------------------
         DIFFICULTY
      ---------------------------------------- */
      if (difficulty) {
        const list = difficulty.split(',').map((d) => d.trim());
        query = query.in('difficulty', list);
      }

      /* ----------------------------------------
         MAX COOK TIME
      ---------------------------------------- */
      if (max_time) {
        const maxTimeNum = Number(max_time);
        if (!Number.isNaN(maxTimeNum)) {
          query = query.lte('total_time', maxTimeNum);
        }
      }

      /* ----------------------------------------
        SERVING TIME FILTER
        ?serving_time=breakfast|lunch|dinner
      ---------------------------------------- */
      if (req.query.serving_time) {
        query = query.eq('serving_time', req.query.serving_time);
      }

      /* ----------------------------------------
         PAGINATION
      ---------------------------------------- */
      const offset = (pageNum - 1) * perPageNum;
      query = query.range(offset, offset + perPageNum - 1);

      const { data, error, count } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        data,
        total_pages: count != null ? Math.ceil(count / perPageNum) : 1,
        total_count: count ?? 0
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  /* ----------------------------------------
     POST
  ---------------------------------------- */
  if (req.method === 'POST') {
    const key = req.headers['x-api-key'];
    if (key !== process.env.RECIPE_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const payload = req.body;
      const { data, error } = await service
        .from('recipes')
        .insert([payload])
        .select();

      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

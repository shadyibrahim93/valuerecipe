import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { getFavoriteIds } from '../lib/favorites';

export default function Favorites() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ids = getFavoriteIds();
    if (!ids.length) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/recipes/by-ids?ids=${ids.join(',')}`);
        const json = await res.json();
        setRecipes(json.data || []);
      } catch (e) {
        console.error('Failed to fetch favorites', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className='vr-container'>
        <h1>Favorites</h1>
        <p>Loading your saved recipes…</p>
      </div>
    );
  }

  return (
    <div className='vr-container'>
      <h1>Favorites</h1>

      {recipes.length === 0 ? (
        <p style={{ marginTop: '0.75rem', color: 'var(--vr-muted)' }}>
          You haven’t saved any recipes yet. Tap the ♥ on a recipe card to add
          it here.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}

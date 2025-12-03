import { useState, useEffect } from 'react';

export default function RatingWidget({
  recipeId,
  initialRating,
  initialCount,
  onRated,
  disableSubmit = false,
  hideCount = false
}) {
  const [rating, setRating] = useState(initialRating || 0);
  const [count, setCount] = useState(initialCount || 0);
  const [hover, setHover] = useState(0);
  const [locked, setLocked] = useState(false);
  const [justRated, setJustRated] = useState(false);

  // Sync when props change
  useEffect(() => {
    setRating(initialRating || 0);
    setCount(initialCount || 0);
    setLocked(false);
    setJustRated(false);

    if (typeof window !== 'undefined') {
      const key = `vr-rated-${recipeId}`;
      if (localStorage.getItem(key)) {
        setLocked(true);
      }
    }
  }, [recipeId, initialRating, initialCount]);

  // 🔥 LISTEN for global rating updates
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.recipeId === recipeId) {
        setRating(e.detail.rating);
        setCount(e.detail.count);
      }
    };

    window.addEventListener('recipe-rating-updated', handler);
    return () => window.removeEventListener('recipe-rating-updated', handler);
  }, [recipeId]);

  // Auto-hide Thank You
  useEffect(() => {
    if (justRated) {
      const timer = setTimeout(() => setJustRated(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [justRated]);

  // Submit rating
  const submitRating = async (value) => {
    if (disableSubmit || locked) return;

    const res = await fetch('/api/rate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId, rating: value })
    });

    const data = await res.json();
    if (!data.success) return;

    setRating(data.rating);
    setCount(data.rating_count);

    // 🔊 BROADCAST UPDATE TO ALL WIDGETS
    window.dispatchEvent(
      new CustomEvent('recipe-rating-updated', {
        detail: {
          recipeId,
          rating: data.rating,
          count: data.rating_count
        }
      })
    );

    localStorage.setItem(`vr-rated-${recipeId}`, 'true');
    setLocked(true);
    setJustRated(true);

    if (onRated) onRated(data.rating);
  };

  return (
    <div className='vr-rating'>
      <div className='vr-rating__stars'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={(hover || rating) >= star ? 'vr-star filled' : 'vr-star'}
            onMouseEnter={() => !locked && !disableSubmit && setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submitRating(star)}
          >
            ★
          </span>
        ))}
      </div>

      <span className='vr-rating__text'>
        {rating.toFixed(1)}
        {!hideCount && ` (${count})`}
      </span>

      {justRated && (
        <span className='vr-rating__thanks'>Thank you, you're the best :)</span>
      )}
    </div>
  );
}

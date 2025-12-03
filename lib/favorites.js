// lib/favorites.js

const STORAGE_KEY = 'vr_favorites';

// Read list of favorite recipe IDs from localStorage
export function getFavoriteIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Save full list of favorite IDs
export function setFavoriteIds(ids) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// Check if a given ID is favorited
export function isFavorite(id) {
  const ids = getFavoriteIds();
  return ids.includes(id);
}

// Toggle a given ID in favorites and return new state (true if now favorited)
export function toggleFavorite(id) {
  const ids = getFavoriteIds();
  let next;
  if (ids.includes(id)) {
    next = ids.filter((v) => v !== id);
  } else {
    next = [...ids, id];
  }
  setFavoriteIds(next);
  return next.includes(id);
}

import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('srf-favorites');
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  const toggleFavorite = (dateKey: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      localStorage.setItem('srf-favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isFavorite = (dateKey: string) => favorites.has(dateKey);

  return {
    favorites: Array.from(favorites),
    toggleFavorite,
    isFavorite,
    count: favorites.size,
  };
}

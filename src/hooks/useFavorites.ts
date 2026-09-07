import { useState, useEffect } from 'react';
import { validateJournal } from '../lib/journal';
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () => {
      try {
        setFavorites(
          validateJournal({
            favorites: JSON.parse(localStorage.getItem('srf-favorites') ?? '[]')
          }).favorites!
        );
      } catch {
        setError('Saved readings could not be loaded.');
      }
    };
    load();
    window.addEventListener('journal-changed', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('journal-changed', load);
      window.removeEventListener('storage', load);
    };
  }, []);
  const toggleFavorite = (key: string) => {
    try {
      const current = validateJournal({
        favorites: JSON.parse(localStorage.getItem('srf-favorites') ?? '[]')
      }).favorites!;
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      localStorage.setItem('srf-favorites', JSON.stringify(next));
      setFavorites(next);
      setError('');
    } catch {
      setError('Could not save this favorite on this computer.');
    }
  };
  return {
    favorites,
    toggleFavorite,
    isFavorite: (key: string) => favorites.includes(key),
    count: favorites.length,
    error
  };
}

import { useState, useEffect, useCallback } from 'react';

export function useRandomQuote() {
  const [allDateKeys, setAllDateKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then((res) => res.json())
      .then((data) => setAllDateKeys(Object.keys(data.entries || data)))
      .catch((err) => console.error('Failed to load dates for random reading:', err));
  }, []);

  // Stable identity that still tracks the loaded keys — so a global keyboard
  // shortcut referencing it doesn't get stuck with the empty initial list.
  const getRandomDateKey = useCallback((): string | null => {
    if (allDateKeys.length === 0) return null;
    return allDateKeys[Math.floor(Math.random() * allDateKeys.length)];
  }, [allDateKeys]);

  return { getRandomDateKey };
}

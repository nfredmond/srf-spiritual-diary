import { useState, useEffect } from 'react';

export function useRandomQuote() {
  const [allDateKeys, setAllDateKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => {
        const keys = Object.keys(data.entries || data);
        setAllDateKeys(keys);
      });
  }, []);

  const getRandomDateKey = (): string | null => {
    if (allDateKeys.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allDateKeys.length);
    return allDateKeys[randomIndex];
  };

  return { getRandomDateKey };
}

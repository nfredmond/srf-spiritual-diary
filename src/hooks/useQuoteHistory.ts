import { useState, useEffect, useCallback } from 'react';

interface HistoryEntry {
  dateKey: string;
  timestamp: number;
}

const STORAGE_KEY = 'srf-quote-history';

export function useQuoteHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load quote history:', e);
      }
    }
  }, []);

  // Stable identity so App's visit-tracking effect doesn't see a new function
  // every render (which, combined with the state update below, produced an
  // infinite render loop / "Maximum update depth exceeded").
  const addToHistory = useCallback((dateKey: string) => {
    setHistory((prev) => {
      if (prev[0]?.dateKey === dateKey) return prev; // already the most recent — no change
      const filtered = prev.filter((e) => e.dateKey !== dateKey);
      const updated = [{ dateKey, timestamp: Date.now() }, ...filtered].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRecentHistory = useCallback((limit: number = 10) => history.slice(0, limit), [history]);

  return {
    history,
    addToHistory,
    getRecentHistory,
  };
}

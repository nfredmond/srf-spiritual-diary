import { useState, useEffect, useCallback } from 'react';
import { validateJournal } from '../lib/journal';
interface HistoryEntry {
  dateKey: string;
  timestamp: number;
}
const STORAGE_KEY = 'srf-quote-history';
const read = () =>
  validateJournal({
    quoteHistory: JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  }).quoteHistory!;
export function useQuoteHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const load = () => {
      try {
        setHistory(read());
      } catch {
        /* Preserve unreadable stored data. */
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
  const addToHistory = useCallback((dateKey: string) => {
    try {
      const prev = read();
      if (prev[0]?.dateKey === dateKey) return;
      const updated = [
        { dateKey, timestamp: Date.now() },
        ...prev.filter((e) => e.dateKey !== dateKey)
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {
      /* Reading stays available; existing progress is preserved. */
    }
  }, []);
  return {
    history,
    addToHistory,
    getRecentHistory: useCallback(
      (limit = 10) => history.slice(0, limit),
      [history]
    )
  };
}

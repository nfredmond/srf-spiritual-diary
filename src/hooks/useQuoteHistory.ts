import { useState, useEffect } from 'react';

interface HistoryEntry {
  dateKey: string;
  timestamp: number;
}

export function useQuoteHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('srf-quote-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load quote history:', e);
      }
    }
  }, []);

  const addToHistory = (dateKey: string) => {
    const newEntry: HistoryEntry = {
      dateKey,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove duplicates and keep only last 50 entries
      const filtered = prev.filter(e => e.dateKey !== dateKey);
      const updated = [newEntry, ...filtered].slice(0, 50);
      localStorage.setItem('srf-quote-history', JSON.stringify(updated));
      return updated;
    });
  };

  const getRecentHistory = (limit: number = 10) => {
    return history.slice(0, limit);
  };

  return {
    history,
    addToHistory,
    getRecentHistory,
  };
}

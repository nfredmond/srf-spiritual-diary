import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';

interface ReadingHistory {
  dates: string[];
  currentStreak: number;
  longestStreak: number;
  lastVisit: string;
}

const STORAGE_KEY = 'srf-reading-history';

export function useReadingStreak() {
  const [history, setHistory] = useState<ReadingHistory>({
    dates: [],
    currentStreak: 0,
    longestStreak: 0,
    lastVisit: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load reading history:', e);
      }
    }
  }, []);

  // Stable identity (useCallback with empty deps) so this can safely sit in an
  // effect dependency array without re-firing every render. Uses a functional
  // updater so it reads the already-loaded history from state rather than a
  // stale render-time closure — this is what previously reset the streak and
  // overwrote saved progress on every load.
  const recordVisit = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    setHistory((prev) => {
      if (prev.lastVisit === today) return prev; // already recorded today — no change

      const isConsecutive = prev.lastVisit === yesterday;
      const newDates = prev.dates.includes(today) ? prev.dates : [...prev.dates, today];
      const newCurrentStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const updated: ReadingHistory = {
        dates: newDates,
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(prev.longestStreak, newCurrentStreak),
        lastVisit: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    currentStreak: history.currentStreak,
    longestStreak: history.longestStreak,
    totalDays: history.dates.length,
    recordVisit,
  };
}

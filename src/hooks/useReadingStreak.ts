import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { validateJournal } from '../lib/journal';
import type { ReadingHistory } from '../lib/journal';
const STORAGE_KEY = 'srf-reading-history';
const empty: ReadingHistory = {
  dates: [],
  currentStreak: 0,
  longestStreak: 0,
  lastVisit: ''
};
const read = () => {
  const value = validateJournal({
    history: JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  }).history!;
  return Object.keys(value).length ? (value as ReadingHistory) : empty;
};
export function useReadingStreak() {
  const [history, setHistory] = useState<ReadingHistory>(empty);
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
  const recordVisit = useCallback(() => {
    try {
      const prev = read(),
        today = format(new Date(), 'yyyy-MM-dd'),
        yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      if (prev.lastVisit === today) return;
      const streak = prev.lastVisit === yesterday ? prev.currentStreak + 1 : 1;
      const updated = {
        dates: [...new Set([...prev.dates, today])],
        currentStreak: streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastVisit: today
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {
      /* Reading stays available; existing progress is preserved. */
    }
  }, []);
  return {
    currentStreak: history.currentStreak,
    longestStreak: history.longestStreak,
    totalDays: history.dates.length,
    recordVisit
  };
}

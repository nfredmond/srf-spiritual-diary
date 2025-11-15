import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ReadingHistory {
  dates: string[];
  currentStreak: number;
  longestStreak: number;
  lastVisit: string;
}

export function useReadingStreak() {
  const [history, setHistory] = useState<ReadingHistory>({
    dates: [],
    currentStreak: 0,
    longestStreak: 0,
    lastVisit: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('srf-reading-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load reading history:', e);
      }
    }
  }, []);

  const recordVisit = () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    if (history.lastVisit === today) {
      return; // Already recorded today
    }

    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const isConsecutive = history.lastVisit === yesterday;

    const newDates = [...history.dates, today];
    const newCurrentStreak = isConsecutive ? history.currentStreak + 1 : 1;
    const newLongestStreak = Math.max(history.longestStreak, newCurrentStreak);

    const updated = {
      dates: newDates,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastVisit: today,
    };

    setHistory(updated);
    localStorage.setItem('srf-reading-history', JSON.stringify(updated));
  };

  return {
    currentStreak: history.currentStreak,
    longestStreak: history.longestStreak,
    totalDays: history.dates.length,
    recordVisit,
  };
}

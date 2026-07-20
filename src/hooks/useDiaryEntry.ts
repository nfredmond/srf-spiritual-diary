import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { DiaryEntry, DiaryData } from '../types/DiaryEntry';
import { toMMDD } from '../lib/diaryDate';

// It's one static JSON file that never changes. This is the whole data layer.
async function loadEntry(dateKey: string): Promise<DiaryEntry | null> {
  const res = await fetch('/data/diary-entries.json');
  const data: DiaryData = await res.json();
  // Feb 29 has no printed entry — gently reuse Feb 28 on leap years.
  return data.entries[dateKey] ?? (dateKey === '02-29' ? data.entries['02-28'] ?? null : null);
}

export function useDiaryEntry(selectedDate: Date) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadEntry(toMMDD(selectedDate))
      .then((found) => {
        if (cancelled) return;
        setEntry(found);
        setError(found ? null : `No entry found for ${format(selectedDate, 'MMMM d')}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('Failed to load diary entry');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  return { entry, loading, error };
}

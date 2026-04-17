import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { DiaryEntry, DiaryData } from '../types/DiaryEntry';
import { getDiaryEntry, hasSupabaseConfig } from '../lib/supabase';
import { toMMDD } from '../lib/diaryDate';

type DataSource = 'auto' | 'supabase' | 'json';

function getDataSource(): DataSource {
  const raw = import.meta.env.VITE_SRF_DATA_SOURCE;
  if (raw === 'supabase' || raw === 'json' || raw === 'auto') return raw;
  return 'auto';
}

async function loadFromJson(dateKey: string): Promise<DiaryEntry | null> {
  const response = await fetch('/data/diary-entries.json');
  const data: DiaryData = await response.json();
  return data.entries[dateKey] ?? null;
}

export function useDiaryEntry(selectedDate: Date) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadEntry = async () => {
      const key = toMMDD(selectedDate);
      const source = getDataSource();
      const trySupabase = (source === 'supabase' || source === 'auto') && hasSupabaseConfig;

      try {
        setLoading(true);
        let found: DiaryEntry | null = null;

        if (trySupabase) {
          try {
            found = await getDiaryEntry(key);
          } catch (err) {
            console.warn('[useDiaryEntry] Supabase lookup failed, falling back to JSON', err);
          }
        }

        if (!found && source !== 'supabase') {
          found = await loadFromJson(key);
        }

        if (cancelled) return;

        if (found) {
          setEntry(found);
          setError(null);
        } else {
          setEntry(null);
          setError(`No entry found for ${format(selectedDate, 'MMMM d')}`);
        }
      } catch (err) {
        if (cancelled) return;
        setError('Failed to load diary entry');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEntry();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  return { entry, loading, error };
}

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { DiaryEntry, DiaryData } from '../types/DiaryEntry';

export function useDiaryEntry(selectedDate: Date) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        setLoading(true);
        
        // Import the diary data
        const response = await fetch('/data/diary-entries.json');
        const data: DiaryData = await response.json();
        
        // Get the key for this date
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        const foundEntry = data.entries[key];
        
        if (foundEntry) {
          setEntry(foundEntry);
          setError(null);
        } else {
          setError(`No entry found for ${format(selectedDate, 'MMMM d')}`);
        }
      } catch (err) {
        setError('Failed to load diary entry');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [selectedDate]);

  return { entry, loading, error };
}


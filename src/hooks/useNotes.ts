import { useState, useEffect } from 'react';

interface Note {
  dateKey: string;
  content: string;
  timestamp: number;
}

export function useNotes(dateKey: string) {
  const [note, setNote] = useState('');
  const [allNotes, setAllNotes] = useState<Record<string, Note>>({});

  useEffect(() => {
    const stored = localStorage.getItem('srf-notes');
    if (stored) {
      try {
        const notes = JSON.parse(stored);
        setAllNotes(notes);
        setNote(notes[dateKey]?.content || '');
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, [dateKey]);

  const saveNote = (content: string) => {
    const updated = {
      ...allNotes,
      [dateKey]: {
        dateKey,
        content,
        timestamp: Date.now(),
      },
    };

    if (content.trim() === '') {
      delete updated[dateKey];
    }

    setAllNotes(updated);
    setNote(content);
    localStorage.setItem('srf-notes', JSON.stringify(updated));
  };

  const hasNote = Object.keys(allNotes).includes(dateKey);
  const totalNotes = Object.keys(allNotes).length;

  return {
    note,
    saveNote,
    hasNote,
    totalNotes,
  };
}

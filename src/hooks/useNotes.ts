import { useState, useEffect } from 'react';
import { validateNotes, saveReflection, notifyJournal } from '../lib/journal';
export function useNotes(dateKey: string) {
  const [note, setNote] = useState('');
  const [hasNote, setHasNote] = useState(false);
  useEffect(() => {
    const load = () => {
      try {
        const notes = validateNotes(
          JSON.parse(localStorage.getItem('srf-notes') ?? '{}')
        );
        setNote(notes[dateKey]?.content ?? '');
        setHasNote(!!notes[dateKey]);
      } catch {
        setNote('');
        setHasNote(false);
      }
    };
    load();
    window.addEventListener('journal-changed', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('journal-changed', load);
      window.removeEventListener('storage', load);
    };
  }, [dateKey]);
  const saveNote = (content: string, original: string = note) => {
    saveReflection(localStorage, dateKey, content, original);
    setNote(content);
    setHasNote(true);
    notifyJournal();
  };
  return { note, saveNote, hasNote };
}

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Save, X } from 'lucide-react';

interface NotesPanelProps {
  dateKey: string;
  initialNote: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function NotesPanel({ dateKey, initialNote, onSave, onClose }: NotesPanelProps) {
  const [note, setNote] = useState(initialNote);
  const [lastSavedNote, setLastSavedNote] = useState(initialNote);
  const [isSaved, setIsSaved] = useState(false);
  const saveMessageTimeoutRef = useRef<number | null>(null);

  const hasUnsavedChanges = note !== lastSavedNote;

  const handleSave = () => {
    if (!hasUnsavedChanges) {
      return;
    }

    onSave(note);
    setLastSavedNote(note);
    setIsSaved(true);

    if (saveMessageTimeoutRef.current) {
      window.clearTimeout(saveMessageTimeoutRef.current);
    }

    saveMessageTimeoutRef.current = window.setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved reflections. Close without saving?'
      );

      if (!shouldDiscard) {
        return;
      }
    }

    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseRequest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (saveMessageTimeoutRef.current) {
        window.clearTimeout(saveMessageTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, note, lastSavedNote]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleCloseRequest}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="notes-modal bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-dialog-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="notes-dialog-title" className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Personal Reflections
          </h3>
          <button
            onClick={handleCloseRequest}
            className="notes-close-btn p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close reflections panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="notes-helper-text text-sm text-gray-600 mb-4">
          Write your thoughts, insights, or personal reflections on today&apos;s wisdom.
        </p>

        <label htmlFor="reflection-note" className="sr-only">
          Reflection notes for {dateKey}
        </label>
        <textarea
          id="reflection-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What does this quote mean to you? How can you apply it today?"
          className="notes-textarea w-full h-64 p-4 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue transition-colors resize-none"
          autoFocus
        />

        <div className="flex items-center justify-between mt-4 gap-4">
          <div>
            <p className="notes-meta-text text-sm text-gray-500">{note.length} characters</p>
            <p className={`text-xs mt-1 ${hasUnsavedChanges ? 'text-amber-700' : 'text-emerald-700'}`}>
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <Save className="w-5 h-5" />
            {isSaved ? 'Saved!' : 'Save Note'}
          </button>
        </div>

        <p className="notes-meta-text text-xs text-gray-500 mt-3" role="status" aria-live="polite">
          Tip: Press Ctrl/Cmd + S to save quickly.
        </p>

        <AnimatePresence>
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="notes-success mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-green-700 text-sm font-medium">
                Your reflection has been saved
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

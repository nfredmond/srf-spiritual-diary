import { useEffect, useRef, useState } from 'react';
import { BookOpen, Save, Feather, X } from 'lucide-react';
import { Modal } from '../Modal/Modal';

interface NotesPanelProps {
  dateKey: string;
  initialNote: string;
  onSave: (content: string) => void;
  onClose: () => void;
  prompt?: {
    quote: string;
    topic: string;
    weeklyTheme?: string | null;
  };
}

// Gentle, local reflection prompts. Nothing is sent anywhere — this honors the
// app's promise that your reflections never leave your device.
const REFLECTION_PROMPTS = [
  'Where did you feel the truth of this today?',
  'What is one small way you could live this reading?',
  'What feeling arose as you read this? Sit with it a moment.',
  'Is there someone you could hold in prayer as you reflect on this?',
  'What would gently change if you truly believed these words?',
  'What is this reading quietly asking you to release?',
];

export function NotesPanel({ dateKey, initialNote, onSave, onClose, prompt }: NotesPanelProps) {
  const [note, setNote] = useState(initialNote);
  const [lastSavedNote, setLastSavedNote] = useState(initialNote);
  const [isSaved, setIsSaved] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const promptIndexRef = useRef(0);
  const saveMessageTimeoutRef = useRef<number | null>(null);

  const hasUnsavedChanges = note !== lastSavedNote;

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    onSave(note);
    setLastSavedNote(note);
    setIsSaved(true);
    if (saveMessageTimeoutRef.current) window.clearTimeout(saveMessageTimeoutRef.current);
    saveMessageTimeoutRef.current = window.setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSuggestPrompt = () => {
    const topicPrompt = prompt?.topic
      ? `How might "${prompt.topic.toLowerCase()}" live in your day?`
      : null;
    const pool = topicPrompt ? [topicPrompt, ...REFLECTION_PROMPTS] : REFLECTION_PROMPTS;
    setSuggestedPrompt(pool[promptIndexRef.current % pool.length]);
    promptIndexRef.current += 1;
  };

  const handleUsePrompt = () => {
    if (!suggestedPrompt) return;
    const separator = note.trim() ? '\n\n' : '';
    setNote((prev) => `${prev}${separator}${suggestedPrompt}\n\n`);
    setSuggestedPrompt(null);
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm('You have unsaved reflections. Close without saving?');
      if (!shouldDiscard) return;
    }
    onClose();
  };

  // Ctrl/Cmd+S quick-save. (Escape and outside-click are handled by Modal, which
  // routes them through handleCloseRequest so the unsaved-changes guard still fires.)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (saveMessageTimeoutRef.current) window.clearTimeout(saveMessageTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, note, lastSavedNote]);

  return (
    <Modal
      onClose={handleCloseRequest}
      ariaLabel="Personal reflections"
      panelClassName="notes-modal w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-2xl text-srf-blue">
          <BookOpen className="h-6 w-6" />
          Personal Reflections
        </h3>
        <button
          onClick={handleCloseRequest}
          className="notes-close-btn rounded-full p-2 transition-colors hover:bg-srf-lotus/40"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <p className="notes-helper-text mb-4 text-sm text-gray-600">
        Write your thoughts, insights, or reflections on today&apos;s reading.
      </p>

      {prompt && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleSuggestPrompt}
            className="inline-flex items-center gap-2 rounded-full border border-srf-gold/40 bg-white px-4 py-2 text-sm font-medium text-srf-blue transition-colors hover:bg-srf-lotus/30"
          >
            <Feather className="h-4 w-4" />
            {suggestedPrompt ? 'Another prompt' : 'Suggest a reflection'}
          </button>
          {suggestedPrompt && (
            <div className="mt-3 rounded-lg border border-srf-gold/30 bg-srf-lotus/20 p-3">
              <p className="text-sm italic text-srf-blue">{suggestedPrompt}</p>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleUsePrompt}
                  className="text-xs font-medium text-srf-blue hover:underline"
                >
                  Use in my reflection
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestedPrompt(null)}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <label htmlFor="reflection-note" className="sr-only">
        Reflection notes for {dateKey}
      </label>
      <textarea
        id="reflection-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What does this reading mean to you? How might you live it today?"
        className="notes-textarea h-64 w-full resize-none rounded-xl border-2 border-srf-blue/20 p-4 transition-colors focus:border-srf-blue focus:outline-none"
        autoFocus
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="notes-meta-text text-sm text-gray-500">{note.length} characters</p>
          <p className={`mt-1 text-xs ${hasUnsavedChanges ? 'text-muted' : 'text-gold-accent'}`}>
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="flex items-center gap-2 rounded-full bg-srf-blue px-6 py-3 font-medium text-white transition-all hover:bg-srf-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {isSaved ? 'Saved!' : 'Save Note'}
        </button>
      </div>

      <p className="notes-meta-text mt-3 text-xs text-gray-500" role="status" aria-live="polite">
        Tip: Press Ctrl/Cmd + S to save quickly.
      </p>

      {isSaved && (
        <div
          className="notes-success mt-4 rounded-lg border border-srf-gold/30 bg-srf-lotus/40 p-3 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-srf-blue">Your reflection has been saved</p>
        </div>
      )}
    </Modal>
  );
}

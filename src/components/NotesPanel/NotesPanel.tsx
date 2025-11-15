import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Save, X } from 'lucide-react';

interface NotesPanelProps {
  dateKey: string;
  initialNote: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function NotesPanel({ initialNote, onSave, onClose }: NotesPanelProps) {
  const [note, setNote] = useState(initialNote);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Personal Reflections
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Write your thoughts, insights, or personal reflections on today's wisdom
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What does this quote mean to you? How can you apply it today?"
          className="w-full h-64 p-4 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue transition-colors resize-none"
          autoFocus
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            {note.length} characters
          </p>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            <Save className="w-5 h-5" />
            {isSaved ? 'Saved!' : 'Save Note'}
          </button>
        </div>

        <AnimatePresence>
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
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

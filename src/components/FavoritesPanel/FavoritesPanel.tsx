import { motion } from 'framer-motion';
import { Heart, Calendar, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface FavoritesPanelProps {
  favorites: string[];
  onSelectDate: (dateKey: string) => void;
  onClose: () => void;
}

export function FavoritesPanel({ favorites, onSelectDate, onClose }: FavoritesPanelProps) {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => setEntries(data.entries || data));
  }, []);

  const favoriteEntries = favorites
    .map(dateKey => ({ dateKey, entry: entries[dateKey] }))
    .filter(item => item.entry);

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
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Favorite Quotes ({favorites.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {favoriteEntries.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No favorites yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Click the heart icon on quotes to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteEntries.map(({ dateKey, entry }) => {
              const [month, day] = dateKey.split('-');
              const date = new Date(2024, parseInt(month) - 1, parseInt(day));
              const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

              return (
                <button
                  key={dateKey}
                  onClick={() => {
                    onSelectDate(dateKey);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-white rounded-lg hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-srf-gold mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-srf-blue">{dateStr}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-srf-gold">{entry.topic}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900 transition-colors italic">
                        "{entry.quote}"
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

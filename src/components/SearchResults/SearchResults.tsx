import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface SearchResultsProps {
  results: Array<{ dateKey: string; entry: DiaryEntry }>;
  onSelectDate: (dateKey: string) => void;
}

export function SearchResults({ results, onSelectDate }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card max-w-4xl mx-auto mb-6 max-h-96 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg text-srf-blue flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
        </h3>
      </div>

      <div className="space-y-3">
        {results.map(({ dateKey, entry }) => {
          const [month, day] = dateKey.split('-');
          const displayDate = new Date(2024, parseInt(month) - 1, parseInt(day));
          const dateStr = displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className="w-full text-left p-4 bg-gradient-to-r from-srf-white to-srf-lotus/10 rounded-lg hover:from-srf-lotus/20 hover:to-srf-lotus/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-srf-gold mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-srf-blue">{dateStr}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-srf-gold">{entry.topic}</span>
                  </div>
                  {entry.weeklyTheme && (
                    <p className="text-xs text-gray-500 mb-2">Theme: {entry.weeklyTheme}</p>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900 transition-colors">
                    {entry.quote}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

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
    <div className="anim-fade-in card max-w-4xl mx-auto mb-6 max-h-96 overflow-y-auto">
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
              className="w-full text-left p-4 bg-srf-white rounded-lg hover:bg-srf-lotus/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gold-accent mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-srf-blue">{dateStr}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gold-accent">{entry.topic}</span>
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
    </div>
  );
}

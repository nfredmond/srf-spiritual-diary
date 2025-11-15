import { motion } from 'framer-motion';
import { X, Calendar, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface QuoteComparisonProps {
  initialDateKey: string;
  onClose: () => void;
}

export function QuoteComparison({ initialDateKey, onClose }: QuoteComparisonProps) {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [date1, setDate1] = useState(initialDateKey);
  const [date2, setDate2] = useState('');

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => setEntries(data.entries || data));
  }, []);

  const formatDateDisplay = (dateKey: string) => {
    if (!dateKey) return '';
    const [month, day] = dateKey.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const entry1 = entries[date1];
  const entry2 = date2 ? entries[date2] : null;

  const findCommonalities = () => {
    if (!entry1 || !entry2) return [];

    const commonalities: string[] = [];

    if (entry1.weeklyTheme === entry2.weeklyTheme) {
      commonalities.push(`Same weekly theme: ${entry1.weeklyTheme}`);
    }

    if (entry1.book === entry2.book) {
      commonalities.push(`Same source book: ${entry1.book}`);
    }

    const words1 = entry1.quote.toLowerCase().split(/\s+/);
    const words2 = entry2.quote.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w) && w.length > 4);

    if (commonWords.length > 3) {
      commonalities.push(`Shared concepts: ${commonWords.slice(0, 5).join(', ')}`);
    }

    return commonalities;
  };

  const commonalities = findCommonalities();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6" />
            Compare Quotes
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Date Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Quote
            </label>
            <select
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
            >
              {Object.keys(entries).sort().map(key => (
                <option key={key} value={key}>
                  {formatDateDisplay(key)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Second Quote
            </label>
            <select
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
            >
              <option value="">Select a quote...</option>
              {Object.keys(entries).sort().filter(k => k !== date1).map(key => (
                <option key={key} value={key}>
                  {formatDateDisplay(key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison View */}
        {entry1 && entry2 ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Quote 1 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-srf-blue" />
                  <span className="text-sm font-medium text-gray-600">
                    {formatDateDisplay(date1)}
                  </span>
                </div>
                <h4 className="font-heading text-lg text-srf-blue mb-2">{entry1.topic}</h4>
                {entry1.weeklyTheme && (
                  <p className="text-sm text-srf-gold mb-3">Theme: {entry1.weeklyTheme}</p>
                )}
                <blockquote className="text-sm italic text-gray-700 mb-3">
                  "{entry1.quote}"
                </blockquote>
                <p className="text-xs text-gray-500">— {entry1.source}</p>
                {entry1.book && <p className="text-xs text-gray-400 mt-1">{entry1.book}</p>}
              </div>

              {/* Quote 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-srf-blue" />
                  <span className="text-sm font-medium text-gray-600">
                    {formatDateDisplay(date2)}
                  </span>
                </div>
                <h4 className="font-heading text-lg text-srf-blue mb-2">{entry2.topic}</h4>
                {entry2.weeklyTheme && (
                  <p className="text-sm text-srf-gold mb-3">Theme: {entry2.weeklyTheme}</p>
                )}
                <blockquote className="text-sm italic text-gray-700 mb-3">
                  "{entry2.quote}"
                </blockquote>
                <p className="text-xs text-gray-500">— {entry2.source}</p>
                {entry2.book && <p className="text-xs text-gray-400 mt-1">{entry2.book}</p>}
              </div>
            </div>

            {/* Commonalities */}
            {commonalities.length > 0 && (
              <div className="bg-gradient-to-r from-srf-blue/10 to-srf-gold/10 rounded-xl p-4 border border-srf-gold/30">
                <h5 className="font-heading text-sm text-srf-blue mb-2">Common Themes & Connections:</h5>
                <ul className="space-y-1">
                  {commonalities.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-srf-gold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select two quotes to compare and find connections</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

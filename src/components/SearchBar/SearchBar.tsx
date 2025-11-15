import { useState, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface SearchBarProps {
  onSearchResults: (results: Array<{ dateKey: string; entry: DiaryEntry }>) => void;
  onClose: () => void;
}

export function SearchBar({ onSearchResults, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'theme'>('text');
  const [allEntries, setAllEntries] = useState<Record<string, DiaryEntry>>({});
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    // Load all diary entries
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => {
        setAllEntries(data.entries || data);

        // Extract unique themes
        const uniqueThemes = new Set<string>();
        Object.values(data.entries || data).forEach((entry: any) => {
          if (entry.weeklyTheme) uniqueThemes.add(entry.weeklyTheme);
          if (entry.topic) uniqueThemes.add(entry.topic);
        });
        setThemes(Array.from(uniqueThemes).sort());
      });
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      onSearchResults([]);
      return;
    }

    const results: Array<{ dateKey: string; entry: DiaryEntry }> = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(allEntries).forEach(([dateKey, entry]) => {
      if (searchType === 'text') {
        // Full-text search
        const searchableText = `${entry.quote} ${entry.topic} ${entry.weeklyTheme}`.toLowerCase();
        if (searchableText.includes(lowerQuery)) {
          results.push({ dateKey, entry });
        }
      } else {
        // Theme search
        const themeText = `${entry.topic} ${entry.weeklyTheme}`.toLowerCase();
        if (themeText.includes(lowerQuery)) {
          results.push({ dateKey, entry });
        }
      }
    });

    onSearchResults(results.slice(0, 20)); // Limit to top 20 results
  }, [query, searchType, allEntries, onSearchResults]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card max-w-4xl mx-auto mb-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === 'text' ? "Search quotes, topics, themes..." : "Search by theme or topic..."}
            className="w-full pl-10 pr-4 py-3 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue transition-colors"
            autoFocus
          />
        </div>

        <button
          onClick={() => setSearchType(searchType === 'text' ? 'theme' : 'text')}
          className="px-4 py-3 bg-srf-gold/10 text-srf-gold rounded-xl hover:bg-srf-gold/20 transition-colors font-medium flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {searchType === 'text' ? 'Text' : 'Theme'}
        </button>

        <button
          onClick={onClose}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Popular Themes */}
      {query.length === 0 && searchType === 'theme' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Popular Themes:</p>
          <div className="flex flex-wrap gap-2">
            {themes.slice(0, 12).map(theme => (
              <button
                key={theme}
                onClick={() => setQuery(theme)}
                className="px-3 py-1 bg-srf-lotus/20 text-srf-blue rounded-full text-sm hover:bg-srf-lotus/40 transition-colors"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

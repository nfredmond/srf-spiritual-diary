import { motion } from 'framer-motion';
import { X, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface AdvancedFilterProps {
  onFilterResults: (results: Array<{ dateKey: string; entry: DiaryEntry }>) => void;
  onClose: () => void;
}

export function AdvancedFilter({ onFilterResults, onClose }: AdvancedFilterProps) {
  const [allEntries, setAllEntries] = useState<Record<string, DiaryEntry>>({});
  const [filters, setFilters] = useState({
    book: '',
    weeklyTheme: '',
    specialDay: false,
    dateFrom: '',
    dateTo: '',
  });

  const [availableFilters, setAvailableFilters] = useState({
    books: [] as string[],
    themes: [] as string[],
  });

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => {
        const entries = data.entries || data;
        setAllEntries(entries);

        // Extract unique books and themes
        const books = new Set<string>();
        const themes = new Set<string>();

        Object.values(entries).forEach((entry: any) => {
          if (entry.book) books.add(entry.book);
          if (entry.weeklyTheme) themes.add(entry.weeklyTheme);
        });

        setAvailableFilters({
          books: Array.from(books).sort(),
          themes: Array.from(themes).sort(),
        });
      });
  }, []);

  const handleFilter = () => {
    const results: Array<{ dateKey: string; entry: DiaryEntry }> = [];

    Object.entries(allEntries).forEach(([dateKey, entry]) => {
      let matches = true;

      // Book filter
      if (filters.book && entry.book !== filters.book) {
        matches = false;
      }

      // Weekly theme filter
      if (filters.weeklyTheme && entry.weeklyTheme !== filters.weeklyTheme) {
        matches = false;
      }

      // Special day filter
      if (filters.specialDay && !entry.specialDay) {
        matches = false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const [month, day] = dateKey.split('-').map(Number);
        const entryDate = new Date(2024, month - 1, day);

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (entryDate < fromDate) matches = false;
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          if (entryDate > toDate) matches = false;
        }
      }

      if (matches) {
        results.push({ dateKey, entry });
      }
    });

    onFilterResults(results);
  };

  const handleReset = () => {
    setFilters({
      book: '',
      weeklyTheme: '',
      specialDay: false,
      dateFrom: '',
      dateTo: '',
    });
    onFilterResults([]);
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Advanced Filters
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Book Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Source
            </label>
            <select
              value={filters.book}
              onChange={(e) => setFilters({ ...filters, book: e.target.value })}
              className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
            >
              <option value="">All Books</option>
              {availableFilters.books.map(book => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
          </div>

          {/* Weekly Theme Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Theme
            </label>
            <select
              value={filters.weeklyTheme}
              onChange={(e) => setFilters({ ...filters, weeklyTheme: e.target.value })}
              className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
            >
              <option value="">All Themes</option>
              {availableFilters.themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Special Day Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.specialDay}
                onChange={(e) => setFilters({ ...filters, specialDay: e.target.checked })}
                className="w-4 h-4 text-srf-blue rounded focus:ring-srf-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                Special Days Only
              </span>
            </label>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-2 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleFilter}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            <Search className="w-5 h-5" />
            Apply Filters
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Combine multiple filters to find exactly what you're looking for
        </p>
      </motion.div>
    </motion.div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { DiaryData, DiaryEntry } from '../../types/DiaryEntry';
import { fromMMDD } from '../../lib/diaryDate';

interface WeeklyThemeViewProps {
  currentDateKey: string;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

interface ThemeGroup {
  theme: string;
  startKey: string;
  endKey: string;
  entries: Array<{ dateKey: string; entry: DiaryEntry }>;
}

function buildThemeGroups(data: DiaryData): ThemeGroup[] {
  const sortedKeys = Object.keys(data.entries).sort();
  const groups: ThemeGroup[] = [];
  let current: ThemeGroup | null = null;

  for (const dateKey of sortedKeys) {
    const entry = data.entries[dateKey];
    const theme = entry.weeklyTheme ?? entry.topic;
    if (current && current.theme === theme) {
      current.entries.push({ dateKey, entry });
      current.endKey = dateKey;
    } else {
      if (current) groups.push(current);
      current = { theme, startKey: dateKey, endKey: dateKey, entries: [{ dateKey, entry }] };
    }
  }
  if (current) groups.push(current);
  return groups;
}

function formatKey(dateKey: string): string {
  return format(fromMMDD(dateKey, 2024), 'MMM d');
}

export function WeeklyThemeView({ currentDateKey, onSelectDate, onClose }: WeeklyThemeViewProps) {
  const [data, setData] = useState<DiaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/diary-entries.json')
      .then((r) => r.json())
      .then((json: DiaryData) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load themes');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const groups = useMemo(() => (data ? buildThemeGroups(data) : []), [data]);
  const activeGroupIndex = useMemo(() => {
    return groups.findIndex((g) => g.entries.some((item) => item.dateKey === currentDateKey));
  }, [groups, currentDateKey]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-stretch justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-theme-title"
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-srf-blue/10">
          <h2 id="weekly-theme-title" className="font-heading text-xl text-srf-blue flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Weekly Themes
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
            aria-label="Close themes"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <p className="p-6 text-sm text-red-600">{error}</p>
          )}
          {!data && !error && (
            <p className="p-6 text-sm text-gray-600">Loading themes…</p>
          )}
          {groups.map((group, idx) => {
            const isActive = idx === activeGroupIndex;
            return (
              <section
                key={`${group.theme}-${group.startKey}`}
                className={`border-b border-srf-blue/10 ${isActive ? 'bg-srf-lotus/20' : ''}`}
              >
                <div className="px-6 py-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-srf-blue/60">
                    {formatKey(group.startKey)} – {formatKey(group.endKey)} · {group.entries.length} day{group.entries.length === 1 ? '' : 's'}
                  </p>
                  <h3 className="font-heading text-lg text-srf-blue">{group.theme}</h3>
                </div>
                <ul className="pb-3">
                  {group.entries.map(({ dateKey, entry }) => {
                    const isCurrent = dateKey === currentDateKey;
                    return (
                      <li key={dateKey}>
                        <button
                          onClick={() => {
                            onSelectDate(fromMMDD(dateKey));
                            onClose();
                          }}
                          className={`w-full text-left px-6 py-2 text-sm flex items-center justify-between gap-3 hover:bg-srf-lotus/30 transition-colors ${isCurrent ? 'font-semibold text-srf-blue' : 'text-gray-700'}`}
                        >
                          <span className="flex-1 truncate">
                            <span className="text-xs text-gray-500 mr-2">{formatKey(dateKey)}</span>
                            {entry.topic}
                          </span>
                          <ChevronRight className="w-4 h-4 text-srf-blue/50 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className="px-6 py-3 border-t border-srf-blue/10 text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to close ·
          <kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">W</kbd> toggles this panel
        </footer>
      </motion.aside>
    </motion.div>
  );
}

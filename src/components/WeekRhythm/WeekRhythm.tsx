import { useEffect, useMemo, useState } from 'react';
import { addDays, subDays, format, isSameDay } from 'date-fns';
import type { DiaryData } from '../../types/DiaryEntry';
import { toMMDD } from '../../lib/diaryDate';

interface WeekRhythmProps {
  selectedDate: Date;
  visitedKeys: string[];
  onSelectDate: (date: Date) => void;
}

interface TileData {
  date: Date;
  key: string;
  weekdayLabel: string;
  dayNumber: string;
  topic: string;
  isSelected: boolean;
  isToday: boolean;
  isVisited: boolean;
}

export function WeekRhythm({ selectedDate, visitedKeys, onSelectDate }: WeekRhythmProps) {
  const [data, setData] = useState<DiaryData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/diary-entries.json')
      .then((r) => r.json())
      .then((json: DiaryData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        // Silent — the strip will just render em-dashes for topics.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles: TileData[] = useMemo(() => {
    const today = new Date();
    const todayKey = toMMDD(today);
    const visited = new Set(visitedKeys);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(subDays(selectedDate, 3), i);
      const key = toMMDD(date);
      const entry = data?.entries[key];
      return {
        date,
        key,
        weekdayLabel: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        topic: entry?.topic ?? '—',
        isSelected: isSameDay(date, selectedDate),
        isToday: key === todayKey,
        isVisited: visited.has(key),
      };
    });
  }, [selectedDate, data, visitedKeys]);

  return (
    <nav
      aria-label="Reading rhythm for the days around this one"
      className="mb-8 -mx-4 px-4 overflow-x-auto"
    >
      <ul className="flex gap-2 justify-center min-w-max mx-auto">
        {tiles.map((tile) => (
          <li key={tile.key} className="flex-shrink-0">
            <button
              onClick={() => onSelectDate(tile.date)}
              aria-current={tile.isSelected ? 'date' : undefined}
              aria-label={`${tile.weekdayLabel} ${tile.dayNumber}, ${tile.topic}${tile.isVisited ? ' (visited)' : ''}`}
              title={tile.topic}
              className={`week-rhythm-tile flex flex-col items-center justify-between gap-1 rounded-xl border p-2 min-w-[78px] md:min-w-[100px] min-h-[84px] md:min-h-[92px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue ${
                tile.isSelected
                  ? 'bg-gradient-to-b from-srf-blue to-srf-blue/80 text-white border-srf-blue shadow-md scale-[1.04]'
                  : tile.isToday
                  ? 'bg-srf-lotus/40 border-srf-gold/50 text-srf-blue hover:bg-srf-lotus/60'
                  : 'bg-white border-srf-blue/10 hover:bg-srf-lotus/30 text-gray-700'
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-[0.15em] ${
                  tile.isSelected ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                {tile.weekdayLabel}
              </span>
              <span
                className={`font-heading text-lg leading-none ${
                  tile.isSelected ? 'text-white' : 'text-srf-blue'
                }`}
              >
                {tile.dayNumber}
              </span>
              <span
                className={`text-[11px] leading-tight truncate max-w-[64px] md:max-w-[88px] ${
                  tile.isSelected ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {tile.topic}
              </span>
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  tile.isVisited
                    ? tile.isSelected
                      ? 'bg-white'
                      : 'bg-srf-gold'
                    : 'bg-transparent'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

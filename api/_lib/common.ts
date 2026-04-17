import fs from 'node:fs/promises';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface PacificDateParts {
  year: number;
  month: number;
  day: number;
  runDate: string;
  dateKey: string;
}

export interface DiaryEntryRow {
  date_key: string;
  month: number;
  day: number;
  weekly_theme: string | null;
  topic: string;
  quote: string;
  source: string;
  book: string | null;
  special_day: string | null;
}

export interface LoadedDiaryEntry {
  entry: DiaryEntryRow;
  fromFallback: boolean;
}

export function getPacificDateParts(now = new Date()): PacificDateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  return {
    year,
    month,
    day,
    runDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    dateKey: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

export async function loadFallbackEntry(dateKey: string): Promise<DiaryEntryRow> {
  const jsonPath = path.resolve(process.cwd(), 'public/data/diary-entries.json');
  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw) as {
    entries?: Record<string, {
      month: number;
      day: number;
      topic: string;
      weeklyTheme?: string;
      quote: string;
      source?: string;
      book?: string;
      specialDay?: string;
    }>;
  };

  const entry = parsed.entries?.[dateKey];
  if (!entry) {
    throw new Error(`No fallback entry in JSON for ${dateKey}`);
  }

  return {
    date_key: dateKey,
    month: entry.month,
    day: entry.day,
    weekly_theme: entry.weeklyTheme || null,
    topic: entry.topic,
    quote: entry.quote,
    source: entry.source || 'Paramahansa Yogananda',
    book: entry.book || null,
    special_day: entry.specialDay || null,
  };
}

export async function loadDiaryEntry(
  supabase: SupabaseClient,
  parts: { dateKey: string; month: number; day: number },
): Promise<LoadedDiaryEntry> {
  const { dateKey, month, day } = parts;

  const { data, error } = await supabase
    .from('diary_entries')
    .select('date_key, month, day, weekly_theme, topic, quote, source, book, special_day')
    .eq('month', month)
    .eq('day', day)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (data) {
    return { entry: data as DiaryEntryRow, fromFallback: false };
  }

  const entry = await loadFallbackEntry(dateKey);
  return { entry, fromFallback: true };
}

import { createClient } from '@supabase/supabase-js';
import type { DiaryEntry } from '../types/DiaryEntry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

interface DiaryEntryRow {
  date_key: string;
  month: number;
  day: number;
  topic: string;
  weekly_theme: string | null;
  special_day: string | null;
  quote: string;
  source: string;
  book: string | null;
}

function rowToDiaryEntry(row: DiaryEntryRow): DiaryEntry {
  return {
    month: row.month,
    day: row.day,
    topic: row.topic,
    weeklyTheme: row.weekly_theme ?? undefined,
    specialDay: row.special_day ?? undefined,
    quote: row.quote,
    source: row.source,
    book: row.book ?? undefined,
  };
}

export async function getDiaryEntry(
  dateKey: string,
  { timeoutMs = 5000 }: { timeoutMs?: number } = {},
): Promise<DiaryEntry | null> {
  if (!supabase) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date_key, month, day, topic, weekly_theme, special_day, quote, source, book')
      .eq('date_key', dateKey)
      .abortSignal(controller.signal)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('abort')) return null;
      throw error;
    }
    return data ? rowToDiaryEntry(data as DiaryEntryRow) : null;
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') return null;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

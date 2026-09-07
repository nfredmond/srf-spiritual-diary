export interface DiaryEntry {
  month: number;
  day: number;
  topic: string;
  weeklyTheme?: string | null;    // Theme for the week
  specialDay?: string | null;     // Special observances (e.g., "Birthday of Sri Gyanamata")
  quote: string;
  source: string;
  book?: string | null;
}

export interface DiaryData {
  entries: Record<string, DiaryEntry>;
}


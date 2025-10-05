export interface DiaryEntry {
  month: number;
  day: number;
  topic: string;
  weeklyTheme?: string;    // Theme for the week
  specialDay?: string;     // Special observances (e.g., "Birthday of Sri Gyanamata")
  quote: string;
  source: string;
  book?: string;
}

export interface DiaryData {
  entries: Record<string, DiaryEntry>;
  weeklyThemes?: Record<string, {
    startDate: string;
    endDate: string;
    theme: string;
  }>;
}


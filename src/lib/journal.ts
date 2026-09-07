import { isValidDiaryDate } from './diaryDate.ts';
export interface Note {
  dateKey: string;
  content: string;
  timestamp: number;
}
export interface ReadingHistory {
  dates: string[];
  currentStreak: number;
  longestStreak: number;
  lastVisit: string;
}
export interface Journal {
  favorites: string[];
  notes: Record<string, Note>;
  drafts: Record<string, Note>;
  conflicts: Note[];
  history: ReadingHistory | Record<string, never>;
  quoteHistory: { dateKey: string; timestamp: number }[];
  theme: string;
}
export const journalKeys = {
  favorites: 'srf-favorites',
  notes: 'srf-notes',
  drafts: 'srf-note-drafts',
  conflicts: 'srf-note-conflicts',
  history: 'srf-reading-history',
  quoteHistory: 'srf-quote-history',
  theme: 'srf-theme'
} as const;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const stamp = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;
const date = (v: unknown): v is string =>
  typeof v === 'string' && isValidDiaryDate(v);
const fullDate = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
function note(v: unknown): v is Note {
  return (
    object(v) &&
    date(v.dateKey) &&
    typeof v.content === 'string' &&
    v.content.length <= 1_000_000 &&
    stamp(v.timestamp)
  );
}
export function validateNotes(v: unknown): Record<string, Note> {
  if (
    !object(v) ||
    Object.entries(v).some(([k, n]) => !date(k) || !note(n) || n.dateKey !== k)
  )
    throw new Error('Invalid notes or drafts');
  return v as Record<string, Note>;
}
export function validateJournal(value: unknown): Partial<Journal> {
  if (!object(value)) throw new Error('Invalid journal');
  for (const [key, v] of Object.entries(value)) {
    if (!Object.hasOwn(journalKeys, key))
      throw new Error(`Unknown journal field: ${key}`);
    if (key === 'notes' || key === 'drafts') validateNotes(v);
    if (key === 'favorites' && (!Array.isArray(v) || !v.every(date)))
      throw new Error('Invalid favorites');
    if (key === 'conflicts' && (!Array.isArray(v) || !v.every(note)))
      throw new Error('Invalid conflicting notes');
    if (
      key === 'quoteHistory' &&
      (!Array.isArray(v) ||
        !v.every((n) => object(n) && date(n.dateKey) && stamp(n.timestamp)))
    )
      throw new Error('Invalid recent readings');
    if (key === 'theme' && !['light', 'dark', 'sepia'].includes(String(v)))
      throw new Error('Invalid theme');
    if (key === 'history') {
      if (
        !object(v) ||
        (Object.keys(v).length > 0 &&
          (!Array.isArray(v.dates) ||
            !v.dates.every(fullDate) ||
            !Number.isInteger(v.currentStreak) ||
            Number(v.currentStreak) < 0 ||
            !Number.isInteger(v.longestStreak) ||
            Number(v.longestStreak) < Number(v.currentStreak) ||
            !(v.lastVisit === '' || fullDate(v.lastVisit))))
      )
        throw new Error('Invalid reading history');
    }
  }
  return value as Partial<Journal>;
}
export function validateBackup(v: unknown): Partial<Journal> {
  if (!object(v) || !['2.0', '3.0'].includes(String(v.version)))
    throw new Error('Unsupported backup version');
  if (v.type === 'srf-favorites') return validateJournal({ favorites: v.data });
  if (v.type === 'srf-notes') return validateJournal({ notes: v.data });
  if (v.type === 'srf-complete-backup') return validateJournal(v.data);
  throw new Error('Unknown backup type');
}
export function readJournal(storage: Storage): Journal {
  const defaults: Journal = {
    favorites: [],
    notes: {},
    drafts: {},
    conflicts: [],
    history: {},
    quoteHistory: [],
    theme: 'light'
  };
  const result: Record<string, unknown> = { ...defaults };
  for (const [field, key] of Object.entries(journalKeys)) {
    const raw = storage.getItem(key);
    if (raw !== null) result[field] = field === 'theme' ? raw : JSON.parse(raw);
  }
  return validateJournal(result) as Journal;
}
export function mergeJournal(
  current: Journal,
  incoming: Partial<Journal>
): Journal {
  const merged: Journal = {
    ...current,
    notes: { ...current.notes },
    drafts: { ...current.drafts },
    conflicts: [...current.conflicts, ...(incoming.conflicts ?? [])],
    favorites: [
      ...new Set([...current.favorites, ...(incoming.favorites ?? [])])
    ]
  };
  for (const field of ['notes', 'drafts'] as const) {
    for (const [key, n] of Object.entries(incoming[field] ?? {})) {
      if (merged[field][key] && merged[field][key].content !== n.content)
        merged.conflicts.push(n);
      else if (!merged[field][key]) merged[field][key] = n;
    }
  }
  merged.conflicts = merged.conflicts.filter(
    (n, i, a) =>
      a.findIndex(
        (other) =>
          other.dateKey === n.dateKey &&
          other.content === n.content &&
          other.timestamp === n.timestamp
      ) === i
  );
  merged.quoteHistory = [
    ...current.quoteHistory,
    ...(incoming.quoteHistory ?? [])
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((n, i, a) => a.findIndex((x) => x.dateKey === n.dateKey) === i);
  const dates = [
    ...new Set([
      ...(current.history.dates ?? []),
      ...(incoming.history?.dates ?? [])
    ])
  ].sort();
  if (dates.length) {
    let run = 0,
      longest = 0,
      prev = '';
    for (const d of dates) {
      run = prev && Date.parse(d) - Date.parse(prev) === 86400000 ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = d;
    }
    merged.history = {
      dates,
      lastVisit: dates.at(-1)!,
      currentStreak: run,
      longestStreak: Math.max(
        longest,
        current.history.longestStreak ?? 0,
        incoming.history?.longestStreak ?? 0
      )
    };
  }
  return merged;
}
export function backup(data: Partial<Journal>) {
  return {
    type: 'srf-complete-backup',
    version: '3.0',
    exportDate: new Date().toISOString(),
    data
  };
}
export function applyImport(storage: Storage, incoming: Partial<Journal>) {
  validateJournal(incoming);
  const current = readJournal(storage);
  const merged = mergeJournal(current, incoming);
  const raw = Object.fromEntries(
    Object.values(journalKeys).map((key) => [key, storage.getItem(key)])
  );
  // This durable snapshot must succeed before the first journal write.
  storage.setItem(
    'srf-import-recovery',
    JSON.stringify({ backup: backup(current), raw })
  );
  try {
    for (const [field, key] of Object.entries(journalKeys))
      storage.setItem(
        key,
        field === 'theme'
          ? merged.theme
          : JSON.stringify(merged[field as keyof Journal])
      );
  } catch {
    let restored = true;
    for (const [key, value] of Object.entries(raw)) {
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        restored = false;
      }
    }
    throw new Error(
      restored
        ? 'Import failed. Original journal restored.'
        : 'Import interrupted. Download the recovery backup before making further changes.'
    );
  }
  return merged;
}
export function notifyJournal() {
  window.dispatchEvent(new Event('journal-changed'));
}
export function saveReflection(
  storage: Storage,
  key: string,
  content: string,
  original: string
) {
  const saved = { dateKey: key, content, timestamp: Date.now() };
  validateNotes({ [key]: saved });
  const notes = validateNotes(JSON.parse(storage.getItem('srf-notes') ?? '{}'));
  const drafts = validateNotes(
    JSON.parse(storage.getItem('srf-note-drafts') ?? '{}')
  );
  const current = notes[key];
  if (current && current.content !== original && current.content !== content) {
    const conflicts = validateJournal({
      conflicts: JSON.parse(storage.getItem('srf-note-conflicts') ?? '[]')
    }).conflicts!;
    storage.setItem(
      'srf-note-conflicts',
      JSON.stringify([...conflicts, current])
    );
  }
  // Keep an intentional empty reflection, rather than silently deleting an entry.
  storage.setItem(
    'srf-notes',
    JSON.stringify({
      ...notes,
      [key]: saved
    })
  );
  // Another tab may have written a different draft since this editor last typed.
  // Clear only the version that this save has actually committed to notes.
  if (drafts[key]?.content === content) {
    delete drafts[key];
    storage.setItem('srf-note-drafts', JSON.stringify(drafts));
  }
}
export function saveDraft(storage: Storage, key: string, content: string, original?: string) {
  validateNotes({ [key]: { dateKey: key, content, timestamp: Date.now() } });
  const drafts = validateNotes(
    JSON.parse(storage.getItem('srf-note-drafts') ?? '{}')
  );
  const existing=drafts[key];
  if(original!==undefined && existing && existing.content!==original && existing.content!==content) {
    const conflicts=validateJournal({conflicts:JSON.parse(storage.getItem('srf-note-conflicts')??'[]')}).conflicts!;
    storage.setItem('srf-note-conflicts',JSON.stringify([...conflicts,existing]));
  }
  storage.setItem(
    'srf-note-drafts',
    JSON.stringify({
      ...drafts,
      [key]: { dateKey: key, content, timestamp: Date.now() }
    })
  );
}

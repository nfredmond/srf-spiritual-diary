import type { DiaryData } from '../types/DiaryEntry.ts';
import { isValidDiaryDate, toMMDD } from './diaryDate.ts';

export const unresolvedDates = [
  '02-17',
  '02-25',
  '02-29',
  '03-05',
  '05-14',
  '09-05',
  '09-07',
  '09-15',
  '09-16',
  '09-17',
  '09-22',
  '09-23',
  '09-27',
  '09-28',
  '10-04',
  '12-14'
];
export function validateDiaryData(value: unknown): DiaryData {
  if (
    !value ||
    typeof value !== 'object' ||
    !('entries' in value) ||
    !value.entries ||
    typeof value.entries !== 'object' ||
    Array.isArray(value.entries)
  )
    throw new Error('Invalid reading collection');
  const entries = value.entries;
  for (const [key, entry] of Object.entries(entries)) {
    if (!isValidDiaryDate(key) || !entry || typeof entry !== 'object')
      throw new Error(`Invalid reading date: ${key}`);
    const [month, day] = key.split('-').map(Number);
    if (entry.month !== month || entry.day !== day)
      throw new Error(`Mismatched reading date: ${key}`);
    for (const field of ['topic', 'quote', 'source', 'weeklyTheme']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim())
        throw new Error(`Invalid ${field}: ${key}`);
    }
    for (const field of ['specialDay', 'book']) {
      if (
        entry[field] != null &&
        (typeof entry[field] !== 'string' || !entry[field].trim())
      )
        throw new Error(`Invalid ${field}: ${key}`);
    }
  }
  if (!Object.keys(entries).length) throw new Error('Empty reading collection');
  return value as DiaryData;
}
export function auditCalendar(value: unknown) {
  const data = validateDiaryData(value);
  const missing: string[] = [];
  for (
    let date = new Date(2024, 0, 1);
    date.getFullYear() === 2024;
    date.setDate(date.getDate() + 1)
  ) {
    const key = toMMDD(date);
    if (!data.entries[key]) missing.push(key);
  }
  const unexplained = missing.filter((key) => !unresolvedDates.includes(key));
  const resolved = unresolvedDates.filter((key) => !missing.includes(key));
  if (unexplained.length || resolved.length)
    throw new Error(
      `Update source evidence and unresolved dates. Unexplained: ${unexplained}; resolved: ${resolved}`
    );
  return { present: Object.keys(data.entries).length, missing };
}
export function nearestReading(date: Date, data: DiaryData): Date | null {
  for (let distance = 1; distance <= 366; distance++) {
    for (const offset of [-distance, distance]) {
      const candidate = new Date(date);
      candidate.setDate(candidate.getDate() + offset);
      if (data.entries[toMMDD(candidate)]) return candidate;
    }
  }
  return null;
}
interface DiaryState { data: DiaryData | null; loading: boolean; error: string | null }
let state: DiaryState = {data:null,loading:true,error:null};
const listeners=new Set<()=>void>();
export function diarySnapshot(){return state;}
export function subscribeDiary(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};}
function publish(next:DiaryState){state=next;for(const listener of listeners)listener();}
let pending: Promise<DiaryData> | undefined;
export function loadDiaryData(): Promise<DiaryData> {
  if(!pending)publish({data:null,loading:true,error:null});
  return (pending ??= fetch('/data/diary-entries.json')
    .then(async (response) => {
      if (!response.ok)
        throw new Error(
          'Could not load readings. Check your connection and retry.'
        );
      const data=validateDiaryData(await response.json());
      publish({data,loading:false,error:null});
      return data;
    })
    .catch((error) => {
      pending = undefined;
      publish({data:null,loading:false,error:error instanceof Error?error.message:'Could not load readings.'});
      throw error;
    }));
}
export function resetDiaryCache() {
  pending = undefined;
  publish({data:null,loading:true,error:null});
}

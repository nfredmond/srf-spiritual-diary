import { useDiaryData } from './useDiaryData';
import { toMMDD } from '../lib/diaryDate';
import { nearestReading } from '../lib/diaryData';
export function useDiaryEntry(selectedDate:Date) {
  const {data,loading,error,retry}=useDiaryData();
  const entry=data?.entries[toMMDD(selectedDate)] ?? null;
  return {entry,loading,error,retry,missing:!!data&&!entry,nearest:data&&!entry?nearestReading(selectedDate,data):null};
}

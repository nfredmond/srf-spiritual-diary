import { useEffect, useSyncExternalStore } from 'react';
import { diarySnapshot, subscribeDiary, loadDiaryData } from '../lib/diaryData';
export function useDiaryData() {
  const state=useSyncExternalStore(subscribeDiary,diarySnapshot,diarySnapshot);
  useEffect(()=>{void loadDiaryData().catch(()=>{});},[]);
  return {...state,retry:()=>{void loadDiaryData().catch(()=>{});}};
}

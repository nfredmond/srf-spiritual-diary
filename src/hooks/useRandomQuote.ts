import { useCallback } from 'react';
import { useDiaryData } from './useDiaryData';
export function useRandomQuote() {
  const {data}=useDiaryData();
  const getRandomDateKey=useCallback(()=>{const keys=Object.keys(data?.entries??{});return keys.length?keys[Math.floor(Math.random()*keys.length)]:null;},[data]);
  return {getRandomDateKey};
}

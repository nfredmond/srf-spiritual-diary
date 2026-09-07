import { readFileSync } from 'node:fs';
import { auditCalendar } from '../src/lib/diaryData.ts';
console.log(JSON.stringify(auditCalendar(JSON.parse(readFileSync(new URL('../public/data/diary-entries.json', import.meta.url)))), null, 2));

const CANONICAL_YEAR = 2024;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toMMDD(date: Date): string {
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function isValidDiaryDate(dateKey: string): boolean {
  if (!/^\d{2}-\d{2}$/.test(dateKey)) return false;
  const [m, d] = dateKey.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const probe = new Date(CANONICAL_YEAR, m - 1, d);
  return probe.getMonth() === m - 1 && probe.getDate() === d;
}

// Keep the requested month/day visible, using a leap year for annual Feb 29 browsing.
export function fromMMDD(dateKey: string, year: number = new Date().getFullYear()): Date {
  if (!isValidDiaryDate(dateKey)) throw new Error('Invalid diary date');
  const [month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return toMMDD(date) === dateKey ? date : new Date(CANONICAL_YEAR, month - 1, day);
}

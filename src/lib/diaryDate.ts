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

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function leapDayFallback(month: number, day: number, year: number): { month: number; day: number } {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return { month: 2, day: 28 };
  }
  return { month, day };
}

export function fromMMDD(dateKey: string, year: number = new Date().getFullYear()): Date {
  const [monthRaw, dayRaw] = dateKey.split('-').map(Number);
  const { month, day } = leapDayFallback(monthRaw, dayRaw, year);
  return new Date(year, month - 1, day);
}

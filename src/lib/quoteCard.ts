import type { DiaryEntry } from '../types/DiaryEntry.ts';
// Wrap each paragraph independently, splitting oversized words only when needed.
export function wrapText(
  text: string,
  measure: (text: string) => number,
  width: number
): string[] {
  return text.split('\n').flatMap((paragraph) => {
    const lines: string[] = [];
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && measure(`${line} ${word}`) > width) {
        lines.push(line);
        line = '';
      }
      if (measure(word) > width) {
        for (const char of word) {
          if (line && measure(line + char) > width) {
            lines.push(line);
            line = '';
          }
          line += char;
        }
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
    return lines;
  });
}
export function cardLayout(
  entry: DiaryEntry,
  measure: (text: string, size: number) => number
) {
  const topic = wrapText(entry.topic, (t) => measure(t, 38), 920);
  const quote = wrapText(entry.quote, (t) => measure(t, 46), 920);
  const source = wrapText(entry.source, (t) => measure(t, 34), 920);
  const book = entry.book
    ? wrapText(entry.book, (t) => measure(t, 28), 920)
    : [];
  const quoteY = 150 + topic.length * 52 + 65;
  const sourceY = quoteY + quote.length * 66 + 85;
  const bookY = sourceY + source.length * 48 + 20;
  const height = Math.max(1200, bookY + book.length * 42 + 210);
  return { topic, quote, source, book, quoteY, sourceY, bookY, height };
}

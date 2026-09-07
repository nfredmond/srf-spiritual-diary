import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  auditCalendar,
  loadDiaryData,
  resetDiaryCache,
  validateDiaryData,
  nearestReading
} from './diaryData.ts';
import {
  applyImport,
  backup,
  mergeJournal,
  readJournal,
  saveDraft,
  saveReflection,
  validateBackup
} from './journal.ts';
import { cardLayout, wrapText } from './quoteCard.ts';
import type { DiaryEntry } from '../types/DiaryEntry.ts';
const real = JSON.parse(
  readFileSync(
    new URL('../../public/data/diary-entries.json', import.meta.url),
    'utf8'
  )
);
class MemoryStorage implements Storage {
  data = new Map<string, string>();
  failKey = '';
  failed = false;
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  key(n: number) {
    return [...this.data.keys()][n] ?? null;
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    if (this.failKey === k && !this.failed) {
      this.failed = true;
      throw new Error('Disk full');
    }
    this.data.set(k, v);
  }
}
const note = (content: string) => ({ dateKey: '01-01', content, timestamp: 1 });
test('calendar census rejects unexplained gaps, invalid fields and missing attribution', () => {
  assert.equal(auditCalendar(real).present, 346);
  assert.equal(auditCalendar(real).missing.length, 20);
  const gap = structuredClone(real);
  delete gap.entries['01-01'];
  assert.throws(() => auditCalendar(gap), /Unexplained/);
  for (const [field, value] of [
    ['source', ''],
    ['topic', null],
    ['quote', 5],
    ['weeklyTheme', ''],
    ['month', 2],
    ['book', 123]
  ]) {
    const bad = structuredClone(real);
    bad.entries['01-01'][String(field)] = value;
    assert.throws(() => auditCalendar(bad));
  }
  assert.throws(() =>
    validateDiaryData({ entries: { '02-30': real.entries['01-01'] } })
  );
  assert.equal(real.entries['02-29'], undefined);
  assert.equal(nearestReading(new Date(2024, 1, 29), real)?.getDate(), 28);
  assert.equal(
    nearestReading(new Date(2024, 11, 31), {
      entries: { '01-01': real.entries['01-01'] }
    })?.getFullYear(),
    2025
  );
});
test('loader deduplicates requests and retries failed HTTP or malformed data', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    resetDiaryCache();
    globalThis.fetch = async () => {
      calls++;
      return { ok: true, json: async () => real } as Response;
    };
    await Promise.all([loadDiaryData(), loadDiaryData()]);
    assert.equal(calls, 1);
    resetDiaryCache();
    globalThis.fetch = async () =>
      ({ ok: false, json: async () => real }) as Response;
    await assert.rejects(loadDiaryData(), /connection/);
    globalThis.fetch = async () =>
      ({ ok: true, json: async () => ({ entries: {} }) }) as Response;
    await assert.rejects(loadDiaryData(), /Empty/);
    globalThis.fetch = async () => {
      throw new Error('offline');
    };
    await assert.rejects(loadDiaryData(), /offline/);
    globalThis.fetch = async () =>
      ({ ok: true, json: async () => real }) as Response;
    assert.equal(Object.keys((await loadDiaryData()).entries).length, 346);
  } finally {
    globalThis.fetch = original;
    resetDiaryCache();
  }
});
test('strict backup validation accepts legacy exports and rejects nested damage', () => {
  assert.deepEqual(
    validateBackup({
      type: 'srf-notes',
      version: '2.0',
      data: { '01-01': note('original') }
    }).notes,
    { '01-01': note('original') }
  );
  for (const payload of [
    { type: 'srf-notes', version: '99', data: {} },
    { type: 'srf-favorites', version: '2.0', data: ['02-30'] },
    backup({ notes: { '02-02': note('wrong key') } }),
    backup({ notes: { '01-01': { ...note('x'), timestamp: NaN } } }),
    backup({ conflicts: [{ ...note('bad date'), dateKey: '02-30' }] }),
    {
      type: 'srf-complete-backup',
      version: '3.0',
      data: {
        history: {
          dates: ['2025-02-29'],
          currentStreak: 1,
          longestStreak: 1,
          lastVisit: '2025-02-29'
        }
      }
    },
    { type: 'srf-complete-backup', version: '3.0', data: { theme: 'purple' } },
    {
      type: 'srf-complete-backup',
      version: '3.0',
      data: { notes: JSON.parse('{"__proto__":{"content":"x"}}') }
    },
    { type: 'srf-complete-backup', version: '3.0', data: { unexpected: true } }
  ])
    assert.throws(() => validateBackup(payload));
});
test('merge preserves original notes, drafts and both conflicting versions', () => {
  const storage = new MemoryStorage();
  storage.setItem('srf-notes', JSON.stringify({ '01-01': note('original') }));
  saveDraft(storage, '01-01', 'draft');
  const result = applyImport(storage, {
    notes: { '01-01': note('imported') },
    favorites: ['02-29'],
    drafts: { '01-01': note('other draft') }
  });
  assert.equal(result.notes['01-01'].content, 'original');
  assert.equal(result.drafts['01-01'].content, 'draft');
  assert.deepEqual(
    result.conflicts.map((n) => n.content),
    ['imported', 'other draft']
  );
  assert.equal(
    JSON.parse(storage.getItem('srf-import-recovery')!).backup.data.notes[
      '01-01'
    ].content,
    'original'
  );
  assert.equal(
    mergeJournal(result, { notes: { '01-01': note('imported') } }).conflicts
      .length,
    2
  );
  assert.deepEqual(validateBackup(backup(readJournal(storage))), result);
});
test('failed recovery write prevents import, later write failure rolls back', () => {
  for (const failKey of ['srf-import-recovery', 'srf-notes']) {
    const storage = new MemoryStorage();
    storage.setItem('srf-notes', JSON.stringify({ '01-01': note('safe') }));
    const before = storage.getItem('srf-notes');
    storage.failKey = failKey;
    assert.throws(() => applyImport(storage, { favorites: ['02-02'] }));
    assert.equal(storage.getItem('srf-notes'), before);
    assert.equal(storage.getItem('srf-favorites'), null);
  }
});
test('draft survives reopening and save preserves an externally changed note', () => {
  const storage = new MemoryStorage();
  saveDraft(storage, '01-01', 'recovered');
  assert.equal(readJournal(storage).drafts['01-01'].content, 'recovered');
  storage.setItem('srf-notes', JSON.stringify({ '01-01': note('other tab') }));
  saveReflection(storage, '01-01', 'recovered', 'original');
  assert.equal(readJournal(storage).conflicts[0].content, 'other tab');
  assert.equal(readJournal(storage).notes['01-01'].content, 'recovered');
  assert.equal(readJournal(storage).drafts['01-01'], undefined);
  storage.failKey = 'srf-note-drafts';
  assert.throws(() => saveDraft(storage, '02-02', 'not persisted'));
  assert.equal(readJournal(storage).drafts['02-02'], undefined);
});
test('quotation layout grows for the longest readings without overlapping attribution', () => {
  const measure = (s: string, size: number) => s.length * size * 0.6;
  for (const entry of Object.values(real.entries) as DiaryEntry[]) {
    const l = cardLayout(entry, measure);
    assert.ok(l.sourceY >= l.quoteY + l.quote.length * 66);
    assert.ok(l.height > l.bookY + l.book.length * 42 + 150);
  }
  const long = {
    ...real.entries['01-01'],
    quote: 'Long reading '.repeat(600),
    source: 'Long attribution '.repeat(20),
    book: 'Source volume '.repeat(40)
  };
  const l = cardLayout(long, measure);
  assert.ok(l.height > 1200);
  assert.ok(l.source.length > 1);
  assert.ok(l.book.length > 1);
  assert.deepEqual(
    wrapText('abc\n\nabcdefgh', (t) => t.length, 3),
    ['abc', '', 'abc', 'def', 'gh']
  );
});

test('patch import refuses invented attribution and requires a verified theme', async () => {
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const root = mkdtempSync(join(tmpdir(), 'diary-patch-'));
  for (const field of ['source', 'weeklyTheme']) {
    const patch = join(root, field + '.json');
    writeFileSync(
      patch,
      JSON.stringify({
        '02-17': { ...real.entries['01-01'], month: 2, day: 17, [field]: '' }
      })
    );
    const result = spawnSync(
      process.execPath,
      ['scripts/merge-diary-json.mjs', '--patch', patch, '--dry-run'],
      { encoding: 'utf8' }
    );
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      new RegExp(field === 'source' ? 'attribution' : 'weeklyTheme')
    );
  }
});

test('simultaneous draft editors retain the replaced draft as a conflict',()=>{const storage=new MemoryStorage();saveDraft(storage,'01-01','other editor');saveDraft(storage,'01-01','my draft','my earlier draft');assert.equal(readJournal(storage).drafts['01-01'].content,'my draft');assert.equal(readJournal(storage).conflicts[0].content,'other editor');});

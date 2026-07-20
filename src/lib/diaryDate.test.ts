import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMMDD, isValidDiaryDate, leapDayFallback, fromMMDD } from './diaryDate.ts';

test('toMMDD zero-pads month and day from local time', () => {
  assert.equal(toMMDD(new Date(2025, 0, 1)), '01-01');
  assert.equal(toMMDD(new Date(2025, 11, 25)), '12-25');
  assert.equal(toMMDD(new Date(2025, 6, 4)), '07-04');
});

test('isValidDiaryDate accepts real calendar dates including Feb 29', () => {
  assert.equal(isValidDiaryDate('01-01'), true);
  assert.equal(isValidDiaryDate('02-29'), true); // valid against the canonical leap year
  assert.equal(isValidDiaryDate('12-31'), true);
});

test('isValidDiaryDate rejects impossible or malformed dates', () => {
  assert.equal(isValidDiaryDate('13-01'), false);
  assert.equal(isValidDiaryDate('02-30'), false);
  assert.equal(isValidDiaryDate('00-10'), false);
  assert.equal(isValidDiaryDate('1-1'), false); // must be zero-padded
  assert.equal(isValidDiaryDate('04-17x'), false);
});

test('leapDayFallback maps Feb 29 to Feb 28 only in non-leap years', () => {
  assert.deepEqual(leapDayFallback(2, 29, 2023), { month: 2, day: 28 });
  assert.deepEqual(leapDayFallback(2, 29, 2024), { month: 2, day: 29 });
  assert.deepEqual(leapDayFallback(3, 5, 2023), { month: 3, day: 5 });
});

test('fromMMDD builds a local Date and gracefully handles Feb 29', () => {
  const d = fromMMDD('03-05', 2025);
  assert.equal(d.getMonth(), 2);
  assert.equal(d.getDate(), 5);

  const leap = fromMMDD('02-29', 2023); // non-leap year → Feb 28
  assert.equal(leap.getMonth(), 1);
  assert.equal(leap.getDate(), 28);
});

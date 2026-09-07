import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMMDD, isValidDiaryDate, fromMMDD } from './diaryDate.ts';

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

test('fromMMDD builds a local Date and gracefully handles Feb 29', () => {
  const d = fromMMDD('03-05', 2025);
  assert.equal(d.getMonth(), 2);
  assert.equal(d.getDate(), 5);

  const leap = fromMMDD('02-29', 2023); // non-leap year → Feb 29
  assert.equal(leap.getMonth(), 1);
  assert.equal(leap.getDate(), 29);
  assert.throws(()=>fromMMDD("02-30"));
});

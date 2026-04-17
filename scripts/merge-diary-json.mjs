#!/usr/bin/env node
/**
 * merge-diary-json.mjs
 *
 * Merge the cleaned raw array-form diary export
 *   (default: /home/narford/Downloads/SRF_Spiritual_Diary_cleaned_raw.json)
 * into the app's MM-DD-keyed data file
 *   (default: public/data/diary-entries.json),
 * producing a merged output plus a diff report.
 *
 * Merge rules:
 *   - Deduplicate new-JSON entries by MM-DD, preferring the cleaner row.
 *   - New JSON wins on quote/topic/source.
 *   - Current file donates weeklyTheme, specialDay, book per key.
 *   - Top-level weeklyThemes map is preserved verbatim.
 *   - For any MM-DD present only in the new JSON, derive weeklyTheme from
 *     the contiguous run of identical topics (only when run length >= 3).
 *   - Any MM-DD present only in the current file is preserved.
 *
 * CLI:
 *   node scripts/merge-diary-json.mjs
 *     [--dry-run] [--verbose]
 *     [--in <new-raw-json>] [--current <current-json>]
 *     [--out <target-json>] [--report <report-json>]
 *
 * Patch mode (hand-transcribed additions for the 20 dates missing from the
 * cleaned raw export — see docs/HAND_TRANSCRIPTION.md):
 *   node scripts/merge-diary-json.mjs --patch <patch.json>
 *     [--dry-run] [--force] [--current <current-json>] [--out <target-json>]
 *     [--report <report-json>]
 *
 * Patch file shape (keys starting with `_` are ignored as comments):
 *   {
 *     "09-05": { "month": 9, "day": 5, "topic": "...", "quote": "...",
 *                "weeklyTheme": null, "specialDay": null,
 *                "source": "Paramahansa Yogananda", "book": null },
 *     ...
 *   }
 *
 * Patch mode refuses to overwrite existing keys unless --force is passed,
 * and refuses to merge any entry whose topic or quote is blank.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const DEFAULTS = {
  in: '/home/narford/Downloads/SRF_Spiritual_Diary_cleaned_raw.json',
  current: path.join(PROJECT_ROOT, 'public/data/diary-entries.json'),
  out: path.join(PROJECT_ROOT, 'public/data/diary-entries.json'),
  report: path.join(PROJECT_ROOT, 'artifacts/data-merge-report.json'),
};

function parseArgs(argv) {
  const opts = { dryRun: false, verbose: false, force: false, patch: null, ...DEFAULTS };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--verbose') opts.verbose = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--patch') opts.patch = argv[++i];
    else if (a === '--in') opts.in = argv[++i];
    else if (a === '--current') opts.current = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--report') opts.report = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage:\n' +
          '  node scripts/merge-diary-json.mjs\n' +
          '    [--dry-run] [--verbose]\n' +
          '    [--in <new-raw-json>] [--current <current-json>]\n' +
          '    [--out <target-json>] [--report <report-json>]\n' +
          '\n' +
          '  node scripts/merge-diary-json.mjs --patch <patch.json>\n' +
          '    [--dry-run] [--force] [--current <current-json>]\n' +
          '    [--out <target-json>] [--report <report-json>]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return opts;
}

function mmddFromDate(dateStr) {
  if (typeof dateStr !== 'string' || dateStr.length < 10) {
    throw new Error(`Invalid date string: ${JSON.stringify(dateStr)}`);
  }
  return dateStr.slice(5, 10);
}

function isTitleCase(s) {
  if (!s) return false;
  const first = s.trim().charAt(0);
  return first === first.toUpperCase() && first !== first.toLowerCase();
}

function hasTrailingPeriod(s) {
  return typeof s === 'string' && s.trim().endsWith('.');
}

function endsWithFragmentWord(topic) {
  // Topic fragments often end with prepositions / articles after a bad split.
  const frags = ['of', 'the', 'and', 'to', 'in', 'for', 'on', 'with', 'a', 'an'];
  const last = topic.trim().split(/\s+/).pop()?.toLowerCase();
  return last ? frags.includes(last) : false;
}

/**
 * Score a candidate row for "cleanliness". Higher = cleaner.
 * Used to pick the winning row when new JSON has duplicate MM-DDs.
 */
function cleanlinessScore(row) {
  const topic = (row.topic ?? '').trim();
  let score = 0;
  if (isTitleCase(topic)) score += 3;
  if (!hasTrailingPeriod(topic)) score += 2;
  if (!endsWithFragmentWord(topic)) score += 2;
  // Penalize topics with > 5 words (corpus topics are 1–5 words; longer = quote fragment).
  const wordCount = topic.split(/\s+/).filter(Boolean).length;
  if (wordCount > 5) score -= 4;
  // Penalize topics that end with a non-letter character other than a letter (e.g., quote char, space).
  const lastChar = topic.slice(-1);
  if (lastChar && !/[A-Za-z]/.test(lastChar)) score -= 2;
  // Penalize topics starting with lowercase continuation words.
  const topicHeadRaw = topic.split(/\s+/)[0] ?? '';
  const continuationStarters = new Set(['with', 'without', 'and', 'but', 'when', 'where', 'so', 'because', 'while']);
  if (continuationStarters.has(topicHeadRaw.toLowerCase())) score -= 3;
  // Penalize quotes that start with the topic's final word (leak signal).
  const topicTail = topic.split(/\s+/).pop()?.toLowerCase();
  const quoteHead = (row.quote ?? '').trim().split(/\s+/)[0]?.toLowerCase();
  if (topicTail && quoteHead && topicTail === quoteHead) score -= 2;
  // Penalize quotes that start with the FIRST word of the topic (other leak shape).
  const topicHead = topic.split(/\s+/)[0]?.toLowerCase();
  if (topicHead && quoteHead && topicHead === quoteHead) score -= 2;
  return score;
}

/**
 * Decide whether a current-file weeklyTheme should be replaced by the new
 * JSON's topic when they represent the "same" concept but one is polluted.
 * Returns the cleaner theme string, or null.
 */
function reconcileWeeklyTheme(currentTheme, newTopic) {
  if (!currentTheme) return newTopic || null;
  if (!newTopic) return currentTheme;
  const norm = (s) => s.trim().toLowerCase().replace(/[.!?"']+$/g, '');
  if (norm(currentTheme) === norm(newTopic)) {
    // Same concept — prefer whichever is Title Case and has no trailing period.
    const curClean = isTitleCase(currentTheme) && !hasTrailingPeriod(currentTheme);
    const newClean = isTitleCase(newTopic) && !hasTrailingPeriod(newTopic);
    if (newClean && !curClean) return newTopic;
    return currentTheme;
  }
  // Different topics. If current is obviously polluted (lowercase start OR
  // trailing period OR ends with a non-letter like `"`) and the new topic
  // looks clean, prefer new.
  const curWordCount = currentTheme.trim().split(/\s+/).filter(Boolean).length;
  const curPolluted =
    !isTitleCase(currentTheme) ||
    hasTrailingPeriod(currentTheme) ||
    /[^A-Za-z)]$/.test(currentTheme.trim()) ||
    curWordCount > 5;
  const newClean = isTitleCase(newTopic) && !hasTrailingPeriod(newTopic) && !/[^A-Za-z)]$/.test(newTopic.trim());
  if (curPolluted && newClean) return newTopic;
  return currentTheme;
}

function pickCleanerRow(a, b) {
  const sa = cleanlinessScore(a);
  const sb = cleanlinessScore(b);
  if (sa !== sb) return sa > sb ? a : b;
  // Tie → prefer shorter quote (polluted variants are usually longer by a word).
  const la = (a.quote ?? '').length;
  const lb = (b.quote ?? '').length;
  if (la !== lb) return la < lb ? a : b;
  // Final tiebreak: later row number (sheet edits usually happen after original).
  return (a.row ?? 0) >= (b.row ?? 0) ? a : b;
}

function groupNewEntriesByKey(newArray) {
  const byKey = new Map();
  for (const row of newArray) {
    const key = mmddFromDate(row.date);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(row);
  }
  return byKey;
}

/**
 * For a given MM-DD, return the contiguous run of MM-DD keys (ordered) that share
 * the same topic in the cleaned new JSON. Used to derive weeklyTheme for
 * new-only entries.
 */
function contiguousTopicRun(orderedKeys, dedupedByKey, targetKey) {
  const idx = orderedKeys.indexOf(targetKey);
  if (idx === -1) return [];
  const topic = dedupedByKey.get(targetKey)?.topic;
  if (!topic) return [];
  const run = [targetKey];
  for (let i = idx - 1; i >= 0; i--) {
    if (dedupedByKey.get(orderedKeys[i])?.topic === topic) run.unshift(orderedKeys[i]);
    else break;
  }
  for (let i = idx + 1; i < orderedKeys.length; i++) {
    if (dedupedByKey.get(orderedKeys[i])?.topic === topic) run.push(orderedKeys[i]);
    else break;
  }
  return run;
}

function isValidMMDD(key) {
  if (!/^\d{2}-\d{2}$/.test(key)) return false;
  const m = Number(key.slice(0, 2));
  const d = Number(key.slice(3, 5));
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const daysInMonth = { 1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
  return d <= daysInMonth[m];
}

async function applyPatch(opts) {
  const [patchRaw, currentRaw] = await Promise.all([
    fs.readFile(opts.patch, 'utf8'),
    fs.readFile(opts.current, 'utf8'),
  ]);
  const patchDoc = JSON.parse(patchRaw);
  const currentDoc = JSON.parse(currentRaw);
  const currentEntries = currentDoc.entries ?? {};
  const weeklyThemes = currentDoc.weeklyThemes ?? null;

  if (!patchDoc || typeof patchDoc !== 'object' || Array.isArray(patchDoc)) {
    throw new Error('Patch file must be a JSON object keyed by MM-DD');
  }

  const patchKeys = Object.keys(patchDoc).filter((k) => !k.startsWith('_'));
  const errors = [];
  const accepted = [];
  const overwrites = [];

  for (const key of patchKeys) {
    const entry = patchDoc[key];
    if (!isValidMMDD(key)) {
      errors.push(`${key}: not a valid MM-DD key`);
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      errors.push(`${key}: entry must be an object`);
      continue;
    }
    const month = Number(key.slice(0, 2));
    const day = Number(key.slice(3, 5));
    if (entry.month !== month) errors.push(`${key}: entry.month (${entry.month}) does not match key month (${month})`);
    if (entry.day !== day) errors.push(`${key}: entry.day (${entry.day}) does not match key day (${day})`);
    const topic = typeof entry.topic === 'string' ? entry.topic.trim() : '';
    const quote = typeof entry.quote === 'string' ? entry.quote.trim() : '';
    if (!topic) errors.push(`${key}: topic is blank — fill in from the physical diary`);
    if (!quote) errors.push(`${key}: quote is blank — fill in from the physical diary`);
    if (entry.source && typeof entry.source !== 'string') errors.push(`${key}: source must be a string`);
    if (key in currentEntries) overwrites.push(key);
    accepted.push(key);
  }

  if (errors.length > 0) {
    console.error('Patch validation failed:');
    for (const e of errors) console.error('  -', e);
    throw new Error(`${errors.length} validation error(s) — fix the patch file and re-run`);
  }

  if (overwrites.length > 0 && !opts.force) {
    console.error('Refusing to overwrite existing entries:');
    for (const k of overwrites) console.error(`  - ${k} (already present in ${opts.current})`);
    throw new Error(`${overwrites.length} key(s) already exist — re-run with --force to overwrite`);
  }

  const mergedEntries = { ...currentEntries };
  for (const key of accepted.filter((k) => !k.startsWith('_'))) {
    const entry = patchDoc[key];
    mergedEntries[key] = {
      month: entry.month,
      day: entry.day,
      topic: entry.topic.trim(),
      weeklyTheme: entry.weeklyTheme ?? null,
      specialDay: entry.specialDay ?? null,
      quote: entry.quote.trim(),
      source: entry.source || 'Paramahansa Yogananda',
      book: entry.book ?? null,
    };
  }

  const mergedDoc = {
    entries: mergedEntries,
    ...(weeklyThemes ? { weeklyThemes } : {}),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'patch',
    inputs: { patch: opts.patch, current: opts.current },
    counts: {
      patchKeys: patchKeys.length,
      accepted: accepted.length,
      overwritten: overwrites.length,
      currentKeysBefore: Object.keys(currentEntries).length,
      currentKeysAfter: Object.keys(mergedEntries).length,
    },
    acceptedKeys: accepted,
    overwrittenKeys: overwrites,
  };

  if (opts.dryRun) {
    console.log('[dry-run] patch would merge:');
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const reportPath = opts.report === DEFAULTS.report
    ? path.join(PROJECT_ROOT, 'artifacts/data-patch-report.json')
    : opts.report;

  await fs.mkdir(path.dirname(opts.out), { recursive: true });
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(opts.out, JSON.stringify(mergedDoc, null, 2) + '\n', 'utf8');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log('Patch merge complete.');
  console.log('  wrote:', opts.out, `(${Object.keys(mergedEntries).length} entries, +${accepted.length - overwrites.length} new, ${overwrites.length} overwritten)`);
  console.log('  report:', reportPath);
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.patch) {
    return applyPatch(opts);
  }
  const [newRaw, currentRaw] = await Promise.all([
    fs.readFile(opts.in, 'utf8'),
    fs.readFile(opts.current, 'utf8'),
  ]);
  const newArr = JSON.parse(newRaw);
  const currentDoc = JSON.parse(currentRaw);
  const currentEntries = currentDoc.entries ?? {};
  const weeklyThemes = currentDoc.weeklyThemes ?? null;

  if (!Array.isArray(newArr)) {
    throw new Error('Expected new JSON to be a flat array');
  }

  // --- 1. Dedupe new JSON by MM-DD using cleanliness heuristic.
  const grouped = groupNewEntriesByKey(newArr);
  const deduped = new Map();
  const dedupDecisions = [];
  for (const [key, rows] of grouped.entries()) {
    if (rows.length === 1) {
      deduped.set(key, rows[0]);
      continue;
    }
    const winner = rows.reduce((best, r) => (best ? pickCleanerRow(best, r) : r), null);
    deduped.set(key, winner);
    dedupDecisions.push({
      key,
      candidates: rows.map((r) => ({
        row: r.row,
        topic: r.topic,
        quoteHead: (r.quote ?? '').slice(0, 60),
        score: cleanlinessScore(r),
      })),
      winnerRow: winner.row,
    });
  }

  const orderedNewKeys = [...deduped.keys()].sort();

  // --- 2. Merge.
  const mergedEntries = {};
  const keysInNewOnly = [];
  const keysInCurrentOnly = [];
  const themesPreserved = [];
  const themesDerived = [];
  const themesNull = [];
  const quoteMismatches = [];

  const allKeys = new Set([...Object.keys(currentEntries), ...deduped.keys()]);
  for (const key of [...allKeys].sort()) {
    const newRow = deduped.get(key);
    const curEntry = currentEntries[key];

    if (newRow && !curEntry) keysInNewOnly.push(key);
    if (!newRow && curEntry) keysInCurrentOnly.push(key);

    if (newRow) {
      const month = parseInt(newRow.date.slice(5, 7), 10);
      const day = parseInt(newRow.date.slice(8, 10), 10);
      const preservedTheme = curEntry?.weeklyTheme || null;
      let weeklyTheme = reconcileWeeklyTheme(preservedTheme, newRow.topic);

      // For keys new-only, derive from contiguous topic run when possible.
      if (!preservedTheme) {
        const run = contiguousTopicRun(orderedNewKeys, deduped, key);
        if (run.length >= 3) {
          weeklyTheme = newRow.topic;
          themesDerived.push({ key, runLength: run.length, theme: newRow.topic });
        } else {
          themesNull.push({ key, reason: `topic run length ${run.length} < 3` });
        }
      } else {
        themesPreserved.push({ key, theme: weeklyTheme, original: preservedTheme });
      }

      const merged = {
        month,
        day,
        topic: newRow.topic,
        weeklyTheme: weeklyTheme ?? null,
        specialDay: curEntry?.specialDay || null,
        quote: newRow.quote,
        source: newRow.source || curEntry?.source || 'Paramahansa Yogananda',
        book: curEntry?.book || null,
      };
      mergedEntries[key] = merged;

      if (curEntry && curEntry.quote && curEntry.quote !== newRow.quote) {
        quoteMismatches.push({
          key,
          currentQuoteHead: curEntry.quote.slice(0, 80),
          newQuoteHead: newRow.quote.slice(0, 80),
          currentTopic: curEntry.topic,
          newTopic: newRow.topic,
        });
      }
    } else if (curEntry) {
      // Preserve any current-only entry untouched.
      mergedEntries[key] = { ...curEntry };
      if (curEntry.weeklyTheme) {
        themesPreserved.push({ key, theme: curEntry.weeklyTheme });
      } else {
        themesNull.push({ key, reason: 'current-only entry with no weeklyTheme' });
      }
    }
  }

  // --- 3. Source distribution for before/after diagnostic.
  const sourceDist = (obj) => {
    const out = {};
    for (const e of Object.values(obj)) {
      const s = e.source || '(unknown)';
      out[s] = (out[s] ?? 0) + 1;
    }
    return out;
  };

  const report = {
    generatedAt: new Date().toISOString(),
    inputs: {
      newRaw: opts.in,
      current: opts.current,
    },
    counts: {
      newRawRows: newArr.length,
      newDedupedKeys: deduped.size,
      currentKeys: Object.keys(currentEntries).length,
      mergedKeys: Object.keys(mergedEntries).length,
      duplicatesResolved: dedupDecisions.length,
      keysInNewOnly: keysInNewOnly.length,
      keysInCurrentOnly: keysInCurrentOnly.length,
      themesPreserved: themesPreserved.length,
      themesDerived: themesDerived.length,
      themesNull: themesNull.length,
      quoteMismatches: quoteMismatches.length,
    },
    sourceDistribution: {
      before: sourceDist(currentEntries),
      after: sourceDist(mergedEntries),
    },
    dedupDecisions,
    keysInNewOnly,
    keysInCurrentOnly,
    themesDerived,
    themesNull,
    quoteMismatches,
    weeklyThemesPreserved: Boolean(weeklyThemes),
    weeklyThemesCount: weeklyThemes ? Object.keys(weeklyThemes).length : 0,
  };

  const mergedDoc = {
    entries: mergedEntries,
    ...(weeklyThemes ? { weeklyThemes } : {}),
  };

  // --- 4. Emit.
  if (opts.dryRun) {
    console.log('[dry-run] merge-diary-json would write:');
    console.log('  out:   ', opts.out);
    console.log('  report:', opts.report);
    console.log('  summary:', JSON.stringify(report.counts, null, 2));
    if (opts.verbose) {
      console.log('\n[dry-run] dedup decisions:');
      for (const d of dedupDecisions) {
        console.log(
          `  ${d.key}  winner row=${d.winnerRow}  ` +
            d.candidates.map((c) => `[row=${c.row} score=${c.score} topic="${c.topic}"]`).join(' vs '),
        );
      }
    }
    return;
  }

  await fs.mkdir(path.dirname(opts.out), { recursive: true });
  await fs.mkdir(path.dirname(opts.report), { recursive: true });
  await fs.writeFile(opts.out, JSON.stringify(mergedDoc, null, 2) + '\n', 'utf8');
  await fs.writeFile(opts.report, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log('Merge complete.');
  console.log('  wrote:', opts.out, `(${Object.keys(mergedEntries).length} entries)`);
  console.log('  report:', opts.report);
  console.log('  counts:', report.counts);
}

main().catch((err) => {
  console.error('merge-diary-json failed:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

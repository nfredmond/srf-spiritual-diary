# Diary Data Merge — 2026-04-16

## Inputs

- **New source** — `~/Downloads/SRF_Spiritual_Diary_cleaned_raw.json` (364 rows, flat array keyed by "2024-MM-DD", fields: `row, date, topic, quote, source`).
- **Existing source** — `public/data/diary-entries.json` (346 MM-DD-keyed entries + top-level `weeklyThemes` map).

## Output

- Merged MM-DD-keyed JSON written back to `public/data/diary-entries.json` (346 entries).
- Diff report at `artifacts/data-merge-report.json`.

## Headline counts

| | value |
|---|---|
| Merged keys | 346 |
| New-only dates added | 0 (all 346 new-raw dates also exist in current) |
| Current-only dates kept | 0 (same set) |
| Themes preserved from current | 346 |
| Themes derived from adjacent topic runs | 0 |
| Quote mismatches where new won | 114 |
| Duplicate same-date pairs in new-raw resolved | 18 |

## Merge rules

1. **Union the key set.** The two sources carry the same 346 MM-DD keys. No derivation fallback was needed.
2. **New JSON wins on `quote`, `topic`, `source`.** Current file donates `weeklyTheme`, `specialDay`, `book`, and the top-level `weeklyThemes` map.
3. **De-dup within new-raw.** New-raw has 18 date pairs where one row is clean and one is polluted (topic/quote leaked across columns). Used a cleanliness score to pick the cleaner one:
   - `+3` TitleCase topic
   - `+2` topic has no trailing period
   - `+2` topic does not start with a fragment word (continuation starters like "is", "of", "and", "the", "each time", etc.)
   - `-4` topic word count > 5
   - `-2` topic ends with a non-letter
   - `-3` topic begins with a continuation word
   - `-2` topic-word leak into quote (or quote-word leak into topic)
   - tie-break: longer non-continuation topic wins
4. **Theme reconciliation.** If the current file's `weeklyTheme` is polluted (`!isTitleCase || hasTrailingPeriod || non-letter ending || word count > 5`) AND the new JSON's topic for the same MM-DD is clean, swap the theme for the clean topic.

## Residual polluted entries

Three MM-DD keys remain with polluted topic strings because both sources are polluted: `03-30`, `07-10`, `11-10`. Flagged for manual review; no programmatic decision was made on these.

## Missing dates (20)

The merged output has 346 entries. A full year is 366 (365 + leap day). Both source files were missing the same 20 keys, so the gap is upstream of the merge:

| Month | Missing keys |
|---|---|
| February | `02-17`, `02-25`, `02-29` |
| March | `03-05` |
| May | `05-14`, `05-29` |
| **September** | **`09-05`, `09-07`, `09-15`, `09-16`, `09-17`, `09-22`, `09-23`, `09-25`, `09-26`, `09-27`, `09-28`, `09-29`** (12 — suspicious; likely a page/section dropout in the raw scan) |
| October | `10-04` |
| December | `12-14` |

Path forward: hand-transcribe from Nathaniel's physical copy of the SRF Spiritual Diary. A small additive JSON in the `{ "MM-DD": { month, day, topic, quote, source, weeklyTheme? } }` shape can be run through `scripts/merge-diary-json.mjs` to fold the entries in.

Do **not** scrape or LLM-generate Yogananda quotes — the covenant/legal review flagged on this project applies even more strongly to fabricated attribution.

## Preserved

- 02-29 present in the merged output if either source has it.
- Top-level `weeklyThemes: Record<string, { startDate, endDate, theme }>` map carried over intact.
- Source distribution unchanged between current and merged outputs (all six attribution sources preserved in the same counts).

## Attribution caveat (not resolved by this merge)

The SPA footer currently reads "© 2025 Self-Realization Fellowship. All rights reserved." That line is not accurate for a personal / unofficial app and needs a covenant/legal review before any public deploy. Flagged as open; no change made in this pass.

## Reproducibility

```bash
# dry run
node scripts/merge-diary-json.mjs --dry-run --verbose

# apply
node scripts/merge-diary-json.mjs
```

Outputs: `public/data/diary-entries.json` + `artifacts/data-merge-report.json`.

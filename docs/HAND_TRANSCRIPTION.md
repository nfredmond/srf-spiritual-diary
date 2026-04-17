# Hand-Transcription Walkthrough — Closing the 20 Missing Diary Dates

The merged `public/data/diary-entries.json` has 346 of 366 MM-DD keys. The
remaining 20 dates were absent from both raw sources (see
`docs/DATA_MERGE_2026-04-16.md` for the list and the likely cause — a page
dropout in the source scan around September). Closing those gaps needs a
physical copy of the SRF Spiritual Diary; this doc walks through doing it
cleanly.

**Do not** scrape these dates, generate them with an LLM, or paraphrase. The
covenant/legal posture of this project (see `docs/COVENANT.md`) depends on
every Yogananda quote being faithfully sourced from the printed diary.

## The 20 missing keys

| Month | Keys |
|---|---|
| February | `02-17`, `02-25`, `02-29` |
| March | `03-05` |
| May | `05-14`, `05-29` |
| September | `09-05`, `09-07`, `09-15`, `09-16`, `09-17`, `09-22`, `09-23`, `09-25`, `09-26`, `09-27`, `09-28`, `09-29` |
| October | `10-04` |
| December | `12-14` |

## Prerequisites

- A physical copy of the SRF Spiritual Diary.
- Node 20+ (`node --version` to check).
- A local clone of this repo with `npm install` already run.

## Steps

### 1. Copy the template

```bash
cp data/missing-dates-patch.example.json data/missing-dates-patch.json
```

The working file `data/missing-dates-patch.json` is already gitignored (via
the `.env.*`-style catch-alls in `.gitignore` plus being named non-example —
double-check before committing that it didn't sneak in).

### 2. Fill in `topic` and `quote` for each date

Open the physical diary to each date. For each key:

- **`topic`** — the header above the day's entry. Most entries share a topic
  across a multi-day section (the "weekly theme" concept) and the topic is
  printed once at the top of that section.
- **`quote`** — the body text under the date heading. Copy faithfully,
  including the ellipses, em-dashes, and punctuation. Don't paraphrase.
- **`weeklyTheme`** (optional) — if the printed section header differs from
  the entry topic (rare, but happens around special days), put the section
  header here. Otherwise leave as `null`; the merge will default it.
- **`specialDay`** (optional) — if the printed page commemorates a birthday
  or anniversary (e.g., "Birthday of Sri Gyanamata"), put that string here.
- **`book`** (optional) — if the printed page credits a specific book below
  the quote, put the title here. Otherwise leave as `null`.

You don't have to fill in all 20 at once. The validator only rejects
entries whose `topic` or `quote` are blank — any entry you haven't touched
yet will be flagged, and you can keep iterating until every row is filled.

If you want to commit a partial batch now and do the rest later, remove the
unfilled rows from the patch file and merge only the ones you've completed.

### 3. Dry-run validation

```bash
node scripts/merge-diary-json.mjs --patch data/missing-dates-patch.json --dry-run
```

The dry-run:
- Rejects invalid MM-DD keys (e.g., `13-40`).
- Rejects entries whose `topic` or `quote` is blank.
- Rejects entries whose `month`/`day` don't match the MM-DD key.
- Refuses to overwrite any key that already exists in
  `public/data/diary-entries.json` (use `--force` only if you're deliberately
  correcting a bad existing entry).

If the dry-run prints a JSON summary with `accepted` = your key count and
`overwritten` = 0, you're ready to apply.

### 4. Apply the patch

```bash
npm run patch-missing-dates
```

This writes the merged entries back to `public/data/diary-entries.json` and
produces `artifacts/data-patch-report.json` with a before/after count.

### 5. Re-seed Supabase

Production reads from Supabase via `auto`-fallback; the client also keeps the
JSON copy as a backup. To propagate the new entries to prod, re-seed:

```bash
SUPABASE_URL="https://ofbbabvrkscumedwybxh.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
npm run seed:supabase
```

Pull the key from `supabase projects api-keys --project-ref ofbbabvrkscumedwybxh`
if you need it, or from `vercel env pull` (it'll be empty for sensitive
vars — go to the Vercel dashboard in that case).

### 6. Verify

```bash
npm run verify
```

Should be green: typecheck clean, 5 lib tests pass, Vite build succeeds.

### 7. Commit + push

```bash
git add public/data/diary-entries.json artifacts/data-patch-report.json
git commit -m "data: hand-transcribe missing diary dates (<n> of 20)"
git push origin main
```

The push auto-deploys to `https://srf-spiritual-diary.vercel.app` via
Vercel (see `docs/DEPLOY_LOG.md` for the deploy pattern). The SPA bundle
hash changes when the JSON file changes, so Vercel will ship a new
deployment with the added entries immediately.

Don't commit `data/missing-dates-patch.json` itself — it's a scratch file.
If the filled-in patch is useful as reference, save it under
`artifacts/hand-transcription-<date>.json` instead.

## Troubleshooting

**"topic is blank" errors** — the validator is reminding you that you
haven't typed anything for that date yet. Either fill it in or remove it
from the patch file.

**"month (X) does not match key month (Y)"** — you edited the `month` or
`day` field. The template ships with the correct values; revert.

**"N key(s) already exist — re-run with --force to overwrite"** — you're
trying to replace an already-populated entry. Only use `--force` when you're
deliberately correcting a known-bad entry; otherwise the patch file has a
typo in the key.

**Seed fails with "cannot insert a non-DEFAULT value into column 'date_key'"**
— the seed script was fixed for this in commit `3f24dcb`; make sure you're on
`main` and pulled recently.

## Why the gaps are what they are

The 12-in-a-row September run (09-15 → 09-29 with a few gaps) looks like a
page-range dropout in the raw OCR scan, not a gap in the printed diary. The
single-date misses in Feb/Mar/May/Oct/Dec are more likely individual
page-turn errors during the same scan. Either way, the physical book is
authoritative.

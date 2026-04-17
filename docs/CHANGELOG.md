# Changelog

## 2026-04-16

### Data
- Merged `SRF_Spiritual_Diary_cleaned_raw.json` with the existing `public/data/diary-entries.json`. New quotes and topic corrections in; preserved weekly themes, special days, books, and the top-level `weeklyThemes` map. Cleanliness-scored de-dup picked the cleaner row when a date had two variants. Full audit at `artifacts/data-merge-report.json`. See `docs/DATA_MERGE_2026-04-16.md` for rules.

### Supabase (v4)
- `supabase/migrations/202604161200_diary_v4_agentic_merge.sql`:
  - Added nullable provenance columns to `diary_entries`: `source_book`, `source_year`, `jurisdiction`, `confidence_score`, `provenance`.
  - Added QA columns to `daily_renders`: `prompt_hash`, `image_qa_pass`, `image_qa_notes`, `run_kind`.
  - Introduced `dispatch_logs` (multi-channel delivery audit).
  - Enabled RLS on all diary tables. Anon can read `diary_entries` and `daily_renders`; writes require the service role.
- `scripts/seed-diary-entries.mjs` upserts the new nullable columns when present.

### Client
- New typed `getDiaryEntry(dateKey)` helper in `src/lib/supabase.ts` (5 s timeout, `.maybeSingle()`).
- `src/hooks/useDiaryEntry.ts` now tries Supabase first and falls back to the JSON file on null/error. Gated by `VITE_SRF_DATA_SOURCE` (`auto` | `supabase` | `json`; default `auto`).
- New `src/lib/diaryDate.ts` with `toMMDD`, `fromMMDD`, `leapDayFallback`, `isValidDiaryDate`.
- Fixed a hardcoded-year navigation bug in `src/App.tsx` (random-quote and search-result handlers).

### Server
- `api/today.ts` and `api/run-daily.ts` now share a single `loadDiaryEntry(supabase, {...})` helper in `api/_lib/common.ts`.

### UX
- **Weekly Themes drawer** — hotkey `W`, Esc to close, deep-linked to the current entry's theme group.
- **Listen button** — new `useSpeech` hook + Volume2 button on `QuoteDisplay`; settings (voice, rate) persisted to `localStorage` under `srf-speech-settings`.
- **Reflection prompt** — new `api/reflection-prompt.ts` Vercel function + "Suggest a prompt" button in `NotesPanel`. Per-IP rate-limited (10/min) and cached in-memory by quote hash for 24 h.
- Existing Share + Copy buttons retained; `navigator.share` with clipboard fallback is already in place.

### Housekeeping
- Moved `projects/srf-diary-agentic/` → `projects/_archive/srf-diary-agentic-2026-04-16/`.
- Moved nested `projects/srf-spiritual-diary/srf-spiritual-diary/` (76 KB legacy snapshot) → `projects/_archive/srf-spiritual-diary-v1-snapshot-2026-04-16/`.

### Not in this release
- No Vercel deploy. No Next.js migration. No rewrites of working components. No production cron wiring.

### Verification
- `npm run verify` green: typecheck clean, 5 lib tests pass, Vite build succeeds (631 KB bundle, 189 KB gzipped).

### Findings surfaced (not yet resolved)
- **20 missing diary dates** — merged output is 346/366 entries. Both source files were missing the same 20 keys (full list in `docs/DATA_MERGE_2026-04-16.md`). 12 of the 20 are in September, which smells like a single page/section dropout in the raw scan. Path forward: hand-transcribe from Nathaniel's physical SRF Spiritual Diary copy; do not scrape or LLM-generate.
- **Local image generation path** — considered, parked in `docs/FEATURES.md`. Recommended route is running `scripts/daily-pipeline.mjs` locally against the existing ComfyUI at `127.0.0.1:8188` and uploading the PNG to Supabase Storage; additive provider layer keeps the Gemini path intact as fallback.

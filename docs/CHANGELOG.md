# Changelog

## 2026-04-17

### Data path live on production
- Added 5 Supabase env vars to Vercel Production (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SRF_DATA_SOURCE=auto`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Live bundle now carries the Supabase URL + anon JWT; anon REST read of `/rest/v1/diary_entries` returns 346 entries. `auto` mode still falls back to the JSON file if Supabase errors. See `docs/DEPLOY_LOG.md` for per-deploy smoke outcomes.
- Schema reconcile migration `202604170001_diary_schema_reconcile.sql` — brings remote in line with local v3/v4 migrations (rename `entry_key`→`date_key`, add `book`, widen `source_year` to integer, add unique index). Seed script dropped the generated `date_key` from its insert payload.

### Image provider layer (Phase 2)
- New `scripts/lib/imageProviders.mjs` — `getImageProvider()` factory returns `GeminiImageProvider` (default) or `ComfyUIImageProvider` based on `SRF_IMAGE_PROVIDER` env. `scripts/daily-pipeline.mjs` now calls the factory instead of an inline Gemini fetch.
- ComfyUI provider posts an 8-step SDXL workflow to `127.0.0.1:8188` (`RealVisXL_V5.0_fp16.safetensors` + `Hyper-SDXL-8steps-CFG-lora.safetensors`), polls `/history/{id}`, fetches the PNG via `/view`, uploads to Supabase Storage bucket `daily-renders/{runDate}.png`, and stores the public HTTPS URL in `daily_renders.image_url`.
- Migration `202604170002_daily_renders_image_provider.sql` adds a `image_provider` TEXT column + index (additive, idempotent).
- `.env.example` documents the new `SRF_IMAGE_PROVIDER`, `SRF_IMAGE_BUCKET`, and `SRF_COMFY_*` vars.
- Verified 2026-04-17: ComfyUI path produced `daily-renders/2026-04-16.png` (1.65 MB, public HTTPS) + `daily_renders` row with `image_provider='comfyui'`. Gemini path is a byte-identical code port of the prior inline call; not live-tested this session (production `GEMINI_API_KEY` is marked sensitive and not exposed via `vercel env pull`).

### Docs / hygiene
- `docs/DEPLOY_LOG.md` — new file tracking production deploys `ohhynqvph`, `dagtqkwiy`, `qaheoznxj`, `n0wu46m2s` with commits, changes, and smoke results.
- `projects/srf-spiritual-diary/WORKSPACE_DEPRECATED.md` — stub at the stale workspace copy pointing at the canonical repo. No files moved or deleted.
- `.gitignore` widened to `.env.*` (excluding `.env.example`) + excludes `supabase/.temp/` + `supabase/.branches/`.

### Not in this release
- No production ComfyUI path (Vercel cron can't reach the home box). `SRF_IMAGE_PROVIDER` stays unset in Production → Gemini continues to serve daily renders.
- No hand-transcription plumbing for the 20 missing MM-DD dates.

### Verification
- `npm run verify` green after all Phase 2 edits.

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

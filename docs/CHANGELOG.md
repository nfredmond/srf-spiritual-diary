# Changelog

## 2026-04-17 (Round 3 Chunk C — component tests)

### Vitest + React Testing Library
- `npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`.
- New `vitest.config.ts` — jsdom environment, `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`), `include: src/components/**/*.test.tsx` so the runner stays clear of the existing `src/lib/*.test.ts` suite which still runs under `node --test`.
- `package.json` — split the `test` script into `test:lib` (the existing `node --experimental-strip-types --test src/lib/*.test.ts` runner) and `test:components` (`vitest run`). The top-level `test` chains both and `verify` keeps calling `npm test`, so CI-style verification exercises all 28 tests in one shot.

### 23 component tests across 5 colocated files
- `src/components/AboutModal/AboutModal.test.tsx` — four sections render, close button fires `onClose`, yogananda.org link carries `target="_blank" rel="noopener noreferrer"`, unofficial / unaffiliated posture copy is present. (4 tests)
- `src/components/OnboardingTour/OnboardingTour.test.tsx` — starts on Welcome, Skip on step 0 fires `onComplete`, Next→Next→Got-it fires `onComplete` once, progress dots expose `aria-current="step"` on the active panel. (4 tests)
- `src/components/WeekRhythm/WeekRhythm.test.tsx` — with `globalThis.fetch` mocked to return a 7-day fixture: 7 tiles render centered on `selectedDate` with topics wired in, selected tile gets `aria-current="date"`, clicking a tile fires `onSelectDate` with the right Date, visited tiles tag their aria-label `(visited)`. (4 tests)
- `src/components/DateNavigator/DateNavigator.test.tsx` — formatted date renders, prev/next/today call `onDateChange` with the correct date, clicking the date label opens the `DatePickerModal`. (5 tests)
- `src/components/QuoteDisplay/QuoteDisplay.test.tsx` — topic/quote/source render, weekly-theme pill renders when present, favorite + notes buttons fire their callbacks, aria-label reflects `isFavorite`, both buttons are omitted when their callbacks are absent. (6 tests)

### Verification
- `npm run verify` green: typecheck clean, 5 lib tests pass, 23 component tests pass, Vite + Workbox build succeeds with PWA v1.2.0 precaching 26 entries.
- No runtime code change; deploy `ekxo1bdu4` serves the same app-shell hash as `opvxbec47`.

## 2026-04-17 (Round 3 Chunk B — offline)

### Service worker + precache
- `npm i -D vite-plugin-pwa workbox-window`.
- `vite.config.ts` — `VitePWA` plugin registered with `registerType: 'autoUpdate'`, `manifest: false` (reuse the existing hand-written `public/manifest.json`), `injectRegister: 'auto'`. Workbox config: `clientsClaim` + `skipWaiting` (new SW takes over without a full tab close); `navigateFallback: /index.html` so SPA routes still work offline. Precache glob picks up the app shell, every lazy modal chunk, every vendor chunk, `data/diary-entries.json` (fingerprinted with a content hash at build time), the 192/512 icons, and the apple-touch-icon — 26 entries, ~1 MB. Oversized crawler/screenshot images (`og-image.png`, `screenshot-*.png`, `art/**`, full-size `favicon-transparent.png`, `logo-transparent.png`) excluded from precache; those are runtime-cached on first visit instead.
- Runtime caches:
  - `/art/**` + `/branding/**` (same-origin images) — cache-first, 30 days, 30 entries.
  - Supabase `/rest/v1/**` — stale-while-revalidate, 7 days, 50 entries. Gives an offline user the last-seen diary rows instantly.
  - Supabase `/storage/v1/object/public/daily-renders/**` — cache-first, 1 year, 400 entries. Each day's render is effectively immutable, so once you've seen it you keep it.
  - `fonts.googleapis.com` — stale-while-revalidate.
  - `fonts.gstatic.com` — cache-first, 1 year, 30 entries.
- Registration is auto-injected by the plugin via a 134-byte `/registerSW.js` script tag appended to `index.html`. No changes to `main.tsx` or `App.tsx` were needed.
- Result: a devotional reader sitting on a phone in a forest / airplane / cabin opens today's entry after the first visit, and any day they've navigated to before still renders.

### Verification
- `npm run verify` green: typecheck + 5 lib tests + Vite build (`PWA v1.2.0 · precache 26 entries (1034.49 KiB) · files generated dist/sw.js + dist/workbox-*.js`).
- Live smoke (`opvxbec47`): homepage 200 with `<script id="vite-plugin-pwa:register-sw">` in HTML; `/sw.js` 200 (3.5 KB application/javascript); `/registerSW.js` serves the standard `navigator.serviceWorker.register('/sw.js', { scope: '/' })` payload; `/data/diary-entries.json` still 200 (186 KB).

## 2026-04-17 (Round 3 Chunk A — performance)

### Bundle split
- `src/App.tsx` — 10 modal components converted to `React.lazy(() => import(...))` with a single `<Suspense fallback={null}>` boundary around the modal block. Lazy: `FavoritesPanel`, `EnhancedMeditationTimer`, `EnhancedQuoteCard`, `NotesPanel`, `StatsDashboard`, `CalendarView`, `ExportImport`, `WeeklyThemeView`, `AboutModal`, `OnboardingTour`. Each now ships as its own 2.5–7.9 KB chunk, fetched the first time the user opens that modal. Above-the-fold imports remain eager: `DateNavigator`, `WeekRhythm`, `QuoteDisplay`, `SearchBar`/`SearchResults`, `ThemeSwitcher`, `ReadingControls`, `ImageGenerator`, `SkeletonLoader`.
- `vite.config.ts` — `rollupOptions.output.manualChunks` splits the heavy vendors into independent chunks: `vendor-motion` (115.96 KB, framer-motion), `vendor-supabase` (171.65 KB, @supabase/supabase-js), `vendor-headless` (47.61 KB, @headlessui/react), `vendor-dates` (20.06 KB, date-fns), `vendor-icons` (18.12 KB, lucide-react). Each caches independently across deploys; a CSS-only change no longer invalidates the 172 KB Supabase bundle.
- Result: main shell 643.94 KB → **227.08 KB** (192.18 KB → **69.94 KB** gzipped). Vite "chunks larger than 500 kB" warning removed.

### Gemini image path unified to Storage
- `scripts/lib/imageProviders.mjs` — `GeminiImageProvider.generate()` now uploads the PNG to Supabase Storage (same `daily-renders/{runDate}.png` path the ComfyUI provider already used) and returns the public HTTPS URL. Falls back to the base64 data URL only when Storage credentials are missing or upload fails. Keeps `daily_renders.image_url` a consistent HTTPS URL shape across both providers and ends the ~1 MB/row bloat from data-URL rows.

### Verification
- `npm run verify` green (typecheck + 5 lib tests + Vite build, no warnings).
- Live smoke (`5wf6qfrzf`): `https://srf-spiritual-diary.vercel.app` returns 200; initial HTML preloads the app shell + 5 vendor chunks only, no modal chunks; `AboutModal` chunk reachable at the hashed asset URL; `/api/reflection-prompt` still responding.

## 2026-04-17

### Data path live on production
- Added 5 Supabase env vars to Vercel Production (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SRF_DATA_SOURCE=auto`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Live bundle now carries the Supabase URL + anon JWT; anon REST read of `/rest/v1/diary_entries` returns 346 entries. `auto` mode still falls back to the JSON file if Supabase errors. See `docs/DEPLOY_LOG.md` for per-deploy smoke outcomes.
- Schema reconcile migration `202604170001_diary_schema_reconcile.sql` — brings remote in line with local v3/v4 migrations (rename `entry_key`→`date_key`, add `book`, widen `source_year` to integer, add unique index). Seed script dropped the generated `date_key` from its insert payload.

### Image provider layer (Phase 2)
- New `scripts/lib/imageProviders.mjs` — `getImageProvider()` factory returns `GeminiImageProvider` (default) or `ComfyUIImageProvider` based on `SRF_IMAGE_PROVIDER` env. `scripts/daily-pipeline.mjs` now calls the factory instead of an inline Gemini fetch.
- ComfyUI provider posts an 8-step SDXL workflow to `127.0.0.1:8188`, polls `/history/{id}`, fetches the PNG via `/view`, uploads to Supabase Storage bucket `daily-renders/{runDate}.png`, and stores the public HTTPS URL in `daily_renders.image_url`.
- Migration `202604170002_daily_renders_image_provider.sql` adds a `image_provider` TEXT column + index (additive, idempotent).
- `.env.example` documents the new `SRF_IMAGE_PROVIDER`, `SRF_IMAGE_BUCKET`, and `SRF_COMFY_*` vars.
- Gemini path is a byte-identical code port of the prior inline call; not live-tested this session (production `GEMINI_API_KEY` is sensitive and not exposed via `vercel env pull`).

### ComfyUI model + prompt tuning
- Default checkpoint flipped `RealVisXL_V5.0` (photoreal, drifts toward portraits) → `DreamShaperXL_Turbo_v2_1` (painterly, devotional-art bias, already distilled for ~8-step generation). CFG dropped `5.0` → `2.5` to match Turbo expectations. `SRF_COMFY_LORA` default emptied — Turbo checkpoints don't want extra step-reduction LoRAs, and the workflow now skips the `LoraLoader` node entirely when no LoRA is set (ComfyUI rejects `lora_name=''`).
- `scripts/lib/prompt-engine.mjs` hardened against figurative output: added `no humans / no people / no faces / no portraits / no saints / no gurus / no deities / no meditating figure / no sitting figure / no robed person / no monk` to the negative prompt, and rewrote the composition clause to "pure unpopulated landscape and natural symbolism only." The fallback when no symbol keywords match is now "unpopulated landscape metaphor using only natural elements" rather than "contemplative visual metaphor" (which DreamShaper read as a meditating figure).
- Verified 2026-04-17 across 4 varied topics (Obedience / Prayer / Freedom / Overcoming Temptation) → pure devotional landscapes, zero human figures, painterly light, lotus / mountain / water / sky composition. Sample URLs: `daily-renders/sample-v3-{01-15,04-16,07-04,10-28}.png` in Supabase Storage.

### Hand-transcription plumbing (Phase 5)
- New `data/missing-dates-patch.example.json` — 20-key template for the MM-DD dates missing from `public/data/diary-entries.json` (3 in Feb, 1 in Mar, 2 in May, 12 in Sep, 1 in Oct, 1 in Dec). Copy to `data/missing-dates-patch.json` (gitignored), fill in from the physical diary, run the merge.
- Extended `scripts/merge-diary-json.mjs` with `--patch <file>` mode (plus `--force` for overwrites and `--dry-run` for validation). The validator rejects blank topic/quote, invalid MM-DD keys, month/day mismatches, and — unless `--force` is passed — refuses to overwrite entries already present in the current JSON.
- New npm script `patch-missing-dates` wraps the common path.
- New `docs/HAND_TRANSCRIPTION.md` walks through the flow (copy template → fill in → dry-run → apply → re-seed Supabase → verify → commit → auto-deploy). Explicitly rejects scraping or LLM-generated quotes (covenant posture).

### Docs / hygiene
- `docs/DEPLOY_LOG.md` — new file tracking production deploys `ohhynqvph`, `dagtqkwiy`, `qaheoznxj`, `n0wu46m2s` with commits, changes, and smoke results.
- `projects/srf-spiritual-diary/WORKSPACE_DEPRECATED.md` — stub at the stale workspace copy pointing at the canonical repo. No files moved or deleted.
- `.gitignore` widened to `.env.*` (excluding `.env.example`) + excludes `supabase/.temp/` + `supabase/.branches/`.

### UX polish (Phase 6)
- New `src/components/WeekRhythm/WeekRhythm.tsx` — compact 7-tile horizontal strip under the `DateNavigator` showing the three days before and after `selectedDate` with weekday letters, day number, and truncated topic. Today gets a soft lotus/gold halo; the selected tile has the blue-gradient fill; visited MM-DD keys (from `useQuoteHistory`) get a small gold dot. Clicking a tile navigates. Fetches `diary-entries.json` once on mount.
- New `src/components/AboutModal/AboutModal.tsx` — Headless UI `Dialog` reusing the `DatePickerModal` pattern. Four sections (what this is, attribution + covenant disclosure, local-only data, keyboard tips) plus a footer link to `yogananda.org` for readers who want to support the teachings directly. Wired to a new `Info` icon in the top-right utility toolbar.
- New `src/components/OnboardingTour/OnboardingTour.tsx` — three-panel first-visit welcome (what this is → navigation hotkeys → toolbar tour). Step indicator, Skip / Back / Next / Got-it buttons. Gated on `localStorage.srf-onboarding-completed`; dismissal (Skip or Got-it) sets the flag so it never re-fires. Existing users without the flag will see the tour once on their next visit, which is the intended upgrade path.
- `src/App.tsx` — imports the two modals plus `WeekRhythm`, pulls `history` from `useQuoteHistory` to derive `visitedKeys`, adds `showAbout` / `showOnboarding` state, `handleOnboardingComplete`, the first-visit effect, the Info toolbar button, and mounts `WeekRhythm` between `DateNavigator` and the quote body.

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

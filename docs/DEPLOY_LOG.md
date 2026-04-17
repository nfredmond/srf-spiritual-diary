# Deploy Log

Production URL: `https://srf-spiritual-diary.vercel.app` · Vercel team: `natford` · Project: `srf-spiritual-diary` · Auto-deploys on push to `main`.

## 2026-04-17

| Time (UTC) | Deploy | Commit | Change | Smoke |
|---|---|---|---|---|
| ~21:00 | `ohhynqvph` | `8464f6d` | Phase 0: reconcile workspace → standalone. 30 files (Supabase-first data path, weekly-theme drawer, Listen/TTS, reflection-prompt API, diaryDate utils, v3+v4 migrations). Nested legacy `srf-spiritual-diary/` subtree moved to `_archive/`. | Footer still had old SRF copyright text. Reflection API returned 200. |
| ~21:12 | `dagtqkwiy` | `0baeb9a` | Phase 3: footer rewritten to unofficial-personal-devotional-reader language + `docs/COVENANT.md`. | Bundle grep confirmed new "unofficial personal devotional reader" text live. |
| ~22:40 | `qaheoznxj` | `3f24dcb` | Phase 1 reconcile migration `202604170001` + seed-script fix (drop generated `date_key` from insert payload). Build-only change; SPA output unchanged. | No regression; bundle hash unchanged from `dagtqkwiy`. |
| ~22:50 | `n0wu46m2s` | redeploy of `dagtqkwiy` | Phase 4: added 5 Supabase env vars to Production (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SRF_DATA_SOURCE=auto`). | Bundle carries `ofbbabvrkscumedwybxh.supabase.co` + anon JWT. Anon REST read of `/rest/v1/diary_entries` returns 346 entries with `Content-Range: 0-345/346`. Today's entry (`04-17`, topic "Prayer") renders from Supabase. `/api/reflection-prompt` returns `{ok:true, prompt:"..."}`. |
| ~05:07 (next day UTC) | `fd7q86yub` | `e6403cf` | Phase 2: env-switched image provider layer (`scripts/lib/imageProviders.mjs`) + migration `202604170002` (`daily_renders.image_provider` column) + `.env.example` + CHANGELOG/FEATURES. SPA output unchanged. | Live URL returns 200; `/api/reflection-prompt` returns 200 with `{ok:true, prompt:"..."}`. Local ComfyUI run for `2026-04-16` uploaded 1.65 MB PNG to `daily-renders/2026-04-16.png` with `image_provider='comfyui'` in `daily_renders`. |
| ~06:07 (next day UTC) | `h17guxlzg` | `0e47b47` | Phase 6 UX polish: new `AboutModal` + `OnboardingTour` components. Info icon in toolbar; first-visit tour gated on `localStorage.srf-onboarding-completed`. Bundle grew 631 KB → 642 KB (+2.5 KB gzipped). | Live URL returns 200; bundle `index-DEJxtvnY.js` carries both new strings (`About this reader`, `srf-onboarding-completed`). No backend change. |
| ~06:14 (next day UTC) | `9pscg3fka` | `43b6397` | Phase 6 continued: new `WeekRhythm` strip under `DateNavigator` — 7 tiles centered on the selected day with weekday letter, day number, truncated topic, and a visit-history dot. Bundle 642 KB → 644 KB (+0.67 KB gzipped). | Live URL returns 200; bundle `index-DMSarjDN.js` carries `week-rhythm-tile` class and `Reading rhythm for the days` aria label. No backend change. |
| ~07:00 (next day UTC) | `5wf6qfrzf` | `ccb709a` | Round 3 Chunk A — perf: `React.lazy` 10 modals + `manualChunks` vendor split (framer-motion, Headless UI, Supabase, date-fns, lucide-react) + Gemini image path unified to Supabase Storage. Main bundle 643.94 KB → 227.08 KB (192.18 KB → 69.94 KB gzipped). Vite >500 KB warning gone. | Live URL returns 200; HTML preloads shell + 5 vendor chunks only, no modal chunks in initial payload. `AboutModal-D3UdY2-K.js` reachable at 4.37 KB. `/api/reflection-prompt` returns validation error on empty payload (alive). |

## Env vars on Production

As of 2026-04-17:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SRF_DATA_SOURCE=auto` (client-side Supabase)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-side API routes)
- `GEMINI_API_KEY` (Gemini reflection prompts + on-demand image generation)
- `OPENAI_API_KEY` (legacy, pre-Gemini; retained for compatibility)

Not set (Phase 2 lane): `SRF_IMAGE_PROVIDER`, `SRF_COMFY_*`, `SRF_TEXT_MODEL`.

## Rollback

`vercel rollback <deploy-url> --scope natford` or alias a prior deploy in the Vercel UI. The last known-good production deploy with the JSON-fallback data path is `dagtqkwiy` (before env vars landed). The last known-good production deploy with the honest footer is also `dagtqkwiy`.

## Notes

- Every push to `main` auto-deploys to production. Preview deploys happen on PRs.
- Production promotion is **not gated on a covenant review** — the current posture (personal unofficial devotional reader, honest footer) is acceptable per `docs/COVENANT.md` "Posture gates" → "Public but unannounced." Broader announcement / link from company site / app store listing still blocks on the `docs/COVENANT.md` open items.

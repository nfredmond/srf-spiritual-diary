# Feature roadmap — SRF Spiritual Diary

Current state is tracked in `docs/CHANGELOG.md`. This file is a parking lot for deferred work.

## Deferred UX (considered during the 2026-04-16 pass, not shipped)

### Multi-day reading-rhythm view
A weekly/monthly zoom-out that shows the last N days of readings + whether the reader opened them, to encourage streaks without shaming them. Likely fits alongside `StatsDashboard`; could reuse the `useReadingStreak` hook. Deferred because it needs a small design pass (calendar heatmap vs. list vs. timeline) before any code.

### First-visit onboarding tour
One-time overlay that walks new visitors through: today's reading, keyboard shortcuts (`?`, `/`, `W`, `M`), favorites (`F`), notes, meditation timer. Needs a `useFirstVisit` flag in localStorage and a small Headless UI `Dialog` sequence. Deferred because the app already works fine cold; onboarding is nice-to-have, not blocking.

## Deferred technical paths

### Local image generation (zero API cost)

Status: considered 2026-04-16, not built. Goal: stop paying Gemini image-API cost for the daily render.

Three viable routes, ordered by practicality for this app:

1. **Local ComfyUI → Supabase Storage, generated offline (recommended).** Nathaniel already runs ComfyUI at `127.0.0.1:8188`. Adapt `scripts/daily-pipeline.mjs` to call the ComfyUI HTTP API instead of Gemini, upload the PNG to Supabase Storage, and upsert the URL into `daily_renders`. Vercel then only reads the cached URL; it never calls an image API. Additive: keep Gemini path behind a provider env flag as a fallback. Cost: $0 plus home-power. Tradeoff: the box needs to be on when the daily job fires, or the pipeline pre-generates a week at a time.
2. **Tunnel local ComfyUI to Vercel** (Cloudflare Tunnel / Tailscale Funnel). Vercel's `api/run-daily.ts` calls the tunnel URL. Zero cost; fragile — home-network outage = no image.
3. **Small always-on server (~$5–10/mo)** running ComfyUI behind an API key. More reliable than home; still materially cheaper long-term than Gemini-per-image.

Recommended next step is (1): additive provider layer, no removal of the Gemini path. Needs a `ComfyUIImageProvider` module in `api/_lib/` with the same shape as the Gemini generator, and a `SRF_IMAGE_PROVIDER=comfyui|gemini` env switch. Stays inside the no-new-deploys boundary of the 2026-04-16 pass.

### Hand-transcribe the 20 missing diary dates

Status: missing dates identified 2026-04-16, content not yet recovered. See `docs/DATA_MERGE_2026-04-16.md` for the list. Path forward is physical-book transcription, not scraping or LLM generation.

## Open covenant / legal item

The SPA footer currently reads "© 2025 Self-Realization Fellowship. All rights reserved." That line is not accurate for a personal / unofficial app and carries real IP risk for Yogananda material. A covenant / legal review is required before any public deploy. Tracked outside this doc under Nat Ford Planning operating covenant.

## Not in scope (hard no for now)

- Next.js migration.
- Rewriting working components for architectural taste.
- Multi-channel dispatch runtime (Telegram/Slack/Discord) — log table is enough.
- Google Drive archival.
- Switching off Supabase-direct to a Marketplace storage provider.

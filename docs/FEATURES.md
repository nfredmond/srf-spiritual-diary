# Feature roadmap — SRF Spiritual Diary

Current state is tracked in `docs/CHANGELOG.md`. This file is a parking lot for deferred work.

## Deferred UX (considered during the 2026-04-16 pass, not shipped)

### Multi-day reading-rhythm view
A weekly/monthly zoom-out that shows the last N days of readings + whether the reader opened them, to encourage streaks without shaming them. Likely fits alongside `StatsDashboard`; could reuse the `useReadingStreak` hook. Deferred because it needs a small design pass (calendar heatmap vs. list vs. timeline) before any code.

### First-visit onboarding tour
One-time overlay that walks new visitors through: today's reading, keyboard shortcuts (`?`, `/`, `W`, `M`), favorites (`F`), notes, meditation timer. Needs a `useFirstVisit` flag in localStorage and a small Headless UI `Dialog` sequence. Deferred because the app already works fine cold; onboarding is nice-to-have, not blocking.

## Deferred technical paths

### Local image generation (zero API cost)

Status: **shipped 2026-04-17 as an env-switched provider layer** in `scripts/lib/imageProviders.mjs`. `SRF_IMAGE_PROVIDER=gemini` (default) keeps the prior cloud path; `SRF_IMAGE_PROVIDER=comfyui` routes through a local ComfyUI SDXL workflow and uploads the PNG to Supabase Storage bucket `daily-renders/`.

Verified 2026-04-17: ComfyUI path runs end-to-end for run date 2026-04-16 — `RealVisXL_V5.0_fp16.safetensors` + `Hyper-SDXL-8steps-CFG-lora.safetensors` at 8 steps → 1.65 MB PNG uploaded to `daily-renders/2026-04-16.png` (public HTTPS URL stored in `daily_renders.image_url`, `image_provider='comfyui'`). Gemini path is a byte-identical code port of the prior inline call (same URL, headers, body, response parsing, artifact write) and keeps producing a base64 data URL.

Still open:
- **When ComfyUI is unreachable**: Vercel cron + `api/run-daily.ts` can't hit the home box, so production currently still uses Gemini. Options (deferred): pre-generate a week at a time while the box is awake, tunnel to Vercel (Cloudflare Tunnel / Tailscale Funnel), or a small always-on server ($5–10/mo).
- **Prompt tuning for SDXL**: Gemini-tuned prompts may need iteration to match the reverent-artwork aesthetic on the ComfyUI path.

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

# SRF Spiritual Diary

SRF Spiritual Diary is a Vite + React spiritual companion app with daily Paramahansa Yogananda quotes, local journaling features, and AI-generated spiritual imagery.

## v3 Operations

Version 3 adds production integration for Nat Ford operations:

- Supabase persistence for `diary_entries`, `daily_renders`, and `delivery_logs`
- OpenAI daily render pipeline with strict no-text prompt constraints
- Host pipeline automation with Google Drive archival (`gog`) and OpenClaw multi-channel delivery
- Gmail sending (`gog`) for daily dispatch
- Vercel API endpoints:
  - `GET /api/today` for quote + latest image metadata
  - `POST /api/run-daily` for token-protected serverless run (generation + DB write only)
- Frontend “Today’s Operations Status” panel
- Safer Backup & Restore UX: in-modal status feedback (no blocking alerts), screen-reader live announcements, and JSON schema checks before local restore

## Prompt safety constraints

All spiritual image prompts enforce:

- no visible text, letters, words, numbers, logos, signatures, watermarks, glyphs, or symbols
- optional single subtle Om symbol (`ॐ`) only when `SRF_ALLOW_OM_SYMBOL=true`

## Quickstart (v3 daily automation)

```bash
npm install
cp .env.example .env
# fill .env values

# apply supabase migration (or run SQL in dashboard)
supabase db push

# seed diary entries
npm run seed:supabase

# local build check
npm run build

# run full host pipeline once
npm run pipeline:daily
```

## Deployment

```bash
vercel --prod
```

Set all `.env.example` variables in Vercel Project Settings.

## Automation options

- Preferred for full delivery stack: host cron calling `npm run pipeline:daily`
- Lightweight serverless fallback: cron calling `POST /api/run-daily` with `CRON_SECRET`

See full runbook in [OPERATIONS.md](./OPERATIONS.md).

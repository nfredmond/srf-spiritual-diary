# Deployment Guide (v3)

## 1) Install + validate

```bash
npm install
npm run build
```

## 2) Configure environment

Use `.env.example` as source of truth and configure the same keys in Vercel.

Required core keys:

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SRF_APP_URL`

Operational keys:

- `SRF_DRIVE_ROOT_FOLDER_ID`
- `SRF_EMAIL_TO`
- `SRF_TELEGRAM_TARGET`
- `SRF_SLACK_TARGET`
- `SRF_DISCORD_TARGET`
- `CRON_SECRET` (or `SRF_RUN_DAILY_TOKEN`)

## 3) Database

Apply migration in `supabase/migrations/202602260001_srf_spiritual_diary_v3.sql` and seed:

```bash
npm run seed:supabase
```

## 4) Deploy to Vercel

```bash
vercel login
vercel --prod
```

## 5) API behavior

- `GET /api/today`
  - Returns today's diary entry and latest image metadata.
- `POST /api/run-daily`
  - Requires `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret`.
  - Serverless-safe mode: generates image and writes Supabase records.
  - Returns warning fields when Drive/OpenClaw/Gmail steps are skipped.

## 6) Scheduling

- Full-stack delivery: run `npm run pipeline:daily` on a host scheduler at 6:00 AM America/Los_Angeles.
- Serverless-only fallback: call `POST /api/run-daily` on cron.

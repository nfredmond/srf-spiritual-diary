# SRF Spiritual Diary v3 Operations

## Architecture (text diagram)

```text
[public/data/diary-entries.json] --(seed script)--> [Supabase: diary_entries]
                                             \
                                              --> [daily-pipeline host script]

[daily-pipeline host script]
  -> reads today's entry (Supabase first, JSON fallback)
  -> builds strict no-text spiritual prompt (optional subtle Om only)
  -> generates image via Google Gemini Images API
  -> writes local artifacts (image + metadata JSON)
  -> uploads artifacts to Google Drive via gog
  -> sends Telegram/Slack/Discord via openclaw
  -> sends Gmail via gog
  -> writes daily_renders + delivery_logs to Supabase

[Vercel API /api/today]
  -> returns today entry + latest render metadata

[Vercel API /api/run-daily]
  -> token-protected serverless run (generation + DB write only)
  -> returns warnings for Drive/OpenClaw/Gmail operations

[React app]
  -> renders quote content
  -> shows "Today's Operations Status" panel from /api/today
```

## Environment setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Fill all required values:

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SRF_DRIVE_ROOT_FOLDER_ID`
- `SRF_EMAIL_TO`
- `SRF_TELEGRAM_TARGET`
- `SRF_SLACK_TARGET`
- `SRF_DISCORD_TARGET`
- `SRF_APP_URL`

Defaults already set in `.env.example`:

- `SRF_OPENCLAW_CHANNEL_TELEGRAM=telegram`
- `SRF_OPENCLAW_CHANNEL_SLACK=slack`
- `SRF_OPENCLAW_CHANNEL_DISCORD=discord`
- `SRF_GENERATION_MODEL=gemini-2.5-flash-image`
- `SRF_ALLOW_OM_SYMBOL=true`

Security for cron trigger:

- Set either `CRON_SECRET` or `SRF_RUN_DAILY_TOKEN`.

## Supabase migration + seed

Run SQL migration in Supabase SQL editor or CLI:

```bash
supabase db push
```

Then seed diary entries:

```bash
npm run seed:supabase
```

## Vercel deploy commands

```bash
npm install
npm run build
vercel login
vercel --prod
```

Set Vercel env vars to match `.env.example` values.

## OpenClaw daily cron examples (6:00 AM America/Los_Angeles)

Host-side full pipeline:

```bash
0 6 * * * cd /home/nathaniel/.openclaw/workspace/projects/srf-spiritual-diary && npm run pipeline:daily
```

Serverless trigger from OpenClaw event runner (example):

```bash
openclaw cron add \
  --name srf-daily-serverless \
  --schedule "0 6 * * *" \
  --tz "America/Los_Angeles" \
  --command "curl -sS -X POST https://YOUR_VERCEL_APP/api/run-daily -H 'Authorization: Bearer $CRON_SECRET'"
```

## Rollback steps

1. Disable cron job(s).
2. Re-deploy the previous Vercel build:

```bash
vercel rollback
```

3. If needed, restore database from Supabase backup snapshot.
4. Re-run `npm run seed:supabase` if diary data was partially modified.

## Troubleshooting matrix

| Symptom | Likely cause | Action |
|---|---|---|
| Google Gemini image generation fails | invalid key, quota/rate, model mismatch | verify `GEMINI_API_KEY`, check billing/usage, set `SRF_GENERATION_MODEL=gemini-2.5-flash-image` as fallback |
| Drive archival fails | gog auth or bad folder id | run `gog auth login`, verify `SRF_DRIVE_ROOT_FOLDER_ID`, test `gog drive mkdir` manually |
| Channel delivery skipped | targets missing or openclaw command mismatch | set `SRF_TELEGRAM_TARGET`/`SRF_SLACK_TARGET`/`SRF_DISCORD_TARGET`; validate local `openclaw` CLI send syntax |
| Supabase write error | missing service role key or schema mismatch | confirm `SUPABASE_SERVICE_ROLE_KEY`, run migration, verify table names and columns |
| `/api/run-daily` unauthorized | missing/incorrect secret | pass `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret` matching env |
| `/api/run-daily` warns about skipped delivery | expected in serverless mode | use host script `npm run pipeline:daily` for Drive/OpenClaw/Gmail operations |

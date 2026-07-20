# Donation handoff — preparing this reader as a gift to SRF

This reader has been shaped into a dignified, self-contained gift. This document
records what was done, what only you (the owner) can finish, and the exact steps
to turn this working repo into the clean package SRF receives.

## What the reader now is

- A calm, reverent daily reader: the sacred passage is the visual hero, with the
  weekly theme, topic, and true source around it, and a thin gold rule the only
  ornament.
- Built on Self-Realization Fellowship's own verified colors — deep navy
  `#052956` and emblem gold `#DCBD23` — with warm-paper neutrals, in three
  reading themes (light / sepia / night).
- **No AI-generated imagery.** The experimental AI "sacred art" generator was
  removed from the reader (see `docs/ATTRIBUTION.md`). Atmosphere is now calm
  gradients and an original, generic lotus mark — never a guru, deity, or the
  SRF emblem.
- Accessible and fast: every panel traps focus and closes on Escape, motion
  honors "reduce motion," gold meets contrast where it is text, the reading is
  announced to screen readers, and first load dropped from ~20 MB of art to a
  ~0.9 MB precache.
- Anonymous, in the spirit of egoless service — no personal byline; the footer
  reads "Offered in loving devotion to Guruji and the SRF family."

## What only you can finish

1. **Transcribe the 20 missing days** from your physical copy of the book. Copy
   `data/missing-dates-patch.example.json` to `data/missing-dates-patch.json`,
   fill in each `topic` and `quote` by hand, and run `npm run patch-missing-dates`.
   Do **not** scrape, OCR, or AI-generate. Until filled, those days show a gentle
   "being prepared" message (no error). See `docs/HAND_TRANSCRIPTION.md`.
2. *(Optional, for scholarly fidelity)* Fill each entry's `book` field with the
   source work (e.g. *Autobiography of a Yogi*, *Whispers from Eternity*, *Man's
   Eternal Quest*) from the printed citations. The UI already shows it when
   present.
3. *(Optional)* Add `specialDay` markers for the sacred days the printed diary
   commemorates (Gurus' birthdays and mahasamadhi dates, Christmas, Janmashtami),
   cross-referencing SRF's own calendar — never asserted from memory.

## Turning this repo into the clean gift

Do these before handing the code to SRF, so nothing personal or private travels
with it:

- **Exclude the private daily-delivery pipeline** — it is your own tool and is
  not needed by the reader. Remove from the gift: `scripts/daily-pipeline.mjs`,
  the delivery/archival parts of `api/run-daily.ts`, and the pipeline docs
  (`OPERATIONS.md`). The reader runs from bundled JSON with no backend.
- **Remove developer/account config:** `.mcp.json`, `opencode.json`, the
  `.vercel/` directory, and anything referencing your personal Supabase project,
  Vercel team, Gmail, Drive, or the `gog`/`openclaw` tools. (The stale `_archive/`
  snapshot and `.vercel-trigger` were already removed and are now git-ignored.)
- **Slim the environment:** `.env.example` now separates the (optional) reader
  settings from the owner-only pipeline settings. The donated reader needs no
  secrets at all.
- **Prune internal docs** that are status logs or contain personal info:
  `PROJECT_STATUS.md`, `MAJOR_UPDATE.md`, `QUICK_START.md`, `VERCEL_*.md`,
  `DATA_CONVERSION.md`, `docs/DEPLOY_LOG.md`, `docs/CHANGELOG.md`. Keep `README.md`,
  `NOTICE`, `LICENSE`, `docs/ATTRIBUTION.md`, `docs/HAND_TRANSCRIPTION.md`, and
  this file. (`docs/COVENANT.md` names you and your company — either delete it or
  fold its useful parts into `docs/ATTRIBUTION.md`, which is already anonymized.)
- **Start a fresh git history** for the gift (a single clean initial commit), so
  no personal name, email, deploy hash, or Supabase project ref survives in prior
  commits.
- **Update the OG/social URL** in `index.html` (`og:url` / `twitter:url`) to
  wherever SRF will host it — or remove those tags.

## How SRF can deploy it

It is a static single-page app. `npm install && npm run build` produces `dist/`,
which can be served by any static host (Vercel, Netlify, GitHub Pages, or their
own web server). No database, no environment variables, no server code required.

## A note on the app's name and mark

The reader is titled "The Spiritual Diary" and uses an original generic lotus,
not the SRF emblem, precisely so it makes no claim of official status. If SRF
accepts the gift, SRF is free to rename it, drop in the official SRF emblem, and
present it as its own.

## Copyright / posture reminder

Until SRF accepts the gift, the honest posture is a private, personal devotional
tool with the "unofficial / not affiliated" disclosure the app already shows.
Consider taking the public deployment down, or keeping it clearly unofficial,
while the offer is with SRF. See `docs/ATTRIBUTION.md`.

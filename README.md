# The Spiritual Diary — a devotional reader

A quiet, contemplative web app that offers one reading each day from
*The Spiritual Diary of Paramahansa Yogananda* — a topic, a passage, its weekly
theme, and its source — with gentle space for reflection, private notes, saved
readings, and meditation.

> **An independent, unofficial devotional reader.** It is not affiliated with,
> endorsed by, or sponsored by Self-Realization Fellowship. The writings of
> Paramahansa Yogananda are © Self-Realization Fellowship. See
> [`NOTICE`](./NOTICE) and [`docs/ATTRIBUTION.md`](./docs/ATTRIBUTION.md).

It is offered freely, as a gift, in the hope it may be of service.

## What it offers

- **A reading for each day of the year**, with its topic, weekly theme, and true
  source attribution (Paramahansa Yogananda, and — where the book does — Sri
  Gyanamata, Sri Yukteswar, Lahiri Mahasaya, Mahavatar Babaji, Rajarsi
  Janakananda).
- **Move gently through the year** — arrow keys, swipe, a date picker, a
  reading calendar, a week-rhythm strip, weekly-theme browsing, or "let a
  reading find you."
- **A quiet place to sit** — save favorite readings, write private reflections,
  and use a simple meditation timer with a gentle bell.
- **Yours, and private** — favorites, notes, and history live only in your
  browser's local storage. Nothing is sent to any server. A "Preserve your
  journal" export makes a backup you control.
- **Calm by design** — three restful reading themes (light, sepia paper, and
  night), adjustable text size, full keyboard access, screen-reader support,
  reduced-motion support, and offline reading as an installable app (PWA).

## Running it locally

```bash
npm install
npm run dev        # start the dev server
```

That's all it needs — the full year of readings is bundled as static JSON, so
the reader runs entirely in the browser with **no backend and no configuration**.

```bash
npm run verify     # type-check + tests + production build
npm run build      # production build into dist/
```

A private daily-delivery pipeline (`api/`, `scripts/`, `supabase/`) exists for the
original maintainer's own use; it is **not part of, or required by, the reader** and
should be extracted into its own repo for the clean gift. See
[`docs/DONATION_HANDOFF.md`](./docs/DONATION_HANDOFF.md).

## The readings (data & provenance)

The year of readings lives in [`public/data/diary-entries.json`](./public/data/diary-entries.json).

- Every present reading has a topic, quote, source, and weekly theme.
- Attribution is faithful to the printed book, including the entries spoken by
  the Gurus and disciples rather than by Yogananda himself.
- **20 days remain to be transcribed** from the physical book (they show a
  gentle "being prepared" message in the app until then). They must be filled by
  **hand-transcription only** — never scraped, OCR'd from unauthorized scans, or
  AI-generated. See [`docs/HAND_TRANSCRIPTION.md`](./docs/HAND_TRANSCRIPTION.md)
  and run `npm run patch-missing-dates`.

## Attribution & license

- **Source code:** MIT ([`LICENSE`](./LICENSE)).
- **The diary text:** © Self-Realization Fellowship, all rights reserved — not
  MIT-licensed. Reproduced with reverence for personal, non-commercial
  devotional reading. See [`NOTICE`](./NOTICE).
- To obtain official Self-Realization Fellowship publications, please visit
  [yogananda.org](https://yogananda.org).

## Built with

React + TypeScript, Vite, Tailwind CSS, Headless UI, framer-motion, date-fns,
and vite-plugin-pwa.

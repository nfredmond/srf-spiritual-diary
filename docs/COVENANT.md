# Covenant & Attribution

This document captures the current legal/covenant posture of the SRF Spiritual Diary reader, what is live in production, and the questions that still need a qualified legal review before any broader public positioning.

## Identity

- **What this app is:** a personal reading companion that shows one entry per day from *The Spiritual Diary of Paramahansa Yogananda*. Built and maintained by Nathaniel Ford Redmond.
- **What this app is not:** an official Self-Realization Fellowship (SRF) product, a redistribution of SRF material, a commercial product, or a replacement for SRF's own publications and programs.
- **Source material:** *The Spiritual Diary* (Self-Realization Fellowship, Los Angeles, CA). All quoted Yogananda writings remain © Self-Realization Fellowship.

## Current attribution (live footer, 2026-04-17)

> A personal reading companion for *The Spiritual Diary* by Paramahansa Yogananda.
>
> Quotes are sourced from *The Spiritual Diary*, published by Self-Realization Fellowship (Los Angeles, CA). Yogananda's writings are © Self-Realization Fellowship. This site is an unofficial personal devotional reader; it is not affiliated with, endorsed by, or sponsored by Self-Realization Fellowship.

This supersedes the prior footer (`© 2025 Self-Realization Fellowship. All rights reserved.`), which was inaccurate because the site is not an SRF publication and we cannot claim SRF's copyright line.

## Open items for legal review (Nathaniel action)

Before any broader public positioning (public announcement, app store listing, paid tier, inclusion in a product portfolio page, etc.) the following should get a qualified legal answer:

1. **Trademark use in attribution.** Nominative fair use of the marks "Self-Realization Fellowship" and "Paramahansa Yogananda" in the attribution line is likely OK, but confirm with counsel — particularly because one daily quote is a durable, repeat display rather than a one-off reference.
2. **Fair-use posture of daily quote display.** Each entry is a short topic + short quote. Personal, non-commercial, devotional use. Review whether this crosses a line when aggregated into a redistributable SPA — even if access is not monetized.
3. **Book cover / OG image handling.** The repo ships `public/og-image.png` and `public/screenshot-1.png`. Confirm these do not reproduce SRF trade dress or copyrighted artwork.
4. **Attribution language for book/year fields.** Each entry's `source` and `book` fields pass through to the UI. Confirm the phrasing is consistent and does not inadvertently imply endorsement.
5. **Hand-transcription workflow.** 20 MM-DD entries are missing from the dataset (see `docs/DATA_MERGE_2026-04-16.md`). Nathaniel's plan is to hand-transcribe from his physical copy. Confirm with counsel that this path is acceptable for personal use. **Do NOT scrape, OCR from pirated scans, or LLM-generate Yogananda content.**

## Posture gates

- **Personal use, private URL:** current state. Acceptable under a conservative personal-devotional fair-use reading.
- **Public but unannounced:** current production URL (`https://srf-spiritual-diary.vercel.app`) is publicly reachable. Today's corrected footer is the minimum disclosure.
- **Publicly announced / promoted:** requires a completed legal review covering the items above. Do not link this app from Nat Ford Planning's company website, write a blog post about it, submit it to Product Hunt, or pitch it externally before that review completes.

## Not in scope

- Selling access, taking donations tied to content, running ads, or otherwise monetizing the daily-quote display.
- Redistribution of Yogananda content outside the single-quote-per-day reading model.
- Generating new Yogananda-attributed content (no LLM-generated "Yogananda quotes" — fabricated attribution is a harder line than quotation).
- Use of SRF marks as product branding, logo, or icon. The app's own branding must not suggest official SRF status.

## How to update this document

If the attribution language in the footer changes, update the "Current attribution" block here in the same commit. If a legal review answer lands, record the answer (and the reviewer) under "Open items for legal review" — don't silently delete the question.

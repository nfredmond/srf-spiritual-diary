# ARCHIVED — 2026-04-16

Small legacy snapshot (76 KB, 7 files) that had been nested inside this repo at `srf-spiritual-diary/srf-spiritual-diary/`. Moved here on 2026-04-16 when the Phase A–F upgrade landed so the duplicate would stop confusing which was canonical.

## Why archived

The nested folder predated the current SPA layout. Every file here has a descendant in the active project root. Keeping it alongside the current source caused repeated confusion about which was canonical.

## Contents

- `vercel.json`
- `api/generate-image.ts`, `api/generate-image-gemini.ts`
- `src/components/ImageGenerator/ImageGenerator.tsx`
- `src/hooks/useImageGeneration.ts`
- `src/lib/utils/promptGenerator.ts`
- `src/types/ImageProvider.ts`

Reference only. Not built or deployed.

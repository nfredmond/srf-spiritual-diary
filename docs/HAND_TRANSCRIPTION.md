# Add verified readings

The current gaps and source leads are in [SOURCE_GAPS.md](SOURCE_GAPS.md).
Never fabricate, paraphrase, or assign an author by default. Preserve the actual
source evidence and any reuse permission separately from the transcript.

1. Record the book edition, page, printed date, section heading, attribution,
   and source-work citation. Use supplied pages or a source permitting reuse.
2. Copy `data/missing-dates-patch.example.json` to the gitignored
   `data/missing-dates-patch.json`. Remove unfilled rows for a partial batch.
3. Fill the topic, quote, author in `source`, and weeklyTheme faithfully. Preserve
   printed punctuation. Leave optional book/specialDay null when not established.
4. Run `node scripts/merge-diary-json.mjs --patch data/missing-dates-patch.json --dry-run`.
   Then run `npm run patch-missing-dates`. Inspect the diff before retaining it.
5. Remove resolved keys from `unresolvedDates` in `src/lib/diaryData.ts` and update
   SOURCE_GAPS.md with the evidence. Run `npm run verify`.

The reader loads bundled JSON. There is no Supabase seeding step. A new static
build includes the revised dataset in its offline cache. Hosting deployment is
separate from verifying the local build.

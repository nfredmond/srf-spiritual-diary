# Acceptance record, 2026-09-06

Implementation is ready for browser acceptance. **The full acceptance plan is
not complete.** Chrome blocked `http://127.0.0.1:4317` with
`ERR_BLOCKED_BY_CLIENT`. The earlier request that Nathaniel "allow" the page was
premature and did not identify an available setting. Nathaniel has explicitly
authorized opening the local reader; another permission request is unnecessary.

Follow-up diagnostics on 2026-09-06 confirmed HTTP 200 from the local server.
Chrome's `Network.loadingFailed` event reported `blockedReason: inspector`,
`errorText: net::ERR_BLOCKED_BY_CLIENT`, and `type: Document`. Reloading the
existing test tab and opening the same URL in a fresh Chrome tab both failed.
The Chrome connection itself works, including X source research. The exposed
browser capabilities provide no site-allow control. This identifies a block in
the debugging layer; it does not identify which component installed the block.
No browser security setting was changed or bypassed.

## Automated evidence

Run from `/home/nathaniel/Computer Use Projects/srf-spiritual-diary`:

- `npm run verify`: calendar audit, TypeScript, 13 library tests, 34 component and
  app tests, 6 companion tests, and production build.
- `node scripts/prove-checks.mjs`: independent scratch checkout, baseline tests,
  a surviving comment-only change, and 27 rejected behavior mutations.
- Build precache includes the static diary and lazy reader panels. This is
  structural evidence, not a successful offline browser journey.

The mutations remove date/field validation, HTTP checks, request deduplication,
shared-loader notification, backup version and note validation, conflict
preservation, recovery-before-write and rollback, draft writes and concurrent
draft preservation, card height growth, date identity, and required patch
attribution. Companion mutations introduce API keys or the wrong model, accept
non-ChatGPT auth, skip PNG checks, trust a mismatched persisted job ID, mishandle
cancellation, and remove origin/session/private-field checks. UI mutations allow
unsafe reflection closure, substitute February 28, and disable day rollover.

The first mutation run found a surviving conflict-note date validator. A focused
malformed conflict-date case was added; removing that validator now fails. The
comment mutation still survives. Local logs and the full mutation report are in
`artifacts/acceptance/`.

These checks cannot establish faithful transcription or reproduction permission.
Simulated companion failures test our handling, not OpenAI's live quota service.
Canvas layout tests measure ordering and height, not actual browser font rasterization.

## Real Codex artwork

The existing CLI 0.150.1 was signed in through ChatGPT but the server rejected
Astra as requiring a newer CLI. An isolated 0.153.4 install under
`artifacts/codex/` was used; the computer's global CLI was not replaced.

Two requests generated images that the first collector missed because the
built-in tool saved them in Codex's thread-specific image directories. The
collector now reads only the exact thread UUID emitted by the CLI, validates the
PNG, and copies it into that job's directory. It does not accept arbitrary paths
from model messages. A third request completed the full collection path.

Verified result:

- Agent model requested: `gpt-6-astra`, with forced ChatGPT authentication.
- Job: `f8ef5e03-da9f-420c-9049-d7406cf09f5a`.
- PNG: 1402 × 1122, 2,742,724 bytes.
- SHA-256: `0f6b9cbff83edfb53fe02bd493c084288c5fd2234c9b1e47d154ac01d3767844`.
- Restarted companion found the saved result and returned it with HTTP 200 through
  the authenticated image-download endpoint. Image bytes were decoded and checked.
- Visually inspected with the image viewer: lake, trees, mist, and soft sunlight;
  no lettering or religious figures.
- File: `artifacts/real-artwork/f8ef5e03-da9f-420c-9049-d7406cf09f5a/artwork.png`.

Astra directs the request. The built-in tool's image-model identity and usage
behavior are documented by [OpenAI](https://learn.chatgpt.com/docs/image-generation).
The CLI JSON stream does not independently report that underlying image model.

## Browser work still required

The running companion was identified as a process in this checkout, bound to
127.0.0.1:4317. Chrome displayed its own block page, so none of the following is
claimed as browser-verified:

1. Enter through the welcome screen at desktop width and 390px. Use Today,
   calendar, reflection, meditation, search, and weekly themes. Inspect focus
   trapping, keyboard behavior, overflow, and console errors.
2. Use the date picker year field for February 29, 2024. Confirm the unavailable
   state, explicit February 28 link, and surrounding calendar markers.
3. Type a disposable test reflection, close, reopen, refresh, and save. Import a
   downloaded backup with a conflicting test note; inspect the preview, preserved
   conflict, and recovery download. Do not use private journals as test fixtures.
4. Export the longest quotation card and inspect the actual downloaded image for
   clipped text or attribution. Check paper and night styles.
5. Use the production service worker offline, reload, browse dates, and open lazy
   panels. Test an update while a draft is open and a return visit across midnight.
6. Connect artwork from Save this reading. Inspect progress, cancellation,
   authenticated preview/download, reconnect, and failure messages.

Do not replace these checks with green unit tests. This browser barrier and the
20 untranscribed readings remain separate from implemented reliability work.
All 20 now have dated X cards in [SOURCE_GAPS.md](SOURCE_GAPS.md). This completes
source location, not transcription, edition verification, or browser acceptance.

## Resume

Read this record, README.md, and SOURCE_GAPS.md. Run `git status --short` and check
active processes before editing. The current companion uses the isolated Codex
executable; `npm run companion` on another computer uses that reader's installed
CLI. Rebuild and restart only the companion process you own after server changes.
Check the process working directory before trusting port 4317. Never point
browser automation at Nathaniel's live Chrome profile directory.

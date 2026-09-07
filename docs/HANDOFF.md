# Finish the Spiritual Diary

You are taking over implementation and acceptance of an existing app. Finish it;
do not restart or redesign it. Nathaniel wants a different agent to carry this
work through. Read this handoff, inspect current state, and proceed without asking
him to repeat authorization for routine local work, browser testing, commits, or
pushes. Bring him actual product decisions, paid services, or destructive actions.

## Checkout and authorities

- Repository: `/home/nathaniel/Computer Use Projects/srf-spiritual-diary`.
- Compatibility path: `/home/nathaniel/code/srf-spiritual-diary`.
- Remote: `https://github.com/nfredmond/srf-spiritual-diary`, branch `main`.
- Implementation checkpoint: `2f1c86d056c0625e428371e06d4b5509efa0f881`.
- All-date source index checkpoint: `da5d030f98cc49e2d93998b433d8d4c1d2340e53`.
- This handoff is a later documentation-only commit. Both checkpoints were pushed.
- Read current global/project AGENTS.md, README.md, docs/ACCEPTANCE.md,
  docs/SOURCE_GAPS.md, docs/HAND_TRANSCRIPTION.md, docs/ATTRIBUTION.md, and NOTICE.
- Check git status, other sessions, and process working directories before editing
  or trusting a local port. Two Codex processes were using this directory during
  the last source-research checkpoint. Other agents also use Chrome. Do not kill
  their processes, change their tabs, or undo their files.

## What is implemented, not fully accepted

The existing React/TypeScript reader now has a validated shared data loader,
calendar audit, explicit missing-date states, nearby-reading navigation without
silent substitution, and no automatic February 29 to February 28 substitution.
Today/date navigation, reflection, meditation, keyboard behavior, date rollover,
and small-screen access were improved in code.

Reflection drafts persist on change and recover after closure/refresh, with
storage-failure feedback. Original `srf-notes` keys remain. Backup versions 2 and 3
are strictly validated and previewed, merge by default, preserve conflicting
versions, and retain a recovery snapshot before applying changes. Quotation cards
grow to fit long passages and attribution. Production service-worker updates
require an explicit reload and wait for open panels to close. Documentation was
updated. Inspect these changes critically; green tests are not acceptance.

Optional artwork uses a local Node companion that serves the built reader and
runs each job in an isolated folder. It binds to loopback, checks host/origin and
session access, validates completed PNGs, and exposes status/create/status/cancel/
download endpoints. Public static reading remains independent of the companion.

Each reader uses their own ChatGPT-signed-in Codex CLI. The agent model must be
exactly `gpt-6-astra`, with no silent substitution, API-key credentials, or direct
API fallback. Built-in image generation produces optional nature/abstract art;
the exact quotation is rendered separately. Never send private journals to Codex.

## Finish the missing readings

The dataset at `public/data/diary-entries.json` still contains **346 readings and
20 untranscribed dates**. All 20 now have expanded, visually inspected X cards
with matching printed dates. **None of their quotations has been added.**

`docs/SOURCE_GAPS.md` contains every direct image/post link, topic, and attribution.
Start there; do not repeat a broad source search or ask Nathaniel for the links.
The account is `https://x.com/SpiritualDiary_`, accessible in signed-in Chrome.
Older 2020-2024 posts supplied the gaps. A post's timestamp is not its card date;
several adjacent-date candidates were excluded after inspecting their images.

Dates: February 17, 25, 29; March 5; May 14, 29; September 5, 7, 15, 16, 17, 22,
23, 25, 26, 27, 28, 29; October 4; December 14.

The February 29 card explicitly says Humility and cites Whispers From Eternity.
This is evidence of a separately dated card, not proof of a particular printed
edition's leap-day treatment. The X account has not been established as official
SRF or as granting reproduction permission. May 14 lacks a named Bhagavad Gita
translation; October 4 cites only a Para-gram. Preserve these uncertainties.

Complete faithful additions from supplied or otherwise permitted sources, retain
source evidence, and reconcile `unresolvedDates` in `src/lib/diaryData.ts` and the
calendar audit in the same change. Do not manufacture wording or silently treat
social-media transcription as printed-book verification. If exact reproduction
cannot be completed, state that specific remaining limit and finish all other
work. Also review the previously flagged March 30, July 10, and November 10
headings. Their current labels are Habits, Freedom, and Simplicity; no visible
corruption was found, but exact printed wording remains unchecked.

## Diagnose the local browser failure properly

Target: `http://127.0.0.1:4317/`. The companion returned HTTP 200 during the last
check, but the controlled Chrome tab repeatedly returned `ERR_BLOCKED_BY_CLIENT`.
Reloading and creating fresh tabs in subsequent turns did not fix it.

Supported CDP diagnostics produced:

```json
{"blockedReason":"inspector","canceled":false,"errorText":"net::ERR_BLOCKED_BY_CLIENT","type":"Document"}
```

Chrome connection and X navigation worked throughout. No `Inspector.detached`
event appeared in the latest filtered reload diagnostics. An attempted
`Target.getTargetInfo` through the browser tool was rejected with
`This method is not supported through raw CDP.` The component applying the block
was **not identified**. Other agents using Chrome is not proof they caused it.
The app's HTTP response headers were not established as the cause either.

The previous agent incorrectly told Nathaniel to "allow" the URL without finding
an actual permission setting. Nathaniel has already explicitly authorized access
and routine computer control. Do not repeat that vague request. Diagnose using
your supported tools and browser instructions. Do not assume this is a general
Chrome outage, authentication failure, or user refusal. Do not evade a confirmed
security restriction or interfere with other agents. If a real tool restriction
remains, identify its exact evidence and limitations rather than inventing a fix.

The prior browser-tool connection used the Chrome extension. Follow your current
browser skill and automation-profile rules. Do not connect automation directly
to Nathaniel's live Chrome profile. Old runtime tab variables and process IDs
are not transferable to your session.

## Acceptance still required

Use the actual production reader at desktop width and 390px. Complete all journeys
in docs/ACCEPTANCE.md and fix defects found:

1. Welcome screen through Today, calendar, Reflect, Meditate, search, weekly
   themes, and backups. Inspect screenshots, keyboard focus, overflow, and console.
2. Leap years, year boundaries, missing dates, failed loading, explicit nearby
   navigation, and return-to-open-tab date rollover. Adjust expected missing-date
   examples if verified readings have since been added.
3. Disposable test reflection recovery after close/reopen/refresh; explicit save;
   strict import preview; conflicting notes; recoverable backup; storage failure;
   old-data compatibility. Protect real journals and never use them as fixtures.
4. Download and visually inspect the longest quotation card in paper and night
   styles. Check the complete quotation and attribution for clipping/readability.
5. Production service worker installed online, then offline reload, date browsing,
   and lazy panels. Check an update while a draft is open. Development mode alone
   cannot establish offline support.
6. Reach artwork from Save this reading, connect, inspect progress and saved image,
   download, reconnect, cancellation, authentication/model/quota failures, timeout,
   and invalid output handling. Use the existing real image where useful to avoid
   spending more Codex allowance without a reason.

## Commands and existing evidence

Use Node 24. Inspect package.json before changing commands.

```sh
npm ci
npm run verify
node scripts/prove-checks.mjs
npm run companion
```

The prior `npm run verify` passed the calendar audit, TypeScript/build, 13 library,
34 component/app, and 6 companion tests. The mutation run had a surviving no-op
and rejected 27 behavior mutations. Evidence is in docs/verification/ and local
artifacts/acceptance/. These are prior-run results, not proof of new changes.
Prove new checks can fail with deliberate bad inputs, and preserve an honest
separation between unit tests and real browser acceptance.

The installed global CLI 0.150.1 was signed in but rejected by the server for Astra.
An isolated CLI 0.153.4 at `artifacts/codex/node_modules/.bin/codex` worked. The
companion previously ran with this override, without replacing the global CLI:

```sh
SRF_CODEX_BIN="$PWD/artifacts/codex/node_modules/.bin/codex" node companion/server.mjs
```

Recheck the executable and running process before using it. Build `dist/` first.
Do not assume the prior server still exists or terminate an unidentified process.

A real Astra-directed generation completed, was visually inspected, survived a
companion restart, and downloaded through its authenticated endpoint:

- Job: `f8ef5e03-da9f-420c-9049-d7406cf09f5a`.
- Thread: `01a07985-8f4a-7e70-9e67-a1dbb0ead3ab`.
- PNG: 1402 by 1122 pixels, 2,742,724 bytes.
- SHA-256: `0f6b9cbff83edfb53fe02bd493c084288c5fd2234c9b1e47d154ac01d3767844`.
- Local artifact: `artifacts/real-artwork/f8ef5e03-da9f-420c-9049-d7406cf09f5a/artwork.png`.
- Completed job also copied to
  `~/.local/share/spiritual-diary/artwork/f8ef5e03-da9f-420c-9049-d7406cf09f5a/`.

The collector initially missed two generated images because Codex saved them in
thread-specific folders. It now trusts only the actual emitted thread UUID,
validates the PNG, and copies it into the job folder. Do not regress into trusting
arbitrary paths in agent messages. The CLI stream did not independently identify
the underlying image model; `gpt-image-2` is the documented built-in image tool,
not the required directing agent model. Verify current OpenAI documentation if
changing the integration.

## Delivery

Finish the app's authorized work and report your own defects. Keep the quiet
reader, existing journals, and free/local operation. Do not provision paid
services. Commit and push at coherent checkpoints; verify remote SHA matches.
Update docs/ACCEPTANCE.md and docs/SOURCE_GAPS.md to the actual outcome, including
any exact unresolved source or tool limit. Give Nathaniel a short plain-language
report of what works and what remains. Do not call the app finished while browser
acceptance or required content work is still unresolved.

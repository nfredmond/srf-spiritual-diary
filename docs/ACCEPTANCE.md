# Acceptance record, 2026-09-06 evening

**The app is not finished.** The current build contains 350 readings and 16
untranscribed dates. Automated checks pass, but the local production reader still
cannot be opened through the available Chrome controls. All required reader
browser journeys remain unverified.

## Changes completed during takeover

- Saved reflections no longer delete a different, newer draft from another
  editor. Matching drafts clear after save; other dates remain intact.
- Invalid date keys, oversized reflection text, and damaged existing drafts fail
  validation before a note is overwritten. Failed persistence no longer tells a
  reader that an unsaved draft is available on disk.
- Artwork reconnect now retries a failed preview even when the same job and
  session are returned. A failed reconnect disables creation until connected.
- Added May 29 and September 25, 26, and 29. Underlying public-domain text was
  compared with the visually inspected dated cards. Minor card variants are
  recorded in [SOURCE_GAPS.md](SOURCE_GAPS.md), not passed off as exact 1946
  wording. No identified printed Spiritual Diary edition has been verified.
- March 30 Habits and November 10 Simplicity match expanded dated cards. July 10
  Freedom still lacks a card comparison. None of these headings has been checked
  against a supplied printed book page.

Implementation checkpoints are `1c02f03` and `d36aa31`. This record is a later
reporting checkpoint. No user journal storage, existing user tab, other agent's
process, browser extension, or security setting was changed. The only companion
restarted was the process started by this takeover, after confirming zero running
artwork jobs. No new image generation was requested.

## Current automated evidence

From `/home/nathaniel/Computer Use Projects/srf-spiritual-diary`:

- `npm run verify`: TypeScript, 16 library tests, 36 component/app tests,
  6 companion tests, calendar census, and production build completed successfully.
- `node scripts/prove-checks.mjs`: independent scratch tree, baseline checks,
  **one surviving no-op and 34 rejected behavior mutations**.
- The new mutations delete the newer-draft guard, reflection/draft input
  validation, artwork reconnect retry, disconnect readiness handling, and honest
  failed-save feedback. Each produces an assertion failure. Changing the reviewed
  May 29 wording also fails the source digest check.
- Production precache contains 25 files, including diary data and lazy panels.
  This establishes generated cache contents, not a successful offline journey.

Portable results: [mutation report](verification/mutations-takeover-2026-09-06.json)
and [source evidence](verification/source-additions-2026-09-06.json).
Local logs: `artifacts/acceptance/takeover-final-verify.log` and
`artifacts/acceptance/takeover-final-mutations.log`.

These checks cannot establish rendering, actual browser downloads, offline
behavior, faithfulness to an unidentified book edition, or permission for the
inherited collection. Journal tests exercise interleaved editors in memory,
not simultaneous browser processes. Artwork reconnect tests inject transport
failures; they do not contact a live OpenAI quota or authentication service.
Source digests prevent unnoticed text changes; they do not authenticate a source.

## Chrome diagnosis and its limit

The new companion bound to 127.0.0.1:4317 was identified through its listening PID
and `/proc/PID/cwd` in this checkout. After the build finished, HTTP GET returned
200 and its body matched `dist/index.html` by SHA-256. One earlier HTTP probe
returned 404 while Vite was rebuilding `dist`; that transient result was discarded
and is not evidence about the Chrome block.

A new agent-owned Chrome tab failed navigation and reload. Supported CDP
`Network.loadingFailed` reported:

```json
{"blockedReason":"inspector","canceled":false,"errorText":"net::ERR_BLOCKED_BY_CLIENT","type":"Document"}
```

The targeted reload capture had no `Inspector.detached` event. The available
browser list contained only the connected Chrome extension. X navigation and
expanded cards worked in another new agent-owned tab during the same session.
The diary tab showed Chrome's error page, with no app UI available for inspection.

The `inspector` reason identifies the reported debugging-layer failure, **not the
component that installed it**. This is consistent with Chromium's
[blocked-reason handling](https://chromium.googlesource.com/chromium/src/+/1525bc2f5db2ad465d485826ddae72790b3aa039/third_party/blink/renderer/core/inspector/inspector_network_agent.cc).
No evidence identifies another agent, an app response header, a user denial,
or a particular extension as the cause.

Read-only inspection of the connected extension was then attempted at
`chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`. The browser tool
explicitly rejected that URL under the **Browser Use URL policy** and instructed
against workarounds. That denial applies to extension inspection. It does not
establish the cause of the earlier local HTTP navigation failure. No workaround,
security-setting change, or alternate profile connection was attempted.

[Diagnostic record](verification/chrome-block-takeover-2026-09-06.json).
Local screenshot: `artifacts/acceptance/chrome-local-block.png`.
The responsible component remains **unknown**. Resolving this requires a
permitted diagnostic path that exposes the installed request-blocking rule and
its owner, or a supported local-browser testing connection. There is no evidence
for asking Nathaniel to "allow" an unspecified setting.

## Existing artwork checked again

The companion found completed job `f8ef5e03-da9f-420c-9049-d7406cf09f5a` for
September 6 after restart. Its authenticated image endpoint returned HTTP 200,
2,742,724 bytes, a valid 1402 by 1122 PNG, and SHA-256
`0f6b9cbff83edfb53fe02bd493c084288c5fd2234c9b1e47d154ac01d3767844`.
A request missing the reader header was rejected with 403, so the access check
was also exercised with an invalid request. No session token was recorded.

The downloaded PNG was opened in the image viewer: a watercolor lake, trees,
mist and sunlight, with no text, people, or religious figures. This verifies the
saved file and HTTP download, **not the artwork panel's browser journey**.
The existing generation history and CLI compatibility findings remain in
[HANDOFF.md](HANDOFF.md).

[HTTP/artwork evidence](verification/takeover-http-artwork-2026-09-06.json).
Local file: `artifacts/acceptance/takeover-artwork-download.png`.

## Browser acceptance still required

Use an isolated, disposable journal origin through a permitted browser connection.
Do not clear or inspect private journals to prepare fixtures. Verify the process
cwd and built response before testing.

| Journey | Current result | Required evidence |
| --- | --- | --- |
| Desktop and 390px welcome through Today, calendar, Reflect, Meditate, search, themes and backups | Blocked before app entry | Screenshots, no overflow, focus/keyboard behavior, console review |
| February 29, year boundary, missing dates, failed loading, nearby navigation, return across midnight | Unit evidence only | Production browser actions; February 29 remains unavailable |
| Disposable draft close/reopen/refresh/save, old backup import, preview, conflict and recovery, storage failure | Unit evidence only | Actual UI writes and downloaded backups; no private fixtures |
| Longest quotation card, December 27, warm paper and deep night | Layout logic tested only | Actual downloaded PNGs inspected for complete text and attribution |
| Installed production worker, offline reload/date browsing/lazy panels, update with an open draft | Build structure only | Online install, offline actions, deferred update and recovered draft |
| Save this reading through artwork connection, progress, preview/download, reconnect, cancel, auth/model/quota/timeout/invalid-output errors | HTTP/file evidence and simulated tests only | Actual browser controls and error states; reuse existing image where possible |

Content completion separately requires permitted exact text for the remaining
16 dates. All original card links are retained in SOURCE_GAPS.md. Preserve the
February 29 edition uncertainty, unnamed May 14 Gita translation, and unspecified
October 4 Para-gram. Do not replace unavailable readings with invented wording.

# Acceptance record, 2026-09-06 final browser pass

The implemented reader and local artwork journeys now pass in an isolated real
Chrome browser. **Content remains incomplete: 350 readings, 16 unavailable date
keys.** Four of the original twenty gaps were filled with sourced text during
this takeover. The other passages still require supplied text or a reusable exact
source; they have not been invented or replaced with different readings.

Implementation checkpoint: `042bc3e`, following `2bab3fe`, `1c02f03`, and `d36aa31`.
[Handoff](HANDOFF.md) contains the launch recipe and original history.
[Source gaps](SOURCE_GAPS.md) preserves all twenty card links and edition limits.

## Browser evidence

Chrome **152.0.7977.82**, real Chromium rendering in headless mode, controlled via
CDP at port 9433. The task-owned profile was
`~/.config/google-chrome-automation/diary-acceptance-20260906`; every test used a new
disposable browser context. No private journal, existing Chrome tab, live Chrome
profile, extension setting, or other agent's process was changed.

The companion served the production `dist` build at `http://127.0.0.1:4317`.
The listening process was PID 3878475 in this checkout. The HTTP root matches
`dist/index.html` by SHA-256. The browser reports and build hashes are retained in
[the final evidence manifest](verification/browser-final-2026-09-06.json).

| Journey | Result and evidence |
| --- | --- |
| Desktop 1440×1000 and mobile 390×844 | Welcome, reader, all three themes at XL type, text/theme search, weekly themes, favorites, calendar, reflection, meditation, About, and backup controls exercised from the front door. Screenshots reviewed; no document horizontal overflow. The week strip retains its intended internal scrolling. |
| Keyboard | Global previous/next and help, shortcuts suppressed while editing, Ctrl+S, Tab focus confinement, Escape closing, and reachable help close control passed. Replacement year typed one character at a time. |
| Date identity | February 29 remains visibly unavailable; Next reaches March 1. December 31 reaches January 1. A missing September 7 offers an explicit September 6 navigation button. No silent reading substitution. |
| Loading failure | Deliberately injected HTTP 503 displays a loading error, distinct from an unavailable date; Retry restores readings. |
| Draft and note | Disposable draft survives close/reopen and reload; Ctrl+S persists a note. Injected storage failures retain unsaved text and prevent closing; restoring storage permits save. Two actual tabs preserve the newer draft when the older editor saves. |
| Backups | Actual downloaded complete JSON contains the saved note and favorite. Version 2 import previews without writing, preserves competing content as a conflict, and downloads the original recovery backup. Unsupported versions cannot be merged. Offline draft is included in an actual downloaded backup. |
| Return after midnight | Browser clock moves December 31 into January 1. Open reflection stays on its original date; closing it permits the scheduled rollover. |
| Meditation | Start, pause, resume, completion, reset, and breathing-phase transition passed using the browser clock. Screenshots reviewed at both sizes. Audio hardware output was not assessed in headless Chrome. |
| Quotation downloads | December 27, the longest bundled passage, downloaded in Warm paper and Deep night. Both actual 1200×1686 PNGs were opened and visually inspected: full ending, attribution, date and footer fit. |
| Production offline | Installed controlling service worker, switched browser offline, reloaded, selected a different sourced reading, opened lazy reflection/timer/backup panels, and downloaded a backup at both sizes. A fresh context also opened previously unvisited timer/calendar/backup panels offline with HTTP cache disabled. |
| Production update | An actual application rebuild produced a waiting worker while a draft was open; update was disabled until the panel closed, and the draft returned after reload. The repeatable harness also serves an isolated production copy and changes only the HTML marker/precache revision to verify waiting, explicit acceptance, new shell activation, and draft recovery. |
| Artwork | Existing real image connected, previewed, downloaded and reconnected. A fresh real Astra request then completed from the UI; download and recovery after browser reload passed. Details below. |
| Artwork failures | Explicit browser transport fixtures exercise unsigned-in readiness, unavailable model, quota, timeout, invalid output, running progress, cancellation, failed polling result, preview retry, failed download, and disconnected readiness. These are simulated service failures, not claims of live account outages. Creation sends only dateKey and style. |

Repeat with `npm run test:browser` after starting the isolated Chrome and companion.
The normal script requires a completed September 6 artwork job. It retrieves an
existing job; **it never starts a paid or allowance-consuming generation**.
`DIARY_ARTWORK_SHA256` optionally pins the expected downloaded image. The resilience
script uses explicit fixtures and a task-owned temporary HTTP server for updates.

## Defects found and fixed in the browser

- At 390px the theme/type control row extended past the page. It now wraps, and
  search gets a full-width input on narrow screens.
- Welcome text was dark on navy. Dark reader theme made utility-panel headings
  nearly white on white; sepia footer text was dark on brown. These surfaces now
  have explicit readable text colors. Selected appearance controls retain contrast on hover and expose their pressed state. Reflection retains its own dark treatment.
- Keyboard help had no close control or proper focus management. It now uses the
  shared accessible dialog and pauses other reader actions.
- The year field rejected partial typing, making replacement by ordinary keyboard
  input impractical. It now accepts editing, disables day selection for incomplete
  years, and includes the year when marking today and the selected date.
- Earlier takeover fixes protect newer concurrent drafts and retry saved artwork
  previews on reconnect. Their behavior now has actual browser evidence as well.

## Verification that could fail

`npm run verify` passed: **16 library, 38 component/app, and 6 companion tests**,
TypeScript, the exact calendar census, and production build. `npm audit` reports
**zero known vulnerabilities** after compatible dependency updates; this is a
registry result, not a security certification.

The mutation runner passed a baseline and retained **one surviving no-op**, while
**36 deliberate behavior mutations failed assertions**. Added mutations disable
year editing and the keyboard-help close action. Browser geometry checks also
rejected an intentionally overflowing element before accepting the real page. Offline reload failed in a control context with both service workers and HTTP cache disabled.
Import preview assertions compare stored text before mutation; backup assertions
read actual downloaded files; the update test requires the new HTML marker.

Portable mutation results: [final mutation report](verification/mutations-browser-2026-09-06.json).
Local logs: `artifacts/acceptance/final-browser-verify.log`,
`final-browser-mutations.log`, and `final-browser-journeys.log`.
Screenshots and disposable downloaded files remain under `artifacts/acceptance/`.
Selected screenshots and both quotation PNGs are committed in
[verification/browser](verification/browser/).

## Fresh real artwork journey

On 2026-09-07 at 04:01:30 UTC (September 6 locally), the diary's **Create artwork**
button started job `2ebaa436-8db5-4f48-8902-0c9056745ad0`, date `09-06`, nature style,
model `gpt-6-astra`. The connected companion uses the existing isolated Codex CLI
0.153.4 and signed-in ChatGPT allowance. No API key or substitute model was used.
The running state and cancel control appeared; the job completed and displayed
its image. Download artwork produced a valid **1122×1402 PNG** with SHA-256:

`b3414596e1fe07ae2add4d1b687afbbb48950ba868818417d55d38074b3ccf23`

The actual download was visually inspected: a watercolor pine rooted in a rocky
cliff with misty mountains, no text or figures. The preview returned after page
reload and reconnection. No page exceptions were recorded. The quotation card
remains separate. The earlier lake image and its original evidence are retained.

## Shared Chrome diagnosis remains bounded

The original extension-controlled Chrome tab returned `ERR_BLOCKED_BY_CLIENT`
with `blockedReason: inspector` despite an identified HTTP 200 app response.
External X pages worked. The same local origin now completes all journeys in a
fresh isolated Chrome profile on the same computer. This narrows the failure to
the original browser/debugging setup; it does **not** identify the component that
installed the blocking rule. The responsible component remains unknown.

My earlier stopping point was too broad: the explicit Browser Use URL-policy
denial concerned `chrome://extensions` inspection. It did not establish that
local app testing was forbidden. The user's standing instruction already specified
CDP automation in a separate profile, which provided a safe testing path. No
extension inspection was attempted through that path, and no blocking rule or
security setting was changed. There is no evidence for asking Nathaniel to
"allow" an unspecified setting.

The original [diagnostic capture](verification/chrome-block-takeover-2026-09-06.json)
is retained as historical evidence, not a current claim that all browser testing
is blocked.

## Still unfinished

- Exact text for **16 readings**; printed Spiritual Diary edition verification;
  the unnamed May 14 Gita translation and October 4 Para-gram remain unresolved.
- July 10's inherited Freedom heading still lacks comparison to its dated card.
- Attribution and availability of web cards do not establish reuse permission for
  the inherited collection. Source digests detect text changes, not authenticity.
- The original shared-browser blocking component remains unidentified. Isolated
  production browser testing is complete; shared-browser settings were preserved.

No hosted deployment, native installation prompt, screen-reader speech output,
or physical audio playback is claimed by this acceptance pass.

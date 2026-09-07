---
name: diary-browser
description: Establish the Spiritual Diary production build and current browser acceptance limits before testing its reader or local artwork companion.
---

# Diary production testing

Read docs/HANDOFF.md and docs/ACCEPTANCE.md. Confirm this checkout and a clean
ownership boundary with other sessions before editing or starting servers.

1. Run `npm run verify` in the repository root and wait for the build to finish.
   Building replaces dist; probing it during a build can produce a transient 404.
2. Inspect `ss -tlnp 'sport = :4317'` and the listener's `/proc/PID/cwd`.
   Do not stop an unidentified listener or another agent's process.
3. Start `node companion/server.mjs` after building. This serves dist and artwork
   on loopback at port 4317. Where the isolated CLI still exists, use
   `SRF_CODEX_BIN="$PWD/artifacts/codex/node_modules/.bin/codex"`.
4. Compare the HTTP root response with local dist/index.html. A 200 alone does
   not identify the build. The companion reads diary data at startup, so restart
   only your own instance after changing data, checking for active jobs first.
5. Follow the installed Browser/Chrome skill. Use new agent-owned tabs and a
   disposable journal origin. Do not inspect or clear private journal storage,
   claim another session's tabs, or connect directly to the live Chrome profile.
6. Complete the acceptance journeys at desktop and 390px, including production
   worker offline/update tests and actual downloaded PNG inspection. Unit tests
   and generated precache files cannot replace those journeys.

At the 2026-09-06 evening checkpoint, no successful browser launch recipe exists
for this session's supported Chrome controls: the local reader returns
ERR_BLOCKED_BY_CLIENT with blockedReason inspector. X works in the same session.
The tool separately denies opening chrome://extensions under its URL policy.
The responsible local-navigation blocker has not been identified. Do not change
request-blocking rules or security settings, bypass the denied inspection, or
ask for an unspecified allow setting. Preserve the exact uncertainty and use
the current diagnostic record, not repeated speculative reloads.

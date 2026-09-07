---
name: diary-browser
description: Test the Spiritual Diary production reader and local artwork companion in a task-owned Chrome profile without touching private journals or other sessions.
---

# Diary production testing

Read docs/HANDOFF.md, docs/ACCEPTANCE.md, and docs/SOURCE_GAPS.md. Confirm this
checkout and file ownership before editing. These instructions record the user's
standing requirement to use CDP with a separate automation profile.

1. Run `npm run verify` in the repository root; wait for the production build.
   Building replaces dist and can cause transient HTTP 404s. Do not build during
   browser testing.
2. Inspect `ss -tlnp 'sport = :4317'` and the listener's `/proc/PID/cwd`. Never stop
   an unidentified listener. The companion reads diary data once at startup;
   restart only your own instance after changing data and checking for active jobs.
3. Start the companion after the build. The tested local CLI invocation is:

   ```bash
   SRF_CODEX_BIN="$PWD/artifacts/codex/node_modules/.bin/codex" node companion/server.mjs
   ```

   The isolated CLI is 0.153.4; the older global CLI rejected Astra. Recheck local
   CLI availability rather than silently choosing another model or authentication.
4. Compare the HTTP root with `dist/index.html` by hash, and verify dataset census.
5. Launch a task-owned Chrome instance on an unused port and unique directory
   beneath the automation profile. The successful launch was:

   ```bash
   google-chrome --headless=new --remote-debugging-address=127.0.0.1 \
     --remote-debugging-port=9433 \
     --user-data-dir=/home/nathaniel/.config/google-chrome-automation/diary-acceptance-20260906 \
     --no-first-run --no-default-browser-check about:blank
   ```

   Inspect ownership if the port/profile already exists. Never connect to the live
   `~/.config/google-chrome` profile or adopt another agent's tabs.
6. Run `npm run test:browser`. Both scripts connect using playwright-core over CDP
   and create disposable contexts; they close only those contexts and their own
   temporary update server. `DIARY_CDP` and `DIARY_URL` override the local defaults.
   A completed September 6 artwork is required for real preview/download checks.
   `DIARY_ARTWORK_SHA256` pins it when needed. The scripts never request a new real
   generation. A fresh generation was separately completed from the UI during the
   final acceptance pass; see its recorded job ID and image hash.
7. Inspect actual screenshots and downloaded PNGs, not only passing assertions.
   Reports and screenshots go to `artifacts/acceptance/browser*`. Failure fixtures
   use no private journals, API keys, live account errors or invented readings.
   Copy only reviewed evidence into docs/verification and update acceptance limits.

The shared Chrome extension connection previously reported ERR_BLOCKED_BY_CLIENT
with blockedReason inspector. A separate tool-policy denial concerned extension
settings inspection. Do not bypass that inspection denial, alter security rules,
or claim its owner is identified. Isolated app testing works; the responsible
component in the shared browser remains unknown. No unspecified "allow" request
is justified by this evidence.

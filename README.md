# The Spiritual Diary

An independent, unofficial devotional reader for readings from *The Spiritual
Diary of Paramahansa Yogananda*. It is not affiliated with or endorsed by
Self-Realization Fellowship. See [NOTICE](NOTICE) and [attribution](docs/ATTRIBUTION.md).

The reader contains 350 readings. Sixteen annual date keys remain unresolved,
including February 29. Missing dates are marked and offer a nearby reading through
an explicit button. [Source gaps and pages needed](docs/SOURCE_GAPS.md).

## Run locally

Use Node 24 or newer and npm.

```sh
npm ci
npm run dev
npm run verify
```

`npm run build` produces `dist/`, served from the root of a static host. No database
or environment variables are required. Offline reading becomes available after
the production reader's first successful online visit and service-worker install.
Development mode does not install the offline cache. App updates wait for open
panels to close and require an explicit reload.

## Reflection and backups

Use Today, Reading calendar, Reflect, or Meditate below the reading controls.
Reflections are still stored using the original `srf-notes` date keys. Drafts save
on each change and recover after closing or refreshing. Storage failures are shown
in the reflection panel; copy your text if the browser cannot save it.

Under More, choose Preserve your journal. Complete backups include notes, drafts,
conflicting versions, favorites, recent readings, and reading history. Versions
2.0 and 3.0 can be imported. Preview a file, then merge it. Existing notes stay in
place; differing imported versions appear under View preserved conflicts. A
recovery backup is retained before any import changes are written. Download it
before another import, which replaces that recovery slot. Backups contain private
text and must be kept somewhere you trust.

Browser storage is specific to the browser and site address. Moving from a hosted
reader to the companion does not move your journal automatically. Export and
import a backup. Clearing browser storage removes saved journals and drafts.

## Optional Codex artwork

Each user runs their own local companion and signs in to their own Codex CLI with
ChatGPT. The public static reader does not require the companion.

```sh
codex login
npm run companion
```

Open `http://127.0.0.1:4317`, choose Save this reading, then Connect local artwork.
The companion requests `gpt-6-astra` exclusively. Built-in image generation uses
`gpt-image-2` and consumes Codex usage allowance, according to the
[official image documentation](https://learn.chatgpt.com/docs/image-generation).
There is no API-key fallback or automatic model substitution.

Astra requires a compatible CLI. Version 0.150.1 was rejected by the server during
verification. Use a current Codex CLI; testing here uses isolated version 0.153.4.
Optional `SRF_CODEX_BIN` selects a local executable. `SRF_PORT` changes the loopback
port. Do not expose the companion through a public proxy.

Only the reading date and chosen style reach the companion; it selects the topic
from its bundled dataset. Notes and drafts are never included. The topic and
artwork instructions are sent to OpenAI through Codex. Outputs remain in
`~/.local/share/spiritual-diary/artwork/`; Codex also keeps original generated
images in its own thread folders. Exact quotations are rendered separately into
local downloadable cards.

## Privacy and licensing

Notes, favorites, and history stay in your browser. Serving the app requires
ordinary requests to its host. Google Fonts may receive font requests. Optional
artwork sends the selected topic to OpenAI through your authenticated CLI.
There is no analytics, journal upload, database, or private delivery pipeline.

Source code is MIT licensed. The diary text is not MIT licensed. The repository
does not establish permission to redistribute SRF's writings. Obtain official
publications from [Self-Realization Fellowship](https://yogananda.org).

## Browser acceptance

Production desktop and 390px journeys, journal backup/recovery, offline/update,
quotation PNG downloads, and fresh local Astra artwork generation have been
checked in isolated Chrome. See [the acceptance record](docs/ACCEPTANCE.md) for
reproducible commands, screenshots, evidence limits, and the remaining 16 source
gaps. `npm run test:browser` uses the task-owned CDP browser described in
[the diary browser skill](.agents/skills/diary-browser/SKILL.md); it creates only
disposable journals and does not start new real artwork generation.

import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, extname, join } from "node:path";
import { createHash } from "node:crypto";
const out = resolve("artifacts/acceptance/browser-resilience");
await mkdir(out, { recursive: true });
const browser = await chromium.connectOverCDP(
  process.env.DIARY_CDP || "http://127.0.0.1:9433",
);
const origin = process.env.DIARY_URL || "http://127.0.0.1:4317";
const contexts = [],
  results = [];
let server;
const record = (name, details = {}) => {
  results.push({ name, result: "PASS", ...details });
  console.log(name);
};
const btn = (p, name) => p.getByRole("button", { name, exact: true });
const text = async (p, s) => p.getByText(s, { exact: true }).first().waitFor();
async function page({ worker = "block", clock, url = origin, route } = {}) {
  const c = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: worker,
    acceptDownloads: true,
  });
  contexts.push(c);
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  if (clock) await p.clock.install({ time: clock });
  if (route) await route(p);
  await p.goto(url);
  await btn(p, "Next").click();
  await btn(p, "Next").click();
  await btn(p, "Got it").click();
  await p.locator('[role="dialog"]').waitFor({ state: "detached" });
  return p;
}
async function reflect(p) {
  await p
    .getByRole("navigation", { name: "Daily practice" })
    .getByRole("button", { name: "Reflect", exact: true })
    .click();
  await p.getByRole("textbox").waitFor();
}
async function selectSep6(p) {
  await p.getByTitle("Choose a date").click();
  await btn(p, "Sep").click();
  await p
    .locator('[role="dialog"]')
    .getByRole("button", { name: "September 6", exact: true })
    .click();
}
async function shot(p, name) {
  await p.screenshot({
    path: `${out}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
}
try {
  let failLoad = true;
  const p = await page({
    route: async (p) =>
      p.route("**/data/diary-entries.json", (r) =>
        failLoad
          ? r.fulfill({ status: 503, body: "deliberate acceptance outage" })
          : r.continue(),
      ),
  });
  await text(p, "Readings could not be loaded");
  assert.equal(await p.getByText(/Reading unavailable for/).count(), 0);
  await shot(p, "load-failure");
  failLoad = false;
  await btn(p, "Retry loading").click();
  await p.locator("blockquote").waitFor();
  record(
    "HTTP failure is distinct from missing content; retry restores readings",
  );
  await selectSep6(p);
  await reflect(p);
  await p.evaluate(() => {
    window.diaryOriginalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (["srf-notes", "srf-note-drafts"].includes(k))
        throw new DOMException(
          "Acceptance storage failure",
          "QuotaExceededError",
        );
      return window.diaryOriginalSet.call(this, k, v);
    };
  });
  await p
    .getByRole("textbox")
    .fill("Unsaved disposable reflection must remain visible.");
  await btn(p, "Save Note").click();
  await btn(p, "Close").click();
  assert.equal(
    await p.getByRole("textbox").inputValue(),
    "Unsaved disposable reflection must remain visible.",
  );
  assert.match(
    await p.locator('[role="dialog"]').innerText(),
    /Draft not saved/,
  );
  await shot(p, "storage-failure-preserved");
  await p.evaluate(() => {
    Storage.prototype.setItem = window.diaryOriginalSet;
    delete window.diaryOriginalSet;
  });
  await btn(p, "Save Note").click();
  await text(p, "Reflection saved on this computer");
  await btn(p, "Close").click();
  record(
    "Injected draft/note storage failure prevents close and recovers after storage is restored",
  );
  // Concurrent tabs use only the newly created disposable browser context.
  await reflect(p);
  await p.getByRole("textbox").fill("First tab draft.");
  const other = await p.context().newPage();
  await other.goto(origin);
  await selectSep6(other);
  await reflect(other);
  assert.equal(
    await other.getByRole("textbox").inputValue(),
    "First tab draft.",
  );
  await other.getByRole("textbox").fill("Newer second tab draft.");
  await btn(p, "Save Note").click();
  assert.equal(
    await p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("srf-note-drafts"))["09-06"].content,
    ),
    "Newer second tab draft.",
  );
  await other.reload();
  await selectSep6(other);
  await reflect(other);
  assert.equal(
    await other.getByRole("textbox").inputValue(),
    "Newer second tab draft.",
  );
  await other.close();
  await btn(p, "Close").click();
  record(
    "Two actual tabs preserve the newer draft when the older editor saves",
  );
  const timing = await page({ clock: new Date("2024-12-31T23:59:00") });
  await reflect(timing);
  await timing.getByRole("textbox").fill("Disposable year-end draft.");
  await timing.clock.setFixedTime(new Date("2025-01-01T00:01:00"));
  await timing.clock.runFor(31000);
  assert.equal(
    await timing.getByTitle("Choose a date").textContent(),
    "December 31",
  );
  assert.equal(
    await timing.getByRole("textbox").inputValue(),
    "Disposable year-end draft.",
  );
  await btn(timing, "Close").click();
  await timing.clock.runFor(31000);
  assert.equal(
    await timing.getByTitle("Choose a date").textContent(),
    "January 1",
  );
  record(
    "Midnight rollover defers while reflection is open and advances afterward",
  );
  await btn(timing, "Meditation timer").click();
  await btn(timing, "5").click();
  await btn(timing, "Start").click();
  await timing.clock.runFor(3000);
  await text(timing, "4:57");
  await btn(timing, "Pause").click();
  await timing.clock.runFor(3000);
  await text(timing, "4:57");
  await btn(timing, "Resume").click();
  await timing.clock.runFor(297000);
  await text(timing, "Meditation Complete");
  await btn(timing, "Reset").click();
  await text(timing, "5:00");
  await btn(timing, "Breathing Exercise").click();
  await timing.clock.runFor(4000);
  await text(timing, "Hold...");
  await shot(timing, "timer-completion-reset-breathing");
  assert.deepEqual(timing.errors, []);
  record(
    "Timer countdown, pause, completion, reset and breathing phase with browser clock",
  );
  // Responses below are explicit transport fixtures, never represented as live model failures.
  let ready = true,
    job = null,
    requestBody,
    postError = "",
    imageFails = false,
    connectionFails = false;
  const art = await page({
    route: async (p) =>
      p.route("**/api/**", async (r) => {
        const path = new URL(r.request().url()).pathname;
        if (path === "/api/status")
          return connectionFails
            ? r.abort("failed")
            : r.fulfill({
                json: {
                  token: "disposable-fixture-token",
                  ready,
                  message: ready
                    ? "Fixture companion connected."
                    : "Sign in to Codex with ChatGPT.",
                  jobs: job ? [job] : [],
                },
              });
        if (path === "/api/jobs" && r.request().method() === "POST") {
          requestBody = r.request().postDataJSON();
          if (postError)
            return r.fulfill({ status: 400, json: { error: postError } });
          job = {
            id: "fixture-job",
            dateKey: "09-06",
            state: "running",
            message: "Generating artwork…",
          };
          return r.fulfill({ json: job });
        }
        if (path.endsWith("/cancel")) {
          job = {
            ...job,
            state: "cancelled",
            message: "Generation cancelled.",
          };
          return r.fulfill({ json: job });
        }
        if (path.endsWith("/image"))
          return imageFails
            ? r.fulfill({ status: 503, body: "Fixture preview failure" })
            : r.fulfill({
                contentType: "image/png",
                body: await readFile(
                  "artifacts/acceptance/browser/real-artwork.png",
                ),
              });
        return r.fulfill({ json: job });
      }),
  });
  await selectSep6(art);
  await btn(art, "Save this reading").click();
  await btn(art, "Connect local artwork").click();
  await text(art, "Fixture companion connected.");
  ready = false;
  await btn(art, "Reconnect artwork").click();
  await text(art, "Sign in to Codex with ChatGPT.");
  assert(await btn(art, "Create artwork").isDisabled());
  ready = true;
  await btn(art, "Reconnect artwork").click();
  await text(art, "Fixture companion connected.");
  await art.getByRole("combobox").selectOption("abstract");
  await btn(art, "Create artwork").click();
  await btn(art, "Cancel generation").waitFor();
  assert.deepEqual(requestBody, { dateKey: "09-06", style: "abstract" });
  assert(await btn(art, "Create artwork").isDisabled());
  await shot(art, "artwork-progress");
  await btn(art, "Cancel generation").click();
  await text(art, "Generation cancelled.");
  await btn(art, "Retry artwork").waitFor();
  const errors = [
    "Codex allowance is exhausted. Retry after your allowance resets.",
    "Astra is unavailable in this CLI or account. No substitute model was used.",
    "Generation timed out after ten minutes. Retry when ready.",
    "No valid PNG was generated.",
  ];
  for (const error of errors) {
    postError = error;
    await btn(art, "Retry artwork").click();
    await text(art, error);
  }
  postError = "";
  await btn(art, "Retry artwork").click();
  await btn(art, "Cancel generation").waitFor();
  job = {
    ...job,
    state: "failed",
    message: "Fixture generation failed without valid output.",
  };
  await text(art, job.message);
  await btn(art, "Retry artwork").waitFor();
  job = { ...job, state: "completed", message: "Fixture artwork complete." };
  imageFails = true;
  await btn(art, "Reconnect artwork").click();
  await text(
    art,
    "Artwork is saved but its preview could not be loaded. Reconnect to retry.",
  );
  imageFails = false;
  await btn(art, "Reconnect artwork").click();
  await art
    .getByAltText(
      "Generated nature or abstract artwork inspired by the reading topic",
    )
    .waitFor();
  imageFails = true;
  await btn(art, "Download artwork").click();
  await text(art, "Could not download artwork. Reconnect and retry.");
  connectionFails = true;
  await btn(art, "Reconnect artwork").click();
  await art.getByText(/To use artwork, run npm run companion/).waitFor();
  assert(await btn(art, "Create artwork").isDisabled());
  await shot(art, "artwork-disconnected");
  assert.deepEqual(art.errors, []);
  record(
    "Artwork browser fixtures: auth, model, quota, timeout, invalid output, progress, cancel, reconnect and failed download",
    { liveGeneration: false, privateFieldsSent: false },
  );
  // No timer/calendar/backup chunk has been opened in this fresh context.
  const freshOffline = await page({ worker: "allow" });
  await freshOffline.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await freshOffline.reload();
  assert(
    await freshOffline.evaluate(() => !!navigator.serviceWorker.controller),
  );
  const cacheControl = await freshOffline.context().newCDPSession(freshOffline);
  await cacheControl.send("Network.enable");
  await cacheControl.send("Network.setCacheDisabled", { cacheDisabled: true });
  await freshOffline.context().setOffline(true);
  await freshOffline.reload();
  await btn(freshOffline, "Meditation timer").click();
  await btn(freshOffline, "Start").waitFor();
  await freshOffline.keyboard.press("Escape");
  await freshOffline
    .getByRole("navigation", { name: "Daily practice" })
    .getByRole("button", { name: "Reading calendar", exact: true })
    .click();
  await btn(freshOffline, "Next month").waitFor();
  await freshOffline.keyboard.press("Escape");
  await btn(freshOffline, "More").click();
  await freshOffline
    .getByRole("menuitem", { name: "Preserve your journal", exact: true })
    .click();
  await btn(freshOffline, "Complete Backup").waitFor();
  await shot(freshOffline, "offline-unvisited-panels");
  assert.deepEqual(freshOffline.errors, []);
  await freshOffline.context().setOffline(false);
  record(
    "Fresh production worker opens previously unvisited lazy panels offline with HTTP cache disabled",
  );
  const noWorker = await page();
  const negativeCache = await noWorker.context().newCDPSession(noWorker);
  await negativeCache.send("Network.enable");
  await negativeCache.send("Network.setCacheDisabled", { cacheDisabled: true });
  await noWorker.context().setOffline(true);
  let offlineRejected = false;
  try {
    await noWorker.reload();
  } catch (error) {
    offlineRejected = /ERR_INTERNET_DISCONNECTED/.test(error.message);
  }
  assert(
    offlineRejected,
    "Without a worker or HTTP cache, offline reload must fail",
  );
  record(
    "Offline negative control fails when service workers and HTTP cache are disabled",
  );

  // Serve an isolated copy of the production files; change the shell revision to exercise a real waiting worker.
  const fixture = join(out, "update-dist");
  await cp(resolve("dist"), fixture, { recursive: true });
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webmanifest": "application/manifest+json",
  };
  server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, "http://localhost").pathname;
      const file = join(fixture, path === "/" ? "index.html" : path);
      assert(file.startsWith(fixture + "/"));
      res.setHeader(
        "Content-Type",
        types[extname(file)] || "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const updateOrigin = `http://127.0.0.1:${server.address().port}`;
  const update = await page({ worker: "allow", url: updateOrigin });
  await update.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await update.reload();
  assert(await update.evaluate(() => !!navigator.serviceWorker.controller));
  await reflect(update);
  await update.getByRole("textbox").fill("Disposable production update draft.");
  const html = await readFile(join(fixture, "index.html"), "utf8");
  const next = html.replace(
    "</head>",
    '<meta name="acceptance-revision" content="second">\n</head>',
  );
  await writeFile(join(fixture, "index.html"), next);
  const sw = await readFile(join(fixture, "sw.js"), "utf8");
  const revision = createHash("md5").update(next).digest("hex");
  const changed = sw.replace(
    /url:"index.html",revision:"[^"]+"/,
    `url:"index.html",revision:"${revision}"`,
  );
  assert.notEqual(changed, sw, "update fixture must change shell revision");
  await writeFile(join(fixture, "sw.js"), changed);
  await update.evaluate(async () => {
    await (await navigator.serviceWorker.ready).update();
  });
  await update
    .getByRole("button", {
      name: "Update and reload",
      exact: true,
      includeHidden: true,
    })
    .waitFor({ state: "attached", timeout: 15000 });
  assert(
    await update
      .getByRole("button", {
        name: "Update and reload",
        exact: true,
        includeHidden: true,
      })
      .isDisabled(),
  );
  assert.equal(
    await update.getByRole("textbox").inputValue(),
    "Disposable production update draft.",
  );
  await shot(update, "update-paused");
  await btn(update, "Close").click();
  await btn(update, "Update and reload").click();
  await update.waitForFunction(
    () =>
      document.querySelector('meta[name="acceptance-revision"]')?.content ===
      "second",
  );
  await reflect(update);
  assert.equal(
    await update.getByRole("textbox").inputValue(),
    "Disposable production update draft.",
  );
  await shot(update, "update-recovered");
  assert.deepEqual(update.errors, []);
  record(
    "Real production worker update: new shell waits, open draft pauses reload, accepted update recovers draft",
    {
      fixture:
        "Copied production build, changed HTML marker and precache revision only",
    },
  );
} catch (e) {
  for (const c of contexts) {
    for (const p of c.pages()) {
      if (
        p.url().startsWith("http://127.0.0.1:") &&
        !p.url().startsWith(origin)
      ) {
        await shot(p, "failed-update");
        console.error(await p.locator("body").innerText());
        console.error(
          await p.evaluate(async () => {
            const r = await navigator.serviceWorker.getRegistration();
            return {
              controller: !!navigator.serviceWorker.controller,
              active: r?.active?.state,
              waiting: r?.waiting?.state,
              installing: r?.installing?.state,
            };
          }),
        );
      }
    }
  }
  results.push({ name: "Browser resilience", result: "FAIL", error: e.stack });
  throw e;
} finally {
  await writeFile(
    `${out}/report.json`,
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  );
  for (const c of contexts) await c.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await browser.close();
}

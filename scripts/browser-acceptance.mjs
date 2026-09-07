import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

// Only connect to the task-owned Chrome launched with the documented separate profile.
const endpoint = process.env.DIARY_CDP || "http://127.0.0.1:9433";
const origin = process.env.DIARY_URL || "http://127.0.0.1:4317";
const out = resolve("artifacts/acceptance/browser");
await mkdir(out, { recursive: true });
const browser = await chromium.connectOverCDP(endpoint);
const results = [],
  contexts = [];
const data = JSON.parse(
  await readFile("public/data/diary-entries.json", "utf8"),
);
const record = (name, details = {}) => {
  results.push({ name, result: "PASS", ...details });
  console.log(name);
};
const expectText = async (p, text) => {
  await p.getByText(text, { exact: true }).first().waitFor();
};
async function start(width = 1440, options = {}) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 1000 },
    acceptDownloads: true,
    ...options,
  });
  contexts.push(context);
  const p = await context.newPage();
  p.setDefaultTimeout(8000);
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  p.consoleErrors = [];
  p.on("console", (e) => {
    if (e.type() === "error") p.consoleErrors.push(e.text());
  });
  await p.goto(origin);
  await p.getByRole("button", { name: "Next", exact: true }).waitFor();
  return p;
}
async function tour(p) {
  await p.getByRole("button", { name: "Next", exact: true }).click();
  await p.getByRole("button", { name: "Next", exact: true }).click();
  await p.getByRole("button", { name: "Got it", exact: true }).click();
  await p.getByTitle("Choose a date").waitFor();
  await p.locator('[role="dialog"]').waitFor({ state: "detached" });
}
const btn = (p, name) => p.getByRole("button", { name, exact: true });
const practice = (p, name) =>
  p
    .getByRole("navigation", { name: "Daily practice" })
    .getByRole("button", { name, exact: true });
async function more(p, name) {
  await btn(p, "More").click();
  await p.getByRole("menuitem", { name, exact: true }).click();
}
async function date(p, key, year = 2024) {
  const [m, d] = key.split("-").map(Number);
  const month = new Date(2024, m - 1, d).toLocaleString("en-US", {
    month: "long",
  });
  await p.getByTitle("Choose a date").click();
  await p.getByRole("spinbutton", { name: "Year" }).fill("");
  await p
    .getByRole("spinbutton", { name: "Year" })
    .pressSequentially(String(year));
  await btn(p, month.slice(0, 3)).click();
  await p
    .getByRole("button", {
      name: new RegExp(`^${month} ${d}(, reading unavailable)?$`),
    })
    .click();
  assert.equal(
    (await p.getByTitle("Choose a date").textContent()).trim(),
    `${month} ${d}`,
  );
}
async function shot(p, name) {
  await p.screenshot({
    path: `${out}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
}
async function noOverflow(p) {
  const sizes = await p.evaluate(() => ({
    viewport: innerWidth,
    body: document.body.scrollWidth,
    root: document.documentElement.scrollWidth,
  }));
  assert(
    sizes.body <= sizes.viewport && sizes.root <= sizes.viewport,
    JSON.stringify(sizes),
  );
}
async function download(p, name, path) {
  const promise = p.waitForEvent("download");
  await btn(p, name).click();
  const d = await promise;
  await d.saveAs(`${out}/${path}`);
  assert.equal(await d.failure(), null);
  return readFile(`${out}/${path}`);
}
async function focusTrap(p) {
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    assert(
      await p.evaluate(
        () => !!document.activeElement.closest('[role="dialog"]'),
      ),
      "focus escaped dialog",
    );
  }
}
try {
  for (const width of [1440, 390]) {
    const p = await start(width);
    assert.equal(
      await p
        .getByRole("heading", { name: "Welcome" })
        .evaluate((e) => getComputedStyle(e).color),
      "rgb(255, 255, 255)",
    );
    await shot(p, `${width}-welcome`);
    await tour(p);
    await noOverflow(p);
    // Prove the geometry check detects a real overflowing fixture in our disposable page.
    await p.evaluate(() => {
      const e = document.createElement("div");
      e.id = "overflow-control";
      e.style.cssText =
        "position:absolute;left:0;top:0;width:2000px;height:1px";
      document.body.append(e);
    });
    let rejected = false;
    try {
      await noOverflow(p);
    } catch {
      rejected = true;
    }
    assert(rejected);
    await p.locator("#overflow-control").evaluate((e) => e.remove());
    await date(p, "02-29");
    await expectText(p, "Reading unavailable for February 29");
    assert.equal(await p.locator("blockquote").count(), 0);
    await btn(p, "Next day").click();
    assert.equal(await p.getByTitle("Choose a date").textContent(), "March 1");
    await date(p, "12-31");
    await btn(p, "Next day").click();
    assert.equal(
      await p.getByTitle("Choose a date").textContent(),
      "January 1",
    );
    await date(p, "09-07");
    await btn(p, "Read September 6 instead").click();
    assert.equal(
      await p.getByTitle("Choose a date").textContent(),
      "September 6",
    );
    for (const theme of ["Light", "Dark", "Sepia"]) {
      await btn(p, `Switch to ${theme} theme`).click();
      await btn(p, "XL font size").click();
      for (const name of [`Switch to ${theme} theme`, "XL font size"]) {
        assert.equal(await btn(p, name).getAttribute("aria-pressed"), "true");
        await p.waitForFunction(
          (label) => {
            const element = [...document.querySelectorAll("button")].find(
              (e) => e.getAttribute("aria-label") === label,
            );
            return (
              element &&
              getComputedStyle(element).color === "rgb(255, 255, 255)"
            );
          },
          name,
          { timeout: 3000 },
        );
      }

      await noOverflow(p);
      await shot(p, `${width}-${theme}-reading`);
      await btn(p, "Search readings").click();
      await p.getByRole("textbox", { name: "Search readings" }).fill("love");
      await p.getByRole("heading", { name: "20 Results Found" }).waitFor();
      await noOverflow(p);
      await shot(p, `${width}-${theme}-search`);
      await btn(p, "Switch to theme search").click();
      await p.getByRole("textbox", { name: "Search readings" }).fill("Effort");
      await p.getByRole("button", { name: /September 6.*Effort/ }).click();
      await more(p, "Weekly themes");
      await btn(p, "Close themes").waitFor();
      assert(
        ["rgb(5, 41, 86)", "rgb(42, 46, 51)"].includes(
          await p
            .getByRole("heading", { name: "Weekly Themes", exact: true })
            .evaluate((e) => getComputedStyle(e).color),
        ),
        "heading must remain dark on paper",
      );
      await noOverflow(p);
      await shot(p, `${width}-${theme}-themes`);
      await p.keyboard.press("Escape");
    }
    await btn(p, "M font size").click();
    await more(p, "Reading shortcuts");
    await btn(p, "Close shortcuts").waitFor();
    await focusTrap(p);
    await p.keyboard.press("Escape");
    assert.equal(await p.locator('[role="dialog"]').count(), 0);
    await p.locator("main").focus();
    await p.keyboard.press("ArrowRight");
    assert.equal(
      await p.getByTitle("Choose a date").textContent(),
      "September 7",
    );
    await p.keyboard.press("ArrowLeft");
    assert.equal(
      await p.getByTitle("Choose a date").textContent(),
      "September 6",
    );
    await p.keyboard.press("?");
    await btn(p, "Close shortcuts").waitFor();
    await p.keyboard.press("Escape");
    await practice(p, "Reflect").click();
    const text = `Disposable browser reflection at ${width}px.`;
    await p.getByRole("textbox").fill(text);
    await p.keyboard.press("ArrowLeft");
    assert.equal(
      await p.getByTitle("Choose a date").textContent(),
      "September 6",
    );
    await btn(p, "Close").click();
    await practice(p, "Reflect").click();
    assert.equal(await p.getByRole("textbox").inputValue(), text);
    await p.reload();
    await date(p, "09-06");
    await practice(p, "Reflect").click();
    assert.equal(await p.getByRole("textbox").inputValue(), text);
    await p.keyboard.press("Control+s");
    await expectText(p, "Reflection saved on this computer");
    await shot(p, `${width}-saved-reflection`);
    await btn(p, "Close").click();
    await btn(p, "Add to favorites").click();
    await btn(p, "Saved readings").click();
    await p.getByRole("heading", { name: /My Favorite Quotes/i }).waitFor();
    await shot(p, `${width}-favorites`);
    await p.keyboard.press("Escape");
    await practice(p, "Reading calendar").click();
    await btn(p, "Next month").waitFor();
    await noOverflow(p);
    await shot(p, `${width}-calendar`);
    await btn(p, "Previous month").click();
    await p.keyboard.press("Escape");
    await more(p, "Preserve your journal");
    const backup = JSON.parse(
      await download(p, "Complete Backup", `${width}-backup.json`),
    );
    assert.equal(backup.data.notes["09-06"].content, text);
    assert(backup.data.favorites.includes("09-06"));
    const legacy = {
      type: "srf-notes",
      version: "2.0",
      data: {
        "09-06": {
          dateKey: "09-06",
          content: "Imported competing version; preserve both.",
          timestamp: 1,
        },
      },
    };
    await p.getByLabel("Choose a backup to preview").setInputFiles({
      name: "legacy.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(legacy)),
    });
    await btn(p, "Merge into journal").waitFor();
    assert.equal(
      await p.evaluate(
        () => JSON.parse(localStorage.getItem("srf-notes"))["09-06"].content,
      ),
      text,
      "preview must not write",
    );
    await shot(p, `${width}-backup-preview`);
    await btn(p, "Merge into journal").click();
    await expectText(
      p,
      "Merged. Original journal retained in the recovery backup.",
    );
    await btn(p, "View preserved conflicts").click();
    await expectText(p, legacy.data["09-06"].content);
    const recovery = JSON.parse(
      await download(p, "Download recovery backup", `${width}-recovery.json`),
    );
    assert.equal(recovery.data.notes["09-06"].content, text);
    assert.equal(recovery.data.conflicts.length, 0);
    const after = JSON.parse(
      await download(p, "Complete Backup", `${width}-merged.json`),
    );
    assert.equal(after.data.notes["09-06"].content, text);
    assert(
      after.data.conflicts.some(
        (n) => n.content === legacy.data["09-06"].content,
      ),
    );
    await p.getByLabel("Choose a backup to preview").setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":"999"}'),
    });
    await expectText(p, "Unsupported backup version");
    assert.equal(await btn(p, "Merge into journal").count(), 0);
    await btn(p, "Close").click();
    await practice(p, "Meditate").click();
    await btn(p, "Start").waitFor();
    await shot(p, `${width}-timer`);
    await btn(p, "Start").click();
    await btn(p, "Pause").click();
    await btn(p, "Reset").click();
    await expectText(p, "10:00");
    await p.keyboard.press("Escape");
    await more(p, "About this reader");
    await p.getByRole("heading", { name: /About/i }).first().waitFor();
    await shot(p, `${width}-about`);
    await p.keyboard.press("Escape");
    assert.deepEqual(p.errors, []);
    assert.deepEqual(p.consoleErrors, []);
    record(
      `${width}px reader, navigation, themes, focus, journal backup/conflict/recovery`,
      { consoleErrors: p.consoleErrors },
    );
    if (width === 1440) {
      await date(p, "12-27");
      await btn(p, "Save this reading").click();
      await btn(p, "Download image").waitFor();
      for (const style of ["Warm paper", "Deep night"]) {
        await btn(p, style).click();
        await p
          .getByAltText("A preview of this reading rendered as an image")
          .waitFor();
        const bytes = await download(
          p,
          "Download image",
          `longest-${style.replace(" ", "-")}.png`,
        );
        assert(bytes.length > 50000);
        record(`Longest reading card downloaded: ${style}`, {
          bytes: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        });
      }
      await btn(p, "Close").click();
      await date(p, "09-06");
      await btn(p, "Save this reading").click();
      await btn(p, "Connect local artwork").click();
      await p
        .getByAltText(
          "Generated nature or abstract artwork inspired by the reading topic",
        )
        .waitFor();
      await shot(p, "real-artwork-panel");
      const art = await download(p, "Download artwork", "real-artwork.png");
      assert.equal(art.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert(art.length > 50000);
      const artworkSha256 = createHash("sha256").update(art).digest("hex");
      if (process.env.DIARY_ARTWORK_SHA256)
        assert.equal(artworkSha256, process.env.DIARY_ARTWORK_SHA256);
      await btn(p, "Reconnect artwork").click();
      await p
        .getByAltText(
          "Generated nature or abstract artwork inspired by the reading topic",
        )
        .waitFor();
      await btn(p, "Close").click();
      record("Real existing artwork connect, preview, download, reconnect", {
        sha256: artworkSha256,
        bytes: art.length,
      });
    }
    await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await p.reload();
    assert(await p.evaluate(() => !!navigator.serviceWorker.controller));
    await p.context().setOffline(true);
    await p.reload();
    await date(p, "05-29");
    assert.equal(
      await p.locator("blockquote").textContent(),
      `“${data.entries["05-29"].quote}”`,
    );
    await practice(p, "Reflect").click();
    await p.getByRole("textbox").fill("Disposable offline draft.");
    await btn(p, "Close").click();
    await practice(p, "Meditate").click();
    await btn(p, "Start").waitFor();
    await shot(p, `${width}-offline`);
    await p.keyboard.press("Escape");
    await more(p, "Preserve your journal");
    const offline = JSON.parse(
      await download(p, "Complete Backup", `${width}-offline-backup.json`),
    );
    assert.equal(
      offline.data.drafts["05-29"].content,
      "Disposable offline draft.",
    );
    await btn(p, "Close").click();
    await p.context().setOffline(false);
    assert.deepEqual(p.errors, []);
    record(
      `${width}px production worker offline reload, navigation, lazy panels and backup`,
    );
  }
} catch (e) {
  results.push({ name: "Browser acceptance", result: "FAIL", error: e.stack });
  throw e;
} finally {
  await writeFile(
    `${out}/report.json`,
    JSON.stringify(
      { endpoint, origin, timestamp: new Date().toISOString(), results },
      null,
      2,
    ),
  );
  for (const context of contexts) await context.close();
  await browser.close();
}

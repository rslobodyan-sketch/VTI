/**
 * Client-facing Playwright walkthrough of the frozen VTI Operations MVP.
 * Capture-only. Does not change product code.
 *
 * Timing is intentional pauses, not a blanket slowMo.
 * Output: demo-output/vti-demo-journey.webm, screenshots/, client-screenshots/
 */
import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { mkdir, readdir, copyFile, writeFile, rm, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "demo-output");
const shotsDir = path.join(outDir, "screenshots");
const clientDir = path.join(outDir, "client-screenshots");
const videoTmp = path.join(outDir, `_video-tmp-${Date.now()}`);
const baseURL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN = { width: 1440, height: 900 };
const READER = { width: 390, height: 844 };

const SETTLE = 2100;
const BEFORE = 1200;
const AFTER = 2100;
const MILESTONE = 3500;
const MINOR = 1000;

const RECEIPT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveKw6P9AAAAAElFTkSuQmCC",
  "base64",
);

const CURATED = [
  ["02-dashboard.png", "01-dashboard.png"],
  ["03-onboarding-step-1-details.png", "02-university-onboarding.png"],
  ["10-university-profile.png", "03-university-profile.png"],
  ["16-inquiry-won.png", "04-inquiry.png"],
  ["18-event-detail.png", "05-event.png"],
  ["21-call-sheet-issued.png", "06-call-sheet.png"],
  ["22-reader-home.png", "07-reader-home.png"],
  ["23-reader-assignment.png", "08-reader-assignment.png"],
  ["27-reader-expenses.png", "09-reader-expenses.png"],
  ["32-payments-cashed.png", "10-payment-tracking.png"],
];

let shotIndex = 0;
const shotNames = [];

async function hold(page, ms) {
  await page.waitForTimeout(ms);
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const text = document.body?.innerText ?? "";
    return (
      !text.includes("Loading this record") &&
      !text.includes("Loading assignment") &&
      !text.includes("Loading workspace")
    );
  });
}

async function ensureCursor(page) {
  await page.evaluate(() => {
    let cursor = document.getElementById("vti-demo-cursor");
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "vti-demo-cursor";
      cursor.setAttribute("aria-hidden", "true");
      document.documentElement.appendChild(cursor);
    }
    cursor.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "width:22px",
      "height:22px",
      "border:2px solid #1f3d2b",
      "border-radius:50%",
      "background:rgba(31,61,43,0.28)",
      "box-shadow:0 0 0 1px rgba(255,255,255,0.7)",
      "pointer-events:none",
      "transform:translate(-30%,-30%)",
      "top:40px",
      "left:40px",
    ].join(";");
    if (!window.__vtiDemoCursorBound) {
      window.__vtiDemoCursorBound = true;
      window.addEventListener(
        "mousemove",
        (event) => {
          const node = document.getElementById("vti-demo-cursor");
          if (!node) return;
          node.style.left = `${event.clientX}px`;
          node.style.top = `${event.clientY}px`;
        },
        true,
      );
    }
  });
}

async function settle(page, ms = SETTLE) {
  await waitReady(page);
  await ensureCursor(page);
  await hold(page, ms);
}

async function shot(page, slug) {
  shotIndex += 1;
  const name = `${String(shotIndex).padStart(2, "0")}-${slug}.png`;
  await page.screenshot({
    path: path.join(shotsDir, name),
    fullPage: true,
    animations: "disabled",
  });
  shotNames.push(name);
  return name;
}

async function moveTo(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 16 });
  } else {
    await locator.hover();
  }
}

async function pointAndClick(page, locator, { before = BEFORE, after = AFTER } = {}) {
  await moveTo(page, locator);
  await hold(page, before);
  await locator.click();
  await hold(page, after);
}

function payRow(page) {
  return page
    .locator("tr, li")
    .filter({ hasText: "Sam Okonkwo" })
    .filter({ hasText: "Lakeshore University Commencement" })
    .first();
}

async function findFfmpeg() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push("ffmpeg");
  const local = process.env.LOCALAPPDATA || "";
  const home = process.env.USERPROFILE || "";
  const caches = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(local, "ms-playwright"),
    path.join(home, "AppData", "Local", "ms-playwright"),
  ].filter(Boolean);
  for (const dir of caches) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith("ffmpeg-")) {
          candidates.push(path.join(dir, entry.name, "ffmpeg-win64.exe"));
          candidates.push(path.join(dir, entry.name, "ffmpeg.exe"));
        }
      }
    } catch {
      /* missing cache */
    }
  }
  for (const bin of candidates) {
    try {
      await execFileAsync(bin, ["-version"], { windowsHide: true });
      return bin;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function convertMp4(webmPath) {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) return { available: false, reason: "ffmpeg not found" };
  try {
    const { stdout, stderr } = await execFileAsync(ffmpeg, ["-version"], { windowsHide: true });
    const banner = `${stdout}\n${stderr}`;
    if (!banner.includes("libx264") && !banner.includes("--enable-libx264")) {
      return { available: false, reason: "available ffmpeg cannot encode H.264" };
    }
  } catch {
    return { available: false, reason: "ffmpeg not usable" };
  }
  const mp4Path = path.join(outDir, "vti-demo-journey.mp4");
  try {
    await execFileAsync(
      ffmpeg,
      [
        "-y",
        "-i",
        webmPath,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        mp4Path,
      ],
      { windowsHide: true },
    );
    await access(mp4Path);
    return { available: true, path: mp4Path };
  } catch {
    return { available: false, reason: "H.264 encode failed" };
  }
}

async function videoDurationSeconds(webmPath, ffmpeg) {
  if (!ffmpeg) return null;
  try {
    const { stderr } = await execFileAsync(ffmpeg, ["-i", webmPath], { windowsHide: true });
    const match = String(stderr).match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) return null;
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  } catch (error) {
    const text = String(error.stderr || error.message || "");
    const match = text.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) return null;
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  }
}

async function main() {
  await mkdir(shotsDir, { recursive: true });
  await mkdir(clientDir, { recursive: true });
  for (const stale of await readdir(shotsDir).catch(() => [])) {
    await rm(path.join(shotsDir, stale), { force: true });
  }
  for (const stale of await readdir(clientDir).catch(() => [])) {
    await rm(path.join(clientDir, stale), { force: true });
  }
  await rm(path.join(outDir, "vti-demo-journey.webm"), { force: true });
  await rm(path.join(outDir, "vti-demo-journey.mp4"), { force: true });
  await mkdir(videoTmp, { recursive: true });
  await writeFile(path.join(outDir, "receipt-rideshare.png"), RECEIPT_PNG);

  const browser = await chromium.launch({
    headless: true,
    slowMo: 35,
  });
  const context = await browser.newContext({
    viewport: ADMIN,
    deviceScaleFactor: 1,
    recordVideo: { dir: videoTmp, size: ADMIN },
    locale: "en-US",
    timezoneId: "America/Chicago",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const started = Date.now();
  let journeyPassed = false;

  try {
    await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      sessionStorage.removeItem("vti-operations-overlay");
      sessionStorage.removeItem("vti-demo-reader");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Dashboard" }).waitFor();
    await settle(page, SETTLE);

    await moveTo(page, page.getByRole("button", { name: "Account" }));
    await hold(page, BEFORE);
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "No session changes" }).waitFor();
    await shot(page, "account-no-session-changes");
    await hold(page, MILESTONE);
    await page.keyboard.press("Escape");
    await hold(page, MINOR);

    await shot(page, "dashboard");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "Onboard university" }).first(), {
      after: SETTLE,
    });
    await page.getByRole("heading", { name: "Onboard university" }).waitFor();
    await settle(page, SETTLE);
    await page.getByLabel("University name").fill("Lakeshore University");
    await page.getByLabel("City").fill("Chicago");
    await page.getByLabel("State").fill("IL");
    await page.locator("#uni-line1").fill("100 Lakeshore Drive");
    await page.locator("#uni-zip").fill("60601");
    await page.locator("#uni-phone").fill("312-555-0200");
    await page.locator("#uni-email").fill("commencement@lakeshore.edu");
    await shot(page, "onboarding-step-1-details");
    await hold(page, MILESTONE);
    await pointAndClick(page, page.getByRole("button", { name: "Continue" }), { after: MINOR });

    await page.getByRole("heading", { name: "Primary contact" }).waitFor();
    await settle(page, MINOR);
    await page.locator("#p-name").fill("Alex Rivera");
    await page.locator("#p-title").fill("Commencement coordinator");
    await page.locator("#p-email").fill("alex@lakeshore.edu");
    await page.locator("#p-phone").fill("312-555-0200");
    await shot(page, "onboarding-step-2-contacts");
    await hold(page, MINOR);
    await pointAndClick(page, page.getByRole("button", { name: "Continue" }), { after: MINOR });

    await page.getByRole("heading", { name: "Operations / event requirements" }).waitFor();
    await page.locator("#attend").fill("1200");
    await page.locator("#venues").fill("Lakeshore Arena");
    await page.locator("#travel").fill("Fly in Nov 20; depart Nov 22.");
    await page.locator("#hotel").fill("University-held block, walking distance to arena.");
    await shot(page, "onboarding-step-3-operations");
    await hold(page, MINOR);
    await pointAndClick(page, page.getByRole("button", { name: "Continue" }), { after: MINOR });

    await page.getByRole("heading", { name: "Billing / administrative" }).waitFor();
    await page.locator("#bill-c").fill("Alex Rivera");
    await page.locator("#bill-e").fill("ap@lakeshore.edu");
    await shot(page, "onboarding-step-4-billing");
    await hold(page, MINOR);
    await pointAndClick(page, page.getByRole("button", { name: "Continue" }), { after: MINOR });

    await page.getByRole("heading", { name: "Compliance" }).waitFor();
    await shot(page, "onboarding-step-5-compliance");
    await hold(page, MINOR);
    await pointAndClick(page, page.getByRole("button", { name: "Continue" }), { after: SETTLE });

    await page.getByRole("heading", { name: "Review" }).waitFor();
    await settle(page, SETTLE);
    await shot(page, "onboarding-step-6-review");
    await hold(page, MILESTONE);
    await pointAndClick(page, page.getByRole("button", { name: "Create university" }), {
      after: AFTER,
    });

    await page.getByRole("heading", { name: "University onboarded successfully" }).waitFor();
    await settle(page, SETTLE);
    await shot(page, "university-success");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "View university" }), { after: SETTLE });
    await page.getByRole("heading", { name: "Lakeshore University" }).waitFor();
    await settle(page, SETTLE);
    await shot(page, "university-profile");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "New inquiry" }).first(), {
      after: SETTLE,
    });
    await page.getByRole("heading", { name: "New inquiry" }).waitFor();
    await waitReady(page);
    await page.locator("#inq-uni").waitFor();
    const selectedUniversity = await page.locator("#inq-uni").inputValue();
    if (!selectedUniversity) {
      throw new Error("Inquiry university select was empty after overlay hydration.");
    }
    const selectedLabel = await page.locator("#inq-uni option:checked").textContent();
    if (!selectedLabel?.includes("Lakeshore")) {
      throw new Error(`Inquiry preselected seed university: ${selectedLabel}`);
    }
    await settle(page, SETTLE);
    await page.locator("#inq-date").fill("2026-11-21");
    await page.locator("#inq-value").fill("8500");
    await shot(page, "inquiry-create");
    await hold(page, AFTER);
    await pointAndClick(page, page.getByRole("button", { name: "Create inquiry" }), { after: SETTLE });

    await page.getByRole("heading", { name: "Lakeshore University" }).waitFor();
    await settle(page, SETTLE);
    await shot(page, "inquiry-new");
    await hold(page, MILESTONE);
    await pointAndClick(page, page.getByRole("button", { name: "Move to Discovery" }));
    await page.getByText("Moved to Discovery.").waitFor();
    await shot(page, "inquiry-discovery");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("button", { name: "Move to Pending admin approval" }));
    await page.getByText("Moved to Pending admin approval.").waitFor();
    await shot(page, "inquiry-pending-admin-approval");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("button", { name: "Move to Coordinator logistics" }));
    await page.getByText("Moved to Coordinator logistics.").waitFor();
    await shot(page, "inquiry-coordinator-logistics");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("button", { name: "Move to Won" }));
    await page.getByText("Moved to Won.").waitFor();
    await shot(page, "inquiry-won");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "Create event" }), { after: SETTLE });
    await page.getByRole("heading", { name: "New event" }).waitFor();
    await settle(page, SETTLE);
    await page.locator("#ev-status").selectOption("confirmed");
    await page.locator("#cer-date").fill("2026-11-21");
    await page.locator("#cer-start").fill("10:00");
    await page.locator("#cer-venue").fill("Lakeshore Arena");
    await page.locator("#cer-addr").fill("100 Lakeshore Drive, Chicago, IL");
    await page.locator("#tr").fill("Fly in Nov 20; depart Nov 22.");
    await page.locator("#hot").fill("University-held block, walking distance to arena.");
    await shot(page, "event-create");
    await hold(page, AFTER);
    await pointAndClick(page, page.getByRole("button", { name: "Create event" }), { after: SETTLE });

    await page.getByRole("heading", { name: "Lakeshore University Commencement" }).waitFor();
    await waitReady(page);
    await page.getByText("Sat, Nov 21, 2026 · 10:00 AM").first().waitFor();
    await settle(page, SETTLE);
    await shot(page, "event-detail");
    await hold(page, MILESTONE);

    await moveTo(page, page.locator("#asg-reader"));
    await hold(page, BEFORE);
    await page.locator("#asg-reader").selectOption("reader-sam");
    await page.locator("#asg-role").selectOption("lead");
    await page.locator("#asg-pay").fill("2800");
    await shot(page, "assign-reader-usd");
    await hold(page, AFTER);
    await pointAndClick(page, page.getByRole("button", { name: "Assign reader" }), { after: SETTLE });

    await page.waitForURL(/\/admin\/assignments\/asg-/);
    await waitReady(page);
    await page.getByText("$2,800.00").first().waitFor();
    await settle(page, SETTLE);
    await shot(page, "assignment-compensation");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "Open event" }), { after: SETTLE });
    await page.getByRole("heading", { name: "Lakeshore University Commencement" }).waitFor();
    await settle(page, SETTLE);
    await page.getByText("$2,800.00").first().waitFor();
    await pointAndClick(page, page.getByRole("button", { name: "Issue Call Sheet" }).first(), {
      after: AFTER,
    });

    await page.waitForURL(/\/admin\/call-sheets\/cs-/);
    await waitReady(page);
    await page.getByText("Call Sheet v1 issued.").waitFor();
    await settle(page, SETTLE);
    await shot(page, "call-sheet-issued");
    await hold(page, MILESTONE);

    await page.evaluate(() => sessionStorage.setItem("vti-demo-reader", "reader-sam"));
    await page.setViewportSize(READER);
    await page.goto(`${baseURL}/reader`, { waitUntil: "domcontentloaded" });
    await waitReady(page);
    await page.getByRole("heading", { name: "Hello, Sam" }).waitFor();
    if (await page.getByRole("heading", { name: "Hello, Marcus" }).count()) {
      throw new Error("Reader identity flashed or stayed on Marcus.");
    }
    await page.getByText("Your compensation: $2,800.00").waitFor();
    await settle(page, SETTLE);
    await shot(page, "reader-home");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: "Open assignment" }), { after: SETTLE });
    await waitReady(page);
    await page.getByRole("heading", { name: "Lakeshore University Commencement" }).waitFor();
    await page.getByText("Lakeshore Arena").first().waitFor();
    await page.getByText("$2,800.00").first().waitFor();
    await settle(page, SETTLE);
    await shot(page, "reader-assignment");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: /Review and accept Call Sheet/ }), {
      after: SETTLE,
    });
    await waitReady(page);
    await page.getByRole("heading", { name: "Call Sheet v1" }).waitFor();
    await settle(page, SETTLE);
    await shot(page, "reader-call-sheet");
    await hold(page, MILESTONE);
    await pointAndClick(
      page,
      page.getByRole("button", { name: "I accept this Call Sheet version" }),
      { after: AFTER },
    );
    await page.getByText("You accepted this Call Sheet version.").waitFor();
    await shot(page, "reader-call-sheet-accepted");
    await hold(page, MILESTONE);

    await page.goBack();
    await waitReady(page);
    await page.getByText("No files on this assignment yet.").waitFor();
    await settle(page, SETTLE);
    await shot(page, "reader-files-empty");
    await hold(page, MILESTONE);

    await pointAndClick(page, page.getByRole("link", { name: /Expenses/ }).first(), { after: SETTLE });
    await page.getByRole("heading", { name: "Expenses" }).waitFor();
    await settle(page, SETTLE);
    const receiptPath = path.join(outDir, "receipt-rideshare.png");
    await page.locator('input[type="file"]').first().setInputFiles(receiptPath);
    await page.getByLabel("Amount (USD)").fill("42.50");
    await shot(page, "reader-expenses");
    await hold(page, MILESTONE);
    await pointAndClick(page, page.getByRole("button", { name: "Attach receipt to report" }));
    await page.getByText("Receipt attached to this report.").waitFor();
    await shot(page, "reader-expense-attached");
    await hold(page, AFTER);

    await page.setViewportSize(ADMIN);
    await page.goto(`${baseURL}/admin/payments`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Payment tracking" }).waitFor();
    await payRow(page).waitFor();
    await page.getByText("$2,800.00").first().waitFor();
    await settle(page, SETTLE);
    await shot(page, "payments-promised");
    await hold(page, MILESTONE);

    const approve = payRow(page).getByRole("button", { name: "Approve" }).first();
    await pointAndClick(page, approve);
    await page.getByText("Chester approved this payment.").waitFor();
    await shot(page, "payments-approved");
    await hold(page, MILESTONE);

    const markPaid = payRow(page).getByRole("button", { name: "Mark paid" }).first();
    await pointAndClick(page, markPaid);
    await page.getByText("Marked paid (tracking only).").waitFor();
    await shot(page, "payments-paid");
    await hold(page, MILESTONE);

    const markCashed = payRow(page).getByRole("button", { name: "Mark cashed" }).first();
    await pointAndClick(page, markCashed);
    await page.getByText("Cashed date recorded.").waitFor();
    await shot(page, "payments-cashed");
    await hold(page, MILESTONE);

    await moveTo(page, page.getByRole("button", { name: "Account" }));
    await hold(page, BEFORE);
    await page.getByRole("button", { name: "Account" }).click();
    await hold(page, BEFORE);
    await pointAndClick(page, page.getByRole("menuitem", { name: "Clear session changes" }));
    await page.getByText("Session changes cleared.").waitFor();
    await shot(page, "session-cleared-payments");
    await hold(page, MILESTONE);

    await page.goto(`${baseURL}/admin/clients`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Universities" }).waitFor();
    await waitReady(page);
    await page.getByRole("link", { name: /Walden University/ }).waitFor();
    await page.getByRole("link", { name: /Harborview/ }).waitFor();
    if (await page.getByText("Lakeshore University").count()) {
      throw new Error("Seed catalog was not restored — Lakeshore still visible.");
    }
    await settle(page, SETTLE);
    await shot(page, "seed-catalog-restored");
    await hold(page, MILESTONE);
    journeyPassed = true;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  const elapsedSec = (Date.now() - started) / 1000;
  const clips = (await readdir(videoTmp)).filter((name) => name.endsWith(".webm"));
  if (!clips.length) {
    throw new Error("Playwright did not write a video file.");
  }
  const dest = path.join(outDir, "vti-demo-journey.webm");
  await copyFile(path.join(videoTmp, clips[0]), dest);
  try {
    await rm(videoTmp, { recursive: true, force: true });
  } catch {
    /* Windows may keep the recorder file locked briefly */
  }

  for (const [source, target] of CURATED) {
    await copyFile(path.join(shotsDir, source), path.join(clientDir, target));
  }

  const mp4 = await convertMp4(dest);
  const duration = (await videoDurationSeconds(dest, (await findFfmpeg()) || "ffmpeg")) ?? elapsedSec;

  console.log(JSON.stringify({
    video: dest,
    durationSeconds: Math.round(duration * 10) / 10,
    mp4: mp4.available ? mp4.path : null,
    screenshotCount: shotNames.length,
    curated: CURATED.map(([, name]) => name),
    journeyPassed,
    elapsedSeconds: Math.round(elapsedSec * 10) / 10,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

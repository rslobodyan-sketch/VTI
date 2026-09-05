import { expect, test } from "@playwright/test";
import { collectPageErrors, startClean } from "./helpers";

const adminRoutes = [
  "/admin",
  "/admin/calendar",
  "/admin/inquiries",
  "/admin/inquiries/new",
  "/admin/inquiries/inq-harborview",
  "/admin/clients",
  "/admin/clients/new",
  "/admin/clients/uni-walden",
  "/admin/events",
  "/admin/events/new",
  "/admin/events/evt-walden-fall-2026",
  "/admin/readers",
  "/admin/readers/reader-marcus",
  "/admin/assignments",
  "/admin/assignments/asg-walden-marcus",
  "/admin/call-sheets",
  "/admin/call-sheets/cs-walden-v2",
  "/admin/expenses",
  "/admin/expenses/exp-walden-marcus",
  "/admin/debriefs",
  "/admin/payments",
  "/admin/settings",
];

const readerRoutes = [
  "/reader",
  "/reader/assignments",
  "/reader/assignments/asg-walden-marcus",
  "/reader/call-sheets",
  "/reader/calendar",
  "/reader/expenses",
  "/reader/debrief",
  "/reader/profile",
];

const assets = ["/manifest.webmanifest", "/icons/icon-192", "/icons/icon-512", "/sw.js"];

test.describe("Route smoke", () => {
  test("Admin and Reader routes render without page errors", async ({ page }) => {
    const errors = collectPageErrors(page);
    await startClean(page, "/");
    for (const path of [...adminRoutes, ...readerRoutes]) {
      const response = await page.goto(path);
      expect(response?.ok() || response?.status() === 304, path).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByText("Application error")).toHaveCount(0);
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("Unknown path and PWA assets", async ({ page }) => {
    const missing = await page.goto("/admin/this-route-does-not-exist");
    expect(missing?.status()).toBe(404);
    for (const path of assets) {
      const response = await page.goto(path);
      expect(response?.ok(), path).toBeTruthy();
    }
  });

  test("Invalid dynamic IDs fail gracefully after hydrate", async ({ page }) => {
    await startClean(page, "/admin/events/evt-does-not-exist");
    await expect(page.getByText(/not found|Loading this record/i)).toBeVisible();
    await page.goto("/reader/assignments/asg-does-not-exist");
    await expect(page.getByText("Not your assignment")).toBeVisible();
  });
});

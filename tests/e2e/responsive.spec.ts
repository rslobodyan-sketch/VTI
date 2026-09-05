import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow, startClean } from "./helpers";

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

const screens = [
  "/admin",
  "/admin/calendar",
  "/admin/clients/uni-walden",
  "/admin/inquiries",
  "/admin/events/evt-walden-fall-2026",
  "/admin/assignments/asg-walden-marcus",
  "/admin/call-sheets/cs-walden-v2",
  "/admin/expenses",
  "/admin/payments",
  "/reader",
  "/reader/assignments/asg-walden-marcus",
  "/reader/calendar",
  "/reader/expenses",
  "/reader/debrief",
  "/reader/profile",
];

test.describe("Responsive smoke", () => {
  for (const viewport of viewports) {
    test(`${viewport.width}x${viewport.height} critical screens`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      await startClean(page, "/admin");
      for (const path of screens) {
        await page.goto(path);
        await expect(page.locator("body")).toBeVisible();
        await assertNoHorizontalOverflow(page);
      }
    });
  }
});

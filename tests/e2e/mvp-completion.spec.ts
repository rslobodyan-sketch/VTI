import { expect, test } from "@playwright/test";
import { startClean } from "./helpers";

test.describe("MVP operational completion", () => {
  test("Financial Command Center exposes receivables and reader reporting", async ({ page }) => {
    await startClean(page, "/admin/financial");
    await expect(page.getByRole("heading", { name: "Financial Command Center" })).toBeVisible();
    await expect(page.getByText("University receivables", { exact: true })).toBeVisible();
    await expect(page.getByText("Reader financial overview", { exact: true })).toBeVisible();
    await expect(page.getByText("University performance", { exact: true })).toBeVisible();
    await expect(page.getByText("Walden University", { exact: true }).first()).toBeVisible();
  });

  test("Calendar provides Chester controls for availability and personal conflicts", async ({ page }) => {
    await startClean(page, "/admin/calendar");
    await expect(page.getByRole("heading", { name: "Reader availability & conflicts" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Personal / external commitments" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save availability block" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add personal block" })).toBeVisible();
  });

  test("Event staffing shows eligibility reasons for readers needing attention", async ({ page }) => {
    await startClean(page, "/admin/events/evt-eastbridge-honor-2026");
    await expect(page.getByRole("heading", { name: "Staffing" })).toBeVisible();
    await expect(page.getByText(/reader\(s\) need attention before assignment/i)).toHaveCount(1);
  });

  test("Assignment notice shows the intended email preview after preparation", async ({ page }) => {
    await startClean(page, "/admin/assignments/asg-walden-elena");
    await page.getByRole("button", { name: "Prepare assignment notice" }).click();
    await expect(page.getByText("Assignment notification prepared — ready for Chester's usual email send.")).toBeVisible();
    await expect(page.getByText("because your sound is a strong match for this event.")).toBeVisible();
  });
});

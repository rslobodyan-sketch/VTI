import { expect, test } from "@playwright/test";
import {
  EVENT,
  PAY_LABEL,
  SAM,
  assignSam,
  attachReceipt,
  createGenEvent,
  onboardUniversity,
  startClean,
  switchReader,
} from "./helpers";

test.describe("Call Sheets, assignments, expenses", () => {
  test("Issue, version, acknowledge, and isolate Call Sheets", async ({ page }) => {
    test.setTimeout(180_000);
    await startClean(page, "/admin");
    await onboardUniversity(page);
    await page.goto("/admin/events/new");
    await page.locator("#ev-uni").selectOption({ label: "Gen Commencement University" });
    await createGenEvent(page);
    await assignSam(page);
    await page.getByRole("link", { name: "Open event" }).click();
    await page.getByRole("button", { name: "Issue Call Sheet" }).first().click();
    await expect(page.getByText("Version 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Dress code")).toBeVisible();
    await expect(page.getByText("This Call Sheet is confidential")).toBeVisible();

    const v1Url = page.url();
    await page.getByRole("link", { name: /Open event|Gen Commencement/ }).first().click();
    await page.getByRole("button", { name: "Issue new Call Sheet version" }).click();
    await expect(page.getByText("Version 2", { exact: true })).toBeVisible();

    await page.goto(v1Url);
    await expect(page.getByText(/superseded/i)).toBeVisible();

    await page.goto("/reader/call-sheets");
    await switchReader(page, SAM);
    await page.getByRole("link", { name: EVENT }).first().click();
    await expect(page.getByText(PAY_LABEL)).toBeVisible();
    await page.getByRole("button", { name: "I accept this Call Sheet version" }).click();
    await expect(page.getByText("You accepted this Call Sheet version.")).toBeVisible();

    await switchReader(page, "Elena Voss");
    await page.goto(page.url());
    await expect(page.getByText("Packet not available")).toBeVisible();
  });

  test("Assignment state transitions stay coherent", async ({ page }) => {
    test.setTimeout(120_000);
    await startClean(page, "/admin");
    await onboardUniversity(page);
    await page.goto("/admin/events/new");
    await page.locator("#ev-uni").selectOption({ label: "Gen Commencement University" });
    await createGenEvent(page);
    await assignSam(page);
    await expect(page.getByText("Offered", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: "Decline offer" }).click();
    await expect(page.getByText("Assignment declined.")).toBeVisible();

    await page.goto("/admin/events");
    await page.getByRole("link", { name: EVENT }).first().click();
    await assignSam(page);
    await page.getByRole("button", { name: "Release to pool" }).click();
    await expect(page.getByText("Released to the reader pool.")).toBeVisible();
  });

  test("Expense reject and reader isolation", async ({ page }) => {
    test.setTimeout(180_000);
    await startClean(page, "/admin");
    await onboardUniversity(page);
    await page.goto("/admin/events/new");
    await page.locator("#ev-uni").selectOption({ label: "Gen Commencement University" });
    await createGenEvent(page);
    await assignSam(page);
    await page.getByRole("link", { name: "Open event" }).click();
    await page.getByRole("button", { name: "Issue Call Sheet" }).first().click();

    await page.goto("/reader/expenses");
    await switchReader(page, SAM);
    await attachReceipt(page, "12.00", "Parking garage");
    await page.getByRole("button", { name: "Submit expense report" }).click();

    await page.goto("/admin/expenses");
    await page.getByRole("link", { name: EVENT }).first().click();
    await page.getByRole("button", { name: "Return to reader" }).click();
    await expect(page.getByText("Expense returned.")).toBeVisible();

    await page.goto("/reader/expenses");
    await switchReader(page, "Marcus Hale");
    await expect(page.getByText("Parking garage")).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";
import { collectPageErrors, startClean } from "./helpers";

test.describe("Accessibility and runtime smoke", () => {
  test("Labeled controls and headings on key forms", async ({ page }) => {
    const errors = collectPageErrors(page);
    await startClean(page, "/admin/clients/new");
    await expect(page.getByRole("heading", { name: /Onboard university/ })).toBeVisible();
    await expect(page.getByLabel("University name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();

    await page.goto("/admin/inquiries/new");
    await expect(page.getByLabel("University")).toBeVisible();

    await page.goto("/admin/events/new");
    await expect(page.getByLabel("Event name")).toBeVisible();
    await expect(page.getByLabel("Date")).toBeVisible();

    await page.goto("/reader");
    await expect(page.getByLabel("View as reader")).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });
});

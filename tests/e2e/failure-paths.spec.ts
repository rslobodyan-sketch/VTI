import { expect, test } from "@playwright/test";
import { startClean } from "./helpers";

test.describe("Failure paths", () => {
  test("Onboarding required fields block create", async ({ page }) => {
    await startClean(page, "/admin/clients/new");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("University name is required.")).toBeVisible();
    await page.locator("#uni-name").fill("Partial U");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("City is required.")).toBeVisible();
  });

  test("Receipt without amount does not attach", async ({ page }) => {
    await startClean(page, "/reader/expenses");
    const file = page.getByLabel("Photo or PDF");
    if (await file.count()) {
      await file.setInputFiles({
        name: "blank.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4"),
      });
      await page.getByRole("button", { name: "Attach receipt to report" }).click();
      await expect(page.getByText("Enter the receipt amount.")).toBeVisible();
    }
  });

  test("Notice wording is not a fake email send", async ({ page }) => {
    await startClean(page, "/admin/assignments/asg-northlake-priya");
    await expect(page.getByRole("button", { name: "Send Assignment Notice" })).toHaveCount(0);
    await expect(page.getByText("Email is not connected")).toBeVisible();
  });
});

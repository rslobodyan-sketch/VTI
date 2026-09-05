import { expect, test } from "@playwright/test";
import { MARCUS, onboardUniversity, startClean, switchReader, UNI } from "./helpers";

test.describe("Demo finishing pass", () => {
  test("University operational totals use seed Walden values only", async ({ page }) => {
    await startClean(page, "/admin/clients/uni-walden");
    const totals = page.locator("#university-operational-totals");
    await expect(page.getByText("Not an official VTI GRCD report")).toBeVisible();
    await expect(totals.getByText("1,840")).toBeVisible();
    await expect(totals.getByText("1,712")).toBeVisible();
    await expect(totals.getByText("$24,200.00").first()).toBeVisible();
    await expect(totals.getByText("$22,800.00")).toBeVisible();
    await expect(totals.getByText("$6,100.00")).toBeVisible();
    await expect(totals.getByText("$476.00")).toBeVisible();
    await expect(totals.getByText("$17,624.00")).toBeVisible();
    await expect(totals.getByText("Graduates (estimated)")).toBeVisible();
    await expect(totals.getByText("Readers")).toBeVisible();
    await expect(totals.getByText("Ceremonies")).toBeVisible();
    await expect(totals.getByText("Days")).toBeVisible();
  });

  test("Event operational totals match the same Walden rollup", async ({ page }) => {
    await startClean(page, "/admin/events/evt-walden-fall-2026");
    const totals = page.locator("#event-operational-totals");
    await expect(totals.getByText("1,840")).toBeVisible();
    await expect(totals.getByText("$24,200.00").first()).toBeVisible();
    await expect(totals.getByText("$6,100.00")).toBeVisible();
    await expect(totals.getByText("$17,624.00")).toBeVisible();
  });

  test("Admin reader financial summary stays off the reader packet", async ({ page }) => {
    await startClean(page, "/admin/readers/reader-marcus");
    const finance = page.locator("#reader-admin-financial-summary");
    await expect(finance.getByText("$5,300.00")).toBeVisible();
    await expect(finance.getByText("$5,000.00")).toBeVisible();
    await expect(finance.getByText("$500.00")).toBeVisible();
    await expect(finance.getByText("$2,500.00")).toBeVisible();
    await expect(finance.getByText("Prior-year pay (recorded)")).toBeVisible();

    await page.goto("/reader/profile");
    await switchReader(page, MARCUS);
    await expect(page.getByText("Prior-year pay (recorded)")).toHaveCount(0);
    await expect(page.locator("#reader-admin-financial-summary")).toHaveCount(0);
    await expect(page.getByText("$5,000.00")).toHaveCount(0);
  });

  test("Returning-university notes use a neutral empty state", async ({ page }) => {
    await startClean(page, "/admin/clients/uni-walden");
    await expect(page.locator("#uni-internal-note")).toHaveAttribute(
      "placeholder",
      "Add an operational note",
    );
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/e\.g\. Hold last/i);
    expect(body.toLowerCase()).not.toContain("todo");
    expect(body.toLowerCase()).not.toContain("sample reminder");

    await onboardUniversity(page, UNI);
    await page.getByRole("link", { name: "View university" }).click();
    await expect(page.getByText("No operational notes yet.")).toBeVisible();
  });

  test("Workspace document library records a filename only", async ({ page }) => {
    await startClean(page, "/admin/settings");
    const library = page.locator("#workspace-document-library");
    await expect(library.getByText("No workspace documents recorded. Filenames only — bytes are not stored.")).toBeVisible();
    await page.locator("#wdoc-filename").fill("VTI Rate Sheet 2026.pdf");
    await page.locator("#wdoc-category").selectOption("rate_sheet");
    await page.locator("#wdoc-note").fill("Current Rate Sheet filename");
    await page.getByRole("button", { name: "Record filename" }).click();
    await expect(page.getByText("Filename recorded.")).toBeVisible();
    await expect(page.getByText("File bytes are not stored.", { exact: true })).toBeVisible();
    await expect(library.getByRole("cell", { name: "VTI Rate Sheet 2026.pdf", exact: true })).toBeVisible();
    await expect(library.getByRole("cell", { name: "Rate Sheet", exact: true })).toBeVisible();
  });

  test("Expense report keeps university, event, and assignment association", async ({ page }) => {
    await startClean(page, "/admin/expenses/exp-walden-marcus");
    const assoc = page.locator("#expense-associations");
    await expect(assoc.getByRole("link", { name: "Walden University" })).toBeVisible();
    await expect(assoc.getByRole("link", { name: "Walden Fall Commencement 2026" })).toBeVisible();
    await expect(assoc.getByRole("link", { name: MARCUS })).toBeVisible();
    await expect(assoc.getByText("$476.00")).toBeVisible();
    await expect(page.getByText("Receipt · change fee")).toBeVisible();
    await expect(page.getByText("Image bytes are not stored in this demo.")).toBeVisible();
  });
});

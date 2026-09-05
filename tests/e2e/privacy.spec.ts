import { expect, test } from "@playwright/test";
import { ELENA, MARCUS, SAM, startClean, switchReader } from "./helpers";

test.describe("Reader privacy (demo isolation)", () => {
  test("Sam cannot open Elena or Marcus assignment packets", async ({ page }) => {
    await startClean(page, "/reader");
    await switchReader(page, SAM);
    await page.goto("/reader/assignments/asg-walden-elena");
    await expect(page.getByText("Not your assignment")).toBeVisible();
    await expect(page.getByText("$2,300.00")).toHaveCount(0);
    await expect(page.getByText("$2,800.00")).toHaveCount(0);

    await page.goto("/reader/assignments/asg-walden-marcus");
    await expect(page.getByText("Not your assignment")).toBeVisible();
    await expect(page.getByText("last year")).toHaveCount(0);
  });

  test("Sam does not see other readers' expenses or historical pay", async ({ page }) => {
    await startClean(page, "/reader/expenses");
    await switchReader(page, SAM);
    await expect(page.locator("#reader-main").getByText(MARCUS)).toHaveCount(0);
    await expect(page.locator("#reader-main").getByText(ELENA)).toHaveCount(0);
    await expect(page.getByText("last year")).toHaveCount(0);

    await page.goto("/reader/profile");
    await expect(
      page.getByText("Driver’s license, passport, and tax records are not displayed on the reader packet."),
    ).toBeVisible();
    await expect(page.getByText("**-***")).toHaveCount(0);
    await expect(page.getByText("***-**")).toHaveCount(0);
    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).not.toContain("ssn");
    expect(body.toLowerCase()).not.toContain("passport number");
  });

  test("Reader navigation stays in /reader", async ({ page }) => {
    await startClean(page, "/reader");
    await switchReader(page, SAM);
    await expect(page.getByRole("link", { name: "Payments" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Universities" })).toHaveCount(0);
    await page.getByRole("link", { name: "Profile" }).first().click();
    await expect(page).toHaveURL(/\/reader\/profile/);
  });

  test("Clearing overlay does not leave Sam's created job", async ({ page }) => {
    await startClean(page, "/reader");
    await switchReader(page, SAM);
    await expect(page.getByText("Nothing on the books")).toBeVisible();
  });
});
